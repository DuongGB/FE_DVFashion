import { IconMail, IconPhone } from "@tabler/icons-react";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";

export default function ForgotPasswordForm({ onSuccess, onSwitchToLogin }) {
  const { forgotPassword, isForgotPasswordLoading, forgotPasswordError } =
    useAuth();
  const [contact, setContact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [contactType, setContactType] = useState(""); // "email" or "phone"

  // Xác định loại input (email hoặc phone)
  const detectContactType = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;

    if (emailRegex.test(value)) {
      return "email";
    } else if (phoneRegex.test(value)) {
      return "phone";
    }
    return "";
  };

  const validateContact = (value) => {
    if (!value.trim()) {
      return "Email hoặc số điện thoại không được để trống";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;

    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      return "Vui lòng nhập email hợp lệ hoặc số điện thoại (10-11 chữ số)";
    }

    return "";
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);
    setErrors("");

    // Xác định loại contact đang nhập
    const type = detectContactType(value);
    setContactType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateContact(contact);
    if (validationErrors) {
      setErrors({ contact: validationErrors });
      return;
    }

    try {
      const requestData = {
        [contactType === "phone" ? "phone" : "email"]: contact.trim(),
      };

      console.log("Sending forgot password request:", requestData);

      const result = await forgotPassword(requestData);
      console.log("Forgot password result:", result);

      // Kiểm tra success dựa trên status code hoặc response
      if (
        result.status === 200 ||
        result.status === 201 ||
        result?.data?.success
      ) {
        console.log("Forgot password request successful!");
        setErrors({});
        setIsEmailSent(true);
      } else {
        setErrors({
          general: "Không thể gửi yêu cầu. Vui lòng thử lại.",
        });
      }
    } catch (err) {
      console.errors("Forgot password failed:", err);

      // Xử lý lỗi và hiển thị thông báo user-friendly
      let errorsMessage = "Có lỗi xảy ra. Vui lòng thử lại.";

      if (err?.response?.status === 400) {
        errorsMessage =
          "Thông tin không hợp lệ. Vui lòng kiểm tra lại email hoặc số điện thoại.";
      } else if (err?.response?.status === 404) {
        errorsMessage =
          contactType === "phone"
            ? "Số điện thoại này chưa được đăng ký tài khoản."
            : "Email này chưa được đăng ký tài khoản.";
      } else if (err?.response?.status === 429) {
        errorsMessage =
          "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 5 phút.";
      } else if (err?.response?.status >= 500) {
        errorsMessage = "Hệ thống đang bảo trì. Vui lòng thử lại sau.";
      } else if (err?.response?.data?.errors?.message) {
        errorsMessage = err.response.data.errors.message;
      } else if (
        err?.code === "NETWORK_ERRORs" ||
        err?.message?.includes("Network")
      ) {
        errorsMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.";
      }

      setErrors({
        general: errorsMessage,
      });
    }
  };

  const handleSwitchToLogin = (e) => {
    e.preventDefault();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setContact("");
    setContactType("");
    setErrors({});
  };

  // Lấy icon phù hợp
  const getContactIcon = () => {
    if (contactType === "phone") {
      return <IconPhone size={22} />;
    }
    return <IconMail size={22} />;
  };

  // Lấy placeholder phù hợp
  const getPlaceholder = () => {
    if (contactType === "phone") {
      return "Số điện thoại (10-11 chữ số)";
    } else if (contactType === "email") {
      return "Email của bạn";
    }
    return "Email hoặc số điện thoại";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px]  flex flex-col relative">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 w-20 h-10">
        <img
          src="./src/assets/logo_DVF.png"
          alt="DVFashion Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {!isEmailSent ? (
        <>
          {/* Title */}
          <h2 className="text-2xl font-bold mb-4 leading-tight">
            Quên mật khẩu?
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Đừng lo lắng! Nhập email hoặc số điện thoại của bạn và chúng tôi sẽ
            gửi link để đặt lại mật khẩu.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {/* Input Contact */}
            <div className="relative">
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={contact}
                onChange={handleContactChange}
                className={`w-full rounded-full border px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200">
                {getContactIcon()}
              </span>
            </div>
            {errors && (
              <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">{errors}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !contact.trim()}
              className="w-full bg-black text-white rounded-full py-4 text-lg font-bold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang gửi...
                </div>
              ) : (
                "GỬI YÊU CẦU"
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          {/* Success State */}
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">✅</span>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-green-600">
              {contactType === "phone" ? "Kiểm tra tin nhắn" : "Kiểm tra email"}
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {contactType === "phone" ? (
                <>
                  Chúng tôi đã gửi mã xác nhận đến số điện thoại{" "}
                  <span className="font-semibold text-black">{contact}</span>
                </>
              ) : (
                <>
                  Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
                  <span className="font-semibold text-black">{contact}</span>
                </>
              )}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-blue-800">
                {contactType === "phone"
                  ? "📱 Không nhận được SMS? Kiểm tra lại số điện thoại hoặc thử lại sau 60 giây."
                  : "📧 Không thấy email? Kiểm tra thư mục spam hoặc thử lại sau 60 giây."}
              </p>
            </div>

            {/* Action buttons */}
            <div className="w-full space-y-3">
              <button
                onClick={() => {
                  setIsEmailSent(false);
                  setContact("");
                  setContactType("");
                  setErrors("");
                }}
                className="w-full bg-gray-100 text-gray-700 rounded-full py-3 text-md font-semibold hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
              >
                Thử {contactType === "phone" ? "số khác" : "email khác"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Links */}
      <div className="mt-auto pt-6">
        <div className="flex justify-center text-sm">
          <button
            type="button"
            onClick={handleSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-colors duration-200 flex items-center gap-1 cursor-pointer"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
