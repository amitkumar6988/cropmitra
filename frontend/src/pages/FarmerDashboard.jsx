import React, { useEffect, useState } from "react";
import { axiosInstance } from "../libs/axios";
import ProfileTopBar from "../components/ProfileTopbar";
import { useNavigate } from "react-router-dom";

const statCards = [
  { key: "totalEarnings",  label: "Total Earnings",   icon: "💰", prefix: "₹", color: "text-green-600"  },
  { key: "totalOrders",    label: "Total Orders",      icon: "📦", prefix: "",  color: "text-blue-600"   },
  { key: "totalCrops",     label: "Crops Listed",      icon: "🌾", prefix: "",  color: "text-emerald-600"},
  { key: "activeBids",     label: "Active Bids",       icon: "💬", prefix: "",  color: "text-orange-500" },
];

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/farmer/dashboard-stats")
      .then(res => setStats(res.data))
      .catch(() => setStats({ totalEarnings: 0, totalOrders: 0, totalCrops: 0, activeBids: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <ProfileTopBar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-500 bg-clip-text text-transparent mb-2">
          Farmer Dashboard 🚜
        </h1>
        <p className="text-gray-500 mb-10">Your farm at a glance</p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {statCards.map(({ key, label, icon, prefix, color }) => (
            <div key={key} className="bg-white/80 backdrop-blur border border-white/40 rounded-3xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition">
              <p className="text-2xl mb-2">{icon}</p>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              {loading
                ? <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3" />
                : <p className={`text-3xl font-bold ${color}`}>
                    {prefix}{(stats?.[key] ?? 0).toLocaleString()}
                  </p>
              }
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Add Crop",      icon: "🌱", path: "/farmer/add-crop"  },
            { label: "My Crops",      icon: "🌾", path: "/farmer/my-crops"  },
            { label: "Orders",        icon: "📦", path: "/farmer/orders"    },
            { label: "Manage Bids",   icon: "💬", path: "/farmer/bids"      },
          ].map(({ label, icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:bg-green-50 hover:border-green-300 hover:shadow-md transition"
            >
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-sm font-medium text-gray-700">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
