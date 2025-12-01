import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getDefaultRouteByRoles } from "../../../utils/getDefaultRouteByRoles";
import GoogleLoginButton from "../../common/GoogleLoginButton";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconPhone,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onForgotPassword,
  stayOnPage,
}) {
  const { login, isLoginLoading, loginError } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate username (email or phone)
    if (!formData.username.trim()) {
      newErrors.username = t("auth.login.errors.username_required");
    } else {
      // Check if it's email or phone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9]{10,11}$/;

      if (
        !emailRegex.test(formData.username) &&
        !phoneRegex.test(formData.username)
      ) {
        newErrors.username = t("auth.login.errors.username_invalid");
      }
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = t("auth.login.errors.password_required");
    } else if (
      formData.password.length < 8 ||
      !/\d/.test(formData.password) ||
      !/[a-zA-Z]/.test(formData.password)
    ) {
      newErrors.password = t("auth.login.errors.password_invalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const loginData = {
        username: formData.username.trim(),
        password: formData.password,
      };

      console.log("Sending login data:", loginData);

      const result = await login(loginData);
      console.log("Login result:", result);

      if (result?.data?.success) {
        // Lấy roles từ response
        const roles = result?.data?.data?.roles || [];
        console.log("Roles from login response:", roles);

        // Xác định route mặc định dựa trên roles (ưu tiên ADMIN)
        const defaultRoute = getDefaultRouteByRoles(roles);
        console.log("Default route determined:", defaultRoute);

        // Set remember me if checked
        if (rememberMe) {
          localStorage.setItem("rememberLogin", "true");
        }

        // Chuyển hướng đến route tương ứng
        if (stayOnPage) {
          if (onSuccess) onSuccess();
        } else {
          navigate(defaultRoute, { replace: true });
          if (onSuccess) onSuccess();
        }

        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Login failed:", err);

      // Xử lý lỗi và hiển thị thông báo user-friendly
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";

      if (err?.response?.status === 400) {
        errorMessage =
          "Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.";
      } else if (err?.response?.status === 401) {
        errorMessage =
          "Tài khoản hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.";
      } else if (err?.response?.status === 403) {
        errorMessage = "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.";
      } else if (err?.response?.status === 429) {
        errorMessage =
          "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.";
      } else if (err?.response?.status >= 500) {
        errorMessage = "Hệ thống đang bảo trì. Vui lòng thử lại sau.";
      } else if (err?.response?.data?.error?.message) {
        // Nếu server trả về message cụ thể
        errorMessage = err.response.data.error.message;
      } else if (
        err?.code === "NETWORK_ERROR" ||
        err?.message?.includes("Network")
      ) {
        errorMessage = t("auth.login.errors.network_error");
      }

      setErrors({
        general: errorMessage,
      });
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (onForgotPassword) {
      onForgotPassword();
    }
  };

  const handleSwitchToRegister = (e) => {
    e.preventDefault();
    if (onSwitchToRegister) {
      onSwitchToRegister();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] flex flex-col relative">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center">
          <span className="text-2xl sm:text-3xl font-bold tracking-widest text-black border-r-2 border-black pr-2">
            DV
          </span>
          <span className="text-2xl sm:text-3xl font-light tracking-wider text-gray-700 pl-2">
            Fashion
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
        {t("auth.login.title")}
      </h2>

      {/* Benefits */}
      <div className="flex gap-3 sm:gap-4 mb-3 justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">%</span>
          <span className="text-xs text-center">
            {t("auth.login.benefits.voucher")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">🎁</span>
          <span className="text-xs text-center">
            {t("auth.login.benefits.gifts")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">💸</span>
          <span className="text-xs text-center">
            {t("auth.login.benefits.cashback")}
          </span>
        </div>
      </div>

      {/* Social login */}
      <div className="flex justify-center gap-3 mb-3">
        <GoogleLoginButton />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-4">
        <hr className="flex-1 border-gray-300" />
        <span className="text-sm text-gray-500">{t("auth.login.or")}</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Input Email/Phone */}
        <div className="relative">
          <input
            type="text"
            name="username"
            placeholder={t("auth.login.username_placeholder")}
            value={formData.username}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.username ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {/^[0-9]{10,11}$/.test(formData.username) ? (
              <IconPhone size={22} />
            ) : (
              <IconMail size={22} />
            )}
          </span>
        </div>
        {errors.username && (
          <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">
            {errors.username}
          </p>
        )}

        {/* Input Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("auth.login.password_placeholder")}
            value={formData.password}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconLock size={22} />
          </span>
          <button
            type="button"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <IconEyeOff size={22} /> : <IconEye size={22} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">
            {errors.password}
          </p>
        )}

        {/* Remember Me */}
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {t("auth.login.remember_me")}
            </span>
          </label>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoginLoading}
          className="w-full bg-black text-white rounded-full py-3 sm:py-4 text-base sm:text-lg font-bold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoginLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              {t("auth.login.logging_in")}
            </div>
          ) : (
            t("auth.login.login_button")
          )}
        </button>
      </form>

      {/* Links */}
      <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2 sm:gap-0 text-sm">
        <button
          type="button"
          onClick={handleSwitchToRegister}
          className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors duration-200 text-center sm:text-left cursor-pointer"
        >
          {t("auth.login.register_link")}
        </button>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors duration-200 text-center sm:text-right cursor-pointer"
        >
          {t("auth.login.forgot_password_link")}
        </button>
      </div>

      {/* Additional Features */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          {t("auth.login.terms_text")}{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            {t("auth.login.terms_link")}
          </a>{" "}
          {t("auth.login.and")}{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            {t("auth.login.privacy_link")}
          </a>{" "}
          {t("auth.login.of_dvfashion")}
        </p>
      </div>
    </div>
  );
}
