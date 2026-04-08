import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import Crop from "../models/crops.model.js";
import FarmerProfile from "../models/farmer.model.js"
import { newOrderFarmerTemplate } from "../templates/newOrderFarmerTemplate.js";
import { orderPlacedTemplate } from "../templates/orderPlacedTemplate.js";
import { orderDeliveredTemplate } from "../templates/orderDeliveredTemplate.js";
import {sendEmail} from "../libs/sendEmail.js"

// PLACE ORDER
export const placeOrder = async (req, res) => {
  const { address, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.crop");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  let totalAmount = 0;
  const orderItems = [];

  // 🔥 Store farmer-wise items
  const farmerMap = new Map();

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

    // ✅ Group items by farmer
    if (!farmerMap.has(crop.farmer.toString())) {
      farmerMap.set(crop.farmer.toString(), []);
    }

    farmerMap.get(crop.farmer.toString()).push({
      name: crop.name,
      quantity: item.quantity
    });
  }

  const order = await Order.create({
    buyer: req.user._id,
    items: orderItems,
    totalAmount,
    address,
    paymentMethod: paymentMethod || "COD"
  });

  await Cart.findOneAndDelete({ user: req.user._id });

  // ================= 📧 EMAILS =================

  // ✅ 1. Buyer Email
  sendEmail({
    to: req.user.email,
    subject: "🛒 Order Placed - CropMitra",
    html: orderPlacedTemplate(req.user.name, order._id),
  });

  // ✅ 2. Farmer Emails (multiple)
  for (const [farmerId, items] of farmerMap) {
    const farmer = await User.findById(farmerId);

    if (!farmer) continue;

    sendEmail({
      to: farmer.email,
      subject: "🌾 New Order Received - CropMitra",
      html: newOrderFarmerTemplate(
        farmer.name,
        req.user.name,
        order._id
      ),
    });
  }

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
  try {
    const orders = await Order.find({
      "items.farmer": req.user._id,
    })
      .populate("buyer", "name email")
      .populate("items.crop", "name");

    res.status(200).json({ orders });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ORDER STATUS (Farmer)

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Only farmers associated with this order can update its status
  const isFarmerInOrder = order.items.some(
    item => item.farmer.toString() === req.user._id.toString()
  );

  if (!isFarmerInOrder) {
    return res.status(403).json({ message: "Not authorized to update this order" });
  }

  // Prevent duplicate earnings
  if (order.status === "DELIVERED") {
    return res.status(400).json({ message: "Order already delivered" });
  }

  order.status = status;
  await order.save();

  // 📧 Send buyer email on every status change
  const buyer = await User.findById(order.buyer);

  const statusMessages = {
    CONFIRMED:        { emoji: "✅", label: "Order Confirmed",        body: "Your order has been confirmed by the farmer and is being prepared." },
    SHIPPED:          { emoji: "🚚", label: "Order Shipped",          body: "Great news! Your order is on its way to you." },
    OUT_FOR_DELIVERY: { emoji: "📦", label: "Out for Delivery",       body: "Your order is out for delivery and will reach you soon." },
  };

  if (buyer && statusMessages[status]) {
    const { emoji, label, body } = statusMessages[status];
    sendEmail({
      to: buyer.email,
      subject: `${emoji} ${label} - CropMitra`,
      html: `
        <h2>${emoji} ${label}</h2>
        <p>Hello ${buyer.name || "User"},</p>
        <p>${body}</p>
        <p><strong>Order ID:</strong> #${order._id}</p>
        <p>— Team CropMitra 🌾</p>
      `
    });
  }

  // ✅ WHEN DELIVERED
  if (status === "DELIVERED") {

    // 💰 Earnings logic (your existing code)
    for (const item of order.items) {
      console.log("Updating earnings for farmer:", item.farmer);
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

    // 📧 Buyer delivery email
    if (buyer) {
      sendEmail({
        to: buyer.email,
        subject: "✅ Order Delivered - CropMitra",
        html: orderDeliveredTemplate(buyer.name, order._id),
      });
    }
  }

  res.status(200).json({
    message: "Order status updated",
    order
  });
};
    // farmer earning
export const getFarmerEarnings = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.farmer": req.user._id,
      status: "DELIVERED",
    });

    let totalEarnings = 0;
    const earningsHistory = [];

    for (const order of orders) {
      for (const item of order.items) {
        if (item.farmer.toString() === req.user._id.toString()) {
          const amount = item.quantity * item.price;

          totalEarnings += amount;

          earningsHistory.push({
            order: order._id,
            amount,
            createdAt: order.createdAt,
            status: order.status,
          });
        }
      }
    }

    res.status(200).json({
      totalEarnings,
      earningsHistory,
    });

  } catch (error) {
    console.error("Earnings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
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
