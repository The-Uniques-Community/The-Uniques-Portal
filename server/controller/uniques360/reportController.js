/**
 * @file reportController.js
 * @description Controller handling progress reports submitted by members for assigned Uniques360 tasks.
 * @architecture Works with Report (server/models/uniques360/Report.js) and Task (server/models/uniques360/Task.js) models under the `/api/uniques360/reports` endpoint namespace.
 * @agent_note When progress reaches 100%, the handler automatically marks the parent task status as 'completed' and sets completion metadata.
 */
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

/**
 * @desc    Submit a daily or milestone progress report for an assigned task
 * @route   POST /api/uniques360/reports
 * @access  Private (Assigned Member only)
 * @body    {Object} req.body - Report submission payload
 * @body    {string} req.body.taskId - Target Task ObjectId string
 * @body    {string} [req.body.reportContent] - Text notes or summary of work done
 * @body    {Array<string>} [req.body.attachments] - Array of attachment URLs
 * @body    {number|string} [req.body.progressPercent] - Progress percentage (0 - 100)
 * @returns {Object} JSON response with created report document
 */
export const submitReport = async (req, res) => {
  try {
    const { taskId, reportContent, attachments, progressPercent } = req.body;
    const trimmedContent = reportContent?.trim?.() || "";

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

    if (!trimmedContent && safeProgress === null) {
      return res.status(400).json({ message: "Add a report message or progress percentage" });
    }

    const contentWithProgress = trimmedContent || `Progress updated to ${safeProgress}%`;

    const newReport = new Report({
      taskId,
      studentId: requesterId,
      reportContent: contentWithProgress,
      progressPercent: safeProgress,
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

/**
 * @desc    Fetch chronological list of progress reports filed for a specific task
 * @route   GET /api/uniques360/reports/task/:taskId
 * @access  Private (Authenticated users / Member / Coordinator)
 * @param   {Object} req - Express request
 * @param   {string} req.params.taskId - Task ObjectId string
 * @returns {Array<Object>} JSON array of Report documents populated with student info
 */
export const getTaskReports = async (req, res) => {
  try {
    const { taskId } = req.params;
    const reports = await Report.find({ taskId }).populate("studentId", "fullName profilePic").sort({ submissionDate: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};
