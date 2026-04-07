import Razorpay from "razorpay";
import crypto from "crypto";

import Order from "../models/order.model.js";
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createPaymentOrder = async (req, res) => {
  try {

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ⭐ Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100,
      currency: "INR"
    });

    // ⭐ Save Razorpay Order ID
    order.paymentOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    // ⭐ Generate Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // ⭐ Find Order
    const order = await Order.findOne({
      paymentOrderId: razorpay_order_id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ⭐ Verify
    if (expectedSignature === razorpay_signature) {

      order.paymentId = razorpay_payment_id;
      order.paymentSignature = razorpay_signature;
      order.paymentStatus = "PAID";
      order.paidAt = new Date();

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified"
      });

    } else {

      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};