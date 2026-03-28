import { baseTemplate } from "./baseTemplate.js";

export const welcomeTemplate = (name) => {
  return baseTemplate(`
    <h2>Welcome ${name} 👋</h2>
    <p>Welcome to CropMitra 🌾</p>
  `);
};