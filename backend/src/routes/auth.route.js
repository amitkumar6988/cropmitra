import express from "express";
import { forgotPassword, login, logout, me, resetPassword, signup } from "../controllers/auth.controller.js";
import { uploadProfileImage } from "../controllers/user.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = express.Router();

// Auth
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, me);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// ✅ Profile image upload (NEW)
router.post(
  "/upload-profile",
  protect,
  upload.single("image"),
  uploadProfileImage
);

 // router  for admin only



export default router;
