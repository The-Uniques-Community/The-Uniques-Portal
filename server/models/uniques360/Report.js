/**
 * @file Report.js
 * @description Mongoose schema and model for student progress reports on assigned tasks.
 * @architecture Forms the progress reporting subsystem under Uniques 360, linking student members to assigned tasks.
 * @agent_note Foreign keys reference Task (taskId) and Member (studentId); progressPercent is bounded between 0 and 100.
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for student task reports.
 * Tracks progress percentages, submission text, and file attachments per task assignment.
 */
const reportSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportContent: {
    type: String,
    required: true,
  },
  progressPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  attachments: [{
    type: String, // URLs to files/images
  }],
  submissionDate: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Optimized compound indexes for task reports
reportSchema.index({ taskId: 1, submissionDate: -1 });
reportSchema.index({ studentId: 1, submissionDate: -1 });

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

/**
 * @module Report
 */
export default Report;
