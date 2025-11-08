import { useState, useEffect } from "react";
import { IconLock, IconEye, IconEyeOff, IconX } from "@tabler/icons-react";
import { useUser } from "../../../hooks/useUser";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function ModalChangePassword({ show, onClose }) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const { changePassword, isChangingPassword } = useUser();
  const { t, i18n } = useTranslation();

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

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!form.oldPassword.trim()) {
      newErrors.oldPassword = t(
        "modal_change_password.errors.current_password_required"
      );
    }

    // New password validation
    if (!form.newPassword.trim()) {
      newErrors.newPassword = t(
        "modal_change_password.errors.new_password_required"
      );
    } else {
      // Pattern validation: at least one letter, one number, minimum 8 characters
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(form.newPassword)) {
        newErrors.newPassword = t(
          "modal_change_password.errors.new_password_invalid"
        );
      }
    }

    // Confirm password validation
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = t(
        "modal_change_password.errors.confirm_password_required"
      );
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = t(
        "modal_change_password.errors.confirm_password_mismatch"
      );
    }

    // Check if new password is same as old password
    if (
      form.oldPassword &&
      form.newPassword &&
      form.oldPassword === form.newPassword
    ) {
      newErrors.newPassword = t("modal_change_password.errors.password_same");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("modal_change_password.errors.check_info"));
      return;
    }

    try {
      const passwordData = {
        currentPassword: form.oldPassword.trim(),
        newPassword: form.newPassword.trim(),
      };

      console.log("Changing password...");

      await changePassword(passwordData);

      toast.success(t("modal_change_password.errors.change_success"));

      // Reset form
      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});

      onClose();
    } catch (error) {
      console.error("Error changing password:", error);

      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message;

        // Handle specific backend validation errors
        if (errorMessage?.includes("Current password")) {
          toast.error(t("modal_change_password.errors.current_password_wrong"));
        } else if (errorMessage?.includes("New password")) {
          toast.error(
            t("modal_change_password.errors.new_password_invalid_backend")
          );
        } else {
          toast.error(
            errorMessage || t("modal_change_password.errors.invalid_data")
          );
        }
      } else if (error.response?.status === 401) {
        toast.error(t("modal_change_password.errors.session_expired"));
      } else if (error.response?.status === 403) {
        toast.error(t("modal_change_password.errors.no_permission"));
      } else {
        toast.error(t("modal_change_password.errors.change_failed"));
      }
    }
  };

  // Handle input change with real-time validation
  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setForm({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl min-w-[340px] max-w-[400px] w-full p-6 relative transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white rounded-full w-7 h-7 flex items-center justify-center text-lg hover:bg-black/50 transition-colors cursor-pointer"
          onClick={handleClose}
          disabled={isChangingPassword}
        >
          <IconX size={18} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
          {t("modal_change_password.title")}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Old password */}
          <div className="mb-2 relative">
            <input
              type={showOld ? "text" : "password"}
              className={`w-full rounded-lg border px-10 py-3 bg-white/80 backdrop-blur-sm text-base font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.oldPassword
                  ? "border-red-500 bg-red-50/50"
                  : "border-white/30"
              }`}
              placeholder={t("modal_change_password.current_password")}
              value={form.oldPassword}
              onChange={(e) => handleInputChange("oldPassword", e.target.value)}
              disabled={isChangingPassword}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={18} />
            </span>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowOld((v) => !v)}
              tabIndex={-1}
              disabled={isChangingPassword}
            >
              {showOld ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          <div className="h-5 mb-3">
            {errors.oldPassword && (
              <p className="text-red-500 text-xs ml-3 leading-tight">
                {errors.oldPassword}
              </p>
            )}
          </div>

          {/* New password */}
          <div className="mb-2 relative">
            <input
              type={showNew ? "text" : "password"}
              className={`w-full rounded-lg border px-10 py-3 bg-white/80 backdrop-blur-sm text-base font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.newPassword
                  ? "border-red-500 bg-red-50/50"
                  : "border-white/30"
              }`}
              placeholder={t("modal_change_password.new_password")}
              value={form.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              disabled={isChangingPassword}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={18} />
            </span>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
              disabled={isChangingPassword}
            >
              {showNew ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          <div className="h-5 mb-2">
            {errors.newPassword && (
              <p className="text-red-500 text-xs ml-3 leading-tight">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Password strength indicator */}
          {form.newPassword && (
            <div className="mb-3 ml-3">
              <div className="text-xs text-gray-600 space-y-1">
                <p
                  className={
                    form.newPassword.length >= 8
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  ✓ {t("modal_change_password.strength_indicators.min_length")}
                </p>
                <p
                  className={
                    /[A-Za-z]/.test(form.newPassword)
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  ✓ {t("modal_change_password.strength_indicators.min_letter")}
                </p>
                <p
                  className={
                    /\d/.test(form.newPassword)
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  ✓ {t("modal_change_password.strength_indicators.min_number")}
                </p>
              </div>
            </div>
          )}

          {/* Confirm password */}
          <div className="mb-2 relative">
            <input
              type={showConfirm ? "text" : "password"}
              className={`w-full rounded-lg border px-10 py-3 bg-white/80 backdrop-blur-sm text-base font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword
                  ? "border-red-500 bg-red-50/50"
                  : "border-white/30"
              }`}
              placeholder={t("modal_change_password.confirm_password")}
              value={form.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              disabled={isChangingPassword}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={18} />
            </span>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              disabled={isChangingPassword}
            >
              {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          <div className="h-5 mb-5">
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs ml-3 leading-tight">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isChangingPassword}
              className="flex-1 bg-white/80 backdrop-blur-sm border border-white/30 text-gray-700 rounded-lg py-3 text-base font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t("modal_change_password.cancel")}
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg py-3 text-base font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isChangingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("modal_change_password.updating")}
                </>
              ) : (
                <>{t("modal_change_password.update")}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
