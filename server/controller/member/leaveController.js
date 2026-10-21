/**
 * @file leaveController.js
 * @description Controller managing student member leave applications, status updates, administrative approvals, rejections, and email notifications.
 * @architecture Mounted at `/api/leave`. Coordinates between `Leave` and `Member` models and triggers email notifications via `leaveEmailService.js`.
 * @agent_note Only pending leaves can be modified or deleted by the applying member, or transitioned to approved/rejected by coordinators/admins.
 */
import Leave from "../../models/member/leaveModel.js";
import Member from "../../models/member/memberModel.js";
import {
  sendLeaveSubmissionNotification,
  sendLeaveApprovalNotification,
  sendLeaveRejectionNotification,
} from "../../services/leaveEmailService.js";
import { paginateQuery, buildSearchQuery } from "../../utils/queryHelper.js";

// Member Controllers

/**
 * @desc Submit a new leave request application
 * @route POST /api/leave/submit
 * @access Private (Member)
 * @body {string} type - Leave type/category
 * @body {string|Date} startDate - Leave starting date
 * @body {string|Date} endDate - Leave ending date
 * @body {string} reason - Justification for leave
 * @body {string} [memberId] - Optional explicit member ID override
 * @returns {Object} 201 - JSON with success message and new leave document
 * @returns {Object} 400 - Validation failure or invalid date range
 * @returns {Object} 404 - If member not found
 * @returns {Object} 500 - Server error
 */
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

    // Send notification emails to admin and coordinator
    await sendLeaveSubmissionNotification(newLeave);

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leave: newLeave,
    });
  } catch (error) {
    console.error("Error submitting leave request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Retrieve all leave applications submitted by the current member
 * @route GET /api/leave/my-leaves
 * @access Private (Member)
 * @query {string} [memberId] - Optional fallback member ID
 * @returns {Object} 200 - JSON with array of leave documents sorted by application date
 * @returns {Object} 400 - If member ID missing
 * @returns {Object} 500 - Server error
 */
export const getMyLeaves = async (req, res) => {
  try {
    const memberId = req.user?.id || req.query.memberId;

    if (!memberId) {
      return res.status(400).json({ success: false, message: "Member ID is required" });
    }

    const { page, limit, status } = req.query;
    const filter = { memberId };
    if (status) filter.status = status;

    const result = await paginateQuery(Leave, filter, {
      page,
      limit,
      sort: { appliedDate: -1 },
      lean: true,
    });

    res.status(200).json({
      success: true,
      message: "Leaves retrieved successfully",
      leaves: result.data,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error retrieving leaves:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @desc Update an existing pending leave request
 * @route PUT /api/leave/:id
 * @access Private (Member)
 * @params {string} id - Leave document ID
 * @body {string} type - Updated leave type
 * @body {string|Date} startDate - Updated start date
 * @body {string|Date} endDate - Updated end date
 * @body {string} reason - Updated reason
 * @returns {Object} 200 - JSON with updated leave document
 * @returns {Object} 400 - If leave is not in pending status or dates invalid
 * @returns {Object} 403 - If user is not the leave owner
 * @returns {Object} 404 - If leave not found
 * @returns {Object} 500 - Server error
 */
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

/**
 * @desc Cancel/delete an existing pending leave request
 * @route DELETE /api/leave/:id
 * @access Private (Member)
 * @params {string} id - Leave document ID
 * @returns {Object} 200 - JSON success message
 * @returns {Object} 400 - If leave is not in pending status
 * @returns {Object} 403 - If user is not the leave owner
 * @returns {Object} 404 - If leave not found
 * @returns {Object} 500 - Server error
 */
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

/**
 * @desc Retrieve all pending leave requests requiring review
 * @route GET /api/leave/pending
 * @access Private (Admin/Coordinator)
 * @returns {Object} 200 - JSON with pending leaves and populated member details
 * @returns {Object} 500 - Server error
 */
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

/**
 * @desc Retrieve all leave requests with optional status filtering
 * @route GET /api/leave/all
 * @access Private (Admin/Coordinator)
 * @query {string} [status] - Filter by leave status (e.g., Pending, Approved, Rejected)
 * @returns {Object} 200 - JSON with leave documents and populated member details
 * @returns {Object} 500 - Server error
 */
export const getAllLeaves = async (req, res) => {
  try {
    const { page, limit, status, type, search } = req.query;

    const filter = { ...buildSearchQuery(search, ["memberName", "memberEmail", "reason"]) };
    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    const result = await paginateQuery(Leave, filter, {
      page,
      limit,
      sort: { appliedDate: -1 },
      populate: { path: "memberId", select: "fullName email contact" },
      lean: true,
    });

    res.status(200).json({
      success: true,
      message: "Leaves retrieved successfully",
      leaves: result.data,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error retrieving leaves:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @desc Approve a pending leave request and send email notifications
 * @route PUT /api/leave/:id/approve
 * @access Private (Admin/Coordinator)
 * @params {string} id - Leave document ID
 * @body {string} [approvedBy='Admin'] - Name or identifier of approver
 * @returns {Object} 200 - JSON with approved leave document
 * @returns {Object} 400 - If leave is not in pending status
 * @returns {Object} 404 - If leave not found
 * @returns {Object} 500 - Server error
 */
export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const approverEmail = req.user?.email;

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

    // Send notification emails to member, admin and coordinator (excluding approver)
    if (approverEmail) {
      await sendLeaveApprovalNotification(leave, approverEmail);
    }

    res.status(200).json({
      message: "Leave approved successfully",
      leave,
    });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Reject a pending leave request with a stated reason and dispatch notifications
 * @route PUT /api/leave/:id/reject
 * @access Private (Admin/Coordinator)
 * @params {string} id - Leave document ID
 * @body {string} rejectionReason - Justification for leave refusal
 * @body {string} [rejectedBy='Admin'] - Name or identifier of rejector
 * @returns {Object} 200 - JSON with rejected leave document
 * @returns {Object} 400 - If rejection reason missing or leave not pending
 * @returns {Object} 404 - If leave not found
 * @returns {Object} 500 - Server error
 */
export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, rejectedBy } = req.body;
    const rejectorEmail = req.user?.email;

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

    // Send notification emails to member, admin and coordinator (excluding rejector)
    if (rejectorEmail) {
      await sendLeaveRejectionNotification(leave, rejectorEmail);
    }

    res.status(200).json({
      message: "Leave rejected successfully",
      leave,
    });
  } catch (error) {
    console.error("Error rejecting leave:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Retrieve single leave request details by document ID
 * @route GET /api/leave/:id
 * @access Private (Member/Admin/Coordinator)
 * @params {string} id - Leave document ID
 * @returns {Object} 200 - JSON with leave document and populated member details
 * @returns {Object} 404 - If leave not found
 * @returns {Object} 500 - Server error
 */
export const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please log in first.",
      });
    }

    const leave = await Leave.findById(id).populate("memberId", "fullName email contact");
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const requesterId = (req.user.id || req.user._id || "").toString();
    const userRole = (req.user.role || "").toLowerCase();
    const leaveOwnerId = (leave.memberId && leave.memberId._id ? leave.memberId._id : leave.memberId).toString();

    if (leaveOwnerId !== requesterId && !["admin", "coordinator"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Not authorized to view this leave request",
      });
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
