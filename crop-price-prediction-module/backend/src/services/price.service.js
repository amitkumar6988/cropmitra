import { Crop } from "../models/crop.model.js";
import { MarketData } from "../models/marketData.model.js";
import { ExternalFactor } from "../models/externalFactor.model.js";

const DEMAND_SUPPLY_SENSITIVITY = 0.35;
const MIN_DS_MULTIPLIER = 0.65;
const MAX_DS_MULTIPLIER = 1.45;
const BAND_LOW = 0.94;
const BAND_HIGH = 1.08;

/**
 * @param {number} month 1-12
 * @param {number} startMonth
 * @param {number} endMonth
 */
function isMonthInSeason(month, startMonth, endMonth) {
  if (startMonth <= endMonth) {
    return month >= startMonth && month <= endMonth;
  }
  return month >= startMonth || month <= endMonth;
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function demandSupplyMultiplier(supply, demand) {
  const s = Math.max(supply, 1);
  const d = Math.max(demand, 1);
  const imbalance = (d - s) / (d + s);
  const raw = 1 + DEMAND_SUPPLY_SENSITIVITY * imbalance;
  return clamp(raw, MIN_DS_MULTIPLIER, MAX_DS_MULTIPLIER);
}

/**
 * @param {import("mongoose").Types.ObjectId} cropId
 * @param {Date} [at]
 */
export async function calculatePrice(cropId, at = new Date()) {
  const crop = await Crop.findById(cropId);
  if (!crop) {
    const err = new Error("Crop not found");
    err.statusCode = 404;
    throw err;
  }

  const month = at.getMonth() + 1;
  const inSeason = isMonthInSeason(
    month,
    crop.inSeasonStartMonth,
    crop.inSeasonEndMonth
  );
  const seasonalMultiplier = inSeason
    ? crop.seasonalFactor.inSeason
    : crop.seasonalFactor.offSeason;

  const latestMarket = await MarketData.findOne({ crop: cropId }).sort({
    date: -1,
  });

  const supply = latestMarket?.supply ?? crop.basePrice * 0.5;
  const demand = latestMarket?.demand ?? crop.basePrice * 0.5;
  const dsMult = demandSupplyMultiplier(supply, demand);

  const factors = await ExternalFactor.find({
    isActive: true,
    affectedCrops: cropId,
    startDate: { $lte: at },
    endDate: { $gte: at },
  }).lean();

  let externalMultiplier = 1;
  for (const f of factors) {
    externalMultiplier *= f.impact;
  }

  const adjustedBase = crop.basePrice * seasonalMultiplier * dsMult;
  const finalPrice = adjustedBase * externalMultiplier;

  const minPrice = finalPrice * BAND_LOW;
  const maxPrice = finalPrice * BAND_HIGH;

  const explanation = buildExplanation({
    inSeason,
    supply,
    demand,
    factors,
  });

  return {
    cropId: String(crop._id),
    cropName: crop.name,
    minPrice: round2(minPrice),
    maxPrice: round2(maxPrice),
    finalPrice: round2(finalPrice),
    breakdown: {
      basePrice: round2(crop.basePrice),
      seasonalMultiplier: round4(seasonalMultiplier),
      demandSupplyMultiplier: round4(dsMult),
      externalMultiplier: round4(externalMultiplier),
    },
    meta: {
      inSeason,
      latestMarketDate: latestMarket?.date ?? null,
      supply,
      demand,
    },
    explanation,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

function buildExplanation({ inSeason, supply, demand, factors }) {
  const parts = [];
  if (!inSeason) {
    parts.push("off-season pricing applies");
  } else {
    parts.push("in-season baseline");
  }
  if (demand > supply) {
    parts.push("demand exceeds supply, pushing prices up");
  } else if (supply > demand) {
    parts.push("supply exceeds demand, easing prices");
  } else {
    parts.push("supply and demand are balanced");
  }
  if (factors.length) {
    parts.push(
      `active external events: ${factors.map((f) => f.type).join(", ")}`
    );
  }
  const headline =
    demand > supply && !inSeason
      ? "Price increased due to high demand and off-season"
      : demand > supply
        ? "Price increased due to strong demand relative to supply"
        : supply > demand
          ? "Price softened due to higher supply than demand"
          : "Price reflects current seasonal and market balance";
  return { headline, details: parts };
}

/**
 * Synthetic history for charts: recompute using market rows ordered by date.
 */
export async function getPriceHistorySeries(cropId, limit = 90) {
  const crop = await Crop.findById(cropId);
  if (!crop) {
    const err = new Error("Crop not found");
    err.statusCode = 404;
    throw err;
  }

  const rows = await MarketData.find({ crop: cropId })
    .sort({ date: 1 })
    .limit(limit)
    .lean();

  if (rows.length === 0) {
    const point = await calculatePrice(cropId, new Date());
    return {
      cropName: crop.name,
      points: [
        {
          date: new Date().toISOString(),
          finalPrice: point.finalPrice,
          minPrice: point.minPrice,
          maxPrice: point.maxPrice,
        },
      ],
    };
  }

  const points = [];
  for (const row of rows) {
    const at = new Date(row.date);
    const month = at.getMonth() + 1;
    const inSeason = isMonthInSeason(
      month,
      crop.inSeasonStartMonth,
      crop.inSeasonEndMonth
    );
    const seasonalMultiplier = inSeason
      ? crop.seasonalFactor.inSeason
      : crop.seasonalFactor.offSeason;
    const dsMult = demandSupplyMultiplier(row.supply, row.demand);
    const factors = await ExternalFactor.find({
      isActive: true,
      affectedCrops: cropId,
      startDate: { $lte: at },
      endDate: { $gte: at },
    }).lean();
    let externalMultiplier = 1;
    for (const f of factors) {
      externalMultiplier *= f.impact;
    }
    const adjustedBase = crop.basePrice * seasonalMultiplier * dsMult;
    const finalPrice = adjustedBase * externalMultiplier;
    points.push({
      date: at.toISOString(),
      finalPrice: round2(finalPrice),
      minPrice: round2(finalPrice * BAND_LOW),
      maxPrice: round2(finalPrice * BAND_HIGH),
    });
  }
  return { cropName: crop.name, points };
}

export async function calculateAllCropPrices(at = new Date()) {
  const crops = await Crop.find().lean();
  const results = [];
  for (const c of crops) {
    const r = await calculatePrice(c._id, at);
    results.push(r);
  }
  return results;
}
