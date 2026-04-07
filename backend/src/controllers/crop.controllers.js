import Crop from "../models/crops.model.js";
import { uploadOnCloudinary } from "../libs/cloudinary.js";


// ------------------ FARMER CONTROLLERS ------------------

// ✅ Add a new crop
export const addCrop = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      quantity,
      unit,
      price,
      discount,
      expiryDate,
      organic,
      location
    } = req.body;

    let images = [];

    if (req.file) {
      const cloudRes = await uploadOnCloudinary(req.file.path);
      if (!cloudRes) {
        return res.status(500).json({ message: "Image upload failed" });
      }
      images.push(cloudRes.secure_url);
    }

    const crop = await Crop.create({
      farmer: req.user._id,
      name,
      category,
      description,
      images,
      quantity,
      unit,
      price,
      discount: discount || 0,
      expiryDate,
      organic: organic || false,
      location
    });

    res.status(201).json({
      message: "Crop added successfully",
      crop
    });

  } catch (error) {
    console.error("Add Crop Error:", error);
    res.status(500).json({ message: "Server error while adding crop" });
  }
};



// ✅ Update crop (SECURE VERSION)
export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findById(id);

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    if (!crop.farmer.equals(req.user._id)) {
      return res.status(403).json({
        message: "You can only edit your own crops"
      });
    }

    // ✅ secure whitelist
    const allowedFields = [
      "name",
      "category",
      "description",
      "quantity",
      "unit",
      "price",
      "discount",
      "expiryDate",
      "organic",
      "location"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        crop[field] = req.body[field];
      }
    });

    // image upload
    if (req.file) {
      const cloudRes = await uploadOnCloudinary(req.file.path);
      if (!cloudRes) {
        return res.status(500).json({ message: "Image upload failed" });
      }
      crop.images = [cloudRes.secure_url];
    }

    await crop.save();

    res.status(200).json({
      message: "Crop updated successfully",
      crop
    });

  } catch (error) {
    console.error("Update Crop Error:", error);
    res.status(500).json({ message: "Server error while updating crop" });
  }
};



// ✅ Delete crop (FIXED deprecated remove)
export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await Crop.findById(id);

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    if (!crop.farmer.equals(req.user._id)) {
      return res.status(403).json({
        message: "You can only delete your own crops"
      });
    }

    await crop.deleteOne();

    res.status(200).json({
      message: "Crop deleted successfully"
    });

  } catch (error) {
    console.error("Delete Crop Error:", error);
    res.status(500).json({ message: "Server error while deleting crop" });
  }
};



// ✅ Get all crops of logged-in farmer
export const getMyCrops = async (req, res) => {
  try {

    const crops = await Crop.find({
      farmer: req.user._id
    }).lean(); // ⚡ performance boost
         


    res.status(200).json(crops);
    

  } catch (error) {
    console.error("Get My Crops Error:", error);
    res.status(500).json({ message: "Server error while fetching crops" });
  }
};



// ------------------ BUYER CONTROLLERS ------------------


export const getAvailableCrops = async (req, res) => {
  try {

    //---------------- PAGINATION ----------------
    const page = Number(req.query.page) || 1;
    const limit = 8;   // 👈 Show 8 crops per page
    const skip = (page - 1) * limit;

    const { search, category, organic, sort } = req.query;

    //---------------- BASE QUERY ----------------
    let query = {
      // ✅ STOCK CHECK (MOST IMPORTANT FIX)
      $expr: {
        $gt: [
          { $subtract: ["$quantity", "$sold"] },
          0
        ]
      },

      // ✅ NOT EXPIRED
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gt: new Date() } }
      ]
    };

    //---------------- SEARCH ----------------
    if (search) {
      query.name = {
        $regex: search,
        $options: "i"
      };
    }

    //---------------- CATEGORY ----------------
    if (category && category !== "all") {
      query.category = category;
    }

    //---------------- ORGANIC ----------------
    if (organic && organic !== "all") {
      query.organic = organic === "true";
    }

    //---------------- FETCH ----------------
    let cropsQuery = Crop.find(query)
      .populate("farmer", "name location")
      .select("name category description images unit price discount organic quantity sold");

    //---------------- SORT ----------------
    if (sort === "lowToHigh") {
      cropsQuery = cropsQuery.sort({ price: 1 });
    }

    if (sort === "highToLow") {
      cropsQuery = cropsQuery.sort({ price: -1 });
    }

    //---------------- COUNT ----------------
    const totalCrops = await Crop.countDocuments(query);

    //---------------- APPLY PAGINATION ----------------
    const crops = await cropsQuery
      .skip(skip)
      .limit(limit)
      .lean();

    //---------------- MAP ----------------
    const buyerCrops = crops.map(c => ({
      id: c._id.toString(), // ✅ React safe
      name: c.name,
      category: c.category,
      description: c.description,
      images: c.images,

      // ✅ calculate dynamically
      quantityAvailable: c.quantity - c.sold,

      unit: c.unit,
      price: c.price,
      discount: c.discount,
      farmerName: c.farmer?.name,
      location: c.farmer?.location,
      organic: c.organic
    }));

    //---------------- RESPONSE ----------------
    res.status(200).json({
      crops: buyerCrops,
      page, // ✅ matches Zustand
      totalPages: Math.ceil(totalCrops / limit),
      totalCrops
    });

  } catch (error) {
    console.error("Get Available Crops Error:", error);
    res.status(500).json({ message: "Server error while fetching crops" });
  }
};

// Public — single crop detail by ID
export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate("farmer", "name location profileImage")
      .lean();

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json({
      ...crop,
      id: crop._id.toString(),
      quantityAvailable: crop.quantity - crop.sold,
      farmerName: crop.farmer?.name,
    });
  } catch (error) {
    console.error("Get Crop By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
