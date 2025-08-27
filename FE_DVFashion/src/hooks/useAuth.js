import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../services/authAPI";
import { getCookie } from "../utils/cookies";
import { data } from "react-router-dom";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = getCookie("isAuthenticated") === "true";

  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const res = await authAPI.getCurrentUser();
      console.log("Current user:", res.data.data);
      return res.data.data;
    },
    retry: false,
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["auth", "user"]);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      console.log("Login response:", data.data);
      queryClient.invalidateQueries(["auth", "user"]);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear all caches
      queryClient.clear();
      document.cookie = "isAuthenticated=false; path=/"; // Update cookie
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error,
  };
};
