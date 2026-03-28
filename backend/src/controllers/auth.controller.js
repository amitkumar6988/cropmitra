import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../libs/sendEmail.js";
import {welcomeTemplate} from "../templates/welcomeTemplate.js";
import { forgotPasswordTemplate } from "../templates/forgotPasswordTemplate.js";
import crypto from "crypto";
// ================== SIGNUP ==================
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email, and password." });
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({
        message: "A user with this email already exists."
      });
    }

    const user = new User({
      name,
      email,
      password,
      role: "user"
    });

    await user.save();

    // 🔐 Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000
    });

    // 📩 SEND EMAIL (non-blocking best practice)
    sendEmail({
      to: email,
      subject: "Welcome to CropMitra 🌾",
      html: welcomeTemplate(name),
    });

    res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || ""
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Server error during registration."
    });
  }
};

// ================== LOGIN ==================
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password." });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000
    });


    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || ""
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

// ================== LOGOUT ==================
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      path: "/"
    });

    res.status(200).json({
      message: "Successfully logged out."
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      message: "Server error during logout."
    });
  }
};

// ================== ME ==================
export const me = async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profileImage: req.user.profileImage || ""
      },
      message: "User session active."
    });
  } catch (error) {
    console.error("Me Error:", error);
    res.status(500).json({
      message: "Internal server error."
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {

    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // create token
    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken =
      crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl =
      `http://localhost:5173/reset-password/${resetToken}`;

    // ✅ PROFESSIONAL EMAIL
    sendEmail({
      to: user.email,
      subject: "Reset Your Password 🔑",
      html: forgotPasswordTemplate(user.name, resetUrl),
    });

    res.json({ message: "Reset mail sent" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {

    const hashedToken =
      crypto.createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Token invalid or expired" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



