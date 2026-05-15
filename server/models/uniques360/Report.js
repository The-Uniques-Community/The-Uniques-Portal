import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
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

const Report = mongoose.model("Report", reportSchema);
export default Report;
