/**
 * @file batchModel.js
 * @description Canonical Mongoose schema and model for community batch cohorts.
 * @architecture Defines cohort metadata, display banners, labels, and registered batch identifiers.
 * @agent_note Unified Single-Source-of-Truth model replacing the previously redundant BatchName collection.
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for batch cohort profiles and showcase metadata.
 */
const batchSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    customImage: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for backward compatibility with code expecting `b.name`
batchSchema.virtual("name").get(function () {
  return this.title || (this.label ? `The ${this.label}` : "");
});

/**
 * Canonical Batch model (maps to 'batchprofiles' collection to preserve existing data)
 * @module Batch
 */
export const Batch =
  mongoose.models.BatchProfile || mongoose.model("BatchProfile", batchSchema);

/**
 * Export BatchProfile for existing imports
 * @module BatchProfile
 */
export const BatchProfile = Batch;

/**
 * Export BatchName as an alias to Batch for complete backward compatibility
 * @module BatchName
 */
export const BatchName = Batch;

export default Batch;
