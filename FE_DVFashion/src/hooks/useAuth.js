import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../services/authAPI";
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";

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
    onSuccess: () => {
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

  // Complete Google login (fetch user info after Google OAuth)
  const loginGoogleCompleteMutation = useMutation({
    mutationFn: async () => {
      const response = await authAPI.getCurrentUser();
      return response.data.data;
    },
    onSuccess: (userData) => {
      if (userData) {
        setCookie("isAuthenticated", "true");
        queryClient.invalidateQueries(["auth", "user"]);
      }
    },
  });

  // Verify OTP for sign up
  const verifyOtpForSignUpMutation = useMutation({
    mutationFn: authAPI.verifyOtpForSignUp,
    onSuccess: () => {
      console.log("OTP verified successfully");
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

    // Google login complete
    loginGoogleComplete: loginGoogleCompleteMutation.mutateAsync,
    isLoginGoogleCompleteLoading: loginGoogleCompleteMutation.isPending,
    loginGoogleCompleteError: loginGoogleCompleteMutation.error,

    // Verify OTP for sign up
    verifyOtpForSignUp: verifyOtpForSignUpMutation.mutateAsync,
    isVerifyOtpForSignUp: verifyOtpForSignUpMutation.isPending,
    verifyOtpForSignUpError: verifyOtpForSignUpMutation.error,
  };
};
