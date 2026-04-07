import express from "express";
import {
  applyFarmer,
  getFarmerRequests,
  approveFarmer,  getMyFarmerProfile,
} from "../controllers/farmer.controller.js";

import { adminOnly } from "../middleware/admin.js";
import { protect } from "../middleware/authMiddleware.js";
import { getFarmerEarnings } from "../controllers/order.controller.js";

import { farmerOnly } from "../middleware/farmer.js";

const router = express.Router();

// Apply to become a farmer (user)
router.post("/apply", protect, applyFarmer);

// Get my farmer profile (user)
router.get("/me", protect, getMyFarmerProfile);

// ADMIN routes
router.get("/requests", protect, adminOnly, getFarmerRequests);
router.patch("/approve/:id", protect, adminOnly, approveFarmer);

 // Earning 
 router.get("/earnings", protect, getFarmerEarnings);

// Dashboard stats
router.get("/dashboard-stats", protect, farmerOnly, async (req, res) => {
  try {
    const [Crop, Order, Bid] = await Promise.all([
      import("../models/crops.model.js").then(m => m.default),
      import("../models/order.model.js").then(m => m.default),
      import("../models/bid.model.js").then(m => m.default),
    ]);

    const [totalCrops, orders, activeBids, earnings] = await Promise.all([
      Crop.countDocuments({ farmer: req.user._id }),
      Order.find({ "items.farmer": req.user._id }),
      Bid.countDocuments({ farmer: req.user._id, status: { $in: ["pending", "counter_offered"] } }),
      Order.find({ "items.farmer": req.user._id, status: "DELIVERED" }),
    ]);

    const totalEarnings = earnings.reduce((sum, order) => {
      return sum + order.items
        .filter(i => i.farmer.toString() === req.user._id.toString())
        .reduce((s, i) => s + i.quantity * i.price, 0);
    }, 0);

    res.status(200).json({
      totalCrops,
      totalOrders: orders.length,
      activeBids,
      totalEarnings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





export default router;
