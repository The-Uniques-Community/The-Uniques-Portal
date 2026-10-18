/**
 * @file passwordResetTokenModel.js
 * @description Mongoose schema for persistent, serverless-safe password reset sessions.
 * @architecture Replaces in-memory Map storage with MongoDB collection and native TTL expiration.
 */

import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userModel: {
      type: String,
      enum: ["Member", "Admin", "CommunityAdmin", "User"],
      default: "Member",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
    },
    otpHash: {
      type: String,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenHash: {
      type: String,
      default: null,
      index: true,
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastRequestedAt: {
      type: Date,
      default: Date.now,
    },
    hourlyRequestCount: {
      type: Number,
      default: 1,
    },
    windowStartedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index: Drops document when wall-clock time reaches expiresAt
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for high-speed queries on verification and reset
passwordResetTokenSchema.index({ email: 1, verified: 1 });

const PasswordResetToken =
  mongoose.models.PasswordResetToken ||
  mongoose.model("PasswordResetToken", passwordResetTokenSchema);

export default PasswordResetToken;
