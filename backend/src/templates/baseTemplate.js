export const baseTemplate = (content) => {
  return `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background:#2e7d32; padding:15px; text-align:center;">
        <h1 style="color:white; margin:0;">🌾 CropMitra</h1>
      </div>

      <!-- Body -->
      <div style="padding:20px;">
        ${content}
      </div>

      <!-- Footer -->
      <div style="background:#f1f1f1; padding:10px; text-align:center; font-size:12px; color:#555;">
        © ${new Date().getFullYear()} CropMitra | All Rights Reserved
      </div>

    </div>
  </div>
  `;
};