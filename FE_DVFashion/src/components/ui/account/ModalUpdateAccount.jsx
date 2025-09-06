import { useState, useEffect } from "react";
import {
  IconUser,
  IconCalendar,
  IconPhone,
  IconMail,
} from "@tabler/icons-react";
import { useUser } from "../../../hooks/useUser";
import { toast } from "react-toastify";

export default function ModalUpdateAccount({ show, onClose, user }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "OTHER", // Backend format
    dob: {
      day: "",
      month: "",
      year: "",
    },
  });

  const [errors, setErrors] = useState({});
  const { updateUser, isUpdatingUser } = useUser();

  // Load user data when modal opens
  useEffect(() => {
    if (show && user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "OTHER",
        dob: parseDateOfBirth(user.dob),
      });
      setErrors({});
    }
  }, [show, user]);

  // Parse existing DOB to day/month/year format
  const parseDateOfBirth = (dateValue) => {
    if (!dateValue) return { day: "", month: "", year: "" };

    let date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === "string") {
      date = new Date(dateValue);
    } else {
      return { day: "", month: "", year: "" };
    }

    if (isNaN(date.getTime())) {
      return { day: "", month: "", year: "" };
    }

    return {
      day: date.getDate().toString(),
      month: (date.getMonth() + 1).toString(),
      year: date.getFullYear().toString(),
    };
  };

  // Format DOB to yyyy-MM-dd format for backend
  const formatDobForBackend = (dobObj) => {
    const { day, month, year } = dobObj;
    if (!day || !month || !year) return null;

    const formattedMonth = month.padStart(2, "0");
    const formattedDay = day.padStart(2, "0");
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    } else if (formData.fullName.trim().length < 6) {
      newErrors.fullName = "Họ và tên phải có ít nhất 6 ký tự";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Email không hợp lệ";
      }
    }

    // Phone validation (optional but if provided should be valid)
    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone.trim().replace(/\s+/g, ""))) {
        newErrors.phone = "Số điện thoại phải có 10-11 chữ số";
      }
    }

    // DOB validation (optional but if provided should be complete)
    const { day, month, year } = formData.dob;
    if (day || month || year) {
      if (!day || !month || !year) {
        newErrors.dob = "Vui lòng chọn đầy đủ ngày, tháng, năm sinh";
      } else {
        const dobDate = new Date(year, month - 1, day);
        const today = new Date();

        if (dobDate > today) {
          newErrors.dob = "Ngày sinh không thể là ngày trong tương lai";
        }

        const age = today.getFullYear() - dobDate.getFullYear();
        if (age < 13 || age > 120) {
          newErrors.dob = "Tuổi phải từ 13 đến 120";
        }
      }
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
      const updateData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        gender: formData.gender,
        dob: formatDobForBackend(formData.dob),
      };

      console.log("Updating user with data:", updateData);

      await updateUser({
        userId: user.id,
        userData: updateData,
      });

      toast.success("Cập nhật thông tin thành công!");
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);

      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Dữ liệu không hợp lệ";
        toast.error(errorMessage);
      } else if (error.response?.status === 409) {
        toast.error("Email đã được sử dụng bởi tài khoản khác!");
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật thông tin!");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleDobChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      dob: {
        ...prev.dob,
        [field]: value,
      },
    }));

    // Clear DOB error when user selects date
    if (errors.dob) {
      setErrors((prev) => ({
        ...prev,
        dob: "",
      }));
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-8 min-w-[600px] max-w-[650px] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={onClose}
          disabled={isUpdatingUser}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-8 text-center">
          Chỉnh sửa thông tin tài khoản
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Họ và tên */}
          <div className="mb-2 relative">
            <input
              type="text"
              className={`w-full rounded-full border px-6 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Họ và tên"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              disabled={isUpdatingUser}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconUser size={22} />
            </span>
          </div>
          {/* Error message container with fixed height */}
          <div className=" mb-4">
            {errors.fullName && (
              <p className="text-red-500 text-sm ml-4 leading-tight">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-2 relative">
            <input
              type="email"
              className={`w-full rounded-full border px-6 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isUpdatingUser}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconMail size={22} />
            </span>
          </div>
          {/* Error message container with fixed height */}
          <div className=" mb-4">
            {errors.email && (
              <p className="text-red-500 text-sm ml-4 leading-tight">
                {errors.email}
              </p>
            )}
          </div>

          {/* Ngày sinh */}
          <div className="mb-2">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <select
                  className={`w-full rounded-full border px-6 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.dob.day}
                  onChange={(e) => handleDobChange("day", e.target.value)}
                  disabled={isUpdatingUser}
                >
                  <option value="">Ngày</option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconCalendar size={22} />
                </span>
              </div>

              <div className="relative flex-1">
                <select
                  className={`w-full rounded-full border px-6 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.dob.month}
                  onChange={(e) => handleDobChange("month", e.target.value)}
                  disabled={isUpdatingUser}
                >
                  <option value="">Tháng</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthNum = i + 1;
                    return (
                      <option key={monthNum} value={monthNum}>
                        Tháng {monthNum}
                      </option>
                    );
                  })}
                </select>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconCalendar size={22} />
                </span>
              </div>

              <div className="relative flex-1">
                <select
                  className={`w-full rounded-full border px-6 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.dob.year}
                  onChange={(e) => handleDobChange("year", e.target.value)}
                  disabled={isUpdatingUser}
                >
                  <option value="">Năm</option>
                  {Array.from({ length: 70 }, (_, i) => 2025 - i).map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconCalendar size={22} />
                </span>
              </div>
            </div>
          </div>
          {/* Error message container with fixed height */}
          <div className=" mb-4">
            {errors.dob && (
              <p className="text-red-500 text-sm ml-4 leading-tight">
                {errors.dob}
              </p>
            )}
          </div>

          {/* Giới tính */}
          <div className="mb-6">
            <p className="text-gray-700 font-medium mb-3">Giới tính:</p>
            <div className="flex gap-8 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={formData.gender === "MALE"}
                  onChange={() => handleInputChange("gender", "MALE")}
                  disabled={isUpdatingUser}
                  className="w-4 h-4 text-blue-600"
                />
                Nam
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={formData.gender === "FEMALE"}
                  onChange={() => handleInputChange("gender", "FEMALE")}
                  disabled={isUpdatingUser}
                  className="w-4 h-4 text-pink-600"
                />
                Nữ
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="OTHER"
                  checked={formData.gender === "OTHER"}
                  onChange={() => handleInputChange("gender", "OTHER")}
                  disabled={isUpdatingUser}
                  className="w-4 h-4 text-gray-600"
                />
                Khác
              </label>
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="mb-2 relative">
            <input
              type="tel"
              className={`w-full rounded-full border px-6 sm:px-12 py-3 sm:py-4 bg-gray-100 text-sm sm:text-md font-medium outline-none transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Số điện thoại (tùy chọn)"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={isUpdatingUser}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconPhone size={22} />
            </span>
          </div>
          {/* Error message container with fixed height */}
          <div className=" mb-6">
            {errors.phone && (
              <p className="text-red-500 text-sm ml-4 leading-tight">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdatingUser}
              className="flex-1 bg-gray-200 text-gray-700 rounded-full py-4 text-lg font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 cursor-pointer "
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={isUpdatingUser}
              className="flex-1 bg-black text-white rounded-full py-4 text-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUpdatingUser ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ĐANG CẬP NHẬT...
                </>
              ) : (
                <>CẬP NHẬT THÔNG TIN</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
