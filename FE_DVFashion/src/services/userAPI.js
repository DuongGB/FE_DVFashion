import api from "./api";

export const userAPI = {
  // Get user by ID
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  // Update user
  updateUser: (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },

  // Create staff
  createStaff: (staffData) => {
    return api.post("/users", staffData);
  },

  // Verify staff
  verifyStaff: (verifyData) => {
    return api.post("/users/verify-staff", verifyData);
  },

  // Get all users (admin only)
  getAllUsers: () => {
    return api.get("/users");
  },

  // Change password
  changePassword: (passwordData) => {
    return api.put("/users/change-password", passwordData);
  },
};
