import Leave from "../../models/member/leaveModel.js";
import Member from "../../models/member/memberModel.js";

// Member Controllers

export const submitLeaveRequest = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const memberId = req.user?.id || req.body.memberId;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    // Validate required fields
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get member details
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Validate dates
    if (start > end) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    if (days <= 0) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const newLeave = new Leave({
      memberId,
      memberName: member.fullName,
      memberEmail: member.email,
      memberPhone: member.contact || "",
      type,
      startDate: start,
      endDate: end,
      days,
      reason,
      status: "Pending",
      appliedDate: new Date(),
    });

    await newLeave.save();

    res.status(201).json({
      message: "Leave request submitted successfully",
      leave: newLeave,
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const memberId = req.user?.id || req.query.memberId;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    const leaves = await Leave.find({ memberId }).sort({ appliedDate: -1 });

    res.status(200).json({
      message: "Leaves retrieved successfully",
      leaves,
    });
  } catch (error) {
    console.error("Error retrieving leaves:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, startDate, endDate, reason } = req.body;
    const memberId = req.user?.id || req.body.memberId;

    // Check if leave exists and belongs to member
    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.memberId.toString() !== memberId) {
      return res.status(403).json({ message: "Not authorized to update this leave" });
    }

    // Can only update pending leaves
    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Can only update pending leave requests" });
    }

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    leave.type = type;
    leave.startDate = start;
    leave.endDate = end;
    leave.days = days;
    leave.reason = reason;

    await leave.save();

    res.status(200).json({
      message: "Leave request updated successfully",
      leave,
    });
  } catch (error) {
    console.error("Error updating leave request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const memberId = req.user?.id || req.body.memberId;

    // Check if leave exists
    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.memberId.toString() !== memberId) {
      return res.status(403).json({ message: "Not authorized to delete this leave" });
    }

    // Can only delete pending leaves
    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Can only delete pending leave requests" });
    }

    await Leave.findByIdAndDelete(id);

    res.status(200).json({
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting leave request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Coordinator/Admin Controllers

export const getAllPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "Pending" })
      .populate("memberId", "fullName email contact")
      .sort({ appliedDate: -1 });

    res.status(200).json({
      message: "Pending leaves retrieved successfully",
      leaves,
    });
  } catch (error) {
    console.error("Error retrieving pending leaves:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate("memberId", "fullName email contact")
      .sort({ appliedDate: -1 });

    res.status(200).json({
      message: "Leaves retrieved successfully",
      leaves,
    });
  } catch (error) {
    console.error("Error retrieving leaves:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Only pending leaves can be approved" });
    }

    leave.status = "Approved";
    leave.approvedBy = approvedBy || "Admin";
    leave.approvedDate = new Date();

    await leave.save();

    res.status(200).json({
      message: "Leave approved successfully",
      leave,
    });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, rejectedBy } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ message: "Only pending leaves can be rejected" });
    }

    leave.status = "Rejected";
    leave.rejectionReason = rejectionReason;
    leave.rejectedBy = rejectedBy || "Admin";
    leave.rejectedDate = new Date();

    await leave.save();

    res.status(200).json({
      message: "Leave rejected successfully",
      leave,
    });
  } catch (error) {
    console.error("Error rejecting leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id).populate("memberId", "fullName email contact");
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.status(200).json({
      message: "Leave retrieved successfully",
      leave,
    });
  } catch (error) {
    console.error("Error retrieving leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
