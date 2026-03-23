import React, { useEffect } from "react";
import { useCropMarketStore } from "../store/cropMarketStore";
import { useCartStore } from "../store/cartStore";
import CropFilters from "../components/CropFilters";
import appleImg from "../assets/apple.jpg";
import { useTranslation } from "react-i18next";

const Home = () => {

  const { t } = useTranslation();

  const {
    crops,
    loading,
    fetchCrops,
    page,
    totalPages,
    setPage
  } = useCropMarketStore();

  const { addToCart } = useCartStore();

  useEffect(() => {
    setPage(1);
  }, []);

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

        {/* Loading */}
        {loading && (
          <p className="mt-10 text-base-content/70 animate-pulse text-center">
            {t("home.loading")}
          </p>
        )}

        {/* Empty */}
        {!loading && crops.length === 0 && (
          <p className="mt-10 text-base-content/70 text-center">
            {t("home.noCrops")} 🌱
          </p>
        )}

        {/* GRID */}
        {!loading && crops.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-10">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="group relative bg-base-100 border border-base-300
                  rounded-3xl p-5 shadow-md hover:shadow-xl transition duration-300"
                >

                  <span className="badge badge-success absolute top-4 left-4">
                    {t("home.fresh")}
                  </span>

                  {/* Image */}
                  <div className="h-48 flex items-center justify-center bg-base-200 rounded-2xl overflow-hidden">
                    <img
                      src={crop.images?.[0] || appleImg}
                      alt={crop.name}
                      className="object-contain max-h-full group-hover:scale-110 transition"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = appleImg;
                      }}
                    />
                  </div>

                  {/* Info */}
                  <h3 className="mt-4 text-xl font-bold">
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

                  {/* Button */}
                  <button
                    onClick={() => addToCart(crop.id, 1)}
                    className="btn btn-success w-full mt-4"
                  >
                    {t("home.addToCart")} 🛒
                  </button>

                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-14">

                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn btn-success disabled:opacity-40"
                >
                  ← {t("home.prev")}
                </button>

                <span className="font-semibold">
                  {t("home.page")} {page} {t("home.of")} {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="btn btn-success disabled:opacity-40"
                >
                  {t("home.next")} →
                </button>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Home;