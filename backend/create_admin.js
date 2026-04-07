import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@cropmitra.com" });

    if (existingAdmin) {
      existingAdmin.password = "admin123";
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log("Admin user already existed, password reset.");
      console.log("Email: admin@cropmitra.com");
      console.log("Password: admin123");
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      name: "Admin",
      email: "admin@cropmitra.com",
      password: "admin123",
      role: "admin"
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@cropmitra.com");
    console.log("Password: admin123");

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

createAdmin();