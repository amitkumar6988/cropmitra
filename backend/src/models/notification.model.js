import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: {
    type: String,
    enum: ["BID_ACCEPTED", "BID_REJECTED", "COUNTER_OFFER", "ORDER_UPDATE", "BID_UPDATED"],
    required: true
  },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
