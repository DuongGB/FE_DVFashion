import { useState, useEffect } from "react";
import {
  IconX,
  IconUser,
  IconCheck,
  IconPlus,
  IconTrash,
  IconMapPin,
  IconLoader2,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconCalendar,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useUser } from "../../../hooks/useUser";

// Enums
const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
};

const UserRole = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
};

export default function CustomerForm({ isOpen, onClose, customer }) {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    fullName: "",
    phone: "",
    gender: Gender.MALE,
    dob: "",
    role: UserRole.CUSTOMER,
    active: true,
    addresses: [],
  });
  const [errors, setErrors] = useState({});

  const { updateUser, isUpdatingUser, updateUserError } = useUser();

  const loading = isUpdatingUser;

  useEffect(() => {
    if (customer) {
      // Edit mode - populate form with existing data
      setFormData({
        userName: customer.userName || "",
        email: customer.email || "",
        fullName: customer.fullName || "",

        phone: customer.phone || "",
        gender: customer.gender || Gender.MALE,
        dob: customer.dob
          ? new Date(customer.dob).toISOString().split("T")[0]
          : "",
        role: customer.role || UserRole.CUSTOMER,
        active: customer.active !== undefined ? customer.active : true,
        addresses: customer.addresses || [],
      });
    } else {
      // Create mode - reset form
      setFormData({
        userName: "",
        email: "",
        fullName: "",
        phone: "",
        gender: Gender.MALE,
        dob: "",
        role: UserRole.CUSTOMER,
        active: true,
        addresses: [],
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleAddAddress = () => {
    const newAddress = {
      id: Date.now(), // Temporary ID
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "Việt Nam",
      zipCode: "",
      isDefault: formData.addresses.length === 0, // First address is default
    };

    setFormData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, newAddress],
    }));
  };

  const handleRemoveAddress = (index) => {
    setFormData((prev) => {
      const newAddresses = prev.addresses.filter((_, i) => i !== index);
      // If we removed the default address and there are still addresses, make the first one default
      if (
        newAddresses.length > 0 &&
        !newAddresses.some((addr) => addr.isDefault)
      ) {
        newAddresses[0].isDefault = true;
      }
      return {
        ...prev,
        addresses: newAddresses,
      };
    });
  };

  const handleAddressChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      ),
    }));
  };

  const handleSetDefaultAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index,
      })),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.userName.trim()) {
      newErrors.userName = "Username là bắt buộc";
    } else if (!/^[a-zA-Z0-9._]+$/.test(formData.userName)) {
      newErrors.userName =
        "Username chỉ được chứa chữ cái, số, dấu chấm và gạch dưới";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.dob) {
      newErrors.dob = "Ngày sinh là bắt buộc";
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dob = "Khách hàng phải từ 13 tuổi trở lên";
      }
    }

    // Validate addresses
    // formData.addresses.forEach((address, index) => {
    //   if (!address.street.trim()) {
    //     newErrors[`address_${index}_street`] = "Địa chỉ là bắt buộc";
    //   }
    //   if (!address.ward.trim()) {
    //     newErrors[`address_${index}_ward`] = "Phường/Xã là bắt buộc";
    //   }
    //   if (!address.district.trim()) {
    //     newErrors[`address_${index}_district`] = "Quận/Huyện là bắt buộc";
    //   }
    //   if (!address.city.trim()) {
    //     newErrors[`address_${index}_city`] = "Thành phố là bắt buộc";
    //   }
    //   if (!address.country.trim()) {
    //     newErrors[`address_${index}_country`] = "Quốc gia là bắt buộc";
    //   }
    // });

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
      const customerData = {
        ...formData,
        dob: new Date(formData.dob),
      };

      if (customer) {
        // Update existing customer
        await updateUser({
          userId: customer.id,
          userData: customerData,
        });

        const successMessage = "Cập nhật khách hàng thành công!";
        toast.success(successMessage);
      }

      onClose();
    } catch (error) {
      console.error("Error submitting customer:", error);
      const errorMessage = customer;
      ("Có lỗi xảy ra khi cập nhật khách hàng!");
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  useEffect(() => {
    if (updateUserError) {
      toast.error(
        updateUserError.message || "Có lỗi xảy ra khi cập nhật khách hàng"
      );
    }
  }, [updateUserError]);

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
                {customer ? "Chỉnh sửa khách hàng" : "Tạo khách hàng mới"}
              </h2>
              <p className="text-blue-100 opacity-90">
                {customer
                  ? "Cập nhật thông tin khách hàng hiện tại"
                  : "Thiết lập thông tin cho khách hàng mới"}
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
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) =>
                      handleInputChange("userName", e.target.value)
                    }
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.userName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Nhập username..."
                    required
                  />
                  {errors.userName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.userName}
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
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                        errors.email
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Nhập email..."
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

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.fullName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Nhập họ và tên..."
                    required
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.fullName}
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
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                        errors.phone
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      placeholder="Nhập số điện thoại..."
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

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh *
                  </label>
                  <div className="relative">
                    <IconCalendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      disabled={loading}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                        errors.dob
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      required
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
                    value={formData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <option value={Gender.MALE}>Nam</option>
                    <option value={Gender.FEMALE}>Nữ</option>
                    <option value={Gender.OTHER}>Khác</option>
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <option value={UserRole.CUSTOMER}>Khách hàng</option>
                    <option value={UserRole.STAFF}>Nhân viên</option>
                    <option value={UserRole.ADMIN}>Quản trị viên</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
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
                      🟢 Hoạt động
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
                      🔴 Không hoạt động
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <IconMapPin size={20} className="text-purple-600" />
                  Địa chỉ ({formData.addresses.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg hover:shadow-xl"
                >
                  <IconPlus size={16} />
                  Thêm địa chỉ
                </button>
              </div>

              {formData.addresses.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-all duration-200">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <IconMapPin size={32} className="text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Chưa có địa chỉ nào
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Thêm địa chỉ để hoàn thiện thông tin khách hàng
                  </p>
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer disabled:opacity-50"
                  >
                    Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.addresses.map((address, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <IconMapPin size={16} className="text-purple-600" />
                          Địa chỉ #{index + 1}
                        </h4>
                        <div className="flex items-center gap-2">
                          {!address.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(index)}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer disabled:opacity-50"
                            >
                              Đặt làm mặc định
                            </button>
                          )}
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                              Mặc định
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAddress(index)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Street */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ *
                          </label>
                          <input
                            type="text"
                            value={address.street}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "street",
                                e.target.value
                              )
                            }
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                              errors[`address_${index}_street`]
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            placeholder="Nhập địa chỉ..."
                          />
                          {errors[`address_${index}_street`] && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <IconX size={12} />
                              {errors[`address_${index}_street`]}
                            </p>
                          )}
                        </div>

                        {/* Ward */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phường/Xã *
                          </label>
                          <input
                            type="text"
                            value={address.ward}
                            onChange={(e) =>
                              handleAddressChange(index, "ward", e.target.value)
                            }
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                              errors[`address_${index}_ward`]
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            placeholder="Nhập phường/xã..."
                          />
                          {errors[`address_${index}_ward`] && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <IconX size={12} />
                              {errors[`address_${index}_ward`]}
                            </p>
                          )}
                        </div>

                        {/* District */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quận/Huyện *
                          </label>
                          <input
                            type="text"
                            value={address.district}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "district",
                                e.target.value
                              )
                            }
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                              errors[`address_${index}_district`]
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            placeholder="Nhập quận/huyện..."
                          />
                          {errors[`address_${index}_district`] && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <IconX size={12} />
                              {errors[`address_${index}_district`]}
                            </p>
                          )}
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thành phố *
                          </label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) =>
                              handleAddressChange(index, "city", e.target.value)
                            }
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                              errors[`address_${index}_city`]
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            placeholder="Nhập thành phố..."
                          />
                          {errors[`address_${index}_city`] && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <IconX size={12} />
                              {errors[`address_${index}_city`]}
                            </p>
                          )}
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quốc gia *
                          </label>
                          <input
                            type="text"
                            value={address.country}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "country",
                                e.target.value
                              )
                            }
                            disabled={loading}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                              errors[`address_${index}_country`]
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            placeholder="Nhập quốc gia..."
                          />
                          {errors[`address_${index}_country`] && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <IconX size={12} />
                              {errors[`address_${index}_country`]}
                            </p>
                          )}
                        </div>

                        {/* Zip Code */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mã bưu điện
                          </label>
                          <input
                            type="text"
                            value={address.zipCode}
                            onChange={(e) =>
                              handleAddressChange(
                                index,
                                "zipCode",
                                e.target.value
                              )
                            }
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200"
                            placeholder="Nhập mã bưu điện..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
                    {customer ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    {customer ? "Cập nhật khách hàng" : "Tạo khách hàng mới"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
