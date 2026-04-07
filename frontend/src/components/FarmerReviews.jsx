import React, { useEffect, useState } from "react";
import { axiosInstance } from "../libs/axios";

function StarDisplay({ rating }) {
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function FarmerReviews({ farmerId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmerId) return;
    axiosInstance.get(`/reviews/${farmerId}`)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [farmerId]);

  if (loading) return <div className="h-6 bg-gray-100 rounded animate-pulse w-32" />;
  if (!data || data.totalReviews === 0) {
    return <p className="text-sm text-gray-400 italic">No reviews yet</p>;
  }

  return (
    <div className="mt-4">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-3">
        <StarDisplay rating={data.averageRating} />
        <span className="text-sm font-semibold text-gray-700">{data.averageRating} / 5</span>
        <span className="text-xs text-gray-400">({data.totalReviews} review{data.totalReviews !== 1 ? "s" : ""})</span>
      </div>

      {/* List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {data.reviews.map(r => (
          <div key={r._id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800">{r.userId?.name || "User"}</span>
              <StarDisplay rating={r.rating} />
            </div>
            {r.review && <p className="text-xs text-gray-600">{r.review}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
