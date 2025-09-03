import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../services/authAPI";
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";
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
      setCookie("isAuthenticated", "true");
      queryClient.invalidateQueries(["auth", "user"]);
    },
  });

  // Google login mutation
  const googleLoginMutation = useMutation({
    mutationFn: authAPI.loginWithGoogle,
    onSuccess: (data) => {
      console.log("Google Login response:", data.data);
      if (data?.data?.success) {
        setCookie("isAuthenticated", "true");
        queryClient.invalidateQueries(["auth", "user"]);
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear all caches
      deleteCookie("isAuthenticated");
      queryClient.clear();
    },
  });

  // Forget password
  const forgotPasswordMutation = useMutation({
    mutationFn: authAPI.forgotPassword,
    onSuccess: (data) => {
      console.log("Forgot password response:", data.data);
      queryClient.invalidateQueries(["auth", "user"]);
    },
  });

  return {
    // User data
    user,
    isLoading,
    error,
    isAuthenticated: !!user,

    // Login
    login: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    // Register
    register: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,

    // Logout
    logout: logoutMutation.mutateAsync,
    isLogoutLoading: logoutMutation.isPending,

    // Forget password
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    forgotPasswordError: forgotPasswordMutation.error,

    // Google login
    googleLogin: googleLoginMutation.mutateAsync,
    isGoogleLoginLoading: googleLoginMutation.isPending,
    googleLoginError: googleLoginMutation.error,
  };
};
