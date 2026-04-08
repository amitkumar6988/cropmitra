import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

export const useWishlistStore = create((set, get) => ({
  wishlist: [], // array of populated crop objects

  fetchWishlist: async () => {
    try {
      const res = await axiosInstance.get("/wishlist");
      set({ wishlist: res.data.wishlist ?? [] });
    } catch { /* silent */ }
  },

  toggle: async (cropId) => {
    if (!cropId) return;
    const id = String(cropId);

    // Optimistic update BEFORE API call
    const wasWishlisted = get().wishlist.some(c => String(c._id || c.id || c) === id);
    if (wasWishlisted) {
      set(state => ({ wishlist: state.wishlist.filter(c => String(c._id || c.id || c) !== id) }));
    } else {
      set(state => ({ wishlist: [...state.wishlist, { _id: id }] }));
    }

    try {
      const res = await axiosInstance.post(`/wishlist/${id}`);
      toast.success(res.data.added ? "Added to wishlist ❤️" : "Removed from wishlist");
      // Refetch for fully populated objects
      get().fetchWishlist();
    } catch (err) {
      console.error("Wishlist error:", err.response?.data || err.message);
      // Revert optimistic update on failure
      if (wasWishlisted) {
        set(state => ({ wishlist: [...state.wishlist, { _id: id }] }));
      } else {
        set(state => ({ wishlist: state.wishlist.filter(c => String(c._id || c.id || c) !== id) }));
      }
      toast.error(err.response?.data?.message || "Failed to update wishlist. Please try again.");
    }
  },

  // Normalize both sides to string for reliable comparison
  isWishlisted: (cropId) => {
    if (!cropId) return false;
    const id = String(cropId);
    return get().wishlist.some(c => String(c._id || c.id || c) === id);
  },
}));
