import { useState } from "react";
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

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const { sendOtp, verifyOtp } = useFirebaseOtp();
  const { register, isRegisterLoading, registerError } = useAuth();
  const navigate = useNavigate();
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
      newErrors.fullName = "Họ và tên không được để trống";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (
      formData.password.length < 8 ||
      !/\d/.test(formData.password) ||
      !/[a-zA-Z]/.test(formData.password)
    ) {
      newErrors.password =
        "Mật khẩu phải có ít nhất 8 ký tự và bao gồm chữ và số";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
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
        setErrors({ general: "Không thể gửi OTP. Vui lòng thử lại." });
        return;
      }

      // Proceed to OTP step
      setStep("otp");
    } catch (err) {
      console.error("Gửi OTP thất bại:", err);
      setErrors({ general: "Không thể gửi OTP. Vui lòng thử lại." });
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
      setErrors({ general: "Đăng ký thất bại. Vui lòng thử lại." });
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

    return "Đăng ký thất bại. Vui lòng thử lại.";
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
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] min-h-[500px] flex flex-col relative">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6 w-16 h-8 sm:w-20 sm:h-10">
          <img
            src="./src/assets/logo_DVF.png"
            alt="DVFashion Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Success Content */}
        <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">✅</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-4 text-green-600">
            Đăng ký thành công!
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Chào mừng <span className="font-semibold">{formData.fullName}</span>{" "}
            đến với DVFashion!
            <br />
            Tài khoản của bạn đã được tạo thành công.
          </p>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
            <p className="text-sm text-blue-800">
              🎉 Hãy mua sắm một cách vui vẻ với chúng tôi
            </p>
          </div>

          {/* Manual Login Button */}
          <button
            onClick={handleSwitchToLogin}
            className="bg-black text-white rounded-full px-8 py-3 text-lg font-bold hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] flex flex-col relative">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2 w-16 h-8 sm:w-20 sm:h-10">
        <img
          src="./src/assets/logo_DVF.png"
          alt="DVFashion Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
        Rất nhiều đặc quyền và quyền lợi mua sắm đang chờ bạn
      </h2>

      {/* Benefits */}
      <div className="flex gap-3 sm:gap-4 mb-3 justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">%</span>
          <span className="text-xs text-center">Voucher ưu đãi</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">🎁</span>
          <span className="text-xs text-center">Quà tặng độc quyền</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg sm:text-xl">💸</span>
          <span className="text-xs text-center">Hoàn tiền DVFcash</span>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-4">
        <hr className="flex-1 border-gray-300" />
        <span className="text-sm text-gray-500">Hoặc</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 ">
        {/* Input Full Name */}
        <div className="relative">
          <input
            type="text"
            name="fullName"
            placeholder="Họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconUser size={22} />
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
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconMail size={22} />
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
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconPhone size={22} />
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
            placeholder="Mật khẩu"
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
        {/* Input Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconLock size={22} />
          </span>
          <button
            type="button"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={() => setShowConfirmPassword((v) => !v)}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <IconEyeOff size={22} />
            ) : (
              <IconEye size={22} />
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
          Bằng việc đăng ký, bạn đã đồng ý với{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            Điều khoản sử dụng
          </a>{" "}
          và{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Chính sách bảo mật
          </a>{" "}
          của DVFashion.
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
          className="w-full bg-black text-white rounded-full py-4 text-lg font-bold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isRegisterLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Đang đăng ký...
            </div>
          ) : (
            "ĐĂNG KÝ"
          )}
        </button>
      </form>
      <div id="recaptcha-container"></div>

      {/* Links */}
      <div className="flex justify-center mt-4 text-sm">
        <span className="text-gray-600">Đã có tài khoản?</span>
        <button
          type="button"
          onClick={handleSwitchToLogin}
          className="text-blue-600 hover:text-blue-800 hover:underline font-bold ml-1 transition-colors duration-200 cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
}
