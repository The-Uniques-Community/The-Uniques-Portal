/**
 * @file communityBenefitsModel.js
 * @description Mongoose schema and model for community member testimonial and benefit cards.
 * @architecture Powers landing page testimonial carousels and highlight cards across public community views.
 * @agent_note cardId is unique and numeric; supports both default and custom avatar URLs.
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for community benefit testimonial cards.
 */
const benefitCardSchema = new mongoose.Schema(
  {
    cardId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    quote: { type: String, required: true },
    avatar: { type: String, default: "" },
    customAvatar: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BenefitCard =
  mongoose.models.BenefitCard || mongoose.model("BenefitCard", benefitCardSchema);

/**
 * @module BenefitCard
 */
export default BenefitCard;
