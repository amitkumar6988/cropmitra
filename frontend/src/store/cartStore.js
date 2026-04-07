import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  // 🛒 CART DATA
  cart: [],
  loading: false,      // fetchCart loading (used by CartPage)
  adding: false,       // addToCart loading (used by buttons)

  // 🟢 CART MODAL (CENTER POPUP)
  cartModalOpen: false,
  openCartModal: () => set({ cartModalOpen: true }),
  closeCartModal: () => set({ cartModalOpen: false }),

  // 🔢 Unique items count (matches cart page display)
  cartCount: () => get().cart.length,

  // ✅ Fetch cart
  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/cart/me");
      set({ cart: res.data.items ?? [] });
    } catch (err) {
      set({ cart: [] });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Add to cart (ONLY cropId + quantity)
  addToCart: async (cropId, quantity = 1) => {
    set({ adding: true });
    try {
      await axiosInstance.post("/cart/add", { cropId, quantity });
      await get().fetchCart();
      get().openCartModal();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      set({ adding: false });
    }
  },

  // ✅ Update quantity
  updateQuantity: async (cropId, quantity) => {
    try {
      await axiosInstance.patch("/cart/update", {
        cropId,
        quantity,
      });
      await get().fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  },

  // ✅ Remove item
  removeItem: async (cropId) => {
    try {
      await axiosInstance.delete(`/cart/remove/${cropId}`);
      toast.success("Removed from cart");
      await get().fetchCart();
    } catch {
      toast.error("Failed to remove item");
    }
  },

  // ✅ Clear cart
  clearCart: async () => {
    try {
      await axiosInstance.delete("/cart/clear");
      set({ cart: [] });
    } catch {
      toast.error("Failed to clear cart");
    }
  },
}));
