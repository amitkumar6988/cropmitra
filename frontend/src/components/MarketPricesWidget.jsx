import React, { useEffect, useState } from "react";
import { getAllCropPrices, displayPricePerKg } from "../api/priceApi";

export default function MarketPricesWidget() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketPrices();
  }, []);

  const fetchMarketPrices = async () => {
    setLoading(true);
    try {
      const data = await getAllCropPrices();
      const source = Array.isArray(data) ? data : data?.data ?? [];
      // Get top 5 crops
      const topCrops = Array.isArray(source)
        ? source.slice(0, 5)
        : Object.values(source).slice(0, 5);
      setPrices(topCrops);
    } catch (error) {
      console.error("Failed to fetch market prices:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <p className="text-sm text-gray-600 animate-pulse">Loading market prices...</p>
      </div>
    );
  }

  if (!prices || prices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <h3 className="font-semibold text-lg">📊 Live Market Prices</h3>
        <p className="text-xs text-green-100">Today's average market rates per kilogram</p>
      </div>

      <div className="divide-y">
        {prices.map((crop, idx) => {
          const cropName = crop.cropName || crop.name || `Crop ${idx + 1}`;
          // All prices from getAllCropPrices() are already in per-kg format
          const price = crop.finalPrice ?? crop.price ?? crop.currentPrice ?? crop.marketPrice ?? 0;
          const pricePerKg = displayPricePerKg(price);
          const trend = crop.trend ?? crop.trendPercent ?? 0;

          return (
            <div key={idx} className="p-3 flex items-between justify-between hover:bg-gray-50 transition">
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{cropName}</p>
                <p className="text-xs text-gray-600">₹{Math.round(pricePerKg)}/kg</p>
              </div>
              <div className="text-right">
                {trend > 0 ? (
                  <p className="text-sm font-semibold text-green-600">
                    ↑ {Math.round(trend)}%
                  </p>
                ) : trend < 0 ? (
                  <p className="text-sm font-semibold text-red-600">
                    ↓ {Math.round(Math.abs(trend))}%
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-gray-600">→ Stable</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-gray-50 border-t">
        <p className="text-xs text-gray-600 text-center">
          💡 Prices update every 6 hours and are cached for persistence
        </p>
      </div>
    </div>
  );
}
