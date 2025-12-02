import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useAuthModal } from "../../../contexts/AuthModalContext";
import { IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function PasswordResetPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { resetPasswordMail, isResetPasswordMailLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("auth.password_reset.errors.password_mismatch"));
      return;
    }

    // Validate password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(t("auth.password_reset.errors.password_invalid"));
      return;
    }

    try {
      await resetPasswordMail({ token, newPassword });
      setSuccess(true);

      // Chờ 2 giây rồi chuyển về trang chủ và mở modal đăng nhập
      setTimeout(() => {
        navigate("/", { replace: true });
        // Chờ một chút để trang chủ render xong rồi mở modal
        setTimeout(() => {
          openAuthModal("login");
        }, 100);
      }, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.errors?.message ||
          t("auth.password_reset.errors.token_invalid")
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] flex flex-col relative">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6 w-16 h-8 sm:w-20 sm:h-10">
          <img
            src="/src/assets/logo_DVF.png"
            alt="DVFashion Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {success ? (
          <>
            {/* Success State */}
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">✅</span>
              </div>

              <h2 className="text-2xl font-bold mb-4 text-green-600">
                {t("auth.password_reset.success_title")}
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {t("auth.password_reset.success_message")}
              </p>

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          </>
        ) : (
          <>
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
              {t("auth.password_reset.title")}
            </h2>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              {t("auth.password_reset.description")}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Input New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("auth.password_reset.new_password")}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t(
                      "auth.password_reset.new_password_placeholder"
                    )}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-full border border-gray-300 px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <IconLock size={22} />
                  </span>
                  <button
                    type="button"
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowNewPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <IconEyeOff size={22} />
                    ) : (
                      <IconEye size={22} />
                    )}
                  </button>
                </div>
              </div>

              {/* Input Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("auth.password_reset.confirm_password")}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t(
                      "auth.password_reset.confirm_password_placeholder"
                    )}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-full border border-gray-300 px-10 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-xs">
                  💡 {t("auth.password_reset.password_requirement")}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isResetPasswordMailLoading}
                className="w-full bg-black text-white rounded-full py-3 sm:py-4 text-base sm:text-lg font-bold hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isResetPasswordMailLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    {t("auth.password_reset.submitting")}
                  </div>
                ) : (
                  t("auth.password_reset.submit_button")
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                {t("auth.password_reset.additional_info")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
