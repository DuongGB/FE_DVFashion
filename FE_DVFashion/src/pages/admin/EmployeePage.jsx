import { useState, useEffect } from "react";
import { IconEye, IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";
import EmployeeForm from "../../components/ui/employee/EmployeeForm";
import { toast } from "react-toastify";

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

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  // Xử lý xóa nhân viên (soft delete)
  const handleDeleteEmployee = (employee) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn ${
          employee.active ? "vô hiệu hóa" : "kích hoạt"
        } nhân viên ${employee.fullName}?`
      )
    ) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === employee.id
            ? { ...e, active: !e.active, updatedAt: new Date().toISOString() }
            : e
        )
      );
      toast.success(
        `${employee.active ? "Vô hiệu hóa" : "Kích hoạt"} nhân viên thành công!`
      );
    }
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
      <h1 className="text-2xl font-bold mb-6">Quản lý nhân viên</h1>

      {/* Filters */}
      <div className="flex justify-between mb-4 items-center gap-4">
        <div className="flex gap-4 items-center flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên (tên, email, username, SĐT)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-4 py-2"
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
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="STAFF">Nhân viên</option>
            <option value="CUSTOMER">Khách hàng</option>
          </select>
        </div>

        <button
          onClick={handleCreateEmployee}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <IconPlus size={16} />
          Tạo nhân viên
        </button>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị {paginatedEmployees.length} trong tổng số{" "}
        {filteredEmployees.length} nhân viên
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
    </div>
  );
}
