import { body, param, validationResult } from "express-validator";
import { ExternalFactor } from "../models/externalFactor.model.js";
import { Crop } from "../models/crop.model.js";

export const createExternalFactorValidators = [
  body("type").trim().notEmpty(),
  body("impact").isFloat({ min: 0 }).toFloat(),
  body("affectedCrops").isArray({ min: 1 }),
  body("affectedCrops.*").isMongoId(),
  body("startDate").isISO8601().toDate(),
  body("endDate").isISO8601().toDate(),
  body("isActive").optional().isBoolean(),
];

export async function createExternalFactor(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const crops = await Crop.find({
      _id: { $in: req.body.affectedCrops },
    });
    if (crops.length !== req.body.affectedCrops.length) {
      return res.status(400).json({
        success: false,
        message: "One or more crop ids are invalid",
      });
    }
    const doc = await ExternalFactor.create({
      type: req.body.type,
      impact: req.body.impact,
      affectedCrops: req.body.affectedCrops,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      isActive: req.body.isActive ?? true,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    next(e);
  }
}

export const listExternalFactorsValidators = [];

export async function listExternalFactors(req, res, next) {
  try {
    const items = await ExternalFactor.find()
      .populate("affectedCrops", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: items });
  } catch (e) {
    next(e);
  }
}

export const toggleFactorValidators = [
  param("id").isMongoId(),
  body("isActive").isBoolean(),
];

export async function toggleExternalFactor(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const updated = await ExternalFactor.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).populate("affectedCrops", "name");
    if (!updated) {
      return res.status(404).json({ success: false, message: "Factor not found" });
    }
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
}
