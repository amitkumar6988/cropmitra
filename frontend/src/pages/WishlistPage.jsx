import React, { useEffect } from "react";
import { useWishlistStore } from "../store/wishlistStore";
import { useNavigate } from "react-router-dom";
import appleImg from "../assets/apple.jpg";

export default function WishlistPage() {
  const { wishlist, fetchWishlist, toggle } = useWishlistStore();
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, []);

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 gap-4">
        <p className="text-5xl">❤️</p>
        <p className="text-gray-500 text-lg font-medium">Your wishlist is empty</p>
        <button onClick={() => navigate("/home")} className="text-green-600 underline text-sm">
          Browse crops →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-lime-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">❤️ My Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {wishlist.map(crop => (
            <div key={crop._id || crop.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
              <div
                className="h-32 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden mb-3 cursor-pointer"
                onClick={() => navigate(`/crop/${crop._id || crop.id}`)}
              >
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
              <button
                onClick={() => toggle(crop._id || crop.id)}
                className="mt-2 text-xs text-red-400 hover:text-red-600 transition"
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
