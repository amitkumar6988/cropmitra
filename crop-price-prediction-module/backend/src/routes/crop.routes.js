import { Router } from "express";
import { listCrops } from "../controllers/crop.controller.js";

const router = Router();
router.get("/", listCrops);

export default router;
