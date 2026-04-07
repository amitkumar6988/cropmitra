import React, { useEffect, useRef, useState } from "react";
import PriceCard from "./PriceCard";
import MarketInsightsModal from "./MarketInsightsModal";
import { getAllCropPrices, displayPricePerKg } from "../api/priceApi";

const FALLBACK = [
  { name: "Wheat",  price: 22, trend: "up",     change: "+2%"   },
  { name: "Rice",   price: 24, trend: "stable",  change: "0%"    },
  { name: "Maize",  price: 20, trend: "down",    change: "-1.5%" },
  { name: "Tomato", price: 18, trend: "up",      change: "+3%"   },
  { name: "Onion",  price: 15, trend: "down",    change: "-2%"   },
];

function normalizeTrend(val) {
  if (val == null) return "stable";
  if (val > 0) return "up";
  if (val < 0) return "down";
  return "stable";
}

function formatChange(val) {
  if (val == null) return "0%";
  const rounded = Math.round(Math.abs(val));
  if (val > 0) return `+${rounded}%`;
  if (val < 0) return `-${rounded}%`;
  return "0%";
}

/** Parse numeric magnitude from a change string like "+3%" → 3 */
function changeMagnitude(changeStr) {
  return Math.abs(parseFloat(changeStr) || 0);
}

/** Skeleton card — matches PriceCard dimensions */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm px-4 py-3 min-w-[140px] flex-shrink-0 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

export default function PriceTicker() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Drag-to-scroll refs
  const scrollRef  = useRef(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    getAllCropPrices()
      .then((data) => {
        const source = Array.isArray(data) ? data : data?.data ?? [];
        const normalized = source.length
          ? source.map((c, i) => ({
              name:   c.cropName || c.name || `Crop ${i + 1}`,
              price:  Math.round(displayPricePerKg(c.finalPrice ?? c.price ?? c.currentPrice ?? c.marketPrice ?? 0)),
              trend:  normalizeTrend(c.trend ?? c.trendPercent),
              change: formatChange(c.trend ?? c.trendPercent),
            }))
          : FALLBACK;
        setItems(normalized);
      })
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  // Identify top 2 movers by change magnitude
  const topMoverNames = React.useMemo(() => {
    if (!items.length) return new Set();
    const sorted = [...items].sort((a, b) => changeMagnitude(b.change) - changeMagnitude(a.change));
    return new Set(sorted.slice(0, 2).map((i) => i.name));
  }, [items]);

  // Drag-to-scroll handlers
  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current     = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x    = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm py-3 shadow-sm rounded-xl mb-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-600">📈 Live Market Prices</p>
        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-medium text-green-600 hover:text-green-700 hover:underline transition-all"
        >
          View Full Market Insights →
        </button>
      </div>

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide cursor-grab"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item, i) => (
              <PriceCard
                key={i}
                {...item}
                isTopMover={topMoverNames.has(item.name)}
              />
            ))}
      </div>

      {modalOpen && (
        <MarketInsightsModal items={items} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
