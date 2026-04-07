import React, { useState } from "react";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

export default function LeaveReviewModal({ farmerId, orderId, onClose, onSubmitted }) {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) { toast.error("Please select a rating"); return; }
    setLoading(true);
    try {
      await axiosInstance.post("/reviews", { farmerId, orderId, rating, review });
      toast.success("Review submitted!");
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Leave a Review ⭐</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Star picker */}
        <div className="flex gap-1 mb-4 justify-center">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className={`text-3xl transition-transform hover:scale-110 ${
                star <= (hovered || rating) ? "text-yellow-400" : "text-gray-300"
              }`}
            >★</button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={e => setReview(e.target.value)}
          placeholder="Share your experience (optional)..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-4 resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
