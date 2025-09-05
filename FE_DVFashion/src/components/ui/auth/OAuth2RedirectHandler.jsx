import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getDefaultRouteByRoles } from "../../../utils/getDefaultRouteByRoles";
import { useAuth } from "../../../hooks/useAuth";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();

  const location = useLocation();

  const {
    loginGoogleComplete,
    isLoginGoogleCompleteLoading,
    loginGoogleCompleteError,
  } = useAuth();

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      // Parse query parameters
      const params = new URLSearchParams(location.search);

      // If error param exists, redirect to home with error message
      if (params.get("error")) {
        navigate("/", { state: { error: "Đăng nhập Google thất bại" } });
        return;
      }

      // Handle Google OAuth2 login completion
      try {
        const use = await loginGoogleComplete();
        const defaultRoute = getDefaultRouteByRoles(use?.roles);
        navigate(defaultRoute);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    handleOAuth2Redirect();
  }, [location, navigate, loginGoogleComplete]);

  // Handle error state
  useEffect(() => {
    if (loginGoogleCompleteError) {
      console.error("Google login complete error:", loginGoogleCompleteError);
      navigate("/", {
        state: {
          error: "Đăng nhập Google thất bại. Vui lòng thử lại.",
        },
      });
    }
  }, [loginGoogleCompleteError, navigate]);

  // Show loading state
  if (isLoginGoogleCompleteLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Animated Container */}
        <div className="relative mb-8">
          {/* Outer Ring */}
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
          {/* Inner Ring */}
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          {/* Center Icon */}
          <div className="absolute top-6 left-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-gray-800 text-xl font-semibold mb-2">
            Đang xử lý đăng nhập
          </h2>
          <p className="text-gray-600 text-sm">Đang kết nối với Google...</p>
        </div>

        {/* Additional Loading Indicator */}
        <div className="flex space-x-1 mt-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (loginGoogleCompleteError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-2xl">✕</span>
          </div>
          <h2 className="text-red-800 text-xl font-semibold mb-2">
            Đăng nhập thất bại
          </h2>
          <p className="text-red-600 text-sm mb-4">
            Có lỗi xảy ra trong quá trình đăng nhập Google
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }
}
