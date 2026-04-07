import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

export const useWishlistStore = create((set, get) => ({
  wishlist: [],   // array of populated crop objects

  fetchWishlist: async () => {
    try {
      const res = await axiosInstance.get("/wishlist");
      set({ wishlist: res.data.wishlist ?? [] });
    } catch { /* silent */ }
  },

  toggle: async (cropId) => {
    try {
      const res = await axiosInstance.post(`/wishlist/${cropId}`);
      toast.success(res.data.added ? "Added to wishlist ❤️" : "Removed from wishlist");
      get().fetchWishlist();
    } catch {
      toast.error("Failed to update wishlist");
    }
  },

  isWishlisted: (cropId) =>
    get().wishlist.some(c => (c._id || c.id || c) === cropId),
}));
