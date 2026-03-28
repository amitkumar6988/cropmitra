import { baseTemplate } from "./baseTemplate.js";

export const orderPlacedTemplate = (name, orderId) => {
  return baseTemplate(`
    <h2>Order Placed Successfully 🛒</h2>

    <p>Hello ${name || "User"},</p>

    <p>Your order has been placed successfully.</p>

    <p><strong>Order ID:</strong> ${orderId}</p>

    <p>The farmer will process your order soon.</p>

    <p>— Team CropMitra</p>
  `);
};