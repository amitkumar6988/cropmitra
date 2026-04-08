import React, { useState, useEffect } from "react";
import { axiosInstance } from "../libs/axios";
import BidCard from "../components/BidCard";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function FarmerBidsPage() {
  const { user } = useAuthStore();
  const [bids, setBids] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("=== FARMER BIDS PAGE LOAD ===");
    console.log("Current user:", user);
    fetchBids();
  }, [filter]);

  const fetchBids = async () => {
    setLoading(true);
    try {
      console.log(`Fetching bids with filter: ${filter}`);
      const url = `/bids/farmer/pending?status=${filter}`;
      console.log("API call URL:", url);
      
      const res = await axiosInstance.get(url);
      
      console.log("Bids response:", res.data);
      setBids(res.data.bids || []);
      
      if (!res.data.bids || res.data.bids.length === 0) {
        console.warn("No bids found for farmer");
      }
    } catch (error) {
      console.error("Error fetching bids:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch bids");
    } finally {
      setLoading(false);
    }
  };

  const handleBidUpdated = () => {
    fetchBids();
  };

  const stats = {
    pending: bids.filter(b => b.status === "pending").length,
    counter: bids.filter(b => b.status === "counter_offered").length,
    accepted: bids.filter(b => b.status === "accepted").length,
    rejected: bids.filter(b => b.status === "rejected").length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Bids</h1>
          <p className="text-gray-600">Track and negotiate offers from buyers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Counter Offers</p>
            <p className="text-2xl font-bold text-blue-600">{stats.counter}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["pending", "counter_offered", "accepted", "rejected"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filter === status
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Bids List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading bids...</p>
          </div>
        ) : !bids || bids.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-gray-600 text-lg">No bids found</p>
            <p className="text-gray-500 text-sm">Buyers haven't made any offers on your crops yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map(bid => (
              <BidCard
                key={bid._id}
                bid={bid}
                userRole="farmer"
                onBidUpdated={handleBidUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
