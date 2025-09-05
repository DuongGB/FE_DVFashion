import axios from "axios";

// Base API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

    // If the error is 401 (Unauthorized) and the request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If not refreshing, set the flag and call the refresh endpoint
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Call the refresh token endpoint
          await api.post("/auth/refresh-token");

          // set the flag to false and notify subscribers
          isRefreshing = false;
          onRefreshed();

          // Retry the original request with the new token
          return api(originalRequest); // Retry original request
        } catch (err) {
          isRefreshing = false;
          // QueryClient.clear(); // Clear cache when token refresh fails
          document.cookie = "isAuthenticated=false; path=/;"; // clear flag
          return Promise.reject(err);
        }
      }

      // If already refreshing, return a promise that resolves when the token is refreshed
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
