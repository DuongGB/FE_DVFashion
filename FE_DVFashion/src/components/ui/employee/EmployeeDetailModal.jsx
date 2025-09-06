import React from "react";
import {
  IconX,
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconBriefcase,
  IconGenderMale,
  IconGenderFemale,
  IconId,
  IconCheck,
  IconUserCheck,
  IconClock,
  IconInfoCircle,
} from "@tabler/icons-react";

export default function EmployeeDetailModal({ employee, open, onClose }) {
  if (!open || !employee) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date only (for DOB)
  const formatDateOnly = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Calculate age
  const calculateAge = (dateString) => {
    if (!dateString) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateString);
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

  // Get gender info
  const getGenderInfo = (gender) => {
    switch (gender) {
      case "MALE":
        return {
          icon: IconGenderMale,
          text: "Nam",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "FEMALE":
        return {
          icon: IconGenderFemale,
          text: "Nữ",
          color: "bg-pink-50 text-pink-700 border-pink-200",
        };
      case "OTHER":
        return {
          icon: IconUser,
          text: "Khác",
          color: "bg-gray-50 text-gray-700 border-gray-200",
        };
      default:
        return {
          icon: IconUser,
          text: gender,
          color: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  // Get role info
  const getRoleInfo = (role) => {
    switch (role) {
      case "ADMIN":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          text: "Quản trị viên",
          description: "Có quyền truy cập và quản lý toàn bộ hệ thống",
          icon: "👑",
        };
      case "STAFF":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          text: "Nhân viên",
          description: "Có quyền quản lý sản phẩm, đơn hàng và khách hàng",
          icon: "👨‍💼",
        };
      case "CUSTOMER":
        return {
          color: "bg-green-50 text-green-700 border-green-200",
          text: "Khách hàng",
          description: "Tài khoản khách hàng để mua sắm",
          icon: "👤",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200",
          text: role,
          description: "Vai trò không xác định",
          icon: "❓",
        };
    }
  };

  const genderInfo = getGenderInfo(employee.gender);
  const roleInfo = getRoleInfo(employee.role);
  const GenderIcon = genderInfo.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
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
              <h2 className="text-2xl font-bold mb-2">Chi tiết nhân viên</h2>
              <p className="text-blue-100 opacity-90">
                Xem thông tin chi tiết của nhân viên {employee.fullName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Avatar Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconUser size={20} className="text-purple-600" />
                  Thông tin cá nhân
                </h3>

                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
                    {employee.fullName?.charAt(0) || "?"}
                  </div>
                  <h4 className="font-bold text-xl text-gray-800 mb-2">
                    {employee.fullName}
                  </h4>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${roleInfo.color}`}
                  >
                    <span className="text-lg">{roleInfo.icon}</span>
                    {roleInfo.text}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Họ và tên:
                    </strong>
                    <p className="mt-2 text-gray-900 font-semibold text-lg">
                      {employee.fullName}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Giới tính:
                    </strong>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${genderInfo.color}`}
                      >
                        <GenderIcon size={16} />
                        {genderInfo.text}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Trạng thái:
                    </strong>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                          employee.active
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {employee.active ? (
                          <>
                            <IconCheck size={16} />
                            Đang hoạt động
                          </>
                        ) : (
                          <>
                            <IconX size={16} />
                            Không hoạt động
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconUserCheck size={20} className="text-blue-600" />
                  Thông tin tài khoản
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="bg-blue-100 rounded-full p-1">
                      <IconId size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <strong className="text-blue-800 text-sm font-medium">
                        ID nhân viên:
                      </strong>
                      <div className="mt-1">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-mono text-sm">
                          #{employee.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Tên đăng nhập:
                    </strong>
                    <p className="mt-2 text-gray-900 font-mono font-semibold">
                      {employee.userName}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Email:
                    </strong>
                    <p className="mt-2">
                      <a
                        href={`mailto:${employee.email}`}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2 transition-colors"
                      >
                        <IconMail size={16} />
                        {employee.email}
                      </a>
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Số điện thoại:
                    </strong>
                    <p className="mt-2">
                      <a
                        href={`tel:${employee.phone}`}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2 transition-colors"
                      >
                        <IconPhone size={16} />
                        {employee.phone || "N/A"}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCalendar size={20} className="text-green-600" />
                Thông tin cá nhân chi tiết
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <IconCalendar size={20} className="text-green-600" />
                    </div>
                    <div>
                      <strong className="text-green-800 text-sm font-medium">
                        Ngày sinh:
                      </strong>
                      <p className="text-green-700 font-semibold text-lg">
                        {formatDateOnly(employee.dob)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <IconUser size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <strong className="text-orange-800 text-sm font-medium">
                        Tuổi:
                      </strong>
                      <p className="text-orange-700 font-semibold text-lg">
                        {calculateAge(employee.dob)} tuổi
                      </p>
                    </div>
                  </div>
                </div>

                {employee.firstName && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <IconUser size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <strong className="text-blue-800 text-sm font-medium">
                          Họ:
                        </strong>
                        <p className="text-blue-700 font-semibold text-lg">
                          {employee.firstName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {employee.lastName && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 rounded-full p-2">
                        <IconUser size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <strong className="text-purple-800 text-sm font-medium">
                          Tên:
                        </strong>
                        <p className="text-purple-700 font-semibold text-lg">
                          {employee.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconBriefcase size={20} className="text-purple-600" />
                Vai trò & Quyền hạn
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-100 rounded-full p-1">
                      <IconBriefcase size={16} className="text-purple-600" />
                    </div>
                    <strong className="text-purple-800 text-sm font-medium">
                      Vai trò hiện tại:
                    </strong>
                  </div>
                  <div
                    className={`border px-4 py-3 rounded-lg ${roleInfo.color}`}
                  >
                    <span className="font-bold text-lg inline-flex items-center gap-2">
                      <span className="text-xl">{roleInfo.icon}</span>
                      {roleInfo.text}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-100 rounded-full p-1">
                      <IconInfoCircle size={16} className="text-blue-600" />
                    </div>
                    <strong className="text-blue-800 text-sm font-medium">
                      Mô tả quyền hạn:
                    </strong>
                  </div>
                  <p className="text-blue-700 leading-relaxed">
                    {roleInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconClock size={20} className="text-orange-600" />
                Thông tin thời gian
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employee.createdAt && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-100 rounded-full p-1">
                        <IconCalendar size={16} className="text-green-600" />
                      </div>
                      <strong className="text-green-800 text-sm font-medium">
                        Ngày tạo tài khoản:
                      </strong>
                    </div>
                    <p className="text-green-700 font-semibold">
                      {formatDate(employee.createdAt)}
                    </p>
                  </div>
                )}

                {employee.updatedAt && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-yellow-100 rounded-full p-1">
                        <IconCalendar size={16} className="text-yellow-600" />
                      </div>
                      <strong className="text-yellow-800 text-sm font-medium">
                        Cập nhật lần cuối:
                      </strong>
                    </div>
                    <p className="text-yellow-700 font-semibold">
                      {formatDate(employee.updatedAt)}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-100 rounded-full p-1">
                      <IconClock size={16} className="text-blue-600" />
                    </div>
                    <strong className="text-blue-800 text-sm font-medium">
                      Thời gian làm việc:
                    </strong>
                  </div>
                  <p className="text-blue-700 font-semibold">
                    {(() => {
                      const workDays = Math.floor(
                        (new Date() - new Date(employee.createdAt)) /
                          (1000 * 60 * 60 * 24)
                      );
                      if (workDays < 30) return `${workDays} ngày`;
                      if (workDays < 365)
                        return `${Math.floor(workDays / 30)} tháng`;
                      return `${Math.floor(workDays / 365)} năm ${Math.floor(
                        (workDays % 365) / 30
                      )} tháng`;
                    })()}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gray-100 rounded-full p-1">
                      <IconClock size={16} className="text-gray-600" />
                    </div>
                    <strong className="text-gray-700 text-sm font-medium">
                      Lần đăng nhập cuối:
                    </strong>
                  </div>
                  <p className="text-gray-700 font-semibold">
                    {employee.lastLogin
                      ? formatDate(employee.lastLogin)
                      : "Chưa đăng nhập"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconInfoCircle size={20} className="text-purple-600" />
                Thông tin bổ sung
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <strong className="text-purple-800 text-sm font-medium">
                    Mã nhân viên:
                  </strong>
                  <p className="mt-1 text-purple-700 font-mono font-semibold">
                    EMP-{employee.id.toString().padStart(4, "0")}
                  </p>
                </div>

                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <strong className="text-indigo-800 text-sm font-medium">
                    Tên hiển thị:
                  </strong>
                  <p className="mt-1 text-indigo-700 font-semibold">
                    {employee.fullName}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-700 text-sm font-medium">
                    Độ dài tên:
                  </strong>
                  <p className="mt-1 text-gray-800 font-semibold">
                    {employee.fullName?.length || 0} ký tự
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-700 text-sm font-medium">
                    Có email:
                  </strong>
                  <p className="mt-1 text-gray-800 font-semibold">
                    {employee.email ? "Có" : "Không"}
                  </p>
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
