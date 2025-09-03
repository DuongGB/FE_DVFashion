import { useState } from "react";
import { IconMail, IconPhone } from "@tabler/icons-react";

export default function ForgotPasswordForm({ onSuccess, onSwitchToLogin }) {
  const [contact, setContact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
    setError("");

    // Xác định loại contact đang nhập
    const type = detectContactType(value);
    setContactType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateContact(contact);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: Call API to send reset password email/SMS
      console.log("Sending reset request for:", contact);
      console.log("Contact type:", contactType);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsEmailSent(true);
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = (e) => {
    e.preventDefault();
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Input Contact */}
            <div className="relative">
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={contact}
                onChange={handleContactChange}
                className={`w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200">
                {getContactIcon()}
              </span>

              {error && (
                <p className="text-red-500 text-sm mt-2 ml-4">{error}</p>
              )}
            </div>

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
                  setError("");
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
