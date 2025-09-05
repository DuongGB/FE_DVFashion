import {
  IconX,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconUsers,
  IconShoppingCart,
  IconHeart,
  IconStar,
  IconInfoCircle,
  IconActivity,
  IconSettings,
} from "@tabler/icons-react";

export default function CustomerDetailModal({ customer, open, onClose }) {
  if (!open || !customer) return null;

  // Helper functions
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN");
  };

  const getGenderLabel = (gender) => {
    const labels = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác",
    };
    return labels[gender] || "Không xác định";
  };

  const getRoleLabel = (role) => {
    const labels = {
      CUSTOMER: "Khách hàng",
      ADMIN: "Quản trị viên",
      STAFF: "Nhân viên",
    };
    return labels[role] || "Không xác định";
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background giống CustomerForm */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          >
            <IconX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconUser size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Chi tiết khách hàng</h2>
              <p className="text-blue-100 opacity-90">
                Thông tin chi tiết về khách hàng {customer.fullName}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  ID: #{customer.id}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    customer.active
                      ? "bg-green-500/20 text-green-100 border border-green-400/30"
                      : "bg-red-500/20 text-red-100 border border-red-400/30"
                  }`}
                >
                  {customer.active ? "🟢 Hoạt động" : "🔴 Không hoạt động"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconInfoCircle size={20} className="text-blue-600" />
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Username
                    </label>
                    <div className="flex items-center gap-2">
                      <IconUser size={16} className="text-gray-400" />
                      <span className="font-mono text-gray-900 bg-white px-3 py-1 rounded border">
                        {customer.userName}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Họ và tên
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.fullName}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2">
                      <IconMail size={16} className="text-gray-400" />
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {customer.email}
                      </a>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Số điện thoại
                    </label>
                    <div className="flex items-center gap-2">
                      <IconPhone size={16} className="text-gray-400" />
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {customer.phone || "Chưa có"}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Giới tính
                    </label>
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {getGenderLabel(customer.gender)}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Ngày sinh
                    </label>
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-gray-400" />
                      <span className="text-gray-900">
                        {formatDate(customer.dob)}
                      </span>
                      {calculateAge(customer.dob) && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {calculateAge(customer.dob)} tuổi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Vai trò
                    </label>
                    <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {getRoleLabel(customer.role)}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Thời gian tham gia
                    </label>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Tạo:</span>
                        <span className="text-sm text-gray-700">
                          {formatDateTime(customer.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Cập nhật:</span>
                        <span className="text-sm text-gray-700">
                          {formatDateTime(customer.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconMapPin size={20} className="text-purple-600" />
                Địa chỉ ({customer.addresses?.length || 0})
              </h3>

              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.addresses.map((address, index) => (
                    <div
                      key={address.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <IconMapPin size={16} className="text-purple-600" />
                          Địa chỉ #{index + 1}
                        </h4>
                        {address.isDefault && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            Mặc định
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border border-gray-100">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            ID Địa chỉ
                          </label>
                          <span className="font-mono text-sm text-gray-700">
                            #{address.id}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded border border-gray-100">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Địa chỉ chi tiết
                          </label>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {address.street}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded border border-gray-100">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Phường/Xã
                            </label>
                            <span className="text-sm text-gray-800">
                              {address.ward}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded border border-gray-100">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Quận/Huyện
                            </label>
                            <span className="text-sm text-gray-800">
                              {address.district}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded border border-gray-100">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Thành phố
                            </label>
                            <span className="text-sm text-gray-800">
                              {address.city}
                            </span>
                          </div>
                          <div className="bg-white p-2 rounded border border-gray-100">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Quốc gia
                            </label>
                            <span className="text-sm text-gray-800">
                              {address.country}
                            </span>
                          </div>
                        </div>

                        {address.zipCode && (
                          <div className="bg-white p-3 rounded border border-gray-100">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Mã bưu điện
                            </label>
                            <span className="font-mono text-sm text-gray-800">
                              {address.zipCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <IconMapPin size={32} className="text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Chưa có địa chỉ nào
                  </p>
                  <p className="text-sm text-gray-500">
                    Khách hàng chưa thêm địa chỉ vào tài khoản
                  </p>
                </div>
              )}
            </div>

            {/* Activity Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconActivity size={20} className="text-green-600" />
                Hoạt động & Thống kê
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Shopping Cart */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <IconShoppingCart size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">
                        {customer.cart ? "1" : "0"}
                      </p>
                      <p className="text-sm text-blue-600">Giỏ hàng</p>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">
                    {customer.cart ? "Có sản phẩm trong giỏ" : "Giỏ hàng trống"}
                  </p>
                </div>

                {/* Reviews */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-yellow-600 p-3 rounded-lg">
                      <IconStar size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-900">
                        {customer.reviews?.length || 0}
                      </p>
                      <p className="text-sm text-yellow-600">Đánh giá</p>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Số lượng đánh giá đã thực hiện
                  </p>
                </div>

                {/* Wishlist */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg border border-pink-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-pink-600 p-3 rounded-lg">
                      <IconHeart size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-900">
                        {customer.wishlist?.length || 0}
                      </p>
                      <p className="text-sm text-pink-600">Yêu thích</p>
                    </div>
                  </div>
                  <p className="text-sm text-pink-700">
                    Sản phẩm trong danh sách yêu thích
                  </p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconSettings size={20} className="text-gray-600" />
                Thông tin hệ thống
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Tổng số địa chỉ
                  </label>
                  <div className="flex items-center gap-2">
                    <IconMapPin size={16} className="text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900">
                      {customer.addresses?.length || 0}
                    </span>
                    <span className="text-sm text-gray-500">địa chỉ</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Địa chỉ mặc định
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      customer.addresses?.find((a) => a.isDefault)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {customer.addresses?.find((a) => a.isDefault)
                      ? "✓ Đã thiết lập"
                      : "Chưa thiết lập"}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Thời gian hoạt động
                  </label>
                  <span className="text-lg font-semibold text-gray-900">
                    {customer.createdAt && customer.updatedAt
                      ? `${Math.max(
                          1,
                          Math.ceil(
                            (new Date(customer.updatedAt) -
                              new Date(customer.createdAt)) /
                              (1000 * 60 * 60 * 24)
                          )
                        )}`
                      : "0"}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">ngày</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Trạng thái tài khoản
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      customer.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {customer.active ? "🟢 Kích hoạt" : "🔴 Vô hiệu hóa"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
