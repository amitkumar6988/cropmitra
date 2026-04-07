/**
 * Mounts crop price prediction module under /api/price-prediction
 * - Any authenticated user (user | farmer | admin): read crops, prices, history, list external factors
 * - Admin only: POST market-data, POST/PATCH external factors (e.g. flood, fuel_crisis)
 */
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/admin.js";
import cropRoutes from "../../../crop-price-prediction-module/backend/src/routes/crop.routes.js";
import priceRoutes from "../../../crop-price-prediction-module/backend/src/routes/price.routes.js";
import marketDataRoutes from "../../../crop-price-prediction-module/backend/src/routes/marketData.routes.js";
import {
  createExternalFactorValidators,
  createExternalFactor,
  listExternalFactors,
  toggleFactorValidators as toggleExternalFactorValidators,
  toggleExternalFactor,
} from "../../../crop-price-prediction-module/backend/src/controllers/externalFactor.controller.js";

const router = Router();

router.use(protect);

router.use("/crops", cropRoutes);
router.use("/prices", priceRoutes);
router.use("/market-data", adminOnly, marketDataRoutes);
router.get("/external-factors", listExternalFactors);
router.post(
  "/external-factors",
  adminOnly,
  createExternalFactorValidators,
  createExternalFactor
);
router.patch(
  "/external-factors/:id/toggle",
  adminOnly,
  toggleExternalFactorValidators,
  toggleExternalFactor
);

export default router;
