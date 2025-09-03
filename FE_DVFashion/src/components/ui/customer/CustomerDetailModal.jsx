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
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconUser size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết khách hàng
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconUser size={18} />
                Thông tin cá nhân
              </h3>
              <div className="space-y-4">
                <div>
                  <strong className="text-gray-600">ID khách hàng:</strong>
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                    #{customer.id}
                  </span>
                </div>

                <div>
                  <strong className="text-gray-600">Username:</strong>
                  <span className="ml-2 text-gray-800 font-mono">
                    {customer.userName}
                  </span>
                </div>

                <div>
                  <strong className="text-gray-600">Họ và tên:</strong>
                  <p className="mt-1 text-gray-900 font-medium text-lg">
                    {customer.fullName}
                  </p>
                </div>

                <div>
                  <strong className="text-gray-600">Họ:</strong>
                  <span className="ml-2 text-gray-800">
                    {customer.lastName}
                  </span>
                </div>

                <div className="flex items-center">
                  <IconMail size={16} className="text-gray-500 mr-2" />
                  <strong className="text-gray-600">Email:</strong>
                  <a
                    href={`mailto:${customer.email}`}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>

                <div className="flex items-center">
                  <IconPhone size={16} className="text-gray-500 mr-2" />
                  <strong className="text-gray-600">Số điện thoại:</strong>
                  <a
                    href={`tel:${customer.phone}`}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    {customer.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconCalendar size={18} />
                Thông tin bổ sung
              </h3>
              <div className="space-y-4">
                <div>
                  <strong className="text-gray-600">Giới tính:</strong>
                  <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    {getGenderLabel(customer.gender)}
                  </span>
                </div>

                <div>
                  <strong className="text-gray-600">Ngày sinh:</strong>
                  <div className="mt-1">
                    <span className="text-gray-800">
                      {formatDate(customer.dob)}
                    </span>
                    {calculateAge(customer.dob) && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({calculateAge(customer.dob)} tuổi)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <strong className="text-gray-600">Vai trò:</strong>
                  <span className="ml-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                    {getRoleLabel(customer.role)}
                  </span>
                </div>

                <div>
                  <strong className="text-gray-600">Trạng thái:</strong>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                      customer.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {customer.active ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </div>

                <div>
                  <strong className="text-gray-600">Ngày tạo:</strong>
                  <p className="mt-1 text-sm text-gray-700">
                    {formatDateTime(customer.createdAt)}
                  </p>
                </div>

                <div>
                  <strong className="text-gray-600">Cập nhật cuối:</strong>
                  <p className="mt-1 text-sm text-gray-700">
                    {formatDateTime(customer.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconMapPin size={18} />
              Địa chỉ ({customer.addresses?.length || 0})
            </h3>

            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses.map((address, index) => (
                  <div
                    key={address.id}
                    className="bg-white p-4 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Địa chỉ #{index + 1}
                      </h4>
                      {address.isDefault && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Mặc định
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <strong className="text-gray-600">ID:</strong>
                        <span className="ml-2 font-mono">#{address.id}</span>
                      </div>
                      <div>
                        <strong className="text-gray-600">Địa chỉ:</strong>
                        <p className="mt-1 text-gray-800">{address.street}</p>
                      </div>
                      <div>
                        <strong className="text-gray-600">Phường/Xã:</strong>
                        <span className="ml-2 text-gray-800">
                          {address.ward}
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-600">Quận/Huyện:</strong>
                        <span className="ml-2 text-gray-800">
                          {address.district}
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-600">Thành phố:</strong>
                        <span className="ml-2 text-gray-800">
                          {address.city}
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-600">Quốc gia:</strong>
                        <span className="ml-2 text-gray-800">
                          {address.country}
                        </span>
                      </div>
                      {address.zipCode && (
                        <div>
                          <strong className="text-gray-600">
                            Mã bưu điện:
                          </strong>
                          <span className="ml-2 text-gray-800 font-mono">
                            {address.zipCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <IconMapPin size={48} className="mx-auto mb-2 text-gray-300" />
                <p>Khách hàng chưa có địa chỉ nào</p>
              </div>
            )}
          </div>

          {/* Activity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Shopping Cart */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconShoppingCart size={18} />
                Giỏ hàng
              </h3>
              <div className="text-center py-4">
                <IconShoppingCart
                  size={32}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p className="text-gray-500 text-sm">
                  {customer.cart ? "Có sản phẩm trong giỏ" : "Giỏ hàng trống"}
                </p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconStar size={18} />
                Đánh giá
              </h3>
              <div className="text-center py-4">
                <IconStar size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-2xl font-bold text-gray-900">
                  {customer.reviews?.length || 0}
                </p>
                <p className="text-gray-500 text-sm">đánh giá</p>
              </div>
            </div>

            {/* Wishlist */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconHeart size={18} />
                Yêu thích
              </h3>
              <div className="text-center py-4">
                <IconHeart size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-2xl font-bold text-gray-900">
                  {customer.wishlist?.length || 0}
                </p>
                <p className="text-gray-500 text-sm">sản phẩm</p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconUsers size={18} />
              Thông tin hệ thống
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Tổng số địa chỉ:</strong>
                <span className="ml-2 text-gray-800">
                  {customer.addresses?.length || 0} địa chỉ
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Địa chỉ mặc định:</strong>
                <span className="ml-2 text-gray-800">
                  {customer.addresses?.find((a) => a.isDefault)
                    ? "Có"
                    : "Chưa thiết lập"}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Thời gian hoạt động:</strong>
                <span className="ml-2 text-gray-800">
                  {customer.createdAt && customer.updatedAt
                    ? `${Math.ceil(
                        (new Date(customer.updatedAt) -
                          new Date(customer.createdAt)) /
                          (1000 * 60 * 60 * 24)
                      )} ngày`
                    : "Không xác định"}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Trạng thái tài khoản:</strong>
                <span
                  className={`ml-2 inline-block px-2 py-1 rounded text-xs font-medium ${
                    customer.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {customer.active ? "Kích hoạt" : "Vô hiệu hóa"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
