/**
 * @file successStoryModel.js
 * @description Mongoose schema and model for The Uniques Community Success Stories.
 * @architecture Captures full alumni career journeys including education, timelines, project showcases, work history, and technical proficiencies.
 * @agent_note Uses mongoose.models check to avoid re-compilation during hot reloading or multiple imports.
 */

import mongoose from "mongoose";

const timelineEntrySchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    achievements: [{ type: String, trim: true }],
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: "", trim: true },
    degree: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    details: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const experienceEntrySchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    duration: { type: String, default: "", trim: true },
    location: { type: String, default: "", trim: true },
    responsibilities: [{ type: String, trim: true }],
  },
  { _id: false }
);

const projectEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    technologies: { type: String, default: "", trim: true },
    date: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    achievements: [{ type: String, trim: true }],
    projectUrl: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const skillsSchema = new mongoose.Schema(
  {
    languages: [{ type: String, trim: true }],
    technologies: [{ type: String, trim: true }],
    tools: [{ type: String, trim: true }],
  },
  { _id: false }
);

const leadershipSchema = new mongoose.Schema(
  {
    organization: { type: String, default: "", trim: true },
    role: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
    achievements: [{ type: String, trim: true }],
  },
  { _id: false }
);

const successStorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, "Role or designation is required"],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      index: true,
    },
    batch: {
      type: String,
      required: [true, "Cohort batch is required"],
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    video: {
      type: String,
      default: "",
      trim: true,
    },
    officialUrl: {
      type: String,
      default: "",
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    timeline: [timelineEntrySchema],
    education: {
      type: educationSchema,
      default: () => ({}),
    },
    experience: [experienceEntrySchema],
    projects: [projectEntrySchema],
    skills: {
      type: skillsSchema,
      default: () => ({ languages: [], technologies: [], tools: [] }),
    },
    leadership: {
      type: leadershipSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Compound search index for fast text matching
successStorySchema.index({
  name: "text",
  company: "text",
  role: "text",
  summary: "text",
  "skills.technologies": "text",
});

const SuccessStory =
  mongoose.models.SuccessStory || mongoose.model("SuccessStory", successStorySchema);

export default SuccessStory;
