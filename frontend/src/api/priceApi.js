import { axiosInstance } from "../libs/axios";

// Cache for persistent price data across app relaunch
const CACHE_KEY = "cropmitra_prices_cache";
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

/**
 * Get cached prices from localStorage
 */
const getCachedPrices = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Return cached data if still valid (within 6 hours)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
    
    // Clear expired cache
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (err) {
    console.error("Error reading price cache:", err);
    return null;
  }
};

/**
 * Save prices to localStorage cache
 */
const cachePrices = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error("Error caching prices:", err);
  }
};

/**
 * Get all crop prices (market prices for all crops)
 * Returns prices normalized to per-kg format
 */
export const getAllCropPrices = async () => {
  try {
    // Try to use cache first
    const cached = getCachedPrices();
    if (cached) {
      return normalizeHistoricalPrices(cached);
    }

    const res = await axiosInstance.get("/price-prediction/prices");
    const data = res.data || [];
    
    // Cache the raw data
    cachePrices(data);
    
    // Return normalized (per-kg) data
    return normalizeHistoricalPrices(data);
  } catch (err) {
    console.error("Failed to fetch all crop prices:", err);
    
    // Try to return cached data on error
    const cached = getCachedPrices();
    return cached ? normalizeHistoricalPrices(cached) : [];
  }
};

/**
 * Get price prediction for a specific crop
 */
export const getPricePrediction = async (cropId) => {
  try {
    const res = await axiosInstance.get(
      `/price-prediction/prices?cropId=${cropId}`
    );
    return res.data || null;
  } catch (err) {
    console.error("Failed to fetch price prediction:", err);
    return null;
  }
};

/**
 * Get historical price data for a crop
 */
export const getPriceHistory = async (cropId, limit = 30) => {
  try {
    const res = await axiosInstance.get(
      `/price-prediction/prices/history?cropId=${cropId}&limit=${limit}`
    );
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch price history:", err);
    return [];
  }
};

/**
 * Calculate price trend percentage
 * Returns: positive = price going up, negative = price going down
 */
export const calculatePriceTrend = (currentPrice, historicalPrice) => {
  if (!historicalPrice || historicalPrice === 0) return 0;
  const change = currentPrice - historicalPrice;
  const percentage = (change / historicalPrice) * 100;
  return Math.round(percentage * 10) / 10; // Round to 1 decimal
};

/**
 * Get trend status based on percentage change
 * Returns: "up" | "down" | "stable"
 */
export const getTrendStatus = (trendPercent) => {
  if (trendPercent > 2) return "up";
  if (trendPercent < -2) return "down";
  return "stable";
};

/**
 * Get trend emoji and label
 */
export const getTrendLabel = (trendPercent) => {
  if (trendPercent > 2) return { emoji: "📈", label: "Up" };
  if (trendPercent < -2) return { emoji: "📉", label: "Down" };
  return { emoji: "→", label: "Stable" };
};

/**
 * Convert price from per quintal to per kg
 * Standard conversion: 1 quintal = 100 kg
 * Predictions come in quintal units, need to convert to per-kg
 */
export const displayPricePerKg = (pricePerQuintal) => {
  if (!pricePerQuintal) return 0;
  // Convert: divide by 100 to get per-kg rate
  return Math.round((pricePerQuintal / 100) * 100) / 100;
};

/**
 * Convert price from per kg to per quintal
 */
export const convertToPerQuintal = (pricePerKg) => {
  if (!pricePerKg) return 0;
  return pricePerKg * 100;
};

/**
 * Convert to per quintal based on crop unit
 * Some crops are measured in different units (kg, liter, etc)
 */
export const convertToPerQuintalByUnit = (price, unit = "kg") => {
  if (!price) return 0;
  
  // Unit conversion to kg first
  const unitConversions = {
    "kg": 1,
    "g": 0.001,
    "lb": 0.453592,
    "oz": 0.0283495,
    "quintal": 100,
    "ton": 1000,
    "liter": 1, // For liquids, assume 1L ≈ 1 kg
    "ml": 0.001,
  };

  const kgEquivalent = price * (unitConversions[unit?.toLowerCase()] || 1);
  
  // Now convert to per 100-unit (quintal) basis
  return kgEquivalent * 100;
};

/**
 * Format price for display
 */
export const formatPrice = (price) => {
  if (!price) return "₹0";
  return `₹${Math.round(price)}`;
};

/**
 * Get recommendation text based on price trend
 */
export const getPriceRecommendation = (trendPercent, currentPrice, marketPrice) => {
  if (trendPercent > 10) {
    return {
      text: "Prices rising! Consider listing higher, demand is strong.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    };
  } else if (trendPercent < -10) {
    return {
      text: "Prices declining. List competitively to stay in demand.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    };
  } else {
    return {
      text: "Prices stable. List at market rate for best conversions.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    };
  }
};

/**
 * Normalize price prediction response
 * Ensures all fields are properly converted to per-kg
 */
export const normalizePrediction = (prediction) => {
  if (!prediction) return null;

  return {
    ...prediction,
    finalPrice: displayPricePerKg(prediction.finalPrice),
    maxPrice: displayPricePerKg(prediction.maxPrice),
    minPrice: displayPricePerKg(prediction.minPrice),
    marketPrice: displayPricePerKg(prediction.marketPrice),
    currentPrice: displayPricePerKg(prediction.currentPrice),
  };
};

/**
 * Normalize historical price points
 */
export const normalizeHistoricalPoints = (points) => {
  if (!Array.isArray(points)) return [];
  
  return points.map((point) => ({
    ...point,
    price: displayPricePerKg(point.price),
  }));
};

/**
 * Normalize all prices in a crop list to per-kg format
 * Maintains backward compatibility with various data formats
 */
export const normalizeHistoricalPrices = (crops) => {
  if (!Array.isArray(crops)) return crops;
  
  return crops.map((crop) => ({
    ...crop,
    // Normalize all price fields to per-kg
    finalPrice: crop.finalPrice ? displayPricePerKg(crop.finalPrice) : crop.finalPrice,
    maxPrice: crop.maxPrice ? displayPricePerKg(crop.maxPrice) : crop.maxPrice,
    minPrice: crop.minPrice ? displayPricePerKg(crop.minPrice) : crop.minPrice,
    marketPrice: crop.marketPrice ? displayPricePerKg(crop.marketPrice) : crop.marketPrice,
    currentPrice: crop.currentPrice ? displayPricePerKg(crop.currentPrice) : crop.currentPrice,
    price: crop.price ? displayPricePerKg(crop.price) : crop.price,
    predictedPrice: crop.predictedPrice ? displayPricePerKg(crop.predictedPrice) : crop.predictedPrice,
  }));
};
