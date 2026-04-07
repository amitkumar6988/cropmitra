import express from "express";
import User from "../models/user.model.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

// GET /wishlist
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("wishlist", "name price unit images category organic");
    res.json({ wishlist: user?.wishlist ?? [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /wishlist/:cropId — toggle (add if absent, remove if present)
router.post("/:cropId", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const cropId = req.params.cropId;
    const idx = user.wishlist.findIndex(id => id.toString() === cropId);

    if (idx === -1) {
      user.wishlist.push(cropId);
    } else {
      user.wishlist.splice(idx, 1);
    }

    await user.save();
    res.json({ wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /wishlist/:cropId
router.delete("/:cropId", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: req.params.cropId }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
