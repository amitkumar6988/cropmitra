// src/store/authStore.js

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set) => ({

      user: null,
      loading: false,

      // ✅ Helper
      setUser: (user) => set({ user }),

      // =========================
      // ✅ REGISTER
      // =========================
      register: async (data) => {
        set({ loading: true });

        try {
          const res = await axiosInstance.post("/auth/signup", data);

          if(res.data.user?.isBlocked){
            toast.error("You are blocked by admin");
            return null;
          }

          set({ user: res.data.user });

          toast.success(res.data.message || "Registered successfully");

          return res.data.user;

        } catch (err) {

          toast.error(err.response?.data?.message || "Registration failed");
          return null;

        } finally {
          set({ loading: false });
        }
      },

      // =========================
      // ✅ LOGIN
      // =========================
      login: async (data) => {

        set({ loading: true });

        try {

          const res = await axiosInstance.post("/auth/login", data);

          const user = res.data.user;

          // 🔥 BLOCK CHECK
          if(user?.isBlocked){
            toast.error("You are blocked by admin");
            return null;
          }

          set({ user });

          toast.success(res.data.message || "Logged in successfully!");
             

          return user; // ✅ return user instead of true
            

        } catch (err) {

          toast.error(err.response?.data?.message || "Login failed");
          return null;

        } finally {
          set({ loading: false });
        }
      },

      // =========================
      // ✅ LOGOUT
      // =========================
      logout: async () => {

        try {

          await axiosInstance.post("/auth/logout");

          set({ user: null });

          toast.success("Logged out successfully!");
              window.location.href = "/login";

        } catch (err) {

          toast.error("Logout failed");
        }
      },

      // =========================
      // ✅ FETCH USER (AUTO LOGIN)
      // =========================
      fetchUser: async () => {

        set({ loading: true });

        try {

          const res = await axiosInstance.get("/auth/me");

          set({ user: res.data.user });

        } catch (err) {

          // Only clear user on explicit 401 (invalid/expired token).
          // Network errors or 5xx should NOT wipe a persisted user.
          if (err.response?.status === 401) {
            set({ user: null });
          }

        } finally {

          set({ loading: false });
        }
      },

      // =========================
      // 🌾 UPGRADE TO FARMER
      // =========================
      upgradeToFarmer: async () => {

        set({ loading: true });

        try {

          const res = await axiosInstance.post("/users/upgrade-to-farmer");

          set({ user: res.data.user });

          toast.success("Upgraded to Farmer 🌾");

          return true;

        } catch (err) {

          toast.error(err.response?.data?.message || "Upgrade failed");

          return false;

        } finally {

          set({ loading: false });
        }
      },

      // =========================
      // 🖼️ UPLOAD PROFILE IMAGE
      // =========================
      uploadProfileImage: async (file) => {

        set({ loading: true });

        try {

          const formData = new FormData();
          formData.append("image", file);

          const res = await axiosInstance.post(
            "/auth/upload-profile",
            formData
          );

          set({ user: res.data.user });

          toast.success("Profile image updated");

          return true;

        } catch (err) {

          toast.error("Image upload failed");

          return false;

        } finally {

          set({ loading: false });
        }
      }

    }),
    {
      name: "auth-storage", // ✅ localStorage key

      // 🔥 Persist ONLY user (not loading)
      partialize: (state) => ({
        user: state.user
      })
    }
  )
);
