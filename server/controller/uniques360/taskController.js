import Task from "../../models/uniques360/Task.js";
import Member from "../../models/member/memberModel.js";
import Report from "../../models/uniques360/Report.js";

// Create a new task (Coordinator/Admin only)
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, deadline, priority, projectCategory, taskType } = req.body;
    
    // Check if assignedTo is an array, if not make it one
    const memberIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    
    // Check if all members exist
    const members = await Member.find({ _id: { $in: memberIds } });
    if (members.length !== memberIds.length) {
      return res.status(404).json({ message: "One or more members not found" });
    }

    const newTask = new Task({
      title,
      description,
      assignedTo: memberIds,
      assignedBy: req.user.id, // Assuming req.user is set by auth middleware
      deadline,
      priority,
      taskType,
      projectCategory
    });

    await newTask.save();
    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

// Get tasks assigned to a member
export const getMemberTasks = async (req, res) => {
  try {
    const { memberId } = req.params;
    const id = memberId === "me" ? req.user.id : memberId;
    const tasks = await Task.find({ assignedTo: id }).populate("assignedTo", "fullName email").sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// Get tasks created by a coordinator
export const getCoordinatorTasks = async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    const id = coordinatorId === "current" ? req.user.id : coordinatorId;
    const tasks = await Task.find({ assignedBy: id })
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 });

    const taskIds = tasks.map((task) => task._id);
    const reports = await Report.find({ taskId: { $in: taskIds } })
      .select("taskId reportContent submissionDate")
      .sort({ submissionDate: -1 });

    const progressByTask = new Map();

    for (const report of reports) {
      const taskId = report.taskId?.toString();
      if (!taskId || progressByTask.has(taskId)) continue;

      const match = report.reportContent?.match(/(\d{1,3})\s*%/);
      if (!match) continue;

      const value = Number(match[1]);
      if (Number.isNaN(value)) continue;

      progressByTask.set(taskId, Math.max(0, Math.min(100, value)));
    }

    const enrichedTasks = tasks.map((task) => {
      const plainTask = task.toObject();
      plainTask.progressPercent = progressByTask.get(task._id.toString()) ?? null;
      return plainTask;
    });

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

    const requesterId = req.user.id || req.user._id;

    // If marking as completed, allow assigned member(s) or the coordinator who assigned it
    if (status === "completed") {
      // Normalize assignedTo to array of strings
      let team = [];
      if (Array.isArray(task.assignedTo)) {
        team = task.assignedTo.map(id => id ? id.toString() : null).filter(Boolean);
      } else if (task.assignedTo) {
        team = [task.assignedTo.toString()];
      }

      const isAssigned = team.includes(requesterId);
      const isCoordinator = task.assignedBy && task.assignedBy.toString() === requesterId;

      if (!isAssigned && !isCoordinator) {
        return res.status(403).json({ message: "Unauthorized to mark this task completed" });
      }

      task.status = "completed";
      task.completedBy = requesterId.toString();
      task.completedAt = new Date();
      await task.save();
      return res.status(200).json({ message: "Task marked completed", task });
    }

    // For other status updates, only allow coordinator (assignedBy)
    if (task.assignedBy && task.assignedBy.toString() !== requesterId) {
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
    const { newMemberId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure assignedTo is an array (handle legacy data)
    let team = [];
    if (Array.isArray(task.assignedTo)) {
      team = task.assignedTo.map(id => id ? id.toString() : null).filter(Boolean);
    } else if (task.assignedTo) {
      team = [task.assignedTo.toString()];
    }

    // Coordinator can manage their own task team, and existing members can invite as well.
    const currentUserId = req.user.id || req.user._id;
    const isCoordinator = task.assignedBy?.toString() === currentUserId;
    const isMember = team.includes(currentUserId);
    
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
      return res.status(400).json({ message: "Member is already part of this project" });
    }

    // 1. Force conversion of assignedTo to an array if it's not one (atomic)
    await Task.updateOne(
      { _id: taskId },
      [
        {
          $set: {
            assignedTo: {
              $cond: {
                if: { $isArray: "$assignedTo" },
                then: "$assignedTo",
                else: { 
                  $cond: {
                    if: { $eq: [{ $type: "$assignedTo" }, "missing"] },
                    then: [],
                    else: ["$assignedTo"]
                  }
                }
              }
            }
          }
        }
      ]
    );

    // 2. Now safely add the member using $addToSet
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { assignedTo: newMemberId } },
      { new: true, runValidators: false }
    ).populate("assignedTo", "fullName email");

    res.status(200).json({ message: "Member added to project successfully", task: updatedTask });
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
    if (task.assignedBy.toString() !== req.user.id) {
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
      const memberIds = assignedTo.filter(Boolean);
      const members = await Member.find({ _id: { $in: memberIds } }).select("_id");

      if (members.length !== memberIds.length) {
        return res.status(404).json({ message: "One or more assigned members not found" });
      }

      updatePayload.assignedTo = memberIds;
    }

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const updatedTask = await Task.findByIdAndUpdate(taskId, updatePayload, {
      new: true,
      runValidators: true,
    }).populate("assignedTo", "fullName email");

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
    if (task.assignedBy.toString() !== req.user.id) {
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
    const isCoordinator = task.assignedBy.toString() === req.user.id;
    const isTeamMember = task.assignedTo.some(id => id && id.toString() === req.user.id);

    if (!isCoordinator && !isTeamMember) {
      return res.status(403).json({ message: "Unauthorized to manage this team" });
    }

    // Cannot remove yourself if you are a member (optional policy, but usually you can leave)
    // For now, allow removal. 

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $pull: { assignedTo: memberIdToRemove } },
      { new: true }
    ).populate("assignedTo", "fullName email");

    res.status(200).json({ message: "Member removed from project successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error removing member from project", error: error.message });
  }
};
