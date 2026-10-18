/**
 * @file batchModel.js
 * @description Mongoose schemas and models for community batch profiles and batch nomenclature.
 * @architecture Defines cohort metadata, display banners, and registered batch identifiers used throughout community filters.
 * @agent_note Exports two models: BatchProfile (cohort details/imagery) and BatchName (unique registered batch tags).
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for batch cohort profiles and showcase metadata.
 */
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

/**
 * Mongoose schema definition for unique registered batch names.
 */
const batchNameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

/**
 * @module BatchProfile
 */
export const BatchProfile =
  mongoose.models.BatchProfile || mongoose.model("BatchProfile", batchProfileSchema);

/**
 * @module BatchName
 */
export const BatchName =
  mongoose.models.BatchName || mongoose.model("BatchName", batchNameSchema);
