import {
  calculatePrice,
  calculateAllCropPrices,
  getPriceHistorySeries,
} from "../services/price.service.js";

export async function getPrices(req, res, next) {
  try {
    const { cropId } = req.query;
    if (!cropId) {
      const all = await calculateAllCropPrices();
      return res.json({
        success: true,
        data: all,
      });
    }
    const result = await calculatePrice(cropId);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function getPriceHistory(req, res, next) {
  try {
    const { cropId } = req.query;
    if (!cropId) {
      return res.status(400).json({
        success: false,
        message: "cropId is required",
      });
    }
    const limit = Math.min(Number(req.query.limit) || 90, 500);
    const series = await getPriceHistorySeries(cropId, limit);
    res.json({ success: true, data: series });
  } catch (e) {
    next(e);
  }
}
