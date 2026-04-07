import { Router } from "express";
import {
  listExternalFactors,
  createExternalFactor,
  toggleExternalFactor
} from "../controllers/externalFactor.controller.js";

const router = Router();

router.get("/", listExternalFactors);
router.post("/", createExternalFactor);
router.patch("/:id/toggle", toggleExternalFactor);

export default router;
