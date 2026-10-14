import mongoose from "mongoose";

const batchProfileSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    customImage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const batchNameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const BatchProfile =
  mongoose.models.BatchProfile || mongoose.model("BatchProfile", batchProfileSchema);

export const BatchName =
  mongoose.models.BatchName || mongoose.model("BatchName", batchNameSchema);
