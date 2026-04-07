import express from "express";
import {
  submitBid,
  getFarmerBids,
  getBuyerBids,
  counterOfferBid,
  acceptBid,
  rejectBid,
  getBidDetails,
  acceptCounterOffer,
  updateBid
} from "../controllers/bid.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { farmerOnly } from "../middleware/farmer.js";

const router = express.Router();

// Protected routes - requires authentication
router.use(protect);

// ⭐ IMPORTANT: Specific routes BEFORE dynamic routes (/bidId)
// Buyer routes
router.post("/submit", submitBid); // Buyer submits a bid
router.get("/my-bids", getBuyerBids); // Buyer views their bids

// Farmer routes - SPECIFIC PATHS FIRST
router.get("/farmer/pending", getFarmerBids); // Farmer views pending bids

// Dynamic routes - AFTER specific ones
router.patch("/:bidId/counter-offer", counterOfferBid); // Farmer sends counter offer
router.patch("/:bidId/accept", acceptBid); // Farmer accepts bid
router.patch("/:bidId/reject", rejectBid); // Farmer rejects bid
router.patch("/:bidId/accept-counter", acceptCounterOffer); // Buyer accepts counter offer
router.put("/:bidId", updateBid); // Buyer updates existing bid
router.get("/:bidId", getBidDetails); // Get bid details

export default router;
