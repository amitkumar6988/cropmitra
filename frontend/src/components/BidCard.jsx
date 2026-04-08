import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../libs/axios";

export default function BidCard({ bid, userRole, onBidUpdated }) {
  const navigate = useNavigate();

  const [counterPrice, setCounterPrice] = useState("");
  const [counterQty, setCounterQty] = useState("");
  const [message, setMessage] = useState("");
  const [showCounter, setShowCounter] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit bid state
  const [showEdit, setShowEdit] = useState(false);
  const [editPrice, setEditPrice] = useState("");
  const [editQty, setEditQty] = useState("");

  const lastOffer = bid.negotiationHistory[bid.negotiationHistory.length - 1];
  const isExpired = new Date(bid.expiryDate) < new Date();
  const orderId = bid.order?._id || bid.order;
  const orderStatus = bid.order?.status || "";

  const handleReject = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/bids/${bid._id}/reject`);
      toast.success("Bid rejected");
      onBidUpdated?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject bid");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/bids/${bid._id}/accept`);
      toast.success("Bid accepted successfully!");
      onBidUpdated?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept bid");
    } finally {
      setLoading(false);
    }
  };

  const handleCounterOffer = async (e) => {
    e.preventDefault();
    if (!counterPrice || !counterQty) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.patch(`/bids/${bid._id}/counter-offer`, {
        counterPrice: parseFloat(counterPrice),
        counterQuantity: parseFloat(counterQty),
        message: message || "Counter offer"
      });
      toast.success("Counter offer sent!");
      setCounterPrice("");
      setCounterQty("");
      setMessage("");
      setShowCounter(false);
      onBidUpdated?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send counter offer");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounterOffer = async () => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/bids/${bid._id}/accept-counter`);
      toast.success("Counter offer accepted!");
      onBidUpdated?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept counter offer");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditPrice(String(bid.bidPrice));
    setEditQty(String(bid.quantity));
    setShowEdit(true);
  };

  const handleEditBid = async (e) => {
    e.preventDefault();
    if (!editPrice || !editQty) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.put(`/bids/${bid._id}`, {
        bidPrice: parseFloat(editPrice),
        quantity: parseFloat(editQty)
      });
      toast.success("Bid updated successfully");
      setShowEdit(false);
      onBidUpdated?.(res.data.bid);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update bid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">
            {bid.crop?.name}
          </h3>
          <p className="text-sm text-gray-600">
            {userRole === "farmer" ? `From: ${bid.buyer?.name}` : `Farmer: ${bid.farmer?.name}`}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            bid.status === "accepted"
              ? "bg-green-100 text-green-800"
              : bid.status === "rejected"
              ? "bg-red-100 text-red-800"
              : bid.status === "counter_offered"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {bid.status.replace("_", " ").toUpperCase()}
        </span>
      </div>

      {/* Bid Details */}
      <div className="grid grid-cols-3 gap-3 mb-4 bg-gray-50 p-3 rounded">
        <div>
          <p className="text-xs text-gray-600">Quantity</p>
          <p className="font-semibold">{lastOffer.quantity} {bid.unit}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Price per Unit</p>
          <p className="font-semibold">₹{lastOffer.price}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Amount</p>
          <p className="font-semibold text-green-600">
            ₹{(lastOffer.quantity * lastOffer.price).toLocaleString()}
          </p>
        </div>
      </div>

      {orderId && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">
                Order created
              </p>
              <p className="text-sm text-emerald-800 mt-1">
                Order #{String(orderId).slice(-6)}
              </p>
              {orderStatus && (
                <p className="text-xs text-emerald-700 mt-1">
                  Status: {orderStatus}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              {/* Pay Now — buyer only, when payment is still pending */}
              {userRole === "buyer" && bid.order?.paymentStatus === "PENDING" && (
                <button
                  onClick={() => navigate(`/payment/${bid._id}`, { state: { bid } })}
                  className="px-3 py-2 text-xs font-semibold rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  💳 Pay Now
                </button>
              )}
              <button
                onClick={() => navigate(userRole === "farmer" ? "/farmer/orders" : "/orders")}
                className="px-3 py-2 text-xs font-semibold rounded bg-emerald-700 text-white hover:bg-emerald-800 transition"
              >
                View order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation History */}
      {bid.negotiationHistory.length > 0 && (
        <div className="mb-4 bg-blue-50 p-3 rounded max-h-40 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-700 mb-2">Negotiation History:</p>
          <div className="space-y-2">
            {bid.negotiationHistory.map((item, idx) => (
              <div key={idx} className="text-xs text-gray-600">
                <span className="font-semibold capitalize">{item.role}</span>
                {" "}
                <span className="capitalize">{item.action}</span>
                {item.price && ` - ₹${item.price}`}
                {item.quantity && ` - ${item.quantity} ${bid.unit}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired Banner */}
      {isExpired && bid.status === "pending" && (
        <div className="mb-3 bg-red-100 text-red-700 p-2 rounded text-xs">
          This bid has expired and is no longer active
        </div>
      )}

      {/* Actions based on role and status */}
      <div className="flex gap-2">
        {userRole === "farmer" && bid.status === "pending" && !isExpired && (
          <>
            <button
              onClick={() => setShowCounter(!showCounter)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              Counter Offer
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
              disabled={loading}
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition disabled:opacity-50"
              disabled={loading}
            >
              Reject
            </button>
          </>
        )}

        {userRole === "farmer" && bid.status === "counter_offered" && !isExpired && (
          <>
            <button
              onClick={() => setShowCounter(!showCounter)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              Counter Again
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
              disabled={loading}
            >
              Accept
            </button>
          </>
        )}

        {userRole === "buyer" && bid.status === "counter_offered" && !isExpired && (
          <button
            onClick={handleAcceptCounterOffer}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
            disabled={loading}
          >
            Accept Counter Offer
          </button>
        )}

        {/* Edit button — buyer only, not on accepted/rejected */}
        {userRole === "buyer" && bid.status !== "accepted" && bid.status !== "rejected" && !isExpired && (
          <button
            onClick={handleOpenEdit}
            className="px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition disabled:opacity-50"
            disabled={loading}
          >
            Edit Bid
          </button>
        )}
      </div>

      {/* Edit Bid Form */}
      {showEdit && userRole === "buyer" && (
        <form onSubmit={handleEditBid} className="mt-3 bg-orange-50 border border-orange-200 p-3 rounded">
          <p className="text-sm font-semibold mb-2 text-orange-800">Update Your Bid:</p>
          <div className="space-y-2">
            <input
              type="number"
              step="0.01"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              placeholder="Quantity"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="number"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder={`Price (₹/${bid.unit})`}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-2 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Bid"}
              </button>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 px-2 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Counter Offer Form */}
      {showCounter && userRole === "farmer" && (
        <form onSubmit={handleCounterOffer} className="mt-3 bg-gray-50 p-3 rounded">
          <p className="text-sm font-semibold mb-2">Send Counter Offer:</p>
          <div className="space-y-2">
            <input
              type="number"
              step="0.01"
              value={counterQty}
              onChange={(e) => setCounterQty(e.target.value)}
              placeholder="Quantity"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              step="0.01"
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              placeholder={`Price (₹/${bid.unit})`}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message (optional)"
              rows="2"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Send Counter
              </button>
              <button
                type="button"
                onClick={() => setShowCounter(false)}
                className="flex-1 px-2 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
