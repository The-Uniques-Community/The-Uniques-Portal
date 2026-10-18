/**
 * @file leaveModel.js
 * @description Mongoose schema and model for member leave requests and approval workflows.
 * @architecture Captures absence requests, duration calculations, approval/rejection audits, and triggers leave email notifications.
 * @agent_note memberId references Member; status transitions between Pending, Approved, and Rejected with approver/rejector metadata.
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for member leave requests.
 */
const leaveSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberName: {
      type: String,
      required: true,
    },
    memberEmail: {
      type: String,
      required: true,
    },
    memberPhone: {
      type: String,
    },
    type: {
      type: String,
      enum: ["Sick Leave", "Casual Leave", "Annual Leave", "Maternity Leave", "Paternity Leave"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: String,
    },
    approvedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    rejectedBy: {
      type: String,
    },
    rejectedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Leave = mongoose.models.Leave || mongoose.model("Leave", leaveSchema);

/**
 * @module Leave
 */
export default Leave;
