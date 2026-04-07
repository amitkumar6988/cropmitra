import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  PlusCircle,
  Award,
  MessageSquare,
  Phone,
  Share2,
  MapPin,
  Truck,
  ShoppingCart,
} from "lucide-react";

import farmer from "../assets/farmer.jpg";
import AddCropModal from "../components/AddCropModal";
import Certifications from "../components/Certifications";
import Reviews from "../components/Reviews";

const ProfileFarmerSidebar = ({ user }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Toggle open / close
  const handleToggleSection = (section) => {
    setActiveSection((prev) => (prev === section ? "dashboard" : section));
  };

  const handleAddCropClick = () => {
    document.getElementById("add_crop_modal").showModal();
  };

  const handleManageBidsClick = () => {
    navigate("/farmer/bids");
  };

  return (
    <div className="w-full max-w-xs bg-white rounded-3xl shadow-lg border border-gray-100 p-6">

      {/* PROFILE */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative">
          <img
            src={farmer}
            alt="Farmer"
            className="w-32 h-32 rounded-full object-cover border-4 border-green-50"
          />
          <div className="absolute bottom-1 right-1 bg-green-500 p-1.5 rounded-full border-4 border-white">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        </div>

        <h2 className="mt-4 text-xl font-bold uppercase text-gray-800">
          {user?.farmName || "Green Valley Organics"}
        </h2>

        <div className="flex items-center text-gray-500 text-sm mt-1">
          <MapPin size={14} className="mr-1" />
          Nashik, Maharashtra
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-2 mb-6">
        <SidebarItem
          icon={<User size={20} />}
          label="Dashboard"
          active={activeSection === "dashboard"}
          onClick={() => setActiveSection("dashboard")}
        />

        <SidebarItem
          icon={<PlusCircle size={20} />}
          label="Add New Crop"
          onClick={handleAddCropClick}
        />

        <SidebarItem
          icon={<ShoppingCart size={20} />}
          label="Manage Bids"
          onClick={handleManageBidsClick}
        />

        <SidebarItem
          icon={<Award size={20} />}
          label="Certifications"
          active={activeSection === "certifications"}
          onClick={() => handleToggleSection("certifications")}
        />

        <SidebarItem
          icon={<MessageSquare size={20} />}
          label="Reviews"
          active={activeSection === "reviews"}
          onClick={() => handleToggleSection("reviews")}
        />
      </nav>

      {/* DYNAMIC CONTENT */}
      {activeSection === "certifications" && (
        <div className="mb-6">
          <Certifications />
        </div>
      )}

      {activeSection === "reviews" && (
        <div className="mb-6">
          <Reviews />
        </div>
      )}

      {/* CONTACT */}
      <div className="space-y-3">
        <button className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-xl font-semibold">
          <Phone size={18} />
          WhatsApp: +91 98765
        </button>

        <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold shadow-md">
          <Share2 size={18} />
          SHARE PROFILE
        </button>
      </div>

      {/* LOGISTICS */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-green-600 uppercase font-bold mb-3 text-center">
          Logistics Tracking
        </p>

        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">DISTANCE TO HUB</span>
            <p className="font-bold text-gray-700">45 KM</p>
          </div>

          <div className="w-12 h-12 bg-white rounded-xl border flex items-center justify-center">
            <Truck size={26} className="text-green-600" />
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AddCropModal />
    </div>
  );
};

// SIDEBAR ITEM
const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active
        ? "bg-green-600 text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

export default ProfileFarmerSidebar;
