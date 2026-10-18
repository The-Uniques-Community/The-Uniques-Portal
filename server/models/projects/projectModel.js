/**
 * @file projectModel.js
 * @description Mongoose schema and model for showcase and community projects.
 * @architecture Defines portfolio project records displayed across the public portal and member showcases; re-exported by community/projectModel.js.
 * @agent_note Uses mongoose.models check to avoid overwrite errors during hot reloading; tracks contributors as string arrays.
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for student and community projects.
 */
const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    batch: {
      type: String,
      required: [true, "Batch is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "/projects/unicare.webp",
      trim: true,
    },
    technologies: {
      type: [String],
      default: ["REACT", "NODE.JS"],
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    link: {
      type: String,
      default: "#",
      trim: true,
    },
    githubLink: {
      type: String,
      default: "",
      trim: true,
    },
    buttonColor: {
      type: String,
      default: "#ea384c",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "In Progress", "Archived", "Upcoming"],
      default: "Active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    contributors: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error during hot reload
const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

/**
 * @module Project
 */
export default Project;
