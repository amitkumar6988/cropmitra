import { useEffect, useMemo, useState } from "react";
import { getAllCropPrices, displayPricePerKg } from "../api/priceApi";

const normalizePredictionItem = (item) => {
  if (!item) return null;
  const cropId = item._id || item.cropId || item.id || null;
  const name = item.name || item.cropName || item.title || "";
  
  // All prices should already be converted to per-kg by getAllCropPrices()
  const price = item.finalPrice ?? item.price ?? item.currentPrice ?? item.marketPrice ?? 0;
  const maxPrice = item.maxPrice ?? item.finalPrice ?? item.price ?? item.currentPrice ?? item.marketPrice ?? 0;
  const previousPrice = item.previousPrice ?? item.marketPrice ?? item.price ?? item.currentPrice ?? 0;
  const trendPercent = item.trend ?? item.trendPercent ?? item.priceChange ?? null;
  const trend = trendPercent !== null && trendPercent !== undefined
    ? Number(trendPercent)
    : previousPrice && price
      ? Math.round(((price - previousPrice) / previousPrice) * 100 * 10) / 10
      : null;

  return {
    cropId,
    name: String(name).trim(),
    cropName: String(name).trim(),
    price: displayPricePerKg(price),
    finalPrice: displayPricePerKg(price),
    maxPrice: displayPricePerKg(maxPrice),
    trend,
    raw: item
  };
};

const simplifyName = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const usePricePredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllCropPrices();
        const items = data?.data ?? data ?? [];
        const normalized = Array.isArray(items)
          ? items.map(normalizePredictionItem).filter(Boolean)
          : [];
        if (!canceled) setPredictions(normalized);
      } catch (err) {
        if (!canceled) setError(err);
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    load();
    return () => {
      canceled = true;
    };
  }, []);

  const byCropName = useMemo(() => {
    const map = new Map();
    predictions.forEach((prediction) => {
      const key = simplifyName(prediction.name);
      if (key && !map.has(key)) {
        map.set(key, prediction);
      }
    });
    return map;
  }, [predictions]);

  const getPrediction = (crop) => {
    if (!crop) return null;
    const byId = predictions.find((prediction) => prediction.cropId && prediction.cropId === (crop._id || crop.id));
    if (byId) return byId;
    const name = simplifyName(crop.name);
    return byCropName.get(name) || null;
  };

  return {
    predictions,
    loading,
    error,
    getPrediction,
  };
};
