import { useState, useEffect } from "react";
import {
  IconX,
  IconUser,
  IconCheck,
  IconPlus,
  IconTrash,
  IconMapPin,
} from "@tabler/icons-react";
import { toast } from "react-toastify";

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

export default function CustomerForm({ isOpen, onClose, onSubmit, customer }) {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    fullName: "",
    lastName: "",
    phone: "",
    gender: Gender.MALE,
    dob: "",
    role: UserRole.CUSTOMER,
    active: true,
    addresses: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      // Edit mode - populate form with existing data
      setFormData({
        userName: customer.userName || "",
        email: customer.email || "",
        fullName: customer.fullName || "",
        lastName: customer.lastName || "",
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
        lastName: "",
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

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Họ là bắt buộc";
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
    formData.addresses.forEach((address, index) => {
      if (!address.street.trim()) {
        newErrors[`address_${index}_street`] = "Địa chỉ là bắt buộc";
      }
      if (!address.ward.trim()) {
        newErrors[`address_${index}_ward`] = "Phường/Xã là bắt buộc";
      }
      if (!address.district.trim()) {
        newErrors[`address_${index}_district`] = "Quận/Huyện là bắt buộc";
      }
      if (!address.city.trim()) {
        newErrors[`address_${index}_city`] = "Thành phố là bắt buộc";
      }
      if (!address.country.trim()) {
        newErrors[`address_${index}_country`] = "Quốc gia là bắt buộc";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        dob: new Date(formData.dob),
      });
      onClose();
    } catch (error) {
      console.error("Error submitting customer:", error);
    } finally {
      setLoading(false);
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
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconUser size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {customer ? "Chỉnh sửa khách hàng" : "Tạo khách hàng mới"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 bg-black text-white rounded-full transition-colors cursor-pointer hover:bg-gray-800 disabled:opacity-50"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) =>
                    handleInputChange("userName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.userName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập username..."
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập email..."
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập họ và tên..."
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập họ..."
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập số điện thoại..."
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.dob && (
                  <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={Gender.MALE}>Nam</option>
                  <option value={Gender.FEMALE}>Nữ</option>
                  <option value={Gender.OTHER}>Khác</option>
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="active"
                    checked={formData.active === true}
                    onChange={() => handleInputChange("active", true)}
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">Hoạt động</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="active"
                    checked={formData.active === false}
                    onChange={() => handleInputChange("active", false)}
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">
                    Không hoạt động
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <IconMapPin size={18} />
                Địa chỉ ({formData.addresses.length})
              </h3>
              <button
                type="button"
                onClick={handleAddAddress}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <IconPlus size={16} />
                Thêm địa chỉ
              </button>
            </div>

            {formData.addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <IconMapPin size={48} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có địa chỉ nào</p>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="mt-2 text-blue-600 hover:underline cursor-pointer"
                >
                  Thêm địa chỉ đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.addresses.map((address, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Địa chỉ #{index + 1}
                      </h4>
                      <div className="flex items-center gap-2">
                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(index)}
                            className="text-blue-600 hover:underline text-sm cursor-pointer"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                        {address.isDefault && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            Mặc định
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAddress(index)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Street */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) =>
                            handleAddressChange(index, "street", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`address_${index}_street`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Nhập địa chỉ..."
                        />
                        {errors[`address_${index}_street`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`address_${index}_street`]}
                          </p>
                        )}
                      </div>

                      {/* Ward */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phường/Xã <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={address.ward}
                          onChange={(e) =>
                            handleAddressChange(index, "ward", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`address_${index}_ward`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Nhập phường/xã..."
                        />
                        {errors[`address_${index}_ward`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`address_${index}_ward`]}
                          </p>
                        )}
                      </div>

                      {/* District */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quận/Huyện <span className="text-red-500">*</span>
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`address_${index}_district`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Nhập quận/huyện..."
                        />
                        {errors[`address_${index}_district`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`address_${index}_district`]}
                          </p>
                        )}
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thành phố <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) =>
                            handleAddressChange(index, "city", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`address_${index}_city`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Nhập thành phố..."
                        />
                        {errors[`address_${index}_city`] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors[`address_${index}_city`]}
                          </p>
                        )}
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quốc gia <span className="text-red-500">*</span>
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`address_${index}_country`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Nhập quốc gia..."
                        />
                        {errors[`address_${index}_country`] && (
                          <p className="text-red-500 text-sm mt-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  {customer ? "Cập nhật" : "Tạo mới"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
