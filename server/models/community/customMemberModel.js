import mongoose from "mongoose";

const customMemberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, default: "" },
    admno: { type: String, default: "" },
    batch: { type: String, default: "The Uniques 5.0" },
    course: { type: String, default: "B.Tech CSE" },
    profileStatus: { type: String, default: "active" },
    isSuspended: { type: Boolean, default: false },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    projects: { type: Array, default: [] },
    achievements: { type: Array, default: [] },
    certifications: { type: Array, default: [] },
  },
  { timestamps: true }
);

const CustomMember =
  mongoose.models.CustomMember || mongoose.model("CustomMember", customMemberSchema);

export default CustomMember;
