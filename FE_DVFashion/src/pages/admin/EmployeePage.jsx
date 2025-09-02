import { useState, useEffect } from "react";
import { IconEye, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";
import EmployeeForm from "../../components/ui/employee/EmployeeForm";
import { toast } from "react-toastify";
import EmployeeDetailModal from "../../components/ui/employee/EmployeeDetailModal";
import { showDeleteConfirmationToast } from "../../utils/showConfirmationToast";

// Mock data nhân viên - cập nhật theo database schema
const mockEmployees = [
  {
    id: 1,
    userName: "admin",
    email: "admin@company.com",
    firstName: "Nguyễn",
    lastName: "Văn A",
    fullName: "Nguyễn Văn A",
    phone: "0901224567",
    gender: "MALE",
    dob: "1990-01-01",
    role: "ADMIN",
    active: true,
    createdAt: "2024-01-01T10:00:00",
    updatedAt: "2024-06-01T12:00:00",
  },
  {
    id: 2,
    userName: "staff001",
    email: "b@company.com",
    firstName: "Trần",
    lastName: "Thị B",
    fullName: "Trần Thị B",
    phone: "0912245678",
    gender: "FEMALE",
    dob: "1992-05-12",
    role: "STAFF",
    active: true,
    createdAt: "2024-02-10T09:00:00",
    updatedAt: "2024-06-02T14:00:00",
  },
  {
    id: 3,
    userName: "staff002",
    email: "c@company.com",
    firstName: "Lê",
    lastName: "Văn C",
    fullName: "Lê Văn C",
    phone: "0987654221",
    gender: "MALE",
    dob: "1988-09-20",
    role: "STAFF",
    active: false,
    createdAt: "2024-02-15T11:00:00",
    updatedAt: "2024-06-02T16:00:00",
  },
  {
    id: 4,
    userName: "customer001",
    email: "d@company.com",
    firstName: "Phạm",
    lastName: "Thị D",
    fullName: "Phạm Thị D",
    phone: "0978122456",
    gender: "FEMALE",
    dob: "1995-07-22",
    role: "CUSTOMER",
    active: true,
    createdAt: "2024-04-20T10:20:00",
    updatedAt: "2024-06-04T15:45:00",
  },
  {
    id: 5,
    userName: "staff003", // FIX: Đổi từ staff002 thành staff003
    email: "e@company.com",
    firstName: "Hoàng",
    lastName: "Văn E",
    fullName: "Hoàng Văn E",
    phone: "0925122456",
    gender: "MALE",
    dob: "1994-07-05",
    role: "STAFF",
    active: true,
    createdAt: "2024-05-10T09:15:00",
    updatedAt: "2024-06-05T14:20:00",
  },
];

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
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    setEmployees(mockEmployees);
  }, []);

  // Lọc theo tên, email, username, hoặc số điện thoại và trạng thái
  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && e.active) ||
      (statusFilter === "inactive" && !e.active);

    const matchesRole = roleFilter === "all" || e.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Xử lý tạo nhân viên mới
  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  // Xử lý chỉnh sửa nhân viên
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  // Xử lý submit form
  const handleFormSubmit = (employeeData) => {
    if (editingEmployee) {
      // Update existing employee
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingEmployee.id
            ? {
                ...employeeData,
                id: editingEmployee.id,
                updatedAt: new Date().toISOString(),
                fullName:
                  `${employeeData.firstName} ${employeeData.lastName}`.trim(),
              }
            : e
        )
      );
      toast.success("Cập nhật nhân viên thành công!");
    } else {
      // Create new employee
      const newEmployee = {
        ...employeeData,
        id: Math.max(...employees.map((e) => e.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fullName: `${employeeData.firstName} ${employeeData.lastName}`.trim(),
      };
      setEmployees((prev) => [newEmployee, ...prev]);
      toast.success("Tạo nhân viên thành công!");
    }

    setShowForm(false);
    setEditingEmployee(null);
  };

  // Xử lý xem chi tiết nhân viên
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  // Xử lý xóa nhân viên (soft delete)
  const handleDeleteEmployee = (employee) => {
    if (!employee) {
      toast.error("Nhân viên không tồn tại!");
      return;
    }

    // Sử dụng utility function để hiển thị confirmation toast
    showDeleteConfirmationToast({
      itemName: employee.fullName,
      itemType: "nhân viên",
      isActive: employee.active,
      uniqueId: `employee-${employee.id}`,
      onConfirm: () => {
        // Logic xử lý khi user xác nhận
        if (employee.active) {
          // Soft delete - chỉ thay đổi trạng thái active
          setEmployees((prev) =>
            prev.map((e) =>
              e.id === employee.id
                ? { ...e, active: false, updatedAt: new Date().toISOString() }
                : e
            )
          );
          toast.success("Vô hiệu hóa nhân viên thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          // Reactivate employee
          setEmployees((prev) =>
            prev.map((e) =>
              e.id === employee.id
                ? { ...e, active: true, updatedAt: new Date().toISOString() }
                : e
            )
          );
          toast.success("Kích hoạt nhân viên thành công!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      },
      onCancel: () => {
        // Optional: Logic khi user hủy
        console.log("User đã hủy thao tác");
      },
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "STAFF":
        return "bg-blue-100 text-blue-800";
      case "CUSTOMER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h1>
        <button
          onClick={handleCreateEmployee}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <IconPlus size={20} />
          Tạo nhân viên
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số nhân viên
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter((e) => e.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Không hoạt động
              </p>
              <p className="text-2xl font-bold text-red-600">
                {employees.filter((e) => !e.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between mb-4 items-center gap-4 bg-white p-4 rounded-lg shadow border">
        <div className="flex gap-4 items-center flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên (tên, email, username, SĐT)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-4 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-4 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="STAFF">Nhân viên</option>
            <option value="CUSTOMER">Khách hàng</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị {paginatedEmployees.length} trên {filteredEmployees.length}{" "}
        nhân viên
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">ID</th>
              <th className="p-2">Username</th>
              <th className="p-2">Họ tên</th>
              <th className="p-2">Email</th>
              <th className="p-2">SĐT</th>
              <th className="p-2">Giới tính</th>
              <th className="p-2">Ngày sinh</th>
              <th className="p-2">Vai trò</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Ngày tạo</th>
              <th className="p-2">Ngày cập nhật</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{e.id}</td>
                  <td className="p-2 font-mono text-sm">{e.userName}</td>
                  <td className="p-2 font-semibold">{e.fullName}</td>
                  <td className="p-2">{e.email}</td>
                  <td className="p-2">{e.phone}</td>
                  <td className="p-2">{genderLabels[e.gender] || "Khác"}</td>
                  <td className="p-2">{formatDate(e.dob)}</td>
                  <td className="p-2 w-28">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                        e.role
                      )}`}
                    >
                      {roleLabels[e.role]}
                    </span>
                  </td>
                  <td className="p-2 w-32">
                    {e.active ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Không hoạt động
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {formatDate(e.createdAt)}
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {formatDate(e.updatedAt)}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                        title="Xem chi tiết"
                        onClick={() => handleViewEmployee(e)}
                      >
                        <IconEye />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-800 p-1 cursor-pointer"
                        onClick={() => handleEditEmployee(e)}
                        title="Chỉnh sửa"
                      >
                        <IconEdit />
                      </button>
                      <button
                        className={`p-1 cursor-pointer ${
                          e.active
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                        onClick={() => handleDeleteEmployee(e)}
                        title={e.active ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center py-6 text-gray-500">
                  Không có nhân viên nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredEmployees.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Employee Form Modal */}
      <EmployeeForm
        isOpen={showForm}
        onClose={handleCloseForm}
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
