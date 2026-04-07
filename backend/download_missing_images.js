import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Crop from './src/models/crops.model.js';

dotenv.config();

const FRONTEND_PUBLIC_DIR = path.join(process.cwd(), "..", "frontend", "public", "crops");

async function downloadImage(url, dest) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    if (!response.ok) return false;
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    return true;
  } catch (err) {
    return false;
  }
}

async function fixMissingImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cropmitra");
    console.log("Connected to MongoDB.");

    const cropsWithNoImage = await Crop.find({ $or: [{ images: { $size: 0 } }, { images: null }] });
    
    console.log(`Found ${cropsWithNoImage.length} crops missing accurate images.`);

    for (let c of cropsWithNoImage) {
      console.log(`Fixing image for ${c.name}...`);
      
      const safeName = c.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const localFilePath = path.join(FRONTEND_PUBLIC_DIR, `${safeName}.jpg`);
      const publicUrl = `/crops/${safeName}.jpg`;

      const prompt = `A highly realistic professional macro photography of fresh ${c.name} ${c.category}, isolated on white background`;
      const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true`;

      let retries = 3;
      let success = false;
      while (retries > 0 && !success) {
        success = await downloadImage(aiUrl, localFilePath);
        if(!success) {
          console.log(`Retrying Pollinations API for ${c.name}...`);
          await new Promise(r => setTimeout(r, 2000));
        }
        retries--;
      }

      if (success) {
        c.images = [publicUrl];
        await c.save();
        console.log(`Saved accurate image for ${c.name}!`);
      } else {
        console.log(`Failed to generate accurately for ${c.name}`);
      }

      // Add a 2 second delay between requests to perfectly bypass any rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }

    console.log("Finished updating missing images.");
    process.exit(0);

  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

fixMissingImages();
