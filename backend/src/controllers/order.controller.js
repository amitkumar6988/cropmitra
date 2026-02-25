import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Crop from "../models/crops.model.js";
import FarmerProfile from "../models/order.model.js"

// PLACE ORDER
export const placeOrder = async (req, res) => {
    const { address, paymentMethod } = req.body; // ⭐ ADD THIS
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.crop");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const crop = await Crop.findById(item.crop._id);

    if (!crop || crop.quantity < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${crop?.name}`
      });
    }

    crop.quantity -= item.quantity;
    await crop.save();

    totalAmount += item.quantity * item.priceAtAddTime;

    orderItems.push({
      crop: crop._id,
      farmer: crop.farmer,
      quantity: item.quantity,
      price: item.priceAtAddTime
    });
  }
const order = await Order.create({
  buyer: req.user._id,
  items: orderItems,
  totalAmount,
  address, // ⭐ THIS WAS MISSING
  paymentMethod: paymentMethod || "COD"
});
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(201).json({
    message: "Order placed successfully",
    order
  });
};

// BUYER ORDERS
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate("items.crop", "name images unit")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
};
// FARMER ORDERS
export const getFarmerOrders = async (req, res) => {
  const orders = await Order.find({ "items.farmer": req.user._id })
    .populate("buyer", "name email")
    .populate("items.crop", "name");

  res.status(200).json({orders});
};

// UPDATE ORDER STATUS (Farmer)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Prevent duplicate earnings
  if (order.status === "DELIVERED") {
    return res.status(400).json({ message: "Order already delivered" });
  }

  order.status = status;
  await order.save();

  // ✅ ADD EARNINGS WHEN DELIVERED
  if (status === "DELIVERED") {
    for (const item of order.items) {
      const farmerProfile = await FarmerProfile.findOne({ user: item.farmer });

      if (farmerProfile) {
        const amount = item.quantity * item.price;

        farmerProfile.totalEarnings += amount;

        farmerProfile.earningsHistory.push({
          order: order._id,
          amount
        });

        await farmerProfile.save();
      }
    }
  }

  res.status(200).json({
    message: "Order status updated",
    order
  });
};
    // farmer earning
export const getFarmerEarnings = async (req, res) => {
  const farmerProfile = await FarmerProfile.findOne({ user: req.user._id })
    .populate("earningsHistory.order", "totalAmount status createdAt");

  if (!farmerProfile) {
    return res.status(404).json({ message: "Farmer profile not found" });
  }

  res.status(200).json({
    totalEarnings: farmerProfile.totalEarnings,
    earningsHistory: farmerProfile.earningsHistory
  });
};
  // order controllers for location
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
