import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useFirebaseOtp } from "../../../hooks/useFirebaseOtp";
import OtpForm from "./OtpForm";
import { useTranslation } from "react-i18next";

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const { sendOtp, verifyOtp } = useFirebaseOtp();
  const { register, isRegisterLoading, registerError } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form");

  // Force re-render when language changes
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

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = t("auth.register.errors.full_name_required");
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t("auth.register.errors.email_required");
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t("auth.register.errors.email_invalid");
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = t("auth.register.errors.phone_required");
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = t("auth.register.errors.phone_invalid");
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = t("auth.register.errors.password_required");
    } else if (
      formData.password.length < 8 ||
      !/\d/.test(formData.password) ||
      !/[a-zA-Z]/.test(formData.password)
    ) {
      newErrors.password = t("auth.register.errors.password_invalid");
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t(
        "auth.register.errors.confirm_password_required"
      );
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t(
        "auth.register.errors.confirm_password_mismatch"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Send OTP to Firebase
      const res = await sendOtp(formData.phone.trim());

      if (!res.success) {
        setErrors({ general: t("auth.register.errors.otp_send_failed") });
        return;
      }

      // Proceed to OTP step
      setStep("otp");
    } catch (err) {
      console.error("Gửi OTP thất bại:", err);
      setErrors({ general: t("auth.register.errors.otp_send_failed") });
    }
  };

  // Callback when OTP is verified successfully
  const handleOtpSuccess = async () => {
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setStep("success");
    } catch (err) {
      console.error("Register failed:", err);
      setErrors({ general: t("auth.register.errors.register_failed") });
    }
  };

  const handleSwitchToLogin = (e) => {
    e.preventDefault();
    console.log("Switching to login manually...");
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      navigate("/login");
    }
  };

  // Get error message to display
  const getErrorMessage = () => {
    if (errors.general) {
      return errors.general;
    }

    if (registerError?.response?.data?.error?.message) {
      return registerError.response.data.error.message;
    }

    if (registerError?.message) {
      return registerError.message;
    }

    return t("auth.register.errors.register_failed");
  };

  // OTP step
  if (step === "otp") {
    return (
      <OtpForm
        verifyOtp={verifyOtp}
        onSuccess={handleOtpSuccess}
        phoneNumber={formData.phone}
        onBack={() => setStep("form")}
        onResend={() => sendOtp(formData.phone)}
      />
    );
  }

  // Success state
  if (step === "success") {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 w-full sm:w-[500px] min-h-[400px] sm:min-h-[500px] flex flex-col relative">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="flex items-center">
            <span className="text-2xl sm:text-3xl font-bold tracking-widest text-black border-r-2 border-black pr-2">
              DV
            </span>
            <span className="text-2xl sm:text-3xl font-light tracking-wider text-gray-700 pl-2">
              Fashion
            </span>
          </div>
        </div>

        {/* Success Content */}
        <div className="flex flex-col items-center justify-center flex-1 text-center py-6 sm:py-12">
          {/* Success Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <span className="text-2xl sm:text-3xl">✅</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-green-600">
            {t("auth.register.success.title")}
          </h2>

          {/* Message */}
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed px-2 sm:px-0">
            {t("auth.register.success.welcome_message", {
              name: formData.fullName,
            })}
            <br />
            {t("auth.register.success.account_created")}
          </p>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 w-full">
            <p className="text-xs sm:text-sm text-blue-800">
              {t("auth.register.success.enjoy_shopping")}
            </p>
          </div>

          {/* Manual Login Button */}
          <button
            onClick={handleSwitchToLogin}
            className="bg-black text-white rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-bold hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          >
            {t("auth.register.success.login_now")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 w-full sm:w-[500px] flex flex-col relative">
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
        {t("auth.register.title")}
      </h2>

      {/* Benefits */}
      <div className="flex gap-3 sm:gap-4 mb-3 justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">%</span>
          <span className="text-xs text-center">
            {t("auth.register.benefits.voucher")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">🎁</span>
          <span className="text-xs text-center">
            {t("auth.register.benefits.gifts")}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">💸</span>
          <span className="text-xs text-center">
            {t("auth.register.benefits.cashback")}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-4">
        <hr className="flex-1 border-gray-300" />
        <span className="text-sm text-gray-500">{t("auth.register.or")}</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Input Full Name */}
        <div className="relative">
          <input
            type="text"
            name="fullName"
            placeholder={t("auth.register.full_name_placeholder")}
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconUser size={18} className="sm:w-[22px] sm:h-[22px]" />
          </span>
        </div>
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">
            {errors.fullName}
          </p>
        )}

        {/* Input Email  */}
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder={t("auth.register.email_placeholder")}
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconMail size={18} className="sm:w-[22px] sm:h-[22px]" />
          </span>
        </div>
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">
            {errors.email}
          </p>
        )}

        {/* Input Phone */}
        <div className="relative">
          <input
            type="text"
            name="phone"
            placeholder={t("auth.register.phone_placeholder")}
            value={formData.phone}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconPhone size={18} className="sm:w-[22px] sm:h-[22px]" />
          </span>
        </div>
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">
            {errors.phone}
          </p>
        )}

        {/* Input Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t("auth.register.password_placeholder")}
            value={formData.password}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconLock size={18} className="sm:w-[22px] sm:h-[22px]" />
          </span>
          <button
            type="button"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? (
              <IconEyeOff size={18} className="sm:w-[22px] sm:h-[22px]" />
            ) : (
              <IconEye size={18} className="sm:w-[22px] sm:h-[22px]" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">
            {errors.password}
          </p>
        )}

        {/* Input Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder={t("auth.register.confirm_password_placeholder")}
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconLock size={18} className="sm:w-[22px] sm:h-[22px]" />
          </span>
          <button
            type="button"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={() => setShowConfirmPassword((v) => !v)}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <IconEyeOff size={18} className="sm:w-[22px] sm:h-[22px]" />
            ) : (
              <IconEye size={18} className="sm:w-[22px] sm:h-[22px]" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">
            {errors.confirmPassword}
          </p>
        )}

        {/* Terms and Conditions */}
        <div className="text-sm text-gray-600 mb-2">
          {t("auth.register.terms_text")}{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            {t("auth.register.terms_link")}
          </a>{" "}
          {t("auth.register.and")}{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            {t("auth.register.privacy_link")}
          </a>{" "}
          {t("auth.register.of_dvfashion")}
        </div>

        {/* General Error */}
        {(registerError || errors.general) && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
            {getErrorMessage()}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isRegisterLoading}
          className="w-full bg-black text-white rounded-full py-3 sm:py-4 text-base sm:text-lg font-bold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isRegisterLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              {t("auth.register.registering")}
            </div>
          ) : (
            t("auth.register.register_button")
          )}
        </button>
      </form>
      <div id="recaptcha-container"></div>

      {/* Links */}
      <div className="flex justify-center mt-4 text-sm">
        <span className="text-gray-600">
          {t("auth.register.already_have_account")}
        </span>
        <button
          type="button"
          onClick={handleSwitchToLogin}
          className="text-blue-600 hover:text-blue-800 hover:underline font-bold ml-1 transition-colors duration-200 cursor-pointer"
        >
          {t("auth.register.login_link")}
        </button>
      </div>
    </div>
  );
}
