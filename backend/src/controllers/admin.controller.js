import User from "../models/user.model.js";
import Crop from "../models/crops.model.js";
import Order from "../models/order.model.js";
import FarmerProfile from "../models/farmer.model.js";



// ✅ ADMIN DASHBOARD


export const getDashboard = async (req, res) => {
  try {

    const [
      totalUsers,
      totalFarmers,
      totalCrops,
      totalOrders,
      pendingFarmers
    ] = await Promise.all([

      User.countDocuments({ role: "user" }),

      User.countDocuments({ role: "farmer" }),

      Crop.countDocuments(),

      Order.countDocuments(),

      User.countDocuments({
        role: "user",
        isFarmerApproved: false
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFarmers,
        totalCrops,
        totalOrders,
        pendingFarmers
      }
    });

  } catch (error) {

    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success:false,
      message:"Failed to load dashboard"
    });
  }
};




// ✅ GET PENDING FARMERS

export const getPendingFarmers = async (req, res) => {
  try {

    const farmers = await FarmerProfile.find({
      isApproved: false
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success:true,
      farmers
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Failed to fetch pending farmers"
    });
  }
};




// ✅ APPROVE FARMER



export const approveFarmer = async (req, res) => {
  try {
    const farmer = await FarmerProfile.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found"
      });
    }

    // 1️⃣ Approve Farmer Profile
    farmer.isApproved = true;
    await farmer.save();

    // 2️⃣ Update User Role + Approval
    const user = await User.findById(farmer.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.role = "farmer";
    user.isFarmerApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Farmer approved successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Approval failed"
    });
  }
};



// ✅ REJECT FARMER


export const rejectFarmer = async (req, res) => {

  try {

    await FarmerProfile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success:true,
      message:"Farmer rejected and removed"
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:"Rejection failed"
    });
  }
};




// ✅ BLOCK USER


export const blockUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    user.isBlocked = true;
    await user.save();

    res.status(200).json({
      success:true,
      message:"User blocked"
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:"Failed to block user"
    });
  }
};




// ✅ UNBLOCK USER


export const unblockUser = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found"
      });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({
      success:true,
      message:"User unblocked"
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:"Failed to unblock user"
    });
  }
};




// ✅ GET ALL USERS


export const getAllUsers = async (req, res) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = 10; // users per page
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .sort({createdAt:-1})
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success:true,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      users
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:"Failed to fetch users"
    });
  }
};




// ✅ GET ALL FARMERS


export const getAllFarmers = async (req, res) => {

  try {

    const farmers = await FarmerProfile.find()
      .populate({
        path: "user",
        select: "name email isBlocked"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farmers.length,
      farmers
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:"Failed to fetch farmers"
    });
  }
};
  

export const getAllOrders = async (req,res)=>{
 try{

   const orders = await Order.find()

   .populate("buyer","name email")

   .populate({
     path:"items.crop",
     select:"name price"
   })

   .populate({
     path:"items.farmer",
     select:"name email"
   })

   .sort({createdAt:-1});

   res.json({
     success:true,
     orders
   });

 }catch(err){

   res.status(500).json({
     success:false,
     message:"Server error"
   });
 }
};