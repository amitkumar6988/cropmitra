import React, { useEffect } from "react";
import ChatBot from "./components/ChatBot";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import DashboardNavbar from "./components/Navbar";
import CartModal from "./components/CartModal";
import { Toaster } from "react-hot-toast";
import TrackOrder from "./pages/TrackOrder";
import ScrollToTop from "./components/ScrollToTop";

import DeliveryTest from "./pages/DeliveryTest";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CartPage from "./pages/CartPage";
import Profile from "./pages/Profile";
import OrdersPage from "./pages/OrdersPage";
import AddCrop from "./pages/AddCrop";
import MyCrops from "./pages/MyCrops";
import FarmerOrders from "./pages/FarmerOrders"; // ⭐ NEW
import MyBidsPage from "./pages/MyBidsPage";
import FarmerBidsPage from "./pages/FarmerBidsPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import BidPaymentPage from "./pages/BidPaymentPage";
import CropDetailPage from "./pages/CropDetailPage";
import WishlistPage from "./pages/WishlistPage";

// Admin
import AdminLayout from "./components/AdminLayout";
import AdminUsers from "./pages/AdminUsers";
import AdminFarmers from "./pages/AdminFarmers";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Store
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import { useWishlistStore } from "./store/wishlistStore";

import "./App.css";
import Addresses from "./pages/Addresses";
import Checkout from "./pages/Checkout";
import PriceInsightsPage from "./pages/PriceInsightsPage.jsx";
import AdminPriceFactors from "./pages/AdminPriceFactors.jsx";

//////////////////////////////////////////////////////
// ⭐ INNER COMPONENT
//////////////////////////////////////////////////////

function AppContent() {
  const { fetchUser } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const location = useLocation();

  //----------------------------------

  useEffect(() => {
    fetchUser();
    fetchCart();
    fetchWishlist();
  }, []);

  //----------------------------------
  // 🔥 ROUTES WHERE NAVBAR SHOULD HIDE
  //----------------------------------

  const hideNavbarRoutes = [
    "/profile",
    "/admin",
    "/farmer", // ⭐ hide navbar for farmer panel
  ];

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  //----------------------------------

  return (
    <>
      <ScrollToTop />
      {!shouldHideNavbar && <DashboardNavbar />}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: "16px",
            padding: "16px 24px",
          },
        }}
      />
         
      <CartModal />
      <ChatBot/>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* USER */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track/:orderId" element={<TrackOrder />} />
        <Route path="/delivery" element={<DeliveryTest />} />
        <Route path="/bids" element={<ProtectedRoute roles={["user", "farmer"]}><MyBidsPage /></ProtectedRoute>} />
        <Route path="/payment/:bidId" element={<ProtectedRoute roles={["user", "farmer"]}><BidPaymentPage /></ProtectedRoute>} />
        <Route path="/crop/:id" element={<CropDetailPage />} />
        <Route path="/wishlist" element={<ProtectedRoute roles={["user", "farmer"]}><WishlistPage /></ProtectedRoute>} />

        <Route
          path="/price-insights"
          element={
            <ProtectedRoute roles={["user", "farmer", "admin"]}>
              <PriceInsightsPage />
            </ProtectedRoute>
          }
        />

        {/* FARMER PROTECTED */}
        <Route
          path="/farmer/orders"
          element={
            <ProtectedRoute role="farmer">
              <FarmerOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/dashboard"
          element={
            <ProtectedRoute role="farmer">
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/bids"
          element={
            <ProtectedRoute role="farmer">
              <FarmerBidsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/add-crop"
          element={
            <ProtectedRoute role="farmer">
              <AddCrop />
            </ProtectedRoute>
          }
        />

        <Route
          path="/farmer/my-crops"
          element={
            <ProtectedRoute role="farmer">
              <MyCrops />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="farmers" element={<AdminFarmers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="price-factors" element={<AdminPriceFactors />} />
        </Route>
      </Routes>
    </>
  );
}

//////////////////////////////////////////////////////
// ⭐ MAIN APP
//////////////////////////////////////////////////////

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
