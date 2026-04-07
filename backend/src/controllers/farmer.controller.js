import FarmerProfile from "../models/farmer.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../libs/sendEmail.js";
import { farmerApprovedTemplate } from "../templates/farmerApprovedTemplate.js";

// ================= APPLY FOR FARMER =================
export const applyFarmer = async (req, res) => {
  const { farmName, location, licenseNumber } = req.body;

  if (!farmName || !location) {
    return res.status(400).json({ message: "Farm name and location are required." });
  }

  try {
    // Check if user already has a farmer profile
    const existingProfile = await FarmerProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "You have already applied or are a farmer." });
    }

    const farmerProfile = new FarmerProfile({
      user: req.user._id,
      farmName,
      location,
      licenseNumber: licenseNumber || "",
    });

    await farmerProfile.save();

    res.status(201).json({
      message: "Farmer application submitted successfully. Wait for admin approval.",
      farmerProfile,
    });
  } catch (error) {
    console.error("Apply Farmer Error:", error);
    res.status(500).json({ message: "Server error while applying for farmer." });
  }
};

// ================= GET ALL FARMER REQUESTS (ADMIN) =================
export const getFarmerRequests = async (req, res) => {
  try {
    // Only show unapproved farmers
    const requests = await FarmerProfile.find({ isApproved: false }).populate("user", "name email");

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get Farmer Requests Error:", error);
    res.status(500).json({ message: "Server error while fetching farmer requests." });
  }
};

// ================= APPROVE FARMER (ADMIN) =================



export const approveFarmer = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findById(req.params.id);

    if (!farmerProfile) {
      return res.status(404).json({ message: "Farmer profile not found" });
    }

    if (farmerProfile.isApproved) {
      return res.status(400).json({ message: "Already approved" });
    }

    const user = await User.findById(farmerProfile.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "farmer";
    await user.save();

    farmerProfile.isApproved = true;
    await farmerProfile.save();

    const html = farmerApprovedTemplate(user.name);

    await sendEmail({
      to: user.email,
      subject: "🎉 You are now a Farmer - CropMitra",
      html: html, // ✅ FIXED
    });

    res.status(200).json({
      message: "Farmer approved and email sent",
    });

  } catch (error) {
    console.error("❌ ERROR:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= GET FARMER PROFILE (LOGGED-IN USER) =================
export const getMyFarmerProfile = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ user: req.user._id }).populate("crops");
    if (!profile) {
      return res.status(404).json({ message: "No farmer profile found." });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error("Get My Farmer Profile Error:", error);
    res.status(500).json({ message: "Server error while fetching your farmer profile." });
  }
};

export const getFarmerEarnings = async (req, res) => {
  try {
    const farmerProfile = await FarmerProfile.findOne({ user: req.user._id })
      .populate("earningsHistory.order", "totalAmount status createdAt");

    if (!farmerProfile) {
      return res.status(404).json({ message: "Farmer profile not found." });
    }

    if (!farmerProfile.isApproved) {
      return res.status(403).json({ message: "Farmer not approved yet." });
    }

    res.status(200).json({
      totalEarnings: farmerProfile.totalEarnings,
      earningsHistory: farmerProfile.earningsHistory
    });
  } catch (error) {
    console.error("Get Farmer Earnings Error:", error);
    res.status(500).json({ message: "Server error while fetching earnings." });
  }
};
