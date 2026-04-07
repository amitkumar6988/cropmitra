import React, { useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../libs/axios";

export default function BidModal({ crop, isOpen, onClose, onBidSubmitted }) {
  const [quantity, setQuantity] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [proposalMessage, setProposalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitBid = async (e) => {
    e.preventDefault();

    console.log("=== BID SUBMISSION DEBUG ===");
    console.log("Crop:", crop);
    console.log("Quantity:", quantity);
    console.log("Bid Price:", bidPrice);
    console.log("ProposalMessage:", proposalMessage);

    if (!quantity || !bidPrice) {
      toast.error("Please fill all fields");
      return;
    }

    if (!crop) {
      toast.error("Crop object is missing");
      console.error("Crop is null or undefined");
      return;
    }

    if (!crop.id) {
      toast.error("Crop ID is missing");
      console.error("Crop ID is missing:", crop);
      return;
    }

    console.log("Quantity available:", crop.quantityAvailable);
    if (!crop.quantityAvailable && crop.quantityAvailable !== 0) {
      toast.error("Crop quantity available is missing");
      return;
    }

    if (parseFloat(quantity) > crop.quantityAvailable) {
      toast.error(`Only ${crop.quantityAvailable} ${crop.unit} available`);
      return;
    }

    setLoading(true);
    try {
      const bidData = {
        cropId: crop.id,
        quantity: parseFloat(quantity),
        bidPrice: parseFloat(bidPrice),
        proposalMessage: proposalMessage || ""
      };

      console.log("Submitting bid data:", bidData);

      const res = await axiosInstance.post("/bids/submit", bidData);

      console.log("Bid response:", res.data);
      toast.success("Bid submitted successfully!");
      setQuantity("");
      setBidPrice("");
      setProposalMessage("");
      onBidSubmitted?.();
      onClose();
    } catch (error) {
      console.error("Bid submission error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to submit bid");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !crop) return null;

  // Calculate available quantity (with fallback)
  const availableQty = crop.quantityAvailable !== undefined 
    ? crop.quantityAvailable 
    : (crop.quantity - (crop.sold || 0)) || 0;

  const totalBidAmount = (parseFloat(quantity) || 0) * (parseFloat(bidPrice) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Make an Offer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Crop Info */}
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <p className="font-semibold text-gray-800">{crop.name}</p>
          <p className="text-sm text-gray-600">
            Listed price: ₹{crop.price}/{crop.unit}
          </p>
          <p className="text-sm text-gray-600">
            Available: {availableQty} {crop.unit}
          </p>
        </div>

        <form onSubmit={handleSubmitBid} className="space-y-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity ({crop.unit})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={availableQty}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Max: ${availableQty}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Bid Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Price (₹/{crop.unit})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={bidPrice}
              onChange={(e) => setBidPrice(e.target.value)}
              placeholder="Enter your offer price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Proposal Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message to Farmer (Optional)
            </label>
            <textarea
              value={proposalMessage}
              onChange={(e) => setProposalMessage(e.target.value)}
              placeholder="e.g., Urgent order, bulk purchase discount expected..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Total Amount */}
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">Total Offer Amount:</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{totalBidAmount.toLocaleString()}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Offer"}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your offer will expire in 7 days if not accepted or countered
        </p>
      </div>
    </div>
  );
}
