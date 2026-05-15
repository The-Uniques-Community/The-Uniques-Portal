import Report from "../../models/uniques360/Report.js";
import Task from "../../models/uniques360/Task.js";

const getRequesterId = (req) => req.user?.id || req.user?._id || req.user?.userId || req.user?.sub || null;

const isAssignedMember = (task, userId) => {
  if (!task || !userId) return false;
  return (task.assignedTo || []).some((entry) => {
    if (!entry) return false;
    if (typeof entry === "string") return entry.toString() === userId.toString();
    if (entry.member) {
      return (entry.member._id || entry.member).toString() === userId.toString();
    }
    return entry._id?.toString?.() === userId.toString();
  });
};

// Submit a daily report (Member only)
export const submitReport = async (req, res) => {
  try {
    const { taskId, reportContent, attachments, progressPercent } = req.body;

    // Verify task exists and is assigned to this member
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const requesterId = getRequesterId(req);
    const isMember = isAssignedMember(task, requesterId);
    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized to submit report for this task" });
    }

    const normalizedProgress = progressPercent === "" || progressPercent === null || progressPercent === undefined
      ? null
      : Number(progressPercent);

    const safeProgress = Number.isFinite(normalizedProgress) ? Math.max(0, Math.min(100, normalizedProgress)) : null;

    const contentWithProgress = safeProgress === null
      ? reportContent
      : `${reportContent}\n\nProgress: ${safeProgress}%`;

    const newReport = new Report({
      taskId,
      studentId: requesterId,
      reportContent: contentWithProgress,
      attachments
    });

    await newReport.save();
    
    // Automatically update task status to 'in-progress' if it was 'pending'
    if (task.status === "pending") {
      task.status = "in-progress";
      await task.save();
    }

    // If the member reports 100%, complete the task automatically for the coordinator/member workflow.
    if (safeProgress === 100) {
      task.status = "completed";
      task.completedBy = requesterId;
      task.completedAt = new Date();
      await task.save();
    }

    res.status(201).json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ message: "Error submitting report", error: error.message });
  }
};

// Get reports for a task
export const getTaskReports = async (req, res) => {
  try {
    const { taskId } = req.params;
    const reports = await Report.find({ taskId }).populate("studentId", "fullName profilePic").sort({ submissionDate: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};
