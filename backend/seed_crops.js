import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import FarmerProfile from "./src/models/farmer.model.js";
import Crop from "./src/models/crops.model.js";

dotenv.config();

const cropsData = [
  // Vegetables
  { name: "Potato", category: "vegetable", price: 30, unit: "kg" },
  { name: "Tomato", category: "vegetable", price: 40, unit: "kg" },
  { name: "Onion", category: "vegetable", price: 25, unit: "kg" },
  { name: "Carrot", category: "vegetable", price: 50, unit: "kg" },
  { name: "Cabbage", category: "vegetable", price: 20, unit: "kg" },
  { name: "Cauliflower", category: "vegetable", price: 35, unit: "kg" },
  { name: "Spinach", category: "vegetable", price: 15, unit: "bunch" },
  { name: "Broccoli", category: "vegetable", price: 80, unit: "kg" },
  { name: "Garlic", category: "vegetable", price: 120, unit: "kg" },
  { name: "Ginger", category: "vegetable", price: 100, unit: "kg" },
  { name: "Chili", category: "vegetable", price: 60, unit: "kg" },
  { name: "Bell Pepper", category: "vegetable", price: 70, unit: "kg" },
  { name: "Peas", category: "vegetable", price: 55, unit: "kg" },
  { name: "Eggplant", category: "vegetable", price: 40, unit: "kg" },
  { name: "Zucchini", category: "vegetable", price: 65, unit: "kg" },
  { name: "Cucumber", category: "vegetable", price: 30, unit: "kg" },
  { name: "Pumpkin", category: "vegetable", price: 25, unit: "kg" },
  { name: "Radish", category: "vegetable", price: 20, unit: "kg" },
  { name: "Turnip", category: "vegetable", price: 30, unit: "kg" },
  { name: "Sweet Potato", category: "vegetable", price: 45, unit: "kg" },

  // Fruits
  { name: "Apple", category: "fruit", price: 150, unit: "kg" },
  { name: "Banana", category: "fruit", price: 50, unit: "dozen" },
  { name: "Mango", category: "fruit", price: 100, unit: "kg" },
  { name: "Orange", category: "fruit", price: 80, unit: "kg" },
  { name: "Grapes", category: "fruit", price: 120, unit: "kg" },
  { name: "Pineapple", category: "fruit", price: 60, unit: "piece" },
  { name: "Papaya", category: "fruit", price: 40, unit: "piece" },
  { name: "Watermelon", category: "fruit", price: 30, unit: "piece" },
  { name: "Pomegranate", category: "fruit", price: 180, unit: "kg" },
  { name: "Guava", category: "fruit", price: 50, unit: "kg" },
  { name: "Strawberry", category: "fruit", price: 200, unit: "box" },
  { name: "Kiwi", category: "fruit", price: 250, unit: "box" },
  { name: "Peach", category: "fruit", price: 150, unit: "kg" },
  { name: "Plum", category: "fruit", price: 130, unit: "kg" },
  { name: "Lemon", category: "fruit", price: 80, unit: "kg" },

  // Grains
  { name: "Wheat", category: "grain", price: 25, unit: "kg" },
  { name: "Rice (Basmati)", category: "grain", price: 80, unit: "kg" },
  { name: "Rice (Regular)", category: "grain", price: 40, unit: "kg" },
  { name: "Maize", category: "grain", price: 22, unit: "kg" },
  { name: "Barley", category: "grain", price: 30, unit: "kg" },
  { name: "Oats", category: "grain", price: 150, unit: "kg" },
  { name: "Millet", category: "grain", price: 45, unit: "kg" },
  { name: "Sorghum", category: "grain", price: 35, unit: "kg" },

  // Pulses
  { name: "Lentils", category: "pulse", price: 90, unit: "kg" },
  { name: "Chickpeas", category: "pulse", price: 110, unit: "kg" },
  { name: "Black Gram", category: "pulse", price: 95, unit: "kg" },
  { name: "Green Gram", category: "pulse", price: 105, unit: "kg" },
  { name: "Pigeon Pea", category: "pulse", price: 120, unit: "kg" },
  { name: "Kidney Beans", category: "pulse", price: 130, unit: "kg" },
  { name: "Soybeans", category: "pulse", price: 60, unit: "kg" }
];

const categoryImages = {
  vegetable: "https://images.unsplash.com/photo-1566385101042-1a0e8bb92d77", // Mixed veg
  fruit: "https://images.unsplash.com/photo-1610486821360-394c8bb12b8b",    // Mixed fruits
  grain: "https://images.unsplash.com/photo-1586201375761-83865001e31c",    // Grains
  pulse: "https://images.unsplash.com/photo-1542010589005-d1eacc3918f2"     // Pulses
};

import fs from 'fs';
import path from 'path';

const FRONTEND_PUBLIC_DIR = path.join(process.cwd(), "..", "frontend", "public", "crops");
if (!fs.existsSync(FRONTEND_PUBLIC_DIR)) {
  fs.mkdirSync(FRONTEND_PUBLIC_DIR, { recursive: true });
}

// Fetch image URL from Wikipedia using native fetch
async function getWikipediaImageLink(cropName) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cropName)}&prop=pageimages&format=json&pithumbsize=400`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!response.ok) return null;
    const data = await response.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const firstPage = Object.values(pages)[0];
    if (firstPage && firstPage.thumbnail && firstPage.thumbnail.source) {
      return firstPage.thumbnail.source;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Download image using fetch
async function downloadImage(url, dest) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!response.ok) {
      console.log(`HTTP ${response.status} on ${url}`);
      return false;
    }
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    return true;
  } catch (err) {
    return false;
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cropmitra");
    console.log("Connected to MongoDB.");

    let user = await User.findOne().sort({ createdAt: -1 });
    if (!user || user.name === "Test") {
      user = await User.findOne({ email: { $ne: "testapi@test.com" } }).sort({ createdAt: -1 });
      if (!user) {
        user = await User.create({
          name: "Amit Yadav", email: "amit.yadav@example.com", password: "password123", role: "farmer", isFarmerApproved: true
        });
      }
    }

    await Crop.deleteMany({ farmer: user._id });

    let inserted = 0;
    for (const data of cropsData) {
      const q = Math.floor(Math.random() * 500) + 50;
      
      const safeName = data.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const localFilePath = path.join(FRONTEND_PUBLIC_DIR, `${safeName}.jpg`);
      const publicUrl = `/crops/${safeName}.jpg`;

      const wikiUrl = await getWikipediaImageLink(data.name);
      
      let imageUrlField = [];
      if (wikiUrl) {
        const d = await downloadImage(wikiUrl, localFilePath);
        if (d) {
          imageUrlField = [publicUrl];
          console.log(`Downloaded ${data.name} image.`);
        } else {
          console.log(`Failed to download ${data.name} from wikiUrl ${wikiUrl}.`);
        }
      } else {
        console.log(`No wiki image found for ${data.name}.`);
      }

      await Crop.create({
        farmer: user._id,
        name: data.name,
        category: data.category,
        description: `Fresh, high-quality ${data.name.toLowerCase()} direct from the farm.`,
        images: imageUrlField,
        quantity: q,
        unit: data.unit,
        price: data.price,
        discount: Math.floor(Math.random() * 15),
        sold: Math.floor(Math.random() * (q / 2)),
        minOrderQty: 1,
        isAvailable: true,
        organic: Math.random() > 0.5,
        location: "Mumbai, Maharashtra"
      });
      inserted++;
    }

    console.log(`Successfully added ${inserted} crops with real Wikipedia images!`);
    process.exit(0);

  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seed();
