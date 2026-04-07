import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFarmerCropStore } from "../store/farmerCropStore";
import ProfileTopBar from "../components/ProfileTopbar";
import PricePredictionBadge from "../components/PricePredictionBadge";
import { usePricePredictions } from "../hooks/usePricePredictions";
import { useTranslation } from "react-i18next";

const MyCrops = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    crops,
    fetchFarmerCrops,
    deleteCrop,
    updateCrop,
    fetchLoading,
    deleteLoading,
    updateLoading,
    updatingCropId
  } = useFarmerCropStore();

  const [editingCropId, setEditingCropId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [priceError, setPriceError] = useState(null);

  const { getPrediction, loading: predictionLoading } = usePricePredictions();

  const startPriceEdit = (crop) => {
    setEditingCropId(crop._id);
    setEditPrice(String(crop.price));
    setPriceError(null);
  };

  const cancelPriceEdit = () => {
    setEditingCropId(null);
    setEditPrice("");
    setPriceError(null);
  };

  const savePriceEdit = async (crop) => {
    const priceValue = Number(editPrice);
    if (!priceValue || priceValue <= 0) {
      setPriceError("Please enter a valid price greater than 0");
      return;
    }

    const updated = await updateCrop(crop._id, { price: priceValue });
    if (updated) {
      cancelPriceEdit();
    }
  };

  useEffect(() => {
    fetchFarmerCrops();
  }, []);

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-green-50">
        <p className="text-xl font-semibold text-green-700 animate-pulse">
          {t("myCrops.loading")}
        </p>
      </div>
    );
  }

  return (
    <>
      <ProfileTopBar />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">

        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-10">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                🌾 {t("myCrops.title")}
              </h1>

              <p className="text-gray-500 mt-1">
                {t("myCrops.subtitle")}
              </p>
            </div>

          </div>

          {/* EMPTY STATE */}
          {crops.length === 0 ? (
            <div className="text-center mt-20">

              <p className="text-gray-500 text-lg">
                {t("myCrops.empty")}
              </p>

              <button
                onClick={() => navigate("/farmer/add-crop")}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                {t("myCrops.addFirst")} 🌱
              </button>

            </div>
          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

              {crops.map((crop) => (
                <div
                  key={crop._id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
                >

                  {/* IMAGE */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={crop.images?.[0] || "/no-image.png"}
                      alt={crop.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">

                    <h3 className="text-lg font-bold text-gray-800">
                      {crop.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {crop.category}
                    </p>

                    {editingCropId === crop._id ? (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Update price (₹/{crop.unit})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                        {priceError && (
                          <p className="text-xs text-red-600">{priceError}</p>
                        )}
                        <div className="flex gap-3">
                          <button
                            onClick={() => savePriceEdit(crop)}
                            disabled={updateLoading && updatingCropId === crop._id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold transition disabled:opacity-50"
                          >
                            {updateLoading && updatingCropId === crop._id ? "Saving..." : "Save Price"}
                          </button>
                          <button
                            onClick={cancelPriceEdit}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-xl font-semibold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-extrabold text-green-600 mt-2">
                          ₹{crop.price}
                          <span className="text-sm text-gray-400 font-normal">
                            /{crop.unit}
                          </span>
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {t("myCrops.stock")} {crop.quantity} {crop.unit}
                        </p>

                        {crop.organic && (
                          <span className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                            {t("myCrops.organic")} 🌿
                          </span>
                        )}

                        <div className="mt-4">
                          <PricePredictionBadge
                            prediction={getPrediction(crop)}
                            currentPrice={crop.price}
                            currentUnit={crop.unit}
                            compact
                          />
                          {predictionLoading && (
                            <p className="text-xs text-slate-500 mt-2">
                              {t("myCrops.predictionLoading") || "Loading price insight..."}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 grid gap-3">
                          <button
                            onClick={() => startPriceEdit(crop)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition"
                          >
                            Edit Price
                          </button>
                          <button
                            disabled={deleteLoading}
                            onClick={() => deleteCrop(crop._id)}
                            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 rounded-xl font-semibold transition"
                          >
                            {deleteLoading ? t("myCrops.deleting") : t("myCrops.delete")}
                          </button>
                        </div>
                      </>
                    )}

                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyCrops;