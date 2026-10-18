/**
 * @file fileAttachmentSchema.js
 * @description Standardized Mongoose embedded subdocument schema for file attachments (Google Drive assets).
 * @architecture Replaces external File model references with embedded subdocuments across Member, Trainer, Event, and User models.
 */

import mongoose from "mongoose";

/**
 * Embedded schema representing an uploaded digital asset or document.
 * Includes both fileUrl and url fields for 100% frontend compatibility.
 */
export const fileAttachmentSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      default: "",
      trim: true,
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true,
    },
    url: {
      type: String,
      default: "",
      trim: true,
    },
    fileName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true, // Preserve unique subdocument ObjectId for React keys and item-level operations
    timestamps: true,
  }
);

// Pre-save / pre-validate hook to keep `url` and `fileUrl` synchronized
fileAttachmentSchema.pre("validate", function (next) {
  if (this.fileUrl && !this.url) {
    this.url = this.fileUrl;
  } else if (this.url && !this.fileUrl) {
    this.fileUrl = this.url;
  }
  next();
});

export default fileAttachmentSchema;
