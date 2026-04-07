/**
 * Seed script — run: npm run seed (from backend folder)
 * Uses PRICE_MONGODB_URI or default local DB.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Crop } from "../models/crop.model.js";
import { MarketData } from "../models/marketData.model.js";
import { ExternalFactor } from "../models/externalFactor.model.js";

dotenv.config();

/** Prefer dedicated URI; else reuse main Cropmitra `MONGO_URI` from backend `.env`. */
const MONGO_URI =
  process.env.PRICE_MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/crop_price_prediction";

/** Base prices roughly INR/qtl; seasonal windows are indicative for India. */
const CROP_SPECS = [
  {
    name: "Wheat",
    basePrice: 2125,
    seasonalFactor: { inSeason: 0.98, offSeason: 1.08 },
    inSeasonStartMonth: 3,
    inSeasonEndMonth: 5,
  },
  {
    name: "Rice (Paddy)",
    basePrice: 1960,
    seasonalFactor: { inSeason: 0.97, offSeason: 1.1 },
    inSeasonStartMonth: 10,
    inSeasonEndMonth: 12,
  },
  {
    name: "Maize",
    basePrice: 1850,
    seasonalFactor: { inSeason: 0.99, offSeason: 1.06 },
    inSeasonStartMonth: 9,
    inSeasonEndMonth: 11,
  },
  {
    name: "Cotton",
    basePrice: 6620,
    seasonalFactor: { inSeason: 0.96, offSeason: 1.12 },
    inSeasonStartMonth: 10,
    inSeasonEndMonth: 2,
  },
  {
    name: "Sugarcane",
    basePrice: 315,
    seasonalFactor: { inSeason: 1.0, offSeason: 1.05 },
    inSeasonStartMonth: 11,
    inSeasonEndMonth: 3,
  },
  {
    name: "Potato",
    basePrice: 780,
    seasonalFactor: { inSeason: 0.95, offSeason: 1.15 },
    inSeasonStartMonth: 12,
    inSeasonEndMonth: 2,
  },
  {
    name: "Onion",
    basePrice: 1200,
    seasonalFactor: { inSeason: 0.94, offSeason: 1.18 },
    inSeasonStartMonth: 3,
    inSeasonEndMonth: 5,
  },
  {
    name: "Tomato",
    basePrice: 1400,
    seasonalFactor: { inSeason: 0.93, offSeason: 1.2 },
    inSeasonStartMonth: 12,
    inSeasonEndMonth: 2,
  },
  {
    name: "Soybean",
    basePrice: 4600,
    seasonalFactor: { inSeason: 0.97, offSeason: 1.09 },
    inSeasonStartMonth: 10,
    inSeasonEndMonth: 11,
  },
  {
    name: "Mustard",
    basePrice: 5050,
    seasonalFactor: { inSeason: 0.98, offSeason: 1.07 },
    inSeasonStartMonth: 3,
    inSeasonEndMonth: 4,
  },
  {
    name: "Groundnut",
    basePrice: 5850,
    seasonalFactor: { inSeason: 0.98, offSeason: 1.08 },
    inSeasonStartMonth: 9,
    inSeasonEndMonth: 11,
  },
  {
    name: "Tur (Arhar)",
    basePrice: 7000,
    seasonalFactor: { inSeason: 0.97, offSeason: 1.1 },
    inSeasonStartMonth: 11,
    inSeasonEndMonth: 1,
  },
  {
    name: "Moong",
    basePrice: 8550,
    seasonalFactor: { inSeason: 0.96, offSeason: 1.09 },
    inSeasonStartMonth: 3,
    inSeasonEndMonth: 6,
  },
  {
    name: "Urad",
    basePrice: 6900,
    seasonalFactor: { inSeason: 0.97, offSeason: 1.08 },
    inSeasonStartMonth: 10,
    inSeasonEndMonth: 12,
  },
  {
    name: "Bajra (Pearl Millet)",
    basePrice: 2250,
    seasonalFactor: { inSeason: 0.99, offSeason: 1.06 },
    inSeasonStartMonth: 10,
    inSeasonEndMonth: 11,
  },
  {
    name: "Jowar (Sorghum)",
    basePrice: 2900,
    seasonalFactor: { inSeason: 0.99, offSeason: 1.06 },
    inSeasonStartMonth: 10,
    inSeasonEndMonth: 12,
  },
  {
    name: "Barley",
    basePrice: 1850,
    seasonalFactor: { inSeason: 0.98, offSeason: 1.07 },
    inSeasonStartMonth: 3,
    inSeasonEndMonth: 5,
  },
  {
    name: "Chana (Gram)",
    basePrice: 5440,
    seasonalFactor: { inSeason: 0.97, offSeason: 1.09 },
    inSeasonStartMonth: 3,
    inSeasonEndMonth: 5,
  },
  {
    name: "Sunflower Seed",
    basePrice: 6760,
    seasonalFactor: { inSeason: 0.98, offSeason: 1.07 },
    inSeasonStartMonth: 2,
    inSeasonEndMonth: 4,
  },
  {
    name: "Coffee",
    basePrice: 12000,
    seasonalFactor: { inSeason: 0.99, offSeason: 1.05 },
    inSeasonStartMonth: 11,
    inSeasonEndMonth: 2,
  },
  {
    name: "Tea",
    basePrice: 280,
    seasonalFactor: { inSeason: 1.0, offSeason: 1.04 },
    inSeasonStartMonth: 5,
    inSeasonEndMonth: 10,
  },
  {
    name: "Banana",
    basePrice: 920,
    seasonalFactor: { inSeason: 0.96, offSeason: 1.12 },
    inSeasonStartMonth: 6,
    inSeasonEndMonth: 9,
  },
];

function jitter(base, pct) {
  const delta = base * pct * (Math.random() * 2 - 1);
  return Math.max(1, Math.round(base + delta));
}

async function run() {
  await mongoose.connect(MONGO_URI);
  await Crop.deleteMany({});
  await MarketData.deleteMany({});
  await ExternalFactor.deleteMany({});

  const crops = await Crop.insertMany(CROP_SPECS);
  const idByName = Object.fromEntries(crops.map((c) => [c.name, c._id]));

  const days = 60;
  const now = new Date();
  for (const c of crops) {
    let supply = jitter(c.basePrice * 1.2, 0.15);
    let demand = jitter(c.basePrice * 1.1, 0.15);
    for (let d = days; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      supply = Math.max(1, jitter(supply * 0.98 + Math.random() * 50, 0.05));
      demand = Math.max(1, jitter(demand * 0.99 + Math.random() * 50, 0.05));
      await MarketData.create({
        crop: c._id,
        supply,
        demand,
        date,
      });
    }
  }

  const start = new Date(now);
  start.setMonth(start.getMonth() - 1);
  const end = new Date(now);
  end.setMonth(end.getMonth() + 2);

  await ExternalFactor.create({
    type: "fuel_crisis",
    impact: 1.08,
    affectedCrops: [idByName["Wheat"], idByName["Maize"], idByName["Onion"]],
    startDate: start,
    endDate: end,
    isActive: true,
  });

  await ExternalFactor.create({
    type: "flood",
    impact: 1.15,
    affectedCrops: [idByName["Rice (Paddy)"], idByName["Potato"]],
    startDate: start,
    endDate: end,
    isActive: false,
  });

  console.log(
    `Seeded ${crops.length} crops, market series, and sample external factors.`
  );
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
