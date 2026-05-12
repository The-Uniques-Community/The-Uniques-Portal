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
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  }],
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
  projectCategory: {
    type: String,
    default: "General",
  }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);
export default Task;
