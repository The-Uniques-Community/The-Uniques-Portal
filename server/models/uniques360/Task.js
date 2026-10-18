/**
 * @file Task.js
 * @description Mongoose schema and model for project and event task management.
 * @architecture Central task delegation and assignment model in Uniques 360; assigns tasks to members and tracks completion status.
 * @agent_note assignedTo references Member with per-assignee roles; assignedBy references Admin model; status and priority use enums.
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for Uniques 360 tasks.
 * Manages task delegation, multiple member assignments, deadlines, and completion records.
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  assignedTo: [
    {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        default: null,
      }
    }
  ],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deadline: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  taskType: {
    type: String,
    enum: ["project", "event"],
    default: "project",
    required: true,
  },
  projectCategory: {
    type: String,
    default: "General",
  }
  ,
  completedBy: {
    type: String, // store user id (string) who marked completed
  },
  completedAt: {
    type: Date,
  }
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

/**
 * @module Task
 */
export default Task;
