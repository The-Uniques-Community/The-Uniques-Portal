import mongoose from "mongoose";

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
        ref: "Member",
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
    ref: "Admin", // Assuming coordinators are also in Admin model or there's a specific role
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

const Task = mongoose.model("Task", taskSchema);
export default Task;
