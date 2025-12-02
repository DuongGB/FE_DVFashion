import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";

const OtpForm = ({ onSuccess, verifyOtp, phoneNumber, onBack, onResend }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState(null);
  const inputRefs = useRef([]);

  const { verifyOtpForSignUp, isVerifyOtpForSignUp, verifyOtpForSignUpError } =
    useAuth();

  // Countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle input change
  const handleChange = (value, index) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace and navigation
  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedText.length === 6) {
      const newOtp = pastedText.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      return;
    }

    try {
      // Verify OTP with Firebase first
      const { idToken } = await verifyOtp(otpCode);

      // Then verify with backend
      await verifyOtpForSignUp({ idToken });

      // Success callback
      onSuccess?.();
    } catch (error) {
      if (error?.response?.data?.error?.code === "CONFLICT_ERROR") {
        setError("Số điện thoại đã tồn tại!");
        return;
      }
      setError("Mã OTP không chính xác hoặc đã hết hạn");
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      // Wait a bit to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check phone đã tồn tại
      const response = await onResend?.();
      // Check if the phone number already exists
      if (response?.error?.code === "CONFLICT_ERROR") {
        setError("Số điện thoại đã tồn tại!");
        return;
      }

      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] min-h-[600px] flex flex-col relative">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center">
          <span className="text-2xl sm:text-3xl font-bold tracking-widest text-black border-r-2 border-black pr-2">
            DV
          </span>
          <span className="text-2xl sm:text-3xl font-light tracking-wider text-gray-700 pl-2">
            Fashion
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Xác thực số điện thoại
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Mã OTP đã được gửi đến số điện thoại
        </p>
        <p className="font-bold text-gray-900 text-lg mt-1">{phoneNumber}</p>
      </div>

      {/* OTP Input */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        {/* OTP Input Grid */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              maxLength="1"
              className={`
                w-12 h-14 text-center text-xl font-bold
                border-2 rounded-xl bg-gray-50
                transition-all duration-200 outline-none
                ${
                  digit
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-300 hover:border-gray-400"
                }
                focus:border-blue-500 focus:bg-blue-50 focus:ring-4 focus:ring-blue-100
                ${verifyOtpForSignUpError ? "border-red-500 bg-red-50" : ""}
              `}
              disabled={isVerifyOtpForSignUp || isResending}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isOtpComplete || isVerifyOtpForSignUp || isResending}
          className={`
            w-full py-4 rounded-full font-bold text-lg
            transition-all duration-200
            ${
              isOtpComplete && !isVerifyOtpForSignUp && !isResending
                ? "bg-black text-white hover:bg-gray-800 transform hover:scale-[1.02] cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {isVerifyOtpForSignUp ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Đang xác thực...
            </div>
          ) : isResending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              Đang gửi lại...
            </div>
          ) : (
            "XÁC THỰC"
          )}
        </button>

        {/* Resend OTP */}
        <div className="text-center mt-6">
          {!canResend ? (
            <p className="text-gray-500 text-sm">
              Gửi lại mã sau{" "}
              <span className="font-bold text-blue-600">{countdown}</span> giây
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isVerifyOtpForSignUp}
              className={`
                text-blue-600 font-bold text-sm underline
                transition-all duration-200
                ${
                  isResending || isVerifyOtpForSignUp
                    ? "text-gray-400 cursor-not-allowed no-underline"
                    : "hover:text-blue-800 cursor-pointer"
                }
              `}
            >
              {isResending ? "Đang gửi..." : "Gửi lại mã OTP"}
            </button>
          )}
        </div>

        {/* Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isVerifyOtpForSignUp || isResending}
            className={`
              text-sm mt-4 flex items-center justify-center gap-1
              transition-all duration-200
              ${
                isVerifyOtpForSignUp || isResending
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-800 cursor-pointer"
              }
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại thông tin đăng ký
          </button>
        )}
      </form>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-700 text-xs text-center">
          💡 Bạn có thể dán mã OTP 6 số vào ô đầu tiên
        </p>
      </div>

      {/* Recaptcha Container */}
      <div id="recaptcha-container" className="hidden"></div>
    </div>
  );
};

export default OtpForm;
