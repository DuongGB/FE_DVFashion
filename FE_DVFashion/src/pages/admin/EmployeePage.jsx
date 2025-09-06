import { useState, useEffect, useMemo } from "react";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import EmployeeForm from "../../components/ui/employee/EmployeeForm";
import EmployeeDetailModal from "../../components/ui/employee/EmployeeDetailModal";
import { useUser } from "../../hooks/useUser";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth để lấy thông tin user hiện tại
import { showConfirmationToast } from "../../utils/showConfirmationToast";

// Translations for labels
const statusLabels = {
  vi: {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    total: "Tổng nhân viên",
    activeCount: "Đang hoạt động",
    inactiveCount: "Không hoạt động",
    allStatus: "Tất cả trạng thái",
    vietnamese: "Tiếng Việt",
    english: "Tiếng Anh",
  },
  en: {
    active: "Active",
    inactive: "Inactive",
    total: "Total Employees",
    activeCount: "Active",
    inactiveCount: "Inactive",
    allStatus: "All Status",
    vietnamese: "Vietnamese",
    english: "English",
  },
};

const genderLabels = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

const roleLabels = {
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

export default function EmployeePage() {
  const { user: currentUser } = useAuth(); // Lấy thông tin user hiện tại
  const {
    users,
    isLoadingUsers,
    usersError,
    updateUser,
    updateUserError,
    createUser,
    isCreatingUser,
    createUserError,
  } = useUser();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [language, setLanguage] = useState("vi");
  const [loadingItems, setLoadingItems] = useState({
    status: null,
    delete: null,
  });
  const [originalOrder, setOriginalOrder] = useState([]); // Store original order
  const pageSize = 10;

  // Store original order when users first load (loại trừ current user)
  useEffect(() => {
    if (
      users &&
      users.length > 0 &&
      originalOrder.length === 0 &&
      currentUser
    ) {
      const employeeIds = users
        .filter((user) => user.role === "ADMIN" || user.role === "STAFF")
        .filter((user) => user.id !== currentUser.id) // Loại trừ user hiện tại
        .map((employee) => employee.id);
      setOriginalOrder(employeeIds);
    }
  }, [users, currentUser]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, roleFilter]);

  // Helper function to get status labels
  const getStatusLabel = (key) => {
    return statusLabels[language][key] || statusLabels.vi[key];
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Sort employees by original order to maintain position (loại trừ current user)
  const sortedEmployees = useMemo(() => {
    if (!users || !currentUser) return [];

    const employeeUsers = users
      .filter((user) => user.role === "ADMIN" || user.role === "STAFF")
      .filter((user) => user.id !== currentUser.id); // Loại trừ user hiện tại

    if (originalOrder.length === 0) {
      const sorted = employeeUsers.sort((a, b) => a.id - b.id);
      return sorted;
    }

    // Sort theo original order
    const sorted = employeeUsers.sort((a, b) => {
      const aIndex = originalOrder.indexOf(a.id);
      const bIndex = originalOrder.indexOf(b.id);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return a.id - b.id;
    });

    return sorted;
  }, [users, originalOrder, currentUser]);

  // Filter employees with stable sorting
  const filteredEmployees = useMemo(() => {
    const filtered = sortedEmployees.filter((employee) => {
      const matchesSearch =
        employee.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        employee.email?.toLowerCase().includes(search.toLowerCase()) ||
        employee.userName?.toLowerCase().includes(search.toLowerCase()) ||
        employee.phone?.includes(search);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && employee.active) ||
        (statusFilter === "inactive" && !employee.active);

      const matchesRole = !roleFilter || employee.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });

    return filtered;
  }, [sortedEmployees, search, statusFilter, roleFilter, currentUser]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle actions
  const handleViewDetail = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  // Handle toggle status with position preservation
  const handleToggleStatus = async (employee) => {
    // Kiểm tra không cho phép thao tác với chính mình
    if (currentUser && employee.id === currentUser.id) {
      toast.warning("Bạn không thể thay đổi trạng thái của chính mình!");
      return;
    }

    const newStatus = !employee.active;
    const langKey = language === "vi" ? "vi" : "en";

    const actionText = newStatus
      ? langKey === "vi"
        ? "kích hoạt lại"
        : "activate"
      : langKey === "vi"
      ? "vô hiệu hóa"
      : "deactivate";

    const confirmText = newStatus
      ? langKey === "vi"
        ? "Kích hoạt"
        : "Activate"
      : langKey === "vi"
      ? "Vô hiệu hóa"
      : "Deactivate";

    const cancelText = langKey === "vi" ? "Hủy" : "Cancel";

    const title =
      langKey === "vi"
        ? `Xác nhận ${actionText} nhân viên`
        : `Confirm ${actionText} employee`;

    const message =
      langKey === "vi"
        ? `Bạn có chắc chắn muốn ${actionText} nhân viên "${employee.fullName}" không?`
        : `Are you sure you want to ${actionText} employee "${employee.fullName}"?`;

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass: `${
        newStatus
          ? "bg-green-600 hover:bg-green-700"
          : "bg-red-600 hover:bg-red-700"
      } text-white px-3 py-1 rounded transition-colors cursor-pointer`,
      onConfirm: async () => {
        setLoadingItems((prev) => ({ ...prev, status: employee.id }));

        try {
          await updateUser({
            userId: employee.id,
            userData: { active: newStatus },
          });

          const successMessage =
            langKey === "vi"
              ? `${
                  newStatus ? "Kích hoạt lại" : "Vô hiệu hóa"
                } nhân viên thành công!`
              : `Employee ${
                  newStatus ? "activated" : "deactivated"
                } successfully!`;

          toast.success(successMessage);
        } catch (error) {
          console.error("❌ Error updating employee status:", error);
          const errorMessage =
            langKey === "vi"
              ? `Có lỗi xảy ra khi ${actionText} nhân viên!`
              : `Error occurred while ${actionText.replace(
                  " ",
                  "ing"
                )} employee!`;
          toast.error(errorMessage);
        } finally {
          setLoadingItems((prev) => ({ ...prev, status: null }));
        }
      },
    });
  };

  // Handle form submit (create/update)
  const handleFormSubmit = async (employeeData) => {
    try {
      if (editingEmployee) {
        // Kiểm tra không cho phép edit chính mình
        if (currentUser && editingEmployee.id === currentUser.id) {
          toast.warning(
            "Bạn không thể chỉnh sửa thông tin của chính mình từ trang này!"
          );
          return;
        }

        // Update existing employee
        await updateUser({
          userId: editingEmployee.id,
          userData: employeeData,
        });
        toast.success("Cập nhật nhân viên thành công!");
      } else {
        // Create new employee
        await createUser(employeeData);
        toast.success("Tạo nhân viên thành công!");
      }
      setShowForm(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error("Error submitting employee:", error);
      const errorMessage = editingEmployee
        ? "Có lỗi xảy ra khi cập nhật nhân viên!"
        : "Có lỗi xảy ra khi tạo nhân viên!";
      toast.error(errorMessage);
    }
  };

  // Calculate statistics từ sortedEmployees (không bao gồm current user)
  const stats = {
    total: sortedEmployees?.length || 0,
    active: sortedEmployees?.filter((e) => e.active).length || 0,
    inactive: sortedEmployees?.filter((e) => !e.active).length || 0,
  };

  // Show error if any
  useEffect(() => {
    if (usersError) {
      toast.error(
        usersError.message || "Có lỗi xảy ra khi tải dữ liệu nhân viên"
      );
    }
  }, [usersError]);

  useEffect(() => {
    if (updateUserError) {
      toast.error(
        updateUserError.message || "Có lỗi xảy ra khi cập nhật nhân viên"
      );
    }
  }, [updateUserError]);

  useEffect(() => {
    if (createUserError) {
      toast.error(createUserError.message || "Có lỗi xảy ra khi tạo nhân viên");
    }
  }, [createUserError]);

  // Handle error state
  if (usersError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold mb-2">
            {language === "vi" ? "Lỗi tải dữ liệu" : "Error Loading Data"}
          </h3>
          <p className="text-sm">
            {usersError.message ||
              (language === "vi"
                ? "Không thể tải danh sách nhân viên"
                : "Unable to load employee list")}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {language === "vi" ? "Thử lại" : "Try Again"}
        </button>
      </div>
    );
  }

  // Loading state nếu chưa có currentUser
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <span className="text-gray-500">
            Đang tải thông tin người dùng...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {language === "vi" ? "Quản lý nhân viên" : "Employee Management"}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
            disabled={isCreatingUser}
          >
            <IconPlus size={20} />
            {isCreatingUser ? "Đang tạo..." : "Tạo nhân viên"}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {getStatusLabel("total")}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <IconUsers size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {getStatusLabel("activeCount")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <IconUsers size={32} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {getStatusLabel("inactiveCount")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
            <IconUsers size={32} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  language === "vi"
                    ? "Tìm kiếm theo tên, email, username, SĐT..."
                    : "Search by name, email, username, phone..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{getStatusLabel("allStatus")}</option>
              <option value="active">{getStatusLabel("activeCount")}</option>
              <option value="inactive">
                {getStatusLabel("inactiveCount")}
              </option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {language === "vi" ? "Tất cả vai trò" : "All Roles"}
              </option>
              <option value="ADMIN">
                {language === "vi" ? "Quản trị viên" : "Admin"}
              </option>
              <option value="STAFF">
                {language === "vi" ? "Nhân viên" : "Staff"}
              </option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vi">{getStatusLabel("vietnamese")}</option>
              <option value="en">{getStatusLabel("english")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {language === "vi"
          ? `Hiển thị ${paginatedEmployees.length} trên tổng số ${filteredEmployees.length} nhân viên (không bao gồm tài khoản của bạn)`
          : `Showing ${paginatedEmployees.length} of ${filteredEmployees.length} employees (excluding your account)`}
      </div>

      {/* Employees Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Username</th>
              <th className="p-3">
                {language === "vi" ? "Họ tên" : "Full Name"}
              </th>
              <th className="p-3">Email</th>
              <th className="p-3">{language === "vi" ? "SĐT" : "Phone"}</th>
              <th className="p-3">
                {language === "vi" ? "Giới tính" : "Gender"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Ngày sinh" : "Date of Birth"}
              </th>
              <th className="p-3 w-28">
                {language === "vi" ? "Vai trò" : "Role"}
              </th>
              <th className="p-3 ">
                {language === "vi" ? "Trạng thái" : "Status"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Ngày tạo" : "Created At"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Hành động" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoadingUsers ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    {language === "vi" ? "Đang tải..." : "Loading..."}
                  </div>
                </td>
              </tr>
            ) : paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee, index) => (
                <tr
                  key={`employee-${employee.id}-${index}`}
                  className="border-b hover:bg-gray-300 transition-colors"
                >
                  <td className="p-3">{employee.id}</td>
                  <td className="p-3 font-mono text-sm">{employee.userName}</td>
                  <td className="p-3 font-semibold">
                    {employee.fullName || "N/A"}
                  </td>
                  <td className="p-3">{employee.email}</td>
                  <td className="p-3">{employee.phone || "N/A"}</td>
                  <td className="p-3">
                    {genderLabels[employee.gender] || "Khác"}
                  </td>
                  <td className="p-3">
                    {employee.dob ? formatDate(employee.dob) : "N/A"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.role === "ADMIN"
                          ? "bg-red-100 text-red-800"
                          : employee.role === "STAFF"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {roleLabels[employee.role] || employee.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(employee)}
                      disabled={loadingItems.status === employee.id}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${
                        employee.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      title={
                        language === "vi"
                          ? `Click để ${
                              employee.active ? "vô hiệu hóa" : "kích hoạt lại"
                            }`
                          : `Click to ${
                              employee.active ? "deactivate" : "activate"
                            }`
                      }
                    >
                      {loadingItems.status === employee.id ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        </div>
                      ) : (
                        <>
                          {employee.active
                            ? getStatusLabel("active")
                            : getStatusLabel("inactive")}
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {formatDate(employee.createdAt)}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(employee)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        title={
                          language === "vi" ? "Xem chi tiết" : "View Details"
                        }
                      >
                        <IconEye size={24} />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                        title={language === "vi" ? "Chỉnh sửa" : "Edit"}
                      >
                        <IconEdit size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-4">
                  {language === "vi"
                    ? "Không có nhân viên nào."
                    : "No employees found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Employee Form Modal */}
      <EmployeeForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleFormSubmit}
        employee={editingEmployee}
      />

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEmployee(null);
        }}
      />
    </div>
  );
}
