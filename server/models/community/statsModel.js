import mongoose from "mongoose";

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
export default Stats;
