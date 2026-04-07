import Cart from "../models/cart.model.js";
import Crop from "../models/crops.model.js";

// ADD TO CART
export const addToCart = async (req, res) => {
  const { cropId, quantity } = req.body;

  if (!cropId || !quantity) {
    return res.status(400).json({ message: "Crop ID and quantity required" });
  }

  const crop = await Crop.findById(cropId);
  if (!crop) {
    return res.status(404).json({ message: "Crop not found" });
  }

  // Prevent farmers from adding their own crops to cart
  if (crop.farmer && crop.farmer.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot add your own crop to cart" });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: []
    });
  }

  const itemIndex = cart.items.findIndex(
    item => item.crop.toString() === cropId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      crop: cropId,
      quantity,
      priceAtAddTime: crop.price
    });
  }

  await cart.save();
  res.status(200).json({ message: "Item added to cart", cart });
};

// GET MY CART
export const getMyCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
.populate("items.crop", "name price unit images");


  if (!cart) {
    return res.status(200).json({ items: [] });
  }

  res.status(200).json(cart);
};

// UPDATE QUANTITY
export const updateCartItem = async (req, res) => {
  const { cropId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const item = cart.items.find(
    item => item.crop.toString() === cropId
  );

  if (!item) {
    return res.status(404).json({ message: "Item not in cart" });
  }

  item.quantity = quantity;
  await cart.save();

  res.status(200).json({ message: "Cart updated", cart });
};

// REMOVE ITEM
export const removeFromCart = async (req, res) => {
  const { cropId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  cart.items = cart.items.filter(
    item => item.crop.toString() !== cropId
  );

  await cart.save();
  res.status(200).json({ message: "Item removed", cart });
};

// CLEAR CART
export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(200).json({ message: "Cart cleared" });
};
