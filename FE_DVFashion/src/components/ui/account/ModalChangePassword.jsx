import { useState, useEffect } from "react";
import { IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-8 min-w-[480px] max-w-[500px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={handleClose}
          disabled={isChangingPassword}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-8 text-center">
          {t("modal_change_password.title")}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Old password */}
          <div className="mb-2 relative">
            <input
              type={showOld ? "text" : "password"}
              className={`w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.oldPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("modal_change_password.current_password")}
              value={form.oldPassword}
              onChange={(e) => handleInputChange("oldPassword", e.target.value)}
              disabled={isChangingPassword}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={22} />
            </span>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowOld((v) => !v)}
              tabIndex={-1}
              disabled={isChangingPassword}
            >
              {showOld ? <IconEyeOff size={22} /> : <IconEye size={22} />}
            </button>
          </div>
          {/* Error message container with fixed height */}
          <div className="h-6 mb-4">
            {errors.oldPassword && (
              <p className="text-red-500 text-sm ml-4 leading-tight">
                {errors.oldPassword}
              </p>
            )}
          </div>

          {/* New password */}
          <div className="mb-2 relative">
            <input
              type={showNew ? "text" : "password"}
              className={`w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("modal_change_password.new_password")}
              value={form.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              disabled={isChangingPassword}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={22} />
            </span>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
              disabled={isChangingPassword}
            >
              {showNew ? <IconEyeOff size={22} /> : <IconEye size={22} />}
            </button>
          </div>
          {/* Error message container with fixed height */}
          <div className="h-6 mb-2">
            {errors.newPassword && (
              <p className="text-red-500 text-sm ml-4 leading-tight">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Password strength indicator */}
          {form.newPassword && (
            <div className="mb-4 ml-4">
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
              className={`w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("modal_change_password.confirm_password")}
              value={form.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              disabled={isChangingPassword}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={22} />
            </span>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              disabled={isChangingPassword}
            >
              {showConfirm ? <IconEyeOff size={22} /> : <IconEye size={22} />}
            </button>
          </div>
          {/* Error message container with fixed height */}
          <div className="h-6 mb-6">
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm ml-4 leading-tight">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isChangingPassword}
              className="flex-1 bg-gray-200 text-gray-700 rounded-full py-4 text-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 cursor-pointer "
            >
              {t("modal_change_password.cancel")}
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex-1 bg-black text-white rounded-full py-4 text-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isChangingPassword ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
