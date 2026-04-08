import React, { useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import appleImg from "../assets/apple.jpg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CartPage = () => {

  const { t } = useTranslation();

  const {
    cart,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  // fetchCart is stable (zustand), but omit from deps to prevent infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading state while cart is being fetched
  const { loading } = useCartStore();

  // Guard: cart items may have a null/unpopulated crop if data is stale
  const safeCart = (cart || []).filter((item) => item?.crop?._id);

  const totalAmount = safeCart.reduce(
    (sum, item) => sum + (item.priceAtAddTime || item.crop.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse text-lg">Loading cart…</p>
      </div>
    );
  }

  if (!safeCart || safeCart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex flex-col items-center justify-center text-center">
        <div className="text-7xl mb-4">🛒</div>

        <h2 className="text-2xl font-bold mb-2">
          {t("cart.emptyTitle")}
        </h2>

        <p className="text-gray-500">
          {t("cart.emptySubtitle")}
        </p>

        <button
          onClick={() => navigate("/home")}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
        >
          {t("cart.continueShopping")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
      
      <div className="max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold mb-2">
          {t("cart.myCart")} 🛒
        </h1>

        <p className="text-gray-500 mb-8">
          {t("cart.reviewItems")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            {safeCart.map((item) => (
              <div
                key={item.crop._id}
                className="group bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition duration-300 flex flex-col sm:flex-row gap-6"
              >

                <div className="w-full sm:w-36">
                  <div className="h-36 flex items-center justify-center bg-gradient-to-br from-green-50 to-white rounded-2xl overflow-hidden">
                    <img
                      src={item.crop.images?.[0] || appleImg}
                      alt={item.crop.name}
                      className="object-contain max-h-full group-hover:scale-110 transition duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = appleImg;
                      }}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {item.crop.name}
                  </h3>

                  <p className="text-gray-500">
                    ₹{item.priceAtAddTime || item.crop.price} / {item.crop.unit}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    👨‍🌾 {item.crop.farmerName || t("cart.verifiedFarmer")}
                  </p>

                  <div className="flex items-center gap-3 mt-4">

                    <button
                      onClick={() =>
                        updateQuantity(item.crop._id, item.quantity - 1)
                      }
                      disabled={item.quantity === 1}
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-lg font-semibold"
                    >
                      −
                    </button>

                    <span className="font-semibold text-lg">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.crop._id, item.quantity + 1)
                      }
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-semibold"
                    >
                      +
                    </button>

                  </div>
                </div>

                <div className="flex sm:flex-col justify-between items-end">
                  <p className="text-xl font-extrabold text-green-600">
                    ₹{(item.priceAtAddTime || item.crop.price) * item.quantity}
                  </p>

                  <button
                    onClick={() => removeItem(item.crop._id)}
                    className="text-red-500 text-sm hover:underline mt-3"
                  >
                    {t("cart.remove")}
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-lg h-fit">

            <h2 className="text-xl font-bold mb-5">
              {t("cart.orderSummary")}
            </h2>

            <div className="flex justify-between text-gray-600 mb-2">
              <span>{t("cart.items")}</span>
              <span>{safeCart.length}</span>
            </div>

            <div className="flex justify-between text-gray-600 mb-2">
              <span>{t("cart.delivery")}</span>
              <span className="text-green-600 font-semibold">
                {t("cart.free")}
              </span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-xl font-bold mb-6">
              <span>{t("cart.total")}</span>
              <span className="text-green-600">
                ₹{totalAmount}
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              disabled={safeCart.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 rounded-2xl font-semibold hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("cart.checkout")} →
            </button>

            <button
              onClick={clearCart}
              className="w-full mt-4 text-red-500 text-sm hover:underline"
            >
              {t("cart.clearCart")}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;