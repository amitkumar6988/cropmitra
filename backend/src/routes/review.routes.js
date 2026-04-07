import express from "express";
import { submitReview, getFarmerReviews } from "../controllers/review.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, submitReview);
router.get("/:farmerId", getFarmerReviews); // public

export default router;
