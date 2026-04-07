import mongoose from "mongoose";

const cropSchema = new mongoose.Schema({
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },

  name: { 
    type: String, 
    required: true,
    trim: true
  },

  category: { 
    type: String, 
    required: true,
   enum: ["vegetable", "fruit", "grain", "pulse", "other"]
  },

  description: { 
    type: String 
  },

  images: [{ 
    type: String 
  }],

  quantity: { 
    type: Number, 
    required: true,
    min: 0
  },

  unit: { 
    type: String, 
    required: true 
  },

  price: { 
    type: Number, 
    required: true,
    min: 0
  },

  discount: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },

  sold: { 
    type: Number, 
    default: 0,
    min: 0
  },

  minOrderQty: {
    type: Number,
    default: 1,
    min: 1
  },

  isAvailable: { 
    type: Boolean, 
    default: true 
  },

  expiryDate: { 
    type: Date 
  },

  organic: { 
    type: Boolean, 
    default: false 
  },

  location: { 
    type: String 
  },

  // Optional bulk pricing tiers — backward compatible (absent = use flat price)
  bulkPricing: [{
    minQty: { type: Number, required: true },
    price:  { type: Number, required: true }
  }],

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// ✅ Virtual Available Stock
cropSchema.virtual("availableStock").get(function () {
  return this.quantity - this.sold;
});


// ✅ Auto update availability before saving
cropSchema.pre("save", function (next) {
  if (this.sold >= this.quantity) {
    this.isAvailable = false;
  } else {
    this.isAvailable = true;
  }
  next();
});


// ✅ Index for faster filtering
cropSchema.index({ category: 1 });

const Crop = mongoose.model("Crop", cropSchema);

export default Crop;
