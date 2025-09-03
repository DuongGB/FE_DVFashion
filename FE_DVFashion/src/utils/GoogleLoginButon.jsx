import { GoogleLogin } from "@react-oauth/google";
import { authAPI } from "../services/authAPI";

const GoogleLoginButton = ({ onSuccess, onError, disabled = false }) => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google credential response:", credentialResponse);

      const response = await authAPI.loginWithGoogle(
        credentialResponse.credential
      );

      console.log("Google login API response:", response);

      // Check if login successful
      if (response?.data?.success) {
        // Lưu token vào localStorage hoặc cookies
        if (response.data.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.data.accessToken);
        }
        if (response.data.data?.refreshToken) {
          localStorage.setItem("refreshToken", response.data.data.refreshToken);
        }

        // Call success callback với full response data
        onSuccess(response.data);
      } else {
        throw new Error("Login response indicates failure");
      }
    } catch (error) {
      console.error("Google login failed:", error);

      // Enhanced error handling
      let errorMessage = "Đăng nhập Google thất bại. Vui lòng thử lại.";

      if (error?.response?.status === 404) {
        errorMessage =
          "Tài khoản Google này chưa được đăng ký. Vui lòng đăng ký trước.";
      } else if (error?.response?.status === 400) {
        errorMessage = "Token Google không hợp lệ. Vui lòng thử lại.";
      } else if (error?.response?.status === 401) {
        errorMessage =
          "Tài khoản Google không được xác thực. Vui lòng thử lại.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau.";
      } else if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }

      onError(new Error(errorMessage));
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google OAuth error:", error);
    onError(new Error("Đăng nhập Google thất bại. Vui lòng thử lại."));
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        auto_select={false}
        theme="outline"
        size="large"
        width="100%"
        text="signin_with"
        locale="vi"
        disabled={disabled}
        containerProps={{
          className: "w-full flex justify-center",
        }}
      />
    </div>
  );
};

export default GoogleLoginButton;
