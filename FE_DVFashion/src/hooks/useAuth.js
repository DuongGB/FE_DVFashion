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
      // console.log("Current user:", res.data.data);
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
    onSuccess: async (data) => {
      // Set cookie trước để các hook biết đã đăng nhập
      setCookie("isAuthenticated", "true");

      // Nếu API trả về thông tin user luôn, set vào cache ngay
      const userData = data?.data?.data;
      if (userData) {
        queryClient.setQueryData(["auth", "user"], userData);
      }

      // Invalidate để fetch lại user data mới nhất (không await để không chặn UI)
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

      // Invalidate các dữ liệu phụ thuộc trạng thái đăng nhập
      queryClient.invalidateQueries({ queryKey: ["vouchers", "customer"] });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });

      // Clear chat data
      localStorage.removeItem("chatRoomCode");
      localStorage.removeItem("chatGuestInfo");
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear all caches
      deleteCookie("isAuthenticated");
      deleteCookie("token");
      queryClient.clear();
      localStorage.removeItem("chatRoomCode");
      localStorage.removeItem("chatGuestInfo");
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

  // Reset password via email token
  const resetPasswordMailMutation = useMutation({
    mutationFn: authAPI.resetPasswordMail,
    onSuccess: () => {
      console.log("Password reset successfully");
    },
  });

  return {
    // User data
    user: isAuthenticated ? user : null,
    isLoading,
    error,
    isAuthenticated,

    // Login
    login: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,

    // Reset password mail
    resetPasswordMail: resetPasswordMailMutation.mutateAsync,
    isResetPasswordMailLoading: resetPasswordMailMutation.isPending,
    resetPasswordMailError: resetPasswordMailMutation.error,

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
