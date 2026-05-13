import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
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

export default mongoose.model("Leave", leaveSchema);
