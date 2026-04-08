import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../libs/axios";
import axios from "axios";
import toast from "react-hot-toast";

export default function BidPaymentPage() {
  const { bidId }  = useParams();
  const { state }  = useLocation(); // bid passed via navigate state
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);

  const bid = state?.bid;

  // Order is already created when bid is accepted — use bid.order
  const orderId = bid?.order?._id || bid?.order;

  const cropName     = bid?.crop?.name    ?? "Crop";
  const unit         = bid?.unit          ?? "";
  const displayPrice = bid?.finalPrice    ?? 0;
  const displayQty   = bid?.finalQuantity ?? 0;
  const displayTotal = displayPrice * displayQty;

  // ── Guard: no bid data ─────────────────────────────────────────────────────
  if (!bid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 gap-4">
        <p className="text-gray-500 text-lg">Bid details not found.</p>
        <button onClick={() => navigate("/bids")} className="text-green-600 underline text-sm">
          ← Back to My Bids
        </button>
      </div>
    );
  }

  // ── Guard: no order linked to bid ─────────────────────────────────────────
  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 gap-4 p-6">
        <p className="text-4xl">⚠️</p>
        <p className="text-gray-700 text-lg font-semibold text-center">Order not found for this bid.</p>
        <p className="text-gray-500 text-sm text-center">
          The order may not have been created yet. Please check your bids page.
        </p>
        <button onClick={() => navigate("/bids")} className="text-green-600 underline text-sm">
          ← Back to My Bids
        </button>
      </div>
    );
  }

  // ── COD ───────────────────────────────────────────────────────────────────
  const handleCOD = () => {
    toast.success("Order placed! Cash on Delivery confirmed.");
    navigate("/orders");
  };

  // ── UPI / Razorpay ────────────────────────────────────────────────────────
  const handleUPI = async () => {
    setLoading(true);
    try {
      // Get Razorpay key
      const { data: keyData } = await axios.get("/api/getkey");
      const key = keyData.key;

      // Create Razorpay payment order using the existing order ID from the bid
      const { data: rpData } = await axiosInstance.post("/payment/create-order", {
        orderId,
      });
      const rpOrder = rpData.razorpayOrder;

      // Open Razorpay popup
      const options = {
        key,
        amount:      rpOrder.amount,
        currency:    "INR",
        name:        "CropMitra",
        description: `Payment for ${cropName}`,
        order_id:    rpOrder.id,
        handler: async (response) => {
          await axiosInstance.post("/payment/verify", response);
          toast.success("Payment successful! Order confirmed.");
          navigate("/orders");
        },
        prefill: {},
        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">

        <div className="text-center mb-6">
          <p className="text-3xl mb-2">💳</p>
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          <p className="text-sm text-gray-500 mt-1">Review your order and choose a payment method</p>
        </div>

        {/* Order summary */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Order Summary
          </h2>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Crop</span>
            <span className="font-semibold">{cropName}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Quantity</span>
            <span className="font-semibold">{displayQty} {unit}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Price per unit</span>
            <span className="font-semibold">₹{displayPrice}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span className="text-green-600">₹{displayTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment options */}
        <div className="space-y-3">
          <button
            onClick={handleUPI}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700
              text-white font-semibold py-3 rounded-2xl transition disabled:opacity-50"
          >
            📱 Pay via UPI / Card
          </button>
          <button
            onClick={handleCOD}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border-2 border-green-600
              text-green-700 font-semibold py-3 rounded-2xl hover:bg-green-50 transition disabled:opacity-50"
          >
            🚚 Cash on Delivery
          </button>
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-400 mt-4 animate-pulse">Processing…</p>
        )}

        <button
          onClick={() => navigate("/bids")}
          className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition"
        >
          ← Back to My Bids
        </button>

      </div>
    </div>
  );
}
