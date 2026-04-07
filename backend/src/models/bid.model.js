import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
      index: true
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // Initial bid information
    quantity: {
      type: Number,
      required: true,
      min: 0
    },

    unit: {
      type: String,
      required: true
    },

    bidPrice: {
      type: Number,
      required: true,
      min: 0
    },

    // Bid message/notes
    proposalMessage: {
      type: String,
      default: ""
    },

    // Status of bid: 'pending' | 'counter_offered' | 'accepted' | 'rejected' | 'expired'
    status: {
      type: String,
      enum: ["pending", "counter_offered", "accepted", "rejected", "expired"],
      default: "pending",
      index: true
    },

    // Negotiation history
    negotiationHistory: [
      {
        role: {
          type: String,
          enum: ["buyer", "farmer"],
          required: true
        },
        action: {
          type: String,
          enum: ["bid", "counter", "accept", "reject"],
          required: true
        },
        price: Number,
        quantity: Number,
        message: String,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Final negotiated values (if accepted)
    finalPrice: Number,
    finalQuantity: Number,

    // Created order reference when the bid is accepted
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },

    // Expiry date for the bid
    expiryDate: {
      type: Date,
      required: true
    },

    // When bid was accepted (if applicable)
    acceptedAt: Date,

    // Additional notes from farmer after acceptance
    farmerNotes: String
  },
  { timestamps: true }
);

// Index for efficient querying
bidSchema.index({ farmer: 1, status: 1 });
bidSchema.index({ buyer: 1, status: 1 });
bidSchema.index({ crop: 1, status: 1 });

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
