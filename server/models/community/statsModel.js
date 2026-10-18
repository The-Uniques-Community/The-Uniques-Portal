/**
 * @file statsModel.js
 * @description Mongoose schema and model for public community achievement and impact statistics.
 * @architecture Supplies aggregated impact metrics (earnings, clients, projects, events) displayed on the landing page.
 * @agent_note Field names use capitalized keys ('Earnings', 'Clients', 'Projects', 'Events') with seeded defaults.
 */

import mongoose from "mongoose";

/**
 * Mongoose schema definition for community-wide showcase statistics.
 */
const statsSchema = new mongoose.Schema(
  {
    Earnings: { type: Number, default: 860000 },
    Clients: { type: Number, default: 100 },
    Projects: { type: Number, default: 150 },
    Events: { type: Number, default: 40 },
  },
  { timestamps: true }
);

const Stats = mongoose.models.Stats || mongoose.model("Stats", statsSchema);

/**
 * @module Stats
 */
export default Stats;
