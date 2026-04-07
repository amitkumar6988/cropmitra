import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import Crop from "./src/models/crops.model.js";

dotenv.config();

const cropsData = [
  // Vegetables - Competitive Prices (slightly lower/different from Amit)
  { name: "Potato", category: "vegetable", price: 28, unit: "kg" },
  { name: "Tomato", category: "vegetable", price: 38, unit: "kg" },
  { name: "Onion", category: "vegetable", price: 22, unit: "kg" },
  { name: "Carrot", category: "vegetable", price: 48, unit: "kg" },
  { name: "Cabbage", category: "vegetable", price: 18, unit: "kg" },
  { name: "Cauliflower", category: "vegetable", price: 32, unit: "kg" },
  { name: "Spinach", category: "vegetable", price: 14, unit: "bunch" },
  { name: "Broccoli", category: "vegetable", price: 75, unit: "kg" },
  { name: "Garlic", category: "vegetable", price: 115, unit: "kg" },
  { name: "Ginger", category: "vegetable", price: 95, unit: "kg" },
  { name: "Chili", category: "vegetable", price: 55, unit: "kg" },
  { name: "Bell Pepper", category: "vegetable", price: 65, unit: "kg" },
  { name: "Peas", category: "vegetable", price: 50, unit: "kg" },
  { name: "Eggplant", category: "vegetable", price: 38, unit: "kg" },
  { name: "Zucchini", category: "vegetable", price: 62, unit: "kg" },
  { name: "Cucumber", category: "vegetable", price: 28, unit: "kg" },
  { name: "Pumpkin", category: "vegetable", price: 23, unit: "kg" },
  { name: "Radish", category: "vegetable", price: 18, unit: "kg" },
  { name: "Turnip", category: "vegetable", price: 28, unit: "kg" },
  { name: "Sweet Potato", category: "vegetable", price: 42, unit: "kg" },

  // Fruits - Competitive Prices
  { name: "Apple", category: "fruit", price: 145, unit: "kg" },
  { name: "Banana", category: "fruit", price: 48, unit: "dozen" },
  { name: "Mango", category: "fruit", price: 95, unit: "kg" },
  { name: "Orange", category: "fruit", price: 75, unit: "kg" },
  { name: "Grapes", category: "fruit", price: 115, unit: "kg" },
  { name: "Pineapple", category: "fruit", price: 55, unit: "piece" },
  { name: "Papaya", category: "fruit", price: 38, unit: "piece" },
  { name: "Watermelon", category: "fruit", price: 28, unit: "piece" },
  { name: "Pomegranate", category: "fruit", price: 175, unit: "kg" },
  { name: "Guava", category: "fruit", price: 48, unit: "kg" },
  { name: "Strawberry", category: "fruit", price: 195, unit: "box" },
  { name: "Kiwi", category: "fruit", price: 245, unit: "box" },
  { name: "Peach", category: "fruit", price: 145, unit: "kg" },
  { name: "Plum", category: "fruit", price: 125, unit: "kg" },
  { name: "Lemon", category: "fruit", price: 75, unit: "kg" },

  // Grains - Competitive Prices
  { name: "Wheat", category: "grain", price: 24, unit: "kg" },
  { name: "Rice (Basmati)", category: "grain", price: 78, unit: "kg" },
  { name: "Rice (Regular)", category: "grain", price: 38, unit: "kg" },
  { name: "Maize", category: "grain", price: 20, unit: "kg" },
  { name: "Barley", category: "grain", price: 28, unit: "kg" },
  { name: "Oats", category: "grain", price: 145, unit: "kg" },
  { name: "Millet", category: "grain", price: 42, unit: "kg" },
  { name: "Sorghum", category: "grain", price: 32, unit: "kg" },

  // Pulses - Competitive Prices
  { name: "Lentils", category: "pulse", price: 88, unit: "kg" },
  { name: "Chickpeas", category: "pulse", price: 108, unit: "kg" },
  { name: "Black Gram", category: "pulse", price: 92, unit: "kg" },
  { name: "Green Gram", category: "pulse", price: 102, unit: "kg" },
  { name: "Pigeon Pea", category: "pulse", price: 118, unit: "kg" },
  { name: "Kidney Beans", category: "pulse", price: 128, unit: "kg" },
  { name: "Soybeans", category: "pulse", price: 58, unit: "kg" }
];

const imageMap = {
  Potato: "potato.jpg",
  Tomato: "tomato.jpg",
  Onion: "onion.jpg",
  Carrot: "carrot.jpg",
  Cabbage: "cabbage.jpg",
  Cauliflower: "cauliflower.jpg",
  Spinach: "spinach.jpg",
  Broccoli: "broccoli.jpg",
  Garlic: "garlic.jpg",
  Ginger: "ginger.jpg",
  Chili: "chili.jpg",
  "Bell Pepper": "bell_pepper.jpg",
  Peas: "peas.jpg",
  Eggplant: "eggplant.jpg",
  Zucchini: "zucchini.jpg",
  Cucumber: "cucumber.jpg",
  Pumpkin: "pumpkin.jpg",
  Radish: "radish.jpg",
  Turnip: "turnip.jpg",
  "Sweet Potato": "sweet_potato.jpg",
  Apple: "apple.jpg",
  Banana: "banana.jpg",
  Mango: "mango.jpg",
  Orange: "orange.jpg",
  Grapes: "grapes.jpg",
  Pineapple: "pineapple.jpg",
  Papaya: "papaya.jpg",
  Watermelon: "watermelon.jpg",
  Pomegranate: "pomegranate.jpg",
  Guava: "guava.jpg",
  Strawberry: "strawberry.jpg",
  Kiwi: "kiwi.jpg",
  Peach: "peach.jpg",
  Plum: "plum.jpg",
  Lemon: "lemon.jpg",
  Wheat: "wheat.jpg",
  "Rice (Basmati)": "rice__basmati_.jpg",
  "Rice (Regular)": "rice__regular_.jpg",
  Maize: "maize.jpg",
  Barley: "barley.jpg",
  Oats: "oats.jpg",
  Millet: "millet.jpg",
  Sorghum: "sorghum.jpg",
  Lentils: "lentils.jpg",
  Chickpeas: "chickpeas.jpg",
  "Black Gram": "black_gram.jpg",
  "Green Gram": "green_gram.jpg",
  "Pigeon Pea": "pigeon_pea.jpg",
  "Kidney Beans": "kidney_beans.jpg",
  Soybeans: "soybeans.jpg"
};

const seedCropsForMangalmani = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find mangalmani user
    const mangalmani = await User.findOne({ name: "mangalmani" });
    if (!mangalmani) {
      console.error("❌ mangalmani user not found");
      process.exit(1);
    }

    console.log("✅ Found mangalmani user:", mangalmani._id);

    // Check if crops already exist for this farmer
    const existingCrops = await Crop.countDocuments({ farmer: mangalmani._id });
    if (existingCrops > 0) {
      console.log(`⚠️  mangalmani already has ${existingCrops} crops. Continuing anyway...`);
    }

    // Create crops with correct images and competitive prices
    const cropsToInsert = cropsData.map((crop) => {
      const imageName = imageMap[crop.name] || "apple.jpg";
      return {
        ...crop,
        farmer: mangalmani._id,
        quantity: 100 + Math.floor(Math.random() * 200), // Random quantity 100-300
        images: [`/crops/${imageName}`],
        description: `Fresh ${crop.name} from mangalmani's farm - Premium Quality`,
        organic: Math.random() > 0.7, // 30% organic
        minOrderQty: crop.category === "pulse" || crop.category === "grain" ? 5 : 1
      };
    });

    const result = await Crop.insertMany(cropsToInsert);
    console.log(`✅ Successfully added ${result.length} crops for mangalmani!`);
    console.log("📊 Crops distribution:");
    console.log("   - Vegetables: 20");
    console.log("   - Fruits: 15");
    console.log("   - Grains: 8");
    console.log("   - Pulses: 7");
    console.log("💰 Prices are competitive (slightly lower than amit's prices)");
    console.log("🖼️  Using existing images from temp folder");

  } catch (error) {
    console.error("Error seeding crops:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

seedCropsForMangalmani();
