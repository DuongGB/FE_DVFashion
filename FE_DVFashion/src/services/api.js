import axios from "axios";

// Base API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Hàm kiểm tra đăng nhập
function isUserAuthenticated() {
  // Nếu dùng cookie:
  return document.cookie.includes("isAuthenticated=true");
  // Nếu dùng localStorage:
  // return localStorage.getItem("isAuthenticated") === "true";
}

// Create axios instance with base config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable sending cookies with requests
});

// Variable to avoid calling refresh multiple times in parallel
let isRefreshing = false;
// Variable that stores the list of subscribers waiting for a refresh token
let refreshSubscribers = [];

// Function to call back all subscribers when token is refreshed
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

// Function to notify all subscribers that the token has been refreshed
function onRefreshed() {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log("Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Variable to hold the original request
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đã logout thì không gọi refresh-token nữa
      if (!isUserAuthenticated()) {
        // Có thể clear cache hoặc chuyển hướng về login nếu muốn
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await api.post("/auth/refresh-token");
          isRefreshing = false;
          onRefreshed();
          return api(originalRequest);
        } catch (err) {
          isRefreshing = false;
          document.cookie = "isAuthenticated=false; path=/;";
          return Promise.reject(err);
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
