import { Router } from "express";
import {
  marketDataValidators,
  upsertMarketData,
} from "../controllers/marketData.controller.js";

const router = Router();
router.post("/", marketDataValidators, upsertMarketData);

export default router;
