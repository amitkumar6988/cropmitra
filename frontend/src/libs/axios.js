import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true, // important if using cookies or JWT in cookies
});
