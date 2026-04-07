import mongoose from "mongoose";

const marketDataSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PriceCrop",
      required: true,
      index: true,
    },
    supply: { type: Number, required: true, min: 0 },
    demand: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const MarketData = mongoose.model("PriceMarketData", marketDataSchema);
