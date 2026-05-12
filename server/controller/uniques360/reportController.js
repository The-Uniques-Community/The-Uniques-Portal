import Report from "../../models/uniques360/Report.js";
import Task from "../../models/uniques360/Task.js";

// Submit a daily report (Member only)
export const submitReport = async (req, res) => {
  try {
    const { taskId, reportContent, attachments } = req.body;

    // Verify task exists and is assigned to this member
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isMember = task.assignedTo.some(id => id.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized to submit report for this task" });
    }

    const newReport = new Report({
      taskId,
      studentId: req.user.id,
      reportContent,
      attachments
    });

    await newReport.save();
    
    // Automatically update task status to 'in-progress' if it was 'pending'
    if (task.status === "pending") {
      task.status = "in-progress";
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
