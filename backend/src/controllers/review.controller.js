import Review from "../models/review.model.js";

// POST /api/reviews
export const submitReview = async (req, res) => {
  try {
    const { farmerId, rating, review, orderId } = req.body;

    if (!farmerId || !rating) {
      return res.status(400).json({ message: "farmerId and rating are required" });
    }

    // Upsert: update if already reviewed, else create
    const doc = await Review.findOneAndUpdate(
      { userId: req.user._id, farmerId },
      { rating, review: review || "", orderId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("userId", "name profileImage");

    res.status(200).json({ success: true, review: doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reviews/:farmerId
export const getFarmerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ farmerId: req.params.farmerId })
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 });

    const avg =
      reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      success: true,
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
