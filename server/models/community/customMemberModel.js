/**
 * @file customMemberModel.js
 * @description Mongoose schema and model for custom / showcase community member records.
 * @architecture Used by community controllers to persist customized member roster entries directly in MongoDB.
 */

import mongoose from "mongoose";

const customMemberSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    admno: { type: String, default: "", trim: true },
    batch: { type: String, default: "The Uniques 5.0", trim: true },
    course: { type: String, default: "B.Tech CSE", trim: true },
    profileStatus: {
      type: String,
      enum: ["active", "inactive", "pending", "blocked"],
      default: "active",
    },
    isSuspended: { type: Boolean, default: false },
    bio: { type: String, default: "Member of The Uniques Community." },
    avatar: { type: String, default: "" },
    skills: { type: [String], default: ["Developer"] },
    projects: { type: Array, default: [] },
    achievements: { type: Array, default: [] },
    certifications: { type: Array, default: [] },
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
  },
  {
    _id: false, // Use the provided custom string _id
    timestamps: true,
  }
);

export const CustomMember =
  mongoose.models.CustomMember || mongoose.model("CustomMember", customMemberSchema);
