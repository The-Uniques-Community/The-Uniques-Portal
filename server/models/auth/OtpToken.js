/**
 * @file OtpToken.js
 * @description Mongoose model for persistent, TTL-expired, rate-limited password reset tokens.
 * @architecture Replaces in-memory Map storage with MongoDB collection and native TTL expiration.
 */
import mongoose from "mongoose";

const otpTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    resetSessionToken: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // MongoDB deletes document after 10 minutes (600s)
    },
  },
  {
    timestamps: true,
  }
);

otpTokenSchema.index({ email: 1, verified: 1 });

const OtpToken = mongoose.models.OtpToken || mongoose.model("OtpToken", otpTokenSchema);
export default OtpToken;
