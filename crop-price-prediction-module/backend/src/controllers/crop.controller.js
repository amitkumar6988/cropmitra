import { Crop } from "../models/crop.model.js";

export async function listCrops(req, res, next) {
  try {
    const crops = await Crop.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: crops });
  } catch (e) {
    next(e);
  }
}
