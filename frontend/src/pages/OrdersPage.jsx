import React, { useEffect } from "react";
import { useOrderStore } from "../store/orderStore";
import { useNavigate } from "react-router-dom";
import appleImg from "../assets/apple.jpg";
import { useTranslation } from "react-i18next";

const OrdersPage = () => {

  const { t } = useTranslation();

  const { orders, fetchMyOrders, loading } = useOrderStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg animate-pulse">
          {t("orders.loading")}
        </p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex flex-col items-center justify-center text-center">
        <div className="text-7xl mb-4">📦</div>

        <h2 className="text-2xl font-bold mb-2">
          {t("orders.emptyTitle")}
        </h2>

        <p className="text-gray-500">
          {t("orders.emptySubtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
      
      <div className="max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold mb-2">
          {t("orders.myOrders")} 📦
        </h1>

        <p className="text-gray-500 mb-8">
          {t("orders.reviewOrders")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">

          {orders.flatMap((order) =>
            order.items.map((item, index) => (
              
              <div
                key={`${order._id}-${index}`}
                className="group relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-5 shadow-lg hover:shadow-2xl hover:-translate-y-3 transition duration-500"
              >

                {/* STATUS BADGE */}
                <span className={`
                  absolute top-4 left-4 text-xs px-3 py-1 rounded-full shadow font-medium
                  ${order.status?.toLowerCase() === "delivered"
                    ? "bg-green-600 text-white"
                    : order.status?.toLowerCase() === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-blue-600 text-white"}
                `}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>

                {/* Image */}
                <div className="h-44 flex items-center justify-center bg-gradient-to-br from-green-50 to-white rounded-2xl overflow-hidden">
                  <img
                    src={item.crop?.images?.[0] || appleImg}
                    alt={item.crop?.name}
                    className="object-contain max-h-full group-hover:scale-125 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.src = appleImg;
                    }}
                  />
                </div>

                {/* Info */}
                <h3 className="mt-4 text-xl font-bold tracking-tight truncate">
                  {item.crop?.name}
                </h3>

                <p className="text-gray-400 text-sm">
                  {t("orders.order")} #{order._id.slice(-6)}
                </p>

                <p className="text-2xl font-extrabold text-green-600 mt-2">
                  ₹{item.price * item.quantity}
                </p>

                <p className="text-sm text-gray-500">
                  {t("orders.qty")}: {item.quantity}
                </p>

                {order.status?.toLowerCase() === "shipped" && (
                  <button
                    onClick={() => navigate(`/track/${order._id}`)}
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                  >
                    {t("orders.track")}
                  </button>
                )}

              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
};

export default OrdersPage;