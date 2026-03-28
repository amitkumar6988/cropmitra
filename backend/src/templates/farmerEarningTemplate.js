import { baseTemplate } from "./baseTemplate.js";

export const farmerEarningTemplate = (name, amount, orderId) => {
  return baseTemplate(`
    <h2>New Earnings 💰</h2>

    <p>Hello ${name || "Farmer"},</p>

    <p>You have earned <strong>₹${amount}</strong> from order <strong>#${orderId}</strong>.</p>

    <p>Keep growing with CropMitra 🌾</p>

    <p>— Team CropMitra</p>
  `);
};