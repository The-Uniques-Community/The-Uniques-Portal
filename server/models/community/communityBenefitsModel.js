import mongoose from "mongoose";

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

export default BenefitCard;
