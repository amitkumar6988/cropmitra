import { baseTemplate } from "./baseTemplate.js";

export const forgotPasswordTemplate = (name, resetUrl) => {
  return baseTemplate(`
    <h2>Reset Your Password 🔑</h2>

    <p>Hello ${name || "User"},</p>

    <p>You requested to reset your password for your CropMitra account.</p>

    <div style="text-align:center; margin:20px 0;">
      <a href="${resetUrl}"
         style="background:#d32f2f; color:white; padding:12px 25px; text-decoration:none; border-radius:5px; font-size:16px;">
         Reset Password
      </a>
    </div>

    <p>This link will expire in <strong>10 minutes</strong>.</p>

    <p>If you didn’t request this, please ignore this email.</p>
  `);
};