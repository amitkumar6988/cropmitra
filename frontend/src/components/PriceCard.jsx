import React from "react";

const trendConfig = {
  up:     { icon: "↑", color: "text-green-500" },
  down:   { icon: "↓", color: "text-red-500"   },
  stable: { icon: "→", color: "text-gray-400"  },
};

export default function PriceCard({ name, price, trend = "stable", change, isTopMover = false }) {
  // Backward-compatible trend: derive from prevPrice if provided, else use existing trend
  const { icon, color } = trendConfig[trend] ?? trendConfig.stable;

  return (
    <div
      className="relative bg-white rounded-xl shadow-sm px-4 py-3 min-w-[140px] flex-shrink-0
        hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-default select-none
        animate-fadeIn"
    >
      {/* Top Mover badge */}
      {isTopMover && (
        <span className="absolute -top-2 -right-2 text-[10px] bg-orange-100 text-orange-600
          font-semibold px-1.5 py-0.5 rounded-full leading-tight whitespace-nowrap">
          🔥 Top
        </span>
      )}

      <p className="font-semibold text-gray-800 text-sm truncate">{name}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">
        ₹{price}<span className="text-xs font-normal text-gray-400">/kg</span>
      </p>
      <p className={`text-sm font-medium mt-0.5 ${color}`}>
        {icon} {change}
      </p>
    </div>
  );
}
