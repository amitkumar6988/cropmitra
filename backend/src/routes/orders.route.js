import express from "express";
import {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { getOrderById } from "../controllers/order.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Buyer
router.post("/place", protect, placeOrder);
router.get("/my", protect, getMyOrders);

// order routes

router.get("/:id", protect, getOrderById);

// Farmer
router.get("/farmer", protect, getFarmerOrders);
router.patch("/:id/status", protect, updateOrderStatus);

export default router;
