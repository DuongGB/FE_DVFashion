import { useState } from "react";
import { IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useUser } from "../../../hooks/useUser";
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

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Current password validation
    if (!form.oldPassword.trim()) {
      newErrors.oldPassword = "Mật khẩu hiện tại là bắt buộc";
    }

    // New password validation
    if (!form.newPassword.trim()) {
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
    } else {
      // Pattern validation: at least one letter, one number, minimum 8 characters
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(form.newPassword)) {
        newErrors.newPassword =
          "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số";
      }
    }

    // Confirm password validation
    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu mới";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    // Check if new password is same as old password
    if (
      form.oldPassword &&
      form.newPassword &&
      form.oldPassword === form.newPassword
    ) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    try {
      const passwordData = {
        currentPassword: form.oldPassword.trim(),
        newPassword: form.newPassword.trim(),
      };

      console.log("Changing password...");

      await changePassword(passwordData);

      toast.success("Đổi mật khẩu thành công!");

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
          toast.error("Mật khẩu hiện tại không đúng!");
        } else if (errorMessage?.includes("New password")) {
          toast.error("Mật khẩu mới không hợp lệ!");
        } else {
          toast.error(errorMessage || "Dữ liệu không hợp lệ");
        }
      } else if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn!");
      } else if (error.response?.status === 403) {
        toast.error("Bạn không có quyền thực hiện thao tác này!");
      } else {
        toast.error("Có lỗi xảy ra khi đổi mật khẩu!");
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
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-800 transition-colors"
          onClick={handleClose}
          disabled={isChangingPassword}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-8 text-center">Đổi mật khẩu</h2>

        <form onSubmit={handleSubmit}>
          {/* Old password */}
          <div className="mb-2 relative">
            <input
              type={showOld ? "text" : "password"}
              className={`w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.oldPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Mật khẩu hiện tại"
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
              placeholder="Mật khẩu mới"
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
                  ✓ Ít nhất 8 ký tự
                </p>
                <p
                  className={
                    /[A-Za-z]/.test(form.newPassword)
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  ✓ Ít nhất 1 chữ cái
                </p>
                <p
                  className={
                    /\d/.test(form.newPassword)
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  ✓ Ít nhất 1 chữ số
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
              placeholder="Nhập lại mật khẩu mới"
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
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="flex-1 bg-black text-white rounded-full py-4 text-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isChangingPassword ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ĐANG ĐỔI...
                </>
              ) : (
                <>CẬP NHẬT MẬT KHẨU</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
