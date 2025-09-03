import api from "./api";
import { apiGoogle } from "./api";

export const authAPI = {
  // login
  login: (data) => {
    return api.post("/auth/sign-in", data);
  },

  // register
  register: (userData) => {
    return api.post("/auth/sign-up", userData);
  },

  // Đăng xuất
  logout: () => {
    return api.post("/auth/logout");
  },

  // Refresh token
  refreshToken: () => {
    return api.post("/auth/refresh-token");
  },

  // Get current user information
  getCurrentUser: () => {
    return api.get("/auth/me");
  },

  //Forget password
  forgotPassword: (data) => {
    return api.post("/auth/forgot-password", data);
  },

  //Google login - chỉ gửi token từ Google lên server
  loginWithGoogle: (googleToken) => {
    return api.post("/oauth2/authorization/google", {
      token: googleToken,
      provider: "GOOGLE",
    });
  },
};
