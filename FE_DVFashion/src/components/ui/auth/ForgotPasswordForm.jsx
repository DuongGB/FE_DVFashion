import { IconMail, IconPhone } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordForm({ onSuccess, onSwitchToLogin }) {
  const { forgotPassword, isForgotPasswordLoading, forgotPasswordError } =
    useAuth();
  const { t, i18n } = useTranslation();
  const [contact, setContact] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [contactType, setContactType] = useState(""); // "email" or "phone"

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
      return t("auth.forgot_password.errors.contact_required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,11}$/;

    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      return t("auth.forgot_password.errors.contact_invalid");
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
          general: t("auth.forgot_password.errors.request_failed"),
        });
      }
    } catch (err) {
      console.error("Forgot password failed:", err);

      // Xử lý lỗi và hiển thị thông báo user-friendly
      let errorsMessage = t("auth.forgot_password.errors.general_error");

      if (err?.response?.status === 400) {
        errorsMessage = t("auth.forgot_password.errors.invalid_data");
      } else if (err?.response?.status === 404) {
        errorsMessage =
          contactType === "phone"
            ? t("auth.forgot_password.errors.phone_not_found")
            : t("auth.forgot_password.errors.email_not_found");
      } else if (err?.response?.status === 429) {
        errorsMessage = t("auth.forgot_password.errors.too_many_requests");
      } else if (err?.response?.status >= 500) {
        errorsMessage = t("auth.forgot_password.errors.server_error");
      } else if (err?.response?.data?.errors?.message) {
        errorsMessage = err.response.data.errors.message;
      } else if (
        err?.code === "NETWORK_ERROR" ||
        err?.message?.includes("Network")
      ) {
        errorsMessage = t("auth.forgot_password.errors.network_error");
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
      return t("auth.forgot_password.placeholder.phone");
    } else if (contactType === "email") {
      return t("auth.forgot_password.placeholder.email");
    }
    return t("auth.forgot_password.placeholder.default");
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] flex flex-col relative">
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
            {t("auth.forgot_password.title")}
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {t("auth.forgot_password.description")}
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
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1 ml-3 sm:ml-4">
                {errors.contact}
              </p>
            )}

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
              disabled={isLoading || !contact.trim()}
              className="w-full bg-black text-white rounded-full py-4 text-lg font-bold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t("auth.forgot_password.sending")}
                </div>
              ) : (
                t("auth.forgot_password.submit_button")
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
              {contactType === "phone"
                ? t("auth.forgot_password.success.phone_title")
                : t("auth.forgot_password.success.email_title")}
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {contactType === "phone" ? (
                <>
                  {t("auth.forgot_password.success.phone_message")}{" "}
                  <span className="font-semibold text-black">{contact}</span>
                </>
              ) : (
                <>
                  {t("auth.forgot_password.success.email_message")}{" "}
                  <span className="font-semibold text-black">{contact}</span>
                </>
              )}
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-blue-800">
                {contactType === "phone"
                  ? t("auth.forgot_password.success.phone_help")
                  : t("auth.forgot_password.success.email_help")}
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
                {contactType === "phone"
                  ? t("auth.forgot_password.success.try_other_phone")
                  : t("auth.forgot_password.success.try_other_email")}
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
            {t("auth.forgot_password.back_to_login")}
          </button>
        </div>
      </div>
    </div>
  );
}
