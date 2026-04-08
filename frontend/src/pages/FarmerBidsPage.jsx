import React, { useState, useEffect } from "react";
import { axiosInstance } from "../libs/axios";
import BidCard from "../components/BidCard";
import toast from "react-hot-toast";

export default function FarmerBidsPage() {
  const [allBids, setAllBids] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      // Fetch all statuses in parallel since backend defaults to "pending" when no status given
      const statuses = ["pending", "counter_offered", "accepted", "rejected"];
      const results = await Promise.all(
        statuses.map(s => axiosInstance.get(`/bids/farmer/pending?status=${s}`))
      );
      const combined = results.flatMap(r => r.data.bids || []);
      
      console.log("=== ALL BIDS FETCHED ===");
      console.log("Total bids:", combined.length);
      console.log("Accepted bids:", combined.filter(b => b.status === "accepted").length);
      console.log("Pending bids:", combined.filter(b => b.status === "pending").length);
      console.log("Counter offered bids:", combined.filter(b => b.status === "counter_offered").length);
      console.log("Rejected bids:", combined.filter(b => b.status === "rejected").length);
      
      setAllBids(combined);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch bids");
    } finally {
      setLoading(false);
    }
  };

  const handleBidUpdated = () => fetchBids();

  // Compute stats from ALL bids (case-insensitive)
  const stats = {
    pending: allBids.filter(b => b.status?.toLowerCase() === "pending").length,
    counter: allBids.filter(b => b.status?.toLowerCase() === "counter_offered").length,
    accepted: allBids.filter(b => b.status?.toLowerCase() === "accepted").length,
    rejected: allBids.filter(b => b.status?.toLowerCase() === "rejected").length,
  };

  // Filter bids for display (case-insensitive)
  const filteredBids = allBids.filter(b => b.status?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Bids</h1>
          <p className="text-gray-600">Track and negotiate offers from buyers</p>
        </div>

        {/* Stats Cards — always from allBids */}
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

        {/* Filter Buttons — client-side only */}
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

        {/* Bids List — from filteredBids */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading bids...</p>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-gray-600 text-lg">No bids found</p>
            <p className="text-gray-500 text-sm">
              {allBids.length === 0 
                ? "Buyers haven't made any offers on your crops yet"
                : `No ${filter.replace("_", " ")} bids`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map(bid => (
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
