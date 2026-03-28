import { baseTemplate } from "./baseTemplate.js";

export const orderDeliveredTemplate = (name, orderId) => {
  return baseTemplate(`
    <h2>Order Delivered ✅</h2>

    <p>Hello ${name || "User"},</p>

    <p>Your order <strong>#${orderId}</strong> has been successfully delivered.</p>

    <p>Thank you for using CropMitra 🌾</p>

    <p>— Team CropMitra</p>
  `);
};