import { baseTemplate } from "./baseTemplate.js";

export const newOrderFarmerTemplate = (farmerName, buyerName, orderId) => {
  return baseTemplate(`
    <h2>New Order Received 🌾</h2>

    <p>Hello ${farmerName || "Farmer"},</p>

    <p>You have received a new order from <strong>${buyerName}</strong>.</p>

    <p><strong>Order ID:</strong> ${orderId}</p>

    <p>Please check your dashboard and process the order.</p>

    <p>— Team CropMitra</p>
  `);
};