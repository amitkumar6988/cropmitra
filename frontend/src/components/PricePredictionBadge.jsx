import React from "react";
import { convertToPerQuintalByUnit, displayPricePerKg } from "../api/priceApi";

const getTrendColor = (trend) => {
  if (trend > 5) return "text-green-700 bg-green-100";
  if (trend < -5) return "text-red-700 bg-red-100";
  return "text-gray-700 bg-gray-100";
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(0);
};

export default function PricePredictionBadge({ prediction, currentPrice, currentUnit, compact }) {
  if (!prediction) return null;

  // Prediction prices are already normalized to per-kg by the API
  const predictedPricePerKg = prediction.price != null ? Number(prediction.price) : (prediction.finalPrice != null ? Number(prediction.finalPrice) : null);
  const rawMaxPrice = prediction.maxPrice;
  const maxPricePerKg = rawMaxPrice != null ? Number(rawMaxPrice) : null;
  const trend = prediction.trend;
  
  // Current farmer price is in crop.unit
  // For 'kg', it's already per-kg. For other units, normalize properly.
  let currentPricePerKg = Number(currentPrice);
  
  if (currentUnit && currentUnit.toLowerCase() !== 'kg') {
    // For non-kg units (ton, liter, etc), convert to standard per-kg basis
    const currentPricePerQuintal = convertToPerQuintalByUnit(currentPrice, currentUnit);
    currentPricePerKg = displayPricePerKg(currentPricePerQuintal);
  }
  
  // Calculate delta in per-kg terms (both prices now in same unit)
  const delta = predictedPricePerKg != null && currentPricePerKg != null ? Math.round((predictedPricePerKg - currentPricePerKg) * 100) / 100 : null;
  const aboveMarket = maxPricePerKg != null && currentPricePerKg != null && currentPricePerKg > maxPricePerKg;
  const trendLabel = trend !== null && trend !== undefined ? `${trend > 0 ? "+" : ""}${trend}%` : null;

  return (
    <div className={`mt-3 rounded-2xl border p-3 ${compact ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Market prediction
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            ₹{formatPrice(predictedPricePerKg)} / kg
          </p>
        </div>
        {trendLabel && (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getTrendColor(trend)}`}>
            {trendLabel}
          </span>
        )}
      </div>

      {delta !== null && (
        <p className="text-xs text-slate-600 mt-2">
          {delta > 0 ? "Above" : delta < 0 ? "Below" : "At"} current price by ₹{Math.abs(delta).toFixed(2)}
        </p>
      )}

      {aboveMarket && (
        <p className="mt-2 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">
          Listed above market max price
        </p>
      )}
    </div>
  );
}
