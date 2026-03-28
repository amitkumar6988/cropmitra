import { baseTemplate } from "./baseTemplate.js";

export const farmerApprovedTemplate = (name) => {
  return baseTemplate(`
    <h2>Farmer Role Approved 🌾</h2>

    <p>Hello ${name || "User"},</p>

    <p>🎉 Your request has been approved.</p>

    <p>You are now a <strong>Farmer</strong> on CropMitra.</p>

    <p>— Team CropMitra</p>
  `);
};