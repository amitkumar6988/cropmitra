import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import Crop from "./src/models/crops.model.js";

dotenv.config();

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

const fixImages = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const farmer = await User.findOne({ name: "mangalmani" });
  if (!farmer) {
    console.error("❌ Could not find user mangalmani");
    process.exit(1);
  }

  const crops = await Crop.find({ farmer: farmer._id });
  if (!crops.length) {
    console.log("No crops found for mangalmani");
    await mongoose.disconnect();
    return;
  }

  let fixed = 0;
  let missing = 0;

  for (const crop of crops) {
    const filename = imageMap[crop.name];
    if (!filename) {
      console.warn(`No image mapping for crop name: ${crop.name}`);
      missing += 1;
      continue;
    }

    const newPath = `/crops/${filename}`;
    if (!crop.images || crop.images[0] !== newPath) {
      crop.images = [newPath];
      await crop.save();
      fixed += 1;
    }
  }

  console.log(`✅ Updated images for ${fixed} crops.`);
  if (missing > 0) console.log(`⚠️ ${missing} crops had no image mapping.`);
  await mongoose.disconnect();
};

fixImages().catch((err) => {
  console.error(err);
  process.exit(1);
});