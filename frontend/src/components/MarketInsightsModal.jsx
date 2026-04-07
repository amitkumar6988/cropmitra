import React, { useState, useMemo } from "react";

const trendConfig = {
  up:     { icon: "↑", color: "text-green-500" },
  down:   { icon: "↓", color: "text-red-500"   },
  stable: { icon: "→", color: "text-gray-400"  },
};

export default function MarketInsightsModal({ items, onClose }) {
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState("default"); // "default" | "price-asc" | "price-desc" | "trend"

  const filtered = useMemo(() => {
    let list = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sortBy === "price-asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "trend")      list = [...list].sort((a, b) => a.trend.localeCompare(b.trend));
    return list;
  }, [items, search, sortBy]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col
          transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">📊 Full Market Insights</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search + Sort controls */}
        <div className="px-6 py-3 border-b border-gray-100 flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-1.5
              focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5
              focus:outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="trend">Trend</option>
          </select>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-4 gap-2 px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <span className="col-span-2">Crop</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change</span>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No crops match your search.</p>
          ) : (
            filtered.map((item, i) => {
              const { icon, color } = trendConfig[item.trend] ?? trendConfig.stable;
              return (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-2 px-6 py-3 items-center hover:bg-gray-50 transition-all"
                >
                  <span className="col-span-2 font-medium text-gray-800 text-sm">{item.name}</span>
                  <span className="text-right text-sm font-bold text-gray-900">₹{item.price}/kg</span>
                  <span className={`text-right text-sm font-semibold ${color}`}>{icon} {item.change}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">Prices are indicative market averages</p>
        </div>
      </div>
    </div>
  );
}
