import mongoose from "mongoose";

/**
 * Season window uses month numbers 1–12. Supports windows that wrap (e.g. Oct–Mar).
 * Required for in-season vs off-season multiplier without changing core price fields.
 */
const cropSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    seasonalFactor: {
      inSeason: { type: Number, required: true, min: 0 },
      offSeason: { type: Number, required: true, min: 0 },
    },
    inSeasonStartMonth: { type: Number, min: 1, max: 12, default: 6 },
    inSeasonEndMonth: { type: Number, min: 1, max: 12, default: 9 },
  },
  { timestamps: true }
);

export const Crop = mongoose.model("PriceCrop", cropSchema);
