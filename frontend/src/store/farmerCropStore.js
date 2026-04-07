import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

export const useFarmerCropStore = create((set, get) => ({

  crops: [],

  fetchLoading: false,
  addLoading: false,
  deleteLoading: false,
  updateLoading: false,
  updatingCropId: null,

  error: null,

  //---------------- FETCH FARMER CROPS ----------------

  fetchFarmerCrops: async () => {
    set({ fetchLoading: true, error: null });

    try {
      const res = await axiosInstance.get("/crops/me");

      set({ crops: res.data || [] });

    } catch (err) {
      set({
        crops: [],
        error: err.response?.data?.message,
      });

      toast.error("Failed to fetch crops");
    } finally {
      set({ fetchLoading: false });
    }
  },

  //---------------- ADD ----------------

  addCrop: async (formData) => {
    set({ addLoading: true });

    try {
      const res = await axiosInstance.post(
        "/crops/add",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      set((state) => ({
        crops: [res.data.crop, ...state.crops],
      }));

      toast.success("Crop added 🌾");

      return true;

    } catch (err) {
  console.log("FULL ERROR:", err);
  console.log("RESPONSE:", err.response);

  toast.error(
    err.response?.data?.message || "Failed to add crop"
  );

  return false;

    } finally {
      set({ addLoading: false });
    }
  },

  //---------------- DELETE ----------------

  deleteCrop: async (id) => {

    if (get().deleteLoading) return;

    set({ deleteLoading: true });

    try {

      await axiosInstance.delete(`/crops/${id}`);

      set((state) => ({
        crops: state.crops.filter((c) => c._id !== id),
      }));

      toast.success("Crop deleted");

    } catch (err) {

      toast.error(
        err.response?.data?.message || "Delete failed"
      );

    } finally {
      set({ deleteLoading: false });
    }
  },

  //---------------- UPDATE ----------------

  updateCrop: async (id, data) => {
    if (get().updateLoading) return false;

    set({ updateLoading: true, updatingCropId: id });

    try {
      const res = await axiosInstance.patch(`/crops/${id}`, data);

      set((state) => ({
        crops: state.crops.map((crop) =>
          crop._id === id ? res.data.crop : crop
        ),
      }));

      toast.success("Crop updated successfully");
      return true;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update crop"
      );
      return false;
    } finally {
      set({ updateLoading: false, updatingCropId: null });
    }
  },

}));
