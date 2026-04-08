import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

const AUTH_ROUTES = ["/auth/login", "/auth/signup", "/auth/me", "/chat"];

let isSessionExpiredHandled = false;

export const resetSessionExpiredFlag = () => {
  isSessionExpiredHandled = false;
};

// ── Request interceptor — block non-auth calls after session expires ──
axiosInstance.interceptors.request.use(
  config => {
    if (isSessionExpiredHandled && !AUTH_ROUTES.some(r => (config.url ?? "").includes(r))) {
      return new Promise(() => {});
    }
    return config;
  },
  error => Promise.reject(error)
);

// ── Response interceptor — only fire "session expired" if user WAS logged in ──
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    if (status === 401 && !AUTH_ROUTES.some(r => url.includes(r))) {
      if (!isSessionExpiredHandled) {
        isSessionExpiredHandled = true;

        const user = useAuthStore.getState().user;

        if (user) {
          // Had an active session that expired
          useAuthStore.getState().setUser(null);
          toast.error("Session expired. Please login again.");
          setTimeout(() => { window.location.href = "/login"; }, 1500);
        }
        // No user in state = not logged in, silently ignore
      }

      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);
