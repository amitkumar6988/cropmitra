import Bid from "../models/bid.model.js";
import Crop from "../models/crops.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Address from "../models/address.model.js";
import { sendEmail } from "../libs/sendEmail.js";
import { newOrderFarmerTemplate } from "../templates/newOrderFarmerTemplate.js";
import { orderPlacedTemplate } from "../templates/orderPlacedTemplate.js";

// ================== HELPER: mark expired pending/counter_offered bids in DB ==================
const markExpiredBids = async (bids) => {
  const now = new Date();
  const toExpire = bids.filter(
    b => new Date(b.expiryDate) < now && (b.status === "pending" || b.status === "counter_offered")
  );
  if (toExpire.length === 0) return;
  await Bid.updateMany(
    { _id: { $in: toExpire.map(b => b._id) } },
    { $set: { status: "expired" } }
  );
  // Reflect in the in-memory objects so the response is already correct
  toExpire.forEach(b => { b.status = "expired"; });
};

// ================== BUYER SUBMITS BID ==================
export const submitBid = async (req, res) => {
  try {
    const { cropId, quantity, bidPrice, proposalMessage } = req.body;

    // Validate input
    if (!cropId || !quantity || !bidPrice) {
      return res.status(400).json({
        success: false,
        message: "cropId, quantity, and bidPrice are required",
        received: { cropId: !!cropId, quantity: !!quantity, bidPrice: !!bidPrice }
      });
    }

    // Check if crop exists
    const crop = await Crop.findById(cropId).populate("farmer");
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found"
      });
    }

    // Check if buyer is the farmer (can't bid on own crop)
    if (crop.farmer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Farmers cannot bid on their own crops"
      });
    }

    // Check if quantity available - use the virtual field
    const availableQty = crop.quantity - crop.sold;
    if (availableQty < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableQty} ${crop.unit} available`
      });
    }

    // Check for existing pending bid from same buyer
    const existingBid = await Bid.findOne({
      crop: cropId,
      buyer: req.user._id,
      status: "pending"
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending bid on this crop"
      });
    }

    // Create bid with 7-day expiry
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const bid = new Bid({
      crop: cropId,
      farmer: crop.farmer._id,
      buyer: req.user._id,
      quantity,
      unit: crop.unit,
      bidPrice,
      proposalMessage: proposalMessage || "",
      expiryDate,
      negotiationHistory: [
        {
          role: "buyer",
          action: "bid",
          price: bidPrice,
          quantity,
          message: proposalMessage || "Initial bid"
        }
      ]
    });

    await bid.save();

    const populatedBid = await bid.populate([
      { path: "crop", select: "name images price" },
      { path: "farmer", select: "name email" },
      { path: "buyer", select: "name email" }
    ]);

    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      bid: populatedBid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createOrderFromBid = async (bid) => {
  const address =
    (await Address.findOne({ user: bid.buyer, isDefault: true })) ||
    (await Address.findOne({ user: bid.buyer }));

  if (!address) {
    throw new Error(
      "Buyer must have a default delivery address before an order can be created."
    );
  }

  const crop = await Crop.findById(bid.crop);
  if (!crop) {
    throw new Error("Crop not found when creating order from bid");
  }

  if (crop.quantity < bid.finalQuantity) {
    throw new Error(
      `Only ${crop.quantity} ${crop.unit} available for order creation`
    );
  }

  crop.quantity -= bid.finalQuantity;
  await crop.save();

  const order = await Order.create({
    buyer: bid.buyer,
    address: address._id,
    items: [
      {
        crop: bid.crop,
        farmer: bid.farmer,
        quantity: bid.finalQuantity,
        price: bid.finalPrice
      }
    ],
    totalAmount: bid.finalPrice * bid.finalQuantity,
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    status: "PLACED",
    bidId: bid._id
  });

  const buyer = await User.findById(bid.buyer);
  const farmer = await User.findById(bid.farmer);

  if (buyer) {
    sendEmail({
      to: buyer.email,
      subject: "🛒 Your bid was accepted — order created",
      html: orderPlacedTemplate(buyer.name, order._id)
    });
  }

  if (farmer) {
    sendEmail({
      to: farmer.email,
      subject: "🌾 An order has been created from your accepted bid",
      html: newOrderFarmerTemplate(
        farmer.name,
        buyer?.name || "Buyer",
        order._id
      )
    });
  }

  return order;
};

// ================== FARMER VIEWS PENDING BIDS ==================
export const getFarmerBids = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { farmer: req.user._id };

    // Only filter by status if explicitly provided
    if (status) {
      query.status = status;
    }

    const bids = await Bid.find(query)
      .populate("crop", "name images price quantity unit")
      .populate("buyer", "name email")
      .populate("order")
      .sort({ createdAt: -1 });

    await markExpiredBids(bids);

    res.status(200).json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== BUYER VIEWS THEIR BIDS ==================
export const getBuyerBids = async (req, res) => {
  try {
    const { status = "all" } = req.query;

    const query = { buyer: req.user._id };
    if (status !== "all") {
      query.status = status;
    }

    const bids = await Bid.find(query)
      .populate("crop", "name images price quantity unit")
      .populate("farmer", "name email location")
      .populate("order")
      .sort({ createdAt: -1 });

    await markExpiredBids(bids);

    res.status(200).json({ bids });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== FARMER COUNTER OFFERS ==================
export const counterOfferBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { counterPrice, counterQuantity, message } = req.body;

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Verify farmer owns this bid
    if (bid.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only allow counter offer on pending bids
    if (bid.status !== "pending" && bid.status !== "counter_offered") {
      return res.status(400).json({
        message: "Can only counter offer on pending or counter offered bids"
      });
    }

    if (new Date(bid.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This bid has expired and can no longer be modified" });
    }

    // Add to negotiation history
    bid.negotiationHistory.push({
      role: "farmer",
      action: "counter",
      price: counterPrice,
      quantity: counterQuantity,
      message: message || "Counter offer"
    });

    bid.status = "counter_offered";
    await bid.save();

    const populatedBid = await bid.populate([
      { path: "crop", select: "name" },
      { path: "buyer", select: "name email" }
    ]);

    res.status(200).json({
      message: "Counter offer sent successfully",
      bid: populatedBid
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== ACCEPT BID (FARMER) ==================
export const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { farmerNotes } = req.body || {};

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Verify farmer owns this bid
    if (bid.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Can accept pending or counter_offered bids
    if (bid.status !== "pending" && bid.status !== "counter_offered") {
      return res.status(400).json({
        message: "Can only accept pending or counter offered bids"
      });
    }

    if (new Date(bid.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This bid has expired and can no longer be accepted" });
    }

    // Get latest counter offer or initial bid
    const lastOffer = bid.negotiationHistory[bid.negotiationHistory.length - 1];

    bid.status = "accepted";
    bid.acceptedAt = new Date();
    bid.finalPrice = lastOffer.price;
    bid.finalQuantity = lastOffer.quantity;
    bid.farmerNotes = farmerNotes || "";

    bid.negotiationHistory.push({
      role: "farmer",
      action: "accept",
      message: "Bid accepted"
    });

    const order = await createOrderFromBid(bid);
    bid.order = order._id;

    await bid.save();

    const populatedBid = await bid.populate([
      { path: "crop", select: "name" },
      { path: "buyer", select: "name email" },
      { path: "farmer", select: "name email" }
    ]);

    res.status(200).json({
      message: "Bid accepted successfully",
      bid: populatedBid,
      order
    });
  } catch (error) {
    const statusCode = /default delivery address|available for order creation|Crop not found/i.test(error.message) ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// ================== REJECT BID ==================
export const rejectBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { message } = req.body;

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Verify farmer owns this bid
    if (bid.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    bid.status = "rejected";
    bid.negotiationHistory.push({
      role: "farmer",
      action: "reject",
      message: message || "Bid rejected"
    });

    await bid.save();

    res.status(200).json({
      message: "Bid rejected successfully",
      bid
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== GET BID DETAILS ==================
export const getBidDetails = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)
      .populate("crop")
      .populate("farmer", "name email location phone")
      .populate("buyer", "name email location phone")
      .populate("order");

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    res.status(200).json({ bid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================== BUYER UPDATES EXISTING BID ==================
export const updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { bidPrice, quantity } = req.body;

    if (!bidPrice || !quantity) {
      return res.status(400).json({ success: false, message: "bidPrice and quantity are required" });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ success: false, message: "Bid not found" });

    if (bid.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (bid.status === "accepted" || bid.status === "rejected") {
      return res.status(400).json({ success: false, message: "Cannot edit an accepted or rejected bid" });
    }

    if (new Date(bid.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "This bid has expired and can no longer be edited" });
    }

    const crop = await Crop.findById(bid.crop);
    if (crop) {
      const available = crop.quantity - crop.sold;
      if (available < quantity) {
        return res.status(400).json({ success: false, message: `Only ${available} ${crop.unit} available` });
      }
    }

    bid.bidPrice = bidPrice;
    bid.quantity = quantity;
    bid.status = "pending";
    bid.negotiationHistory.push({
      role: "buyer",
      action: "bid",
      price: bidPrice,
      quantity,
      message: "Buyer updated their bid"
    });

    await bid.save();

    const populatedBid = await bid.populate([
      { path: "crop", select: "name images price quantity unit" },
      { path: "farmer", select: "name email location" },
      { path: "buyer", select: "name email" },
      { path: "order" }
    ]);

    res.status(200).json({ success: true, message: "Bid updated successfully", bid: populatedBid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================== BUYER ACCEPTS COUNTER OFFER ==================
export const acceptCounterOffer = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    // Verify buyer owns this bid
    if (bid.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (bid.status !== "counter_offered") {
      return res.status(400).json({
        message: "Bid must be counter offered to accept"
      });
    }

    if (new Date(bid.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This bid has expired and can no longer be accepted" });
    }

    // Get latest counter offer
    const lastOffer = bid.negotiationHistory[bid.negotiationHistory.length - 1];

    bid.status = "accepted";
    bid.acceptedAt = new Date();
    bid.finalPrice = lastOffer.price;
    bid.finalQuantity = lastOffer.quantity;

    bid.negotiationHistory.push({
      role: "buyer",
      action: "accept",
      message: "Counter offer accepted"
    });

    const order = await createOrderFromBid(bid);
    bid.order = order._id;

    await bid.save();

    const populatedBid = await bid.populate([
      { path: "crop", select: "name" },
      { path: "farmer", select: "name email" }
    ]);

    res.status(200).json({
      message: "Counter offer accepted successfully",
      bid: populatedBid,
      order
    });
  } catch (error) {
    const statusCode = /default delivery address|available for order creation|Crop not found/i.test(error.message) ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};
