import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../libs/axios";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import BidModal from "../components/BidModal";
import PricePredictionBadge from "../components/PricePredictionBadge";
import FarmerReviews from "../components/FarmerReviews";
import { usePricePredictions } from "../hooks/usePricePredictions";
import appleImg from "../assets/apple.jpg";

// ── Enhanced FarmerReviews wrapper with friendly empty state ────────────────
function ReviewsSection({ farmerId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!farmerId) { setLoading(false); return; }
    axiosInstance.get(`/reviews/${farmerId}`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [farmerId]);

  if (loading) return <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />;

  if (!data || data.totalReviews === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-3xl mb-2">💬</p>
        <p className="text-gray-500 font-medium">No reviews yet.</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to review after your order!</p>
      </div>
    );
  }

  // Delegate to existing FarmerReviews for the actual list
  return <FarmerReviews farmerId={farmerId} />;
}

// ── Related crop card ────────────────────────────────────────────────────────
function RelatedCard({ crop, navigate }) {
  return (
    <div
      onClick={() => navigate(`/crop/${crop.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer
        hover:shadow-md hover:-translate-y-1 transition-all duration-200
        min-w-[150px] flex-shrink-0"
    >
      <div className="h-28 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden mb-3">
        <img
          src={crop.images?.[0] || appleImg}
          alt={crop.name}
          className="object-contain max-h-full"
          onError={e => { e.currentTarget.src = appleImg; }}
        />
      </div>
      <p className="font-semibold text-gray-800 text-sm truncate">{crop.name}</p>
      <p className="text-green-600 font-bold text-sm mt-0.5">
        ₹{crop.price}<span className="text-gray-400 font-normal">/{crop.unit}</span>
      </p>
    </div>
  );
}

// ── Horizontal recommendation strip ─────────────────────────────────────────
function RecommendSection({ title, emoji, crops, navigate, viewAllHref }) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">
          {emoji} {title}
        </h2>
        <a
          href={viewAllHref}
          className="text-sm text-green-600 hover:text-green-700 hover:underline transition"
        >
          View all →
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {crops.map(c => (
          <RelatedCard key={c.id} crop={c} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

// ── Category emoji helper ────────────────────────────────────────────────────
function categoryEmoji(cat) {
  const map = { fruit: "🍎", vegetable: "🥦", grain: "🌾", pulse: "🫘", other: "🌿" };
  return map[cat?.toLowerCase()] ?? "🌱";
}

// ── Farmer reputation score (derived, non-breaking) ──────────────────────────
function FarmerReputation({ farmerId }) {
  const [rep, setRep] = useState(null);

  useEffect(() => {
    if (!farmerId) return;
    // Reuse existing reviews endpoint for rating
    axiosInstance.get(`/reviews/${farmerId}`)
      .then(r => setRep(prev => ({ ...prev, rating: r.data.averageRating, reviews: r.data.totalReviews })))
      .catch(() => {});
    // Reuse existing farmer orders endpoint for order count + success rate
    axiosInstance.get("/orders/farmer")
      .then(r => {
        const orders = r.data.orders ?? [];
        const total     = orders.length;
        const delivered = orders.filter(o => o.status === "DELIVERED").length;
        setRep(prev => ({
          ...prev,
          totalOrders:  total,
          successRate:  total > 0 ? Math.round((delivered / total) * 100) : null,
        }));
      })
      .catch(() => {});
  }, [farmerId]);

  if (!rep) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-2">
      {rep.rating != null && rep.rating > 0 && (
        <span className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 font-semibold px-2 py-1 rounded-full">
          ⭐ {rep.rating} / 5 {rep.reviews > 0 ? `(${rep.reviews})` : ""}
        </span>
      )}
      {rep.totalOrders > 0 && (
        <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 font-semibold px-2 py-1 rounded-full">
          📦 {rep.totalOrders} orders
        </span>
      )}
      {rep.successRate != null && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border
          ${rep.successRate >= 80
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-orange-50 border-orange-200 text-orange-700"}`}>
          ✅ {rep.successRate}% success
        </span>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CropDetailPage() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { addToCart } = useCartStore();
  const { getPrediction } = usePricePredictions();
  const { toggle: toggleWishlist, isWishlisted, isToggling, fetchWishlist } = useWishlistStore();

  useEffect(() => { fetchWishlist(); }, []);

  const [crop, setCrop]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [bidOpen, setBidOpen]     = useState(false);
  const [qty, setQty]             = useState(1);
  // Recommendation buckets
  const [sameCat, setSameCat]     = useState([]);   // same category as current crop
  const [veggies, setVeggies]     = useState([]);   // vegetables
  const [grains, setGrains]       = useState([]);   // grains + pulses

  useEffect(() => {
    setLoading(true);
    setSameCat([]); setVeggies([]); setGrains([]);

    axiosInstance.get(`/crops/${id}`)
      .then(res => {
        const c = res.data;
        setCrop(c);

        const exclude = c.id || c._id;

        // Fetch same-category (up to 8, excluding current)
        if (c.category) {
          axiosInstance.get(`/crops?category=${c.category}`)
            .then(r => setSameCat(
              (r.data.crops || []).filter(x => x.id !== exclude).slice(0, 8)
            ))
            .catch(() => {});
        }

        // Fetch vegetables (only if current crop isn't already a vegetable)
        if (c.category !== "vegetable") {
          axiosInstance.get("/crops?category=vegetable")
            .then(r => setVeggies((r.data.crops || []).slice(0, 6)))
            .catch(() => {});
        }

        // Fetch grains + pulses (two calls, merge client-side)
        if (!["grain", "pulse"].includes(c.category)) {
          Promise.all([
            axiosInstance.get("/crops?category=grain").catch(() => ({ data: { crops: [] } })),
            axiosInstance.get("/crops?category=pulse").catch(() => ({ data: { crops: [] } })),
          ]).then(([gRes, pRes]) => {
            const merged = [
              ...(gRes.data.crops || []),
              ...(pRes.data.crops || []),
            ].slice(0, 8);
            setGrains(merged);
          });
        }
      })
      .catch(() => setCrop(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Reset qty when crop changes
  useEffect(() => { setQty(1); }, [id]);

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
        <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded mb-8" />
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-gray-200 rounded-3xl min-h-[320px]" />
            <div className="flex flex-col gap-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded w-2/3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────
  if (!crop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 gap-4">
        <p className="text-4xl">🌱</p>
        <p className="text-gray-500 text-lg">Crop not found.</p>
        <button onClick={() => navigate("/home")} className="text-green-600 underline text-sm">
          ← Back to marketplace
        </button>
      </div>
    );
  }

  const prediction   = getPrediction(crop);
  const farmerId     = crop.farmer?._id || crop.farmer;
  const isOutOfStock = (crop.quantityAvailable ?? 0) <= 0;
  const maxQty       = crop.quantityAvailable ?? 99;

  // Bulk pricing helper — falls back to flat price if no tiers defined
  const getEffectivePrice = (quantity) => {
    const tiers = crop.bulkPricing;
    if (!tiers || tiers.length === 0) return crop.price;
    let applicable = crop.price;
    for (const tier of tiers) {
      if (quantity >= tier.minQty) applicable = tier.price;
    }
    return applicable;
  };
  const effectivePrice = getEffectivePrice(qty);
  const hasBulkDiscount = crop.bulkPricing?.length > 0 && effectivePrice < crop.price;

  // Price signal from prediction
  const predictedPrice = prediction?.price ?? prediction?.finalPrice;
  let priceSignal = null;
  if (predictedPrice && crop.price) {
    priceSignal = crop.price <= predictedPrice ? "good" : "high";
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* Back + Wishlist */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-500 hover:text-green-700 inline-flex items-center gap-1 transition"
            >
              ← Back
            </button>
            <button
              onClick={() => toggleWishlist(crop.id || crop._id)}
              disabled={isToggling(crop.id || crop._id)}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-xl border transition
                hover:scale-105 active:scale-95
                border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isWishlisted(crop.id || crop._id) ? "Remove from wishlist" : "Save to wishlist"}
            >
              {isWishlisted(crop.id || crop._id) ? "❤️ Saved" : "🤍 Save"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-10">

            {/* ── Left: Image ─────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-md overflow-hidden flex items-center justify-center p-6 min-h-[320px]">
              <img
                src={crop.images?.[0] || appleImg}
                alt={crop.name}
                className="object-contain max-h-72 w-full"
                onError={e => { e.currentTarget.src = appleImg; }}
              />
            </div>

            {/* ── Right: Info ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                {crop.organic && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
                    🌿 Organic
                  </span>
                )}
                {crop.category && (
                  <span className="text-xs bg-gray-100 text-gray-600 font-medium px-3 py-1 rounded-full capitalize">
                    {crop.category}
                  </span>
                )}
                {isOutOfStock && (
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-3 py-1 rounded-full">
                    Out of stock
                  </span>
                )}
                {/* Price signal badge */}
                {priceSignal === "good" && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
                    ✅ Good price
                  </span>
                )}
                {priceSignal === "high" && (
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-3 py-1 rounded-full">
                    ⚠️ Above market
                  </span>
                )}
              </div>

              {/* Name + price */}
              <h1 className="text-3xl font-bold text-gray-900">{crop.name}</h1>

              <p className={`text-3xl font-extrabold ${priceSignal === "high" ? "text-red-500" : "text-green-600"}`}>
                ₹{effectivePrice}
                <span className="text-base font-normal text-gray-400"> /{crop.unit}</span>
                {hasBulkDiscount && (
                  <span className="ml-2 text-sm line-through text-gray-400 font-normal">₹{crop.price}</span>
                )}
              </p>

              {/* Bulk pricing tiers */}
              {crop.bulkPricing?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">💰 Bulk Discounts</p>
                  <div className="flex flex-wrap gap-2">
                    {crop.bulkPricing.map((tier, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium
                        ${qty >= tier.minQty ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700"}`}>
                        {tier.minQty}+ {crop.unit} → ₹{tier.price}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock */}
              <p className="text-sm text-gray-500">
                Available:{" "}
                <span className={`font-semibold ${isOutOfStock ? "text-red-500" : "text-gray-700"}`}>
                  {crop.quantityAvailable ?? 0} {crop.unit}
                </span>
              </p>

              {/* Description */}
              {crop.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{crop.description}</p>
              )}

              {/* Market prediction badge */}
              <PricePredictionBadge
                prediction={prediction}
                currentPrice={crop.price}
                currentUnit={crop.unit}
              />

              {/* ── Quantity selector ──────────────────────────────────── */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      className="px-3 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100
                        disabled:opacity-30 transition"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-semibold text-gray-800 min-w-[2.5rem] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                      disabled={qty >= maxQty}
                      className="px-3 py-2 text-lg font-bold text-gray-600 hover:bg-gray-100
                        disabled:opacity-30 transition"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">{crop.unit}</span>
                </div>
              )}

              {/* ── Sticky action buttons ──────────────────────────────── */}
              <div className="flex gap-3 mt-2 sticky bottom-4 z-10">
                <button
                  disabled={isOutOfStock}
                  onClick={() => addToCart(crop.id || crop._id, qty)}
                  className="flex-1 bg-green-600 hover:bg-green-700 active:scale-95 text-white
                    font-semibold py-3 rounded-2xl shadow-md transition
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  🛒 Add {qty > 1 ? `${qty} ${crop.unit} · ₹${effectivePrice * qty}` : ""} to Cart
                </button>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setBidOpen(true)}
                  className="flex-1 border-2 border-green-600 text-green-700 font-semibold
                    py-3 rounded-2xl hover:bg-green-50 active:scale-95 shadow-sm transition
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  💰 Bid
                </button>
              </div>

            </div>
          </div>

          {/* ── Farmer Info ───────────────────────────────────────────── */}
          {crop.farmer && (
            <div className="mt-10 bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">👨‍🌾 Farmer Details</h2>
              <div className="flex items-center gap-4">
                {crop.farmer.profileImage ? (
                  <img
                    src={crop.farmer.profileImage}
                    alt={crop.farmer.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl border-2 border-green-200">
                    🌾
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-base">
                      {crop.farmer.name ?? crop.farmerName}
                    </p>
                    <span className="text-xs bg-green-600 text-white font-semibold px-2 py-0.5 rounded-full">
                      ✓ Verified Farmer
                    </span>
                  </div>
                  {crop.farmer.location && (
                    <p className="text-sm text-gray-500 mt-0.5">📍 {crop.farmer.location}</p>
                  )}
                  {crop.location && !crop.farmer.location && (
                    <p className="text-sm text-gray-500 mt-0.5">📍 {crop.location}</p>
                  )}
                  {/* Reputation score — derived from existing APIs, non-breaking */}
                  <FarmerReputation farmerId={farmerId} />
                </div>
              </div>
            </div>
          )}

          {/* ── Reviews ───────────────────────────────────────────────── */}
          <div className="mt-8 bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">⭐ Farmer Reviews</h2>
            <ReviewsSection farmerId={farmerId} />
          </div>

          {/* ── Recommendations ───────────────────────────────────── */}

          {/* Same category */}
          {sameCat.length > 0 && (
            <RecommendSection
              title={`More ${crop.category} crops`}
              emoji={categoryEmoji(crop.category)}
              crops={sameCat}
              navigate={navigate}
              viewAllHref={`/home?category=${crop.category}`}
            />
          )}

          {/* Vegetables */}
          {veggies.length > 0 && (
            <RecommendSection
              title="You may also like"
              emoji="🥦"
              crops={veggies}
              navigate={navigate}
              viewAllHref="/home?category=vegetable"
            />
          )}

          {/* Grains & Pulses */}
          {grains.length > 0 && (
            <RecommendSection
              title="Grains & Pulses"
              emoji="🌾"
              crops={grains}
              navigate={navigate}
              viewAllHref="/home?category=grain"
            />
          )}

        </div>
      </div>

      {/* Bid modal — unchanged */}
      <BidModal
        crop={crop}
        isOpen={bidOpen}
        onClose={() => setBidOpen(false)}
        onBidSubmitted={() => setBidOpen(false)}
      />
    </>
  );
}
