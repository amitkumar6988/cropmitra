import express from "express";
import {
  addCrop,
  updateCrop,
  deleteCrop,
  getMyCrops,
  getAvailableCrops,
  getCropById
} from "../controllers/crop.controllers.js";
import { upload } from "../middleware/multer.middleware.js";

import { protect } from "../middleware/authMiddleware.js";
import { farmerOnly } from "../middleware/farmer.js";

const router = express.Router();

// Farmer routes
router.post(
  "/add",
  protect,
  farmerOnly,
  upload.single("image"), 
  addCrop
);
router.patch(
  "/:id",
  protect,
  farmerOnly,
  upload.single("image"), // optional image update
  updateCrop
);
router.delete("/:id", protect, farmerOnly, deleteCrop);
router.get("/me", protect, farmerOnly, getMyCrops);

// Buyer routes
router.get("/", getAvailableCrops);       // no auth required to browse crops
router.get("/:id", getCropById);          // public single crop detail

export default router;
