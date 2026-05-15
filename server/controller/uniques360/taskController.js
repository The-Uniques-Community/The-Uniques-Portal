import Task from "../../models/uniques360/Task.js";
import Member from "../../models/member/memberModel.js";
import Report from "../../models/uniques360/Report.js";
import mongoose from "mongoose";

const getRequesterId = (req) => req.user?.id || req.user?._id || req.user?.userId || req.user?.sub || null;

// Convert string ID to ObjectId safely
const toObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
};

// Safe ID comparison function
const idsEqual = (id1, id2) => {
  const str1 = id1?.toString?.() || String(id1);
  const str2 = id2?.toString?.() || String(id2);
  return str1 === str2;
};

const toPlainTask = (task) => task?.toObject ? task.toObject() : task;

const populateTaskProgress = async (tasks) => {
  const plainTasks = (tasks || []).map(toPlainTask).filter(Boolean);
  const taskIds = plainTasks.map((task) => task._id).filter(Boolean);

  if (!taskIds.length) return plainTasks;

  const reports = await Report.find({ taskId: { $in: taskIds } })
    .select("taskId reportContent progressPercent submissionDate")
    .sort({ submissionDate: -1 });

  const progressByTask = new Map();

  for (const report of reports) {
    const taskId = report.taskId?.toString();
    if (!taskId || progressByTask.has(taskId)) continue;

    const value = typeof report.progressPercent === "number"
      ? report.progressPercent
      : Number(report.reportContent?.match(/(\d{1,3})\s*%/)?.[1]);
    if (Number.isNaN(value)) continue;

    progressByTask.set(taskId, Math.max(0, Math.min(100, value)));
  }

  return plainTasks.map((task) => ({
    ...task,
    progressPercent: progressByTask.get(task._id.toString()) ?? null,
  }));
};

// Create a new task (Coordinator/Admin only)
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, deadline, priority, projectCategory, taskType } = req.body;

    // Normalize assignedTo into array of { member, role }
    const assignedArray = Array.isArray(assignedTo)
      ? assignedTo.map((item) => {
          if (item && typeof item === 'object' && (item.member || item.member === 0)) {
            return { member: item.member, role: item.role || null };
          }
          return { member: item, role: null };
        })
      : assignedTo
      ? [{ member: assignedTo, role: null }]
      : [];

    const memberIds = assignedArray.map(a => a.member).filter(Boolean);
    // Validate members exist
    if (memberIds.length) {
      const membersFound = await Member.find({ _id: { $in: memberIds } }).select('_id');
      if (membersFound.length !== memberIds.length) {
        return res.status(404).json({ message: 'One or more members not found' });
      }
    }

    const newTask = new Task({
      title,
      description,
      assignedTo: assignedArray,
      assignedBy: toObjectId(getRequesterId(req)),
      deadline,
      priority,
      taskType,
      projectCategory,
    });

    await newTask.save();
    const populated = await Task.findById(newTask._id).populate('assignedTo.member', 'fullName email');
    res.status(201).json({ message: 'Task created successfully', task: populated });
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

// Get tasks assigned to a member
export const getMemberTasks = async (req, res) => {
  try {
    const { memberId } = req.params;
    const id = toObjectId(memberId === "me" ? getRequesterId(req) : memberId);
    let tasks = await Task.find({ 'assignedTo.member': id }).populate('assignedTo.member', 'fullName email').sort({ createdAt: -1 });
    // Backwards compatibility: if no tasks found using new shape, try legacy shape
    if (!tasks.length) {
      const legacyTasks = await Task.find({ assignedTo: id }).sort({ createdAt: -1 });
      if (legacyTasks.length) {
        // populate member objects
        const memberIds = legacyTasks.flatMap(t => Array.isArray(t.assignedTo) ? t.assignedTo : []).filter(Boolean);
        const members = await Member.find({ _id: { $in: memberIds } }).select('fullName email');
        const membersById = new Map(members.map(m => [m._id.toString(), m]));
        tasks = legacyTasks.map(t => {
          const plain = t.toObject();
          plain.assignedTo = (plain.assignedTo || []).map(idVal => ({ member: membersById.get(idVal.toString()) || idVal, role: null }));
          return plain;
        });
      }
    }
    const enrichedTasks = await populateTaskProgress(tasks);
    res.status(200).json(enrichedTasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// Get tasks created by a coordinator
export const getCoordinatorTasks = async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    const requesterId = getRequesterId(req);
    const id = toObjectId(coordinatorId === "current" ? requesterId : coordinatorId);
    const isCurrentCoordinatorView = coordinatorId === "current";
    const requesterRole = req.user?.role?.toLowerCase?.();
    const canSeeCoordinatorTasks = ["admin", "coordinator", "communityadmin"].includes(requesterRole);

    const taskQuery = isCurrentCoordinatorView && canSeeCoordinatorTasks
      ? {}
      : { assignedBy: id };

    let tasks = await Task.find(taskQuery)
        .populate('assignedTo.member', 'fullName email')
        .sort({ createdAt: -1 });

    // Normalize legacy assignedTo arrays (ObjectId[]) into { member, role } objects
    if (tasks.length) {
      const needsMigration = tasks.some(t => t.assignedTo?.length && t.assignedTo[0] && !t.assignedTo[0].member);
      if (needsMigration) {
        // collect all member ids
        const allIds = tasks.flatMap(t => (Array.isArray(t.assignedTo) ? t.assignedTo : [])).filter(Boolean);
        const members = await Member.find({ _id: { $in: allIds } }).select('fullName email');
        const membersById = new Map(members.map(m => [m._id.toString(), m]));
        tasks = tasks.map(t => {
          const plain = t.toObject();
          if (plain.assignedTo?.length && plain.assignedTo[0] && !plain.assignedTo[0].member) {
            plain.assignedTo = (plain.assignedTo || []).map(idVal => ({ member: membersById.get(idVal.toString()) || idVal, role: null }));
          }
          return plain;
        });
      }
    }

    const enrichedTasks = await populateTaskProgress(tasks);
    res.status(200).json(enrichedTasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const requesterId = getRequesterId(req);

    // If marking as completed, allow assigned member(s) or the coordinator who assigned it
    if (status === "completed") {
      // Normalize assignedTo to array of member ids
      const team = Array.isArray(task.assignedTo) ? task.assignedTo.map(a => a.member ? a.member.toString() : null).filter(Boolean) : [];

      const isAssigned = team.some(memberId => idsEqual(memberId, requesterId));
      const isCoordinator = idsEqual(task.assignedBy, requesterId);

      if (!isAssigned && !isCoordinator) {
        return res.status(403).json({ message: "Unauthorized to mark this task completed" });
      }

      task.status = "completed";
      task.completedBy = toObjectId(requesterId);
      task.completedAt = new Date();
      await task.save();
      return res.status(200).json({ message: "Task marked completed", task });
    }

    // For other status updates, only allow coordinator (assignedBy)
    if (task.assignedBy && !idsEqual(task.assignedBy, requesterId)) {
      return res.status(403).json({ message: "Unauthorized to update task status" });
    }

    task.status = status;
    await task.save();
    res.status(200).json({ message: "Task status updated", task });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

// Add a member to an existing task (Existing team member only)
export const addMemberToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newMemberId, role } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Normalize existing team member ids
    const team = Array.isArray(task.assignedTo) ? task.assignedTo.map(a => a.member ? a.member.toString() : null).filter(Boolean) : [];

    // Coordinator can manage their own task team, and existing members can invite as well.
    const currentUserId = getRequesterId(req);
    const isCoordinator = idsEqual(task.assignedBy, currentUserId);
    const isMember = team.some(memberId => idsEqual(memberId, currentUserId));
    
    if (!isCoordinator && !isMember) {
      return res.status(403).json({ 
        message: "Unauthorized to manage this project team",
      });
    }

    // Check if member to be added exists
    if (!newMemberId) {
      return res.status(400).json({ message: "New member ID is required" });
    }

    const newMember = await Member.findById(newMemberId);
    if (!newMember) return res.status(404).json({ message: "New member not found" });

    // Add member if not already present
    if (team.includes(newMemberId)) {
      return res.status(400).json({ message: 'Member is already part of this project' });
    }

    // Push new subdocument { member, role }
    task.assignedTo.push({ member: newMemberId, role: role || null });
    await task.save();

    const updatedTask = await Task.findById(taskId).populate('assignedTo.member', 'fullName email');
    res.status(200).json({ message: 'Member added to project successfully', task: updatedTask });
  } catch (error) {
    console.error("Error in addMemberToTask:", error);
    res.status(500).json({ 
      message: "Error adding member to project", 
      error: error.message
    });
  }
};

// Update a task (Coordinator only)
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, deadline, priority, projectCategory, status, assignedTo, taskType } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check if user is the one who assigned the task
    if (!idsEqual(task.assignedBy, getRequesterId(req))) {
      return res.status(403).json({ message: "Unauthorized to update this task" });
    }

    const updatePayload = {
      title,
      description,
      deadline,
      priority,
      projectCategory,
      status,
      taskType,
    };

    if (Array.isArray(assignedTo)) {
      // assignedTo may be array of ids or array of { member, role }
      const normalized = assignedTo.map((item) => {
        if (item && typeof item === 'object' && (item.member || item.member === 0)) {
          return { member: item.member, role: item.role || null };
        }
        return { member: item, role: null };
      }).filter(Boolean);

      const memberIds = normalized.map(a => a.member).filter(Boolean);
      const members = memberIds.length ? await Member.find({ _id: { $in: memberIds } }).select('_id') : [];

      if (memberIds.length && members.length !== memberIds.length) {
        return res.status(404).json({ message: 'One or more assigned members not found' });
      }

      updatePayload.assignedTo = normalized;
    }

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const updatedTask = await Task.findByIdAndUpdate(taskId, updatePayload, {
      new: true,
      runValidators: true,
    }).populate('assignedTo.member', 'fullName email');

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

// Delete a task (Coordinator only)
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check if user is the one who assigned the task
    if (!idsEqual(task.assignedBy, getRequesterId(req))) {
      return res.status(403).json({ message: "Unauthorized to delete this task" });
    }

    await Task.findByIdAndDelete(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};

// Remove a member from a task
export const removeMemberFromTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { memberIdToRemove } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check authorization: Must be the coordinator OR an existing team member
    const requesterId = getRequesterId(req);
    const isCoordinator = idsEqual(task.assignedBy, requesterId);
    const isTeamMember = task.assignedTo.some(a => idsEqual(a.member, requesterId));

    if (!isCoordinator && !isTeamMember) {
      return res.status(403).json({ message: "Unauthorized to manage this team" });
    }

    // Cannot remove yourself if you are a member (optional policy, but usually you can leave)
    // For now, allow removal. 

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $pull: { assignedTo: { member: memberIdToRemove } } },
      { new: true }
    ).populate('assignedTo.member', 'fullName email');

    res.status(200).json({ message: "Member removed from project successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error removing member from project", error: error.message });
  }
};
