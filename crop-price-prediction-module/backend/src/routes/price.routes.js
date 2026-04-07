import { Router } from "express";
import { getPrices, getPriceHistory } from "../controllers/price.controller.js";

const router = Router();
router.get("/history", getPriceHistory);
router.get("/", getPrices);

export default router;
