import mongoose from "mongoose";

const externalFactorSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    impact: { type: Number, required: true, min: 0 },
    affectedCrops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PriceCrop",
      },
    ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ExternalFactor = mongoose.model(
  "PriceExternalFactor",
  externalFactorSchema
);
