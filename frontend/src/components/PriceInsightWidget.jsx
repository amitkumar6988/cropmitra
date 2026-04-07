import { useEffect, useState } from "react";
import { getPricePrediction, calculatePriceTrend, getTrendStatus, convertToPerQuintalByUnit } from "../api/priceApi";

const PriceInsightWidget = ({ cropName, currentPrice, currentUnit }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    if (!cropName) {
      setLoading(false);
      return;
    }

    const fetchPrediction = async () => {
      try {
        // Calculate trend using per-quintal values
        const currentPricePerQuintal = convertToPerQuintalByUnit(currentPrice, currentUnit);
        const predictedPrice = data?.predictedPrice ?? data?.price ?? data?.finalPrice ?? currentPricePerQuintal;
        const trendPercent = calculatePriceTrend(predictedPrice, currentPricePerQuintal);
        setTrend({ percent: trendPercent, status: getTrendStatus(trendPercent) });
      } catch (err) {
        console.log("Trend calc error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [cropName, currentPrice, currentUnit, data]);

  if (loading) return <div className="text-sm text-gray-500">Loading price insights...</div>;
  if (!data) return null;

  const currentPricePerQuintal = convertToPerQuintalByUnit(currentPrice, currentUnit);
  const currentMarketPrice = data.price ?? data.predictedPrice ?? data.finalPrice ?? currentPricePerQuintal;
  const recommendedPrice = Math.round(currentMarketPrice * 0.95);
  const premiumPrice = Math.round(currentMarketPrice * 1.05);

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
      <h4 className="font-semibold text-sm text-gray-700 mb-3">💡 Price Insights</h4>

      {trend && (
        <div className="mb-3 p-2 bg-white rounded border border-blue-100">
          <p className="text-xs text-gray-600">Market Trend</p>
          <p className="text-sm font-bold text-gray-800">
            {trend.status === "up" ? "📈" : trend.status === "down" ? "📉" : "→"} {Math.abs(trend.percent)}%{" "}
            {trend.status === "up" ? "Up" : trend.status === "down" ? "Down" : "Stable"}
          </p>
        </div>
      )}

      {/* Price Recommendations */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white p-2 rounded text-center border border-gray-200">
          <p className="text-xs text-gray-600">Market Price</p>
          <p className="font-bold text-gray-800 text-sm">₹{Math.round(currentMarketPrice / 100)} / kg</p>
        </div>
        <div className="bg-green-50 p-2 rounded text-center border border-green-200">
          <p className="text-xs text-green-700">Competitive</p>
          <p className="font-bold text-green-700 text-sm">₹{Math.round(recommendedPrice / 100)} / kg</p>
        </div>
        <div className="bg-blue-50 p-2 rounded text-center border border-blue-200">
          <p className="text-xs text-blue-700">Premium</p>
          <p className="font-bold text-blue-700 text-sm">₹{Math.round(premiumPrice / 100)} / kg</p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white p-3 rounded border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">💭 Recommendation:</p>
        {trend && trend.percent > 10 ? (
          <p className="text-xs text-green-700">
            📈 Prices are rising! Consider listing at ₹{premiumPrice} or higher to maximize profit. Market demand is strong.
          </p>
        ) : trend && trend.percent < -10 ? (
          <p className="text-xs text-orange-700">
            📉 Prices are declining. List at ₹{recommendedPrice} to stay competitive. Price may drop further.
          </p>
        ) : (
          <p className="text-xs text-blue-700">
            → Prices are stable. List at ₹{Math.round(currentMarketPrice / 100)} for best market alignment.
          </p>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        💼 Bulk pricing tip: Consider offering 5% discount for bulk orders to attract wholesale buyers.
      </p>
    </div>
  );
};

export default PriceInsightWidget;
