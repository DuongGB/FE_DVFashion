import {
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconInfoCircle,
  IconKey,
  IconLoader2,
  IconMail,
  IconPhone,
  IconTag,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "../../../hooks/useUser";

const EmployeeForm = ({ isOpen, onClose, employee = null }) => {
  const [formData, setFormData] = useState({
    // Backend required fields
    fullName: "",
    email: "",
    phone: "",
    // Optional fields for edit mode
    gender: "MALE",
    dob: "",
    role: "STAFF",
    active: true,
  });

  const [errors, setErrors] = useState({});

  const { createUser, updateUser, isCreatingUser, isUpdatingUser } = useUser();

  const loading = isCreatingUser || isUpdatingUser;

  // Helper function to extract role from roles array
  const getRoleFromRoles = (roles) => {
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return "STAFF";
    }
    // Remove ROLE_ prefix if present
    const role = roles[0].replace("ROLE_", "");
    return role;
  };

  // Load dữ liệu khi edit employee
  useEffect(() => {
    if (employee) {
      // Edit mode - populate form with existing data
      setFormData({
        fullName: employee.fullName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        gender: employee.gender || "MALE",
        dob: employee.dob
          ? new Date(employee.dob).toISOString().split("T")[0]
          : "",
        role: employee.role || getRoleFromRoles(employee.roles) || "STAFF",
        active: employee.active !== undefined ? employee.active : true,
      });
    } else {
      // Create mode - reset form with minimal fields
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        gender: "MALE",
        dob: "",
        role: "STAFF",
        active: true,
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user changes input
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    handleInputChange(name, fieldValue);
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation (required by backend - min 6 characters)
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    } else if (formData.fullName.trim().length < 6) {
      newErrors.fullName = "Họ và tên phải có ít nhất 6 ký tự";
    }

    // Email validation (required by backend)
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Phone validation (required by backend)
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 số)";
    }

    // Date of birth validation (optional but if provided should be valid) - only for edit mode
    if (employee && formData.dob) {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16) {
        newErrors.dob = "Nhân viên phải từ 16 tuổi trở lên";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      // Format data theo backend requirement
      const submitData = {
        // Required fields by CreateStaffRequest
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      // Add optional fields only for edit mode
      if (employee) {
        submitData.gender = formData.gender;
        // Fix: Format date properly for backend
        submitData.dob = formData.dob
          ? new Date(formData.dob).toISOString().split("T")[0]
          : null;
        submitData.role = formData.role;
        submitData.active = formData.active;
      }

      if (employee) {
        // Update existing employee
        await updateUser({
          userId: employee.id,
          userData: submitData,
        });
        toast.success("Cập nhật nhân viên thành công!");
      } else {
        // Create new employee
        await createUser(submitData);
        toast.success("Tạo nhân viên thành công!");
      }

      onClose();
    } catch (error) {
      console.error("Error submitting employee:", error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message || "Dữ liệu không hợp lệ";
        toast.error(errorMessage);
      } else if (error.response?.status === 409) {
        toast.error("Email hoặc tên đăng nhập đã tồn tại!");
      } else {
        const errorMessage = employee
          ? "Có lỗi xảy ra khi cập nhật nhân viên!"
          : "Có lỗi xảy ra khi tạo nhân viên!";
        toast.error(errorMessage);
      }
    }
  };
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 bg-black backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <IconX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconUser size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {employee ? "Chỉnh sửa nhân viên" : "Tạo nhân viên mới"}
              </h2>
              <p className="text-blue-100 opacity-90">
                {employee
                  ? "Cập nhật thông tin nhân viên hiện tại"
                  : "Thiết lập thông tin cơ bản cho nhân viên mới"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconInfoCircle size={20} className="text-blue-600" />
                Thông tin {employee ? "cơ bản" : "bắt buộc"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                    <span className="text-xs text-gray-500 ml-1">
                      (ít nhất 6 ký tự)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.fullName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Nhập họ và tên đầy đủ (VD: Nguyễn Văn An)"
                    required
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <IconMail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                        errors.email
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <div className="relative">
                    <IconPhone
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                        errors.phone
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="0xxx xxx xxx"
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Các trường chỉ hiển thị khi edit */}
                {employee && (
                  <>
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh
                        <span className="text-xs text-gray-500 ml-1">
                          (tùy chọn)
                        </span>
                      </label>
                      <div className="relative">
                        <IconCalendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          disabled={loading}
                          max={new Date().toISOString().split("T")[0]}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                            errors.dob
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        />
                      </div>
                      {errors.dob && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <IconX size={12} />
                          {errors.dob}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vai trò *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <option value="STAFF">Nhân viên</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Status - chỉ hiển thị khi edit */}
              {employee && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái tài khoản
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === true}
                        onChange={() => handleInputChange("active", true)}
                        disabled={loading}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed transition-all duration-200"
                      />
                      <span className="ml-3 text-sm font-medium text-green-600">
                        🟢 Tài khoản hoạt động
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === false}
                        onChange={() => handleInputChange("active", false)}
                        disabled={loading}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 disabled:cursor-not-allowed transition-all duration-200"
                      />
                      <span className="ml-3 text-sm font-medium text-red-600">
                        🔴 Tài khoản không hoạt động
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Thông báo cho mode tạo mới */}
              {!employee && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ℹ️ Các thông tin khác như giới tính, ngày sinh, vai trò sẽ
                    được thiết lập mặc định và có thể chỉnh sửa sau khi tạo tài
                    khoản.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    {employee ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    {employee ? "Cập nhật nhân viên" : "Tạo nhân viên mới"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
