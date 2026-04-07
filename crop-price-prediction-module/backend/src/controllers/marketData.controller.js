import { body, validationResult } from "express-validator";
import { MarketData } from "../models/marketData.model.js";
import { Crop } from "../models/crop.model.js";

export const marketDataValidators = [
  body("crop").isMongoId().withMessage("Valid crop id required"),
  body("supply").isFloat({ min: 0 }).toFloat(),
  body("demand").isFloat({ min: 0 }).toFloat(),
  body("date").optional().isISO8601().toDate(),
];

export async function upsertMarketData(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const crop = await Crop.findById(req.body.crop);
    if (!crop) {
      return res.status(404).json({ success: false, message: "Crop not found" });
    }
    const payload = {
      crop: req.body.crop,
      supply: req.body.supply,
      demand: req.body.demand,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };
    const doc = await MarketData.create(payload);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    next(e);
  }
}
