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
  IconEdit,
} from "@tabler/icons-react";

export default function EmployeeDetailModal({ employee, open, onClose }) {
  if (!open || !employee) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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
          color: "bg-blue-100 text-blue-800",
        };
      case "FEMALE":
        return {
          icon: IconGenderFemale,
          text: "Nữ",
          color: "bg-pink-100 text-pink-800",
        };
      case "OTHER":
        return {
          icon: IconUser,
          text: "Khác",
          color: "bg-gray-100 text-gray-800",
        };
      default:
        return {
          icon: IconUser,
          text: gender,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  // Get role info
  const getRoleInfo = (role) => {
    switch (role) {
      case "ADMIN":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          text: "Quản trị viên",
          description: "Có quyền truy cập và quản lý toàn bộ hệ thống",
        };
      case "STAFF":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          text: "Nhân viên",
          description: "Có quyền quản lý sản phẩm, đơn hàng và khách hàng",
        };
      case "CUSTOMER":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          text: "Khách hàng",
          description: "Tài khoản khách hàng để mua sắm",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          text: role,
          description: "Vai trò không xác định",
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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconUser size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết nhân viên
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Avatar và thông tin cơ bản */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Avatar Section */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {employee.firstName?.charAt(0) || "?"}
                  {employee.lastName?.charAt(0) || ""}
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">
                  {employee.fullName}
                </h3>
                <div className="space-y-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${roleInfo.color}`}
                  >
                    {roleInfo.text}
                  </span>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-2 ${
                      employee.active
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    } border`}
                  >
                    {employee.active ? "Hoạt động" : "Không hoạt động"}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="lg:col-span-3 space-y-4">
              {/* Account Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconUserCheck size={18} />
                  Thông tin tài khoản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-600">ID:</strong>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                      #{employee.id}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Username:</strong>
                    <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm">
                      {employee.userName}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <strong className="text-gray-600">Email:</strong>
                    <span className="ml-2 text-blue-600 hover:text-blue-800">
                      <a href={`mailto:${employee.email}`}>{employee.email}</a>
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconId size={18} />
                  Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-600">Họ:</strong>
                    <span className="ml-2 text-gray-800 font-medium">
                      {employee.firstName}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Tên:</strong>
                    <span className="ml-2 text-gray-800 font-medium">
                      {employee.lastName}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Số điện thoại:</strong>
                    <span className="ml-2 text-blue-600 hover:text-blue-800">
                      <a href={`tel:${employee.phone}`}>{employee.phone}</a>
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Giới tính:</strong>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-sm font-medium inline-flex items-center gap-1 ${genderInfo.color}`}
                    >
                      <GenderIcon size={14} />
                      {genderInfo.text}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Ngày sinh:</strong>
                    <span className="ml-2 text-gray-800">
                      {formatDateOnly(employee.dob)}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Tuổi:</strong>
                    <span className="ml-2 text-gray-800 font-medium">
                      {calculateAge(employee.dob)} tuổi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconBriefcase size={18} />
              Thông tin vai trò
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Vai trò hiện tại:</strong>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${roleInfo.color}`}
                >
                  {roleInfo.text}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Trạng thái tài khoản:</strong>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                    employee.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.active ? (
                    <IconCheck size={14} />
                  ) : (
                    <IconX size={14} />
                  )}
                  {employee.active ? "Hoạt động" : "Không hoạt động"}
                </span>
              </div>
              <div className="md:col-span-2">
                <strong className="text-gray-600">Mô tả quyền hạn:</strong>
                <p className="ml-2 mt-1 text-gray-700 italic">
                  {roleInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Work Statistics (if available) */}
          {employee.workStats && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconEdit size={18} />
                Thống kê công việc
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {employee.workStats.ordersHandled || 0}
                  </div>
                  <div className="text-sm text-gray-600">Đơn hàng xử lý</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {employee.workStats.customersServed || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Khách hàng phục vụ
                  </div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {employee.workStats.tasksCompleted || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Nhiệm vụ hoàn thành
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconClock size={18} />
              Thông tin thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Ngày tạo tài khoản:</strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(employee.createdAt)}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Cập nhật cuối:</strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(employee.updatedAt)}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Thời gian làm việc:</strong>
                <span className="ml-2 text-gray-800 font-medium">
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
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Lần đăng nhập cuối:</strong>
                <span className="ml-2 text-gray-800">
                  {employee.lastLogin
                    ? formatDate(employee.lastLogin)
                    : "Chưa đăng nhập"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
