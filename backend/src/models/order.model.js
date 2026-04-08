import mongoose from "mongoose";


// ✅ Order Item Schema
const orderItemSchema = new mongoose.Schema({

  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true
  },

  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  // ⭐ Price Snapshot (very important)
  price: {
    type: Number,
    required: true
  }

});


// ✅ Main Order Schema
const orderSchema = new mongoose.Schema({

  // ⭐ Professional Order Number
  orderNumber: {
    type: String,
    unique: true
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ⭐ DELIVERY ADDRESS
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },

  items: [orderItemSchema],

  totalAmount: {
    type: Number,
    required: true
  },

  // ⭐ LOGISTICS FLOW
  status: {
    type: String,
    enum: [
      "PLACED",
      "CONFIRMED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED"
    ],
    default: "PLACED"
  },

  // ⭐ PAYMENT METHOD
  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD"
  },

  // ⭐ PAYMENT STATUS
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING"
  },

  // 🔥 RAZORPAY ORDER ID (Before Payment)
  paymentOrderId: {
    type: String
  },

  // 🔥 RAZORPAY PAYMENT ID (After Success)
  paymentId: {
    type: String
  },

  // 🔥 PAYMENT SIGNATURE (Verification)
  paymentSignature: {
    type: String
  },

  // ⭐ Payment Time (Industry Practice)
  paidAt: {
    type: Date
  },

  // ⭐ Marketplace future feature
  isFarmerPaid: {
    type: Boolean,
    default: false
  },

  // Reverse link to bid (null for cart-based orders)
  bidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bid",
    default: null
  }

}, { timestamps: true });


// 🔥 AUTO GENERATE ORDER NUMBER
orderSchema.pre("save", function(next){

  if(!this.orderNumber){
    this.orderNumber =
      "ORD-" +
      Math.floor(100000 + Math.random() * 900000);
  }

  next();
});


export default mongoose.model("Order", orderSchema);