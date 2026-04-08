import React, { useEffect, useRef, useState } from "react";
import { useCropMarketStore } from "../store/cropMarketStore";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import CropFilters from "../components/CropFilters";
import BidModal from "../components/BidModal";
import PriceTicker from "../components/PriceTicker";
import PricePredictionBadge from "../components/PricePredictionBadge";
import { usePricePredictions } from "../hooks/usePricePredictions";
import appleImg from "../assets/apple.jpg";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";

const Home = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCropForBid, setSelectedCropForBid] = useState(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const {
    crops,
    loading,
    fetchCrops,
    fetchMoreCrops,
    page,
    totalPages,
    setPage
  } = useCropMarketStore();

  const { addToCart } = useCartStore();
  const { getPrediction } = usePricePredictions();
  const { toggle: toggleWishlist, isWishlisted, isToggling, fetchWishlist } = useWishlistStore();
  const navigate = useNavigate();

  // Reset scroll position on mount — prevents stale scroll state from previous route
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "";        // clear any leaked overflow lock
    document.documentElement.style.overflow = "";
  }, []);

  // Shuffle once per fetch — stable across re-renders, doesn't mutate original
  const [displayedCrops, setDisplayedCrops] = useState([]);
  useEffect(() => {
    setDisplayedCrops([...crops].sort(() => Math.random() - 0.5));
  }, [crops]);

  // Trending = highest sold count; Best Deals = discount > 0 or price below average
  const trendingCrops = [...crops].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 6);
  const bestDeals     = crops.filter(c => (c.discount ?? 0) > 0).slice(0, 6);

  // Sentinel element observed for infinite scroll
  const sentinelRef = useRef(null);

  // Re-attach observer whenever crops change so it always picks up the sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Read fresh state at call time to avoid stale closure
          const { loading, page, totalPages } = useCropMarketStore.getState();
          if (!loading && page < totalPages) {
            fetchMoreCrops();
          }
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [crops]); // re-run after every crops update so sentinel is always observed

  useEffect(() => {
    const urlPage   = parseInt(searchParams.get("page"))   || 1;
    const urlSearch = searchParams.get("search") || "";

    // Sync URL search param into store (triggers fetchCrops via setSearch)
    const { search: storeSearch, setSearch } = useCropMarketStore.getState();
    if (urlSearch && urlSearch !== storeSearch) {
      setSearch(urlSearch);   // setSearch already resets page + fetches
      return;
    }

    if (page !== urlPage) {
      setPage(urlPage);
    } else if (crops.length === 0 && !loading) {
      fetchCrops();
    }
    // eslint-disable-next-line
  }, [searchParams.get("page"), searchParams.get("search")]);

  return (
    <div className="min-h-screen bg-base-200 text-base-content">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HERO */}
        <div className="relative mb-10 overflow-hidden rounded-2xl
          bg-gradient-to-r from-green-600 to-emerald-500
          px-8 py-8 text-white shadow-xl">

          <div className="flex items-center justify-between gap-6 flex-wrap">

            <div className="max-w-xl">
              <h1 className="text-3xl font-bold leading-snug">
                {t("home.heroTitle")}
              </h1>

              <p className="mt-2 text-green-100">
                {t("home.heroSubtitle")}
              </p>
            </div>

            <button className="btn bg-white text-green-700 hover:bg-gray-100">
              {t("home.explore")} →
            </button>

          </div>

          <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/20 rounded-full blur-2xl"></div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-2">
          {t("home.heading")} 🌾
        </h2>

        <p className="text-base-content/70 mb-6">
          {t("home.description")}
        </p>

        <CropFilters />

        {/* Price Ticker */}
        <div className="mt-6 mb-4">
          <PriceTicker />
        </div>

        {/* Initial loading — only shown before first page arrives */}
        {loading && crops.length === 0 && (
          <p className="mt-10 text-base-content/70 animate-pulse text-center">
            {t("home.loading")}
          </p>
        )}

        {/* Empty */}
        {!loading && crops.length === 0 && (
          <p className="mt-10 text-base-content/70 text-center">
            {searchParams.get("search")
              ? `No crops found for "${searchParams.get("search")}" 🌱`
              : `${t("home.noCrops")} 🌱`}
          </p>
        )}

        {/* GRID */}
        {crops.length > 0 && (
          <>
            {/* 🔥 Trending Crops */}
            {trendingCrops.length > 0 && (
              <div className="mt-8 mb-2">
                <p className="text-lg font-bold text-gray-800 mb-3">🔥 Trending Crops</p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {trendingCrops.map(c => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/crop/${c.id}`)}
                      className="bg-white rounded-2xl shadow-sm border border-orange-100 p-3
                        min-w-[140px] flex-shrink-0 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
                    >
                      <div className="h-20 flex items-center justify-center bg-orange-50 rounded-xl overflow-hidden mb-2">
                        <img src={c.images?.[0] || appleImg} alt={c.name}
                          className="object-contain max-h-full"
                          onError={e => { e.currentTarget.src = appleImg; }} />
                      </div>
                      <p className="font-semibold text-gray-800 text-xs truncate">{c.name}</p>
                      <p className="text-orange-600 font-bold text-xs">₹{c.price}/{c.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 💰 Best Deals */}
            {bestDeals.length > 0 && (
              <div className="mt-6 mb-2">
                <p className="text-lg font-bold text-gray-800 mb-3">💰 Best Deals</p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {bestDeals.map(c => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/crop/${c.id}`)}
                      className="bg-white rounded-2xl shadow-sm border border-green-100 p-3
                        min-w-[140px] flex-shrink-0 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
                    >
                      <div className="h-20 flex items-center justify-center bg-green-50 rounded-xl overflow-hidden mb-2">
                        <img src={c.images?.[0] || appleImg} alt={c.name}
                          className="object-contain max-h-full"
                          onError={e => { e.currentTarget.src = appleImg; }} />
                      </div>
                      <p className="font-semibold text-gray-800 text-xs truncate">{c.name}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-green-600 font-bold text-xs">₹{c.price}/{c.unit}</p>
                        {c.discount > 0 && (
                          <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-1 rounded">
                            -{c.discount}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-10">
              {displayedCrops.map((crop) => (
                <div
                  key={crop.id}
                  className="group relative bg-base-100 border border-base-300
                  rounded-3xl p-5 shadow-md hover:shadow-xl transition duration-300"
                >

                  {/* Image with wishlist heart and fresh badge overlaid inside */}
                  <div
                    className="relative h-48 flex items-center justify-center bg-base-200 rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/crop/${crop.id}`)}
                  >
                    <img
                      src={crop.images?.[0] || appleImg}
                      alt={crop.name}
                      className="object-contain max-h-full group-hover:scale-110 transition"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = appleImg;
                      }}
                    />
                    {/* Fresh badge — top-left, always fully visible */}
                    <span className="absolute top-2 left-2 z-10 badge badge-success">
                      {t("home.fresh")}
                    </span>
                    {/* Wishlist heart — top-right, always visible */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(crop.id); }}
                      disabled={isToggling(crop.id)}
                      className="absolute top-2 right-2 z-10 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center text-base hover:scale-110 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isWishlisted(crop.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {isWishlisted(crop.id) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  {/* Info */}
                  <h3
                    className="mt-4 text-xl font-bold cursor-pointer hover:text-green-700 transition"
                    onClick={() => navigate(`/crop/${crop.id}`)}
                  >
                    {crop.name}
                  </h3>

                  <p className="text-base-content/70 text-sm">
                    👨‍🌾 {crop.farmerName || t("home.verifiedFarmer")}
                  </p>

                  {/* Price */}
                  <p className="text-2xl font-extrabold text-green-600 mt-2">
                    ₹{crop.price}
                    <span className="text-sm text-base-content/60 font-normal">
                      /{crop.unit}
                    </span>
                  </p>

                  <PricePredictionBadge
                    prediction={getPrediction(crop)}
                    currentPrice={crop.price}
                    compact
                  />

                  {/* Button */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => addToCart(crop.id, 1)}
                      className="btn btn-success flex-1"
                    >
                      {t("home.addToCart")} 🛒
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCropForBid(crop);
                        setIsBidModalOpen(true);
                      }}
                      className="btn btn-outline btn-primary flex-1"
                      title="Make an offer to the farmer"
                    >
                      💰 Bid
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Pagination buttons — fallback for no-JS / accessibility */}
            {totalPages > 1 && (
              <noscript>
                <div className="flex justify-center items-center gap-6 mt-14">
                  <button
                    disabled={page === 1}
                    onClick={() => setSearchParams((prev) => { prev.set("page", page - 1); return prev; })}
                    className="btn btn-success disabled:opacity-40"
                  >
                    ← {t("home.prev")}
                  </button>
                  <span className="font-semibold">
                    {t("home.page")} {page} {t("home.of")} {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setSearchParams((prev) => { prev.set("page", page + 1); return prev; })}
                    className="btn btn-success disabled:opacity-40"
                  >
                    {t("home.next")} →
                  </button>
                </div>
              </noscript>
            )}
          </>
        )}

      </div>

      {/* Infinite scroll sentinel — always in DOM so observer always works */}
      <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-6">
        {loading && crops.length > 0 && (
          <p className="text-base-content/60 animate-pulse text-sm">
            {t("home.loading")}
          </p>
        )}
        {!loading && page >= totalPages && crops.length > 0 && (
          <p className="text-base-content/40 text-sm">
            🌾 You've seen all available crops
          </p>
        )}
      </div>

      {/* Bid Modal */}
      <BidModal
        crop={selectedCropForBid}
        isOpen={isBidModalOpen}
        onClose={() => {
          setIsBidModalOpen(false);
          // Clear crop after modal closes to avoid backdrop flash
          setTimeout(() => setSelectedCropForBid(null), 0);
        }}
        onBidSubmitted={() => {
          setIsBidModalOpen(false);
          setTimeout(() => setSelectedCropForBid(null), 0);
        }}
      />
    </div>
  );
};

export default Home;