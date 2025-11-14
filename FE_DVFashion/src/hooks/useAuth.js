import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../services/authAPI";
import chatAPI from "../services/chatAPI";
import { getCookie, setCookie, deleteCookie } from "../utils/cookies";
import { useChat } from "./useChat";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = getCookie("isAuthenticated") === "true";
  const { createCustomerChatRoom } = useChat();

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

  // Khi user login thành công, tự động lấy chatRoomCode customer
  useEffect(() => {
    async function fetchRoomCodeIfNeeded() {
      if (
        isAuthenticated &&
        user &&
        Array.isArray(user.roles) &&
        user.roles.includes("ROLE_CUSTOMER") &&
        !user.roles.includes("ROLE_ADMIN")
      ) {
        // Nếu user đã có roomCode thì lưu vào localStorage, không tạo mới
        if (user.roomCode) {
          localStorage.setItem("chatRoomCode", user.roomCode);
        } else {
          // Thử lấy roomCode từ API mới bằng userId
          try {
            const savedRoomCode = localStorage.getItem("chatRoomCode");
            if (!savedRoomCode) {
              const res = await chatAPI.getRoomCodeByUserId(user.id);
              if (res?.data) {
                localStorage.setItem("chatRoomCode", res.data);
              } else {
                // Nếu vẫn chưa có thì tạo mới
                createCustomerChatRoom.mutate(undefined, {
                  onSuccess: (data) => {
                    if (data?.data?.roomCode) {
                      localStorage.setItem("chatRoomCode", data.data.roomCode);
                    }
                  },
                });
              }
            }
          } catch (err) {
            // Nếu không có roomCode thì tạo mới
            createCustomerChatRoom.mutate(undefined, {
              onSuccess: (data) => {
                if (data?.data?.roomCode) {
                  localStorage.setItem("chatRoomCode", data.data.roomCode);
                }
              },
            });
          }
        }
      }
    }
    fetchRoomCodeIfNeeded();
  }, [isAuthenticated, user]);

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
      // set cookie để các hook dựa vào cookie nhận biết đã đăng nhập
      setCookie("isAuthenticated", "true");
      // Fetch lại user để lấy thông tin roomCode
      await queryClient.invalidateQueries(["auth", "user"]);

      // Invalidate user
      queryClient.invalidateQueries(["auth", "user"]);
      // Invalidate các dữ liệu phụ thuộc trạng thái đăng nhập
      queryClient.invalidateQueries({ queryKey: ["vouchers", "customer"] });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
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
