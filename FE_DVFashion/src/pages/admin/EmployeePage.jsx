import { useState, useEffect } from "react";
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";

// Mock data nhân viên
const mockEmployees = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "a@company.com",
    phone: "0901234567",
    gender: "MALE",
    dob: "1990-01-01",
    position: "Quản lý",
    active: true,
    createdAt: "2024-01-01T10:00",
    updatedAt: "2024-06-01T12:00",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "b@company.com",
    phone: "0912345678",
    gender: "FEMALE",
    dob: "1992-05-12",
    position: "Nhân viên bán hàng",
    active: true,
    createdAt: "2024-02-10T09:00",
    updatedAt: "2024-06-02T14:00",
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    email: "c@company.com",
    phone: "0987654321",
    gender: "MALE",
    dob: "1988-09-20",
    position: "Kế toán",
    active: false,
    createdAt: "2024-03-15T11:00",
    updatedAt: "2024-06-03T16:00",
  },
  {
    id: 4,
    fullName: "Phạm Thị D",
    email: "d@company.com",
    phone: "0978123456",
    gender: "FEMALE",
    dob: "1995-07-22",
    position: "Nhân viên kho",
    active: true,
    createdAt: "2024-04-20T10:30",
    updatedAt: "2024-06-04T15:45",
  },
  {
    id: 5,
    fullName: "Hoàng Văn E",
    email: "e@company.com",
    phone: "0935123456",
    gender: "MALE",
    dob: "1994-07-05",
    position: "Nhân viên giao hàng",
    active: true,
    createdAt: "2024-05-10T09:15",
    updatedAt: "2024-06-05T14:20",
  },
  {
    id: 6,
    fullName: "Vũ Thị F",
    email: "f@gmail.com",
    phone: "0909876543",
    gender: "FEMALE",
    dob: "1991-03-18",
    position: "Nhân viên bán hàng",
    active: false,
    createdAt: "2024-01-15T10:00",
    updatedAt: "2024-06-06T12:00",
  },
  {
    id: 7,
    fullName: "Đỗ Văn G",
    email: "g@gmail.com",
    phone: "0918765432",
    gender: "MALE",
    dob: "1989-11-30",
    position: "Quản lý kho",
    active: true,
    createdAt: "2024-02-20T09:30",
    updatedAt: "2024-06-07T13:30",
  },
  {
    id: 8,
    fullName: "Trương Thị H",
    email: "h@gmail.com",
    phone: "0923456789",
    gender: "FEMALE",
    dob: "1993-06-25",
    position: "Nhân viên kế toán",
    active: true,
    createdAt: "2024-03-05T11:15",
    updatedAt: "2024-06-08T15:00",
  },
  {
    id: 9,
    fullName: "Phan Văn I",
    email: "i@gmail.com",
    phone: "0934567890",
    gender: "MALE",
    dob: "1990-12-10",
    position: "Nhân viên IT",
    active: false,
    createdAt: "2024-04-12T10:45",
    updatedAt: "2024-06-09T14:10",
  },
  {
    id: 10,
    fullName: "Lý Thị K",
    email: "k@gmail.com",
    phone: "0945678901",
    gender: "FEMALE",
    dob: "1996-08-14",
    position: "Nhân viên marketing",
    active: true,
    createdAt: "2024-05-18T09:20",
    updatedAt: "2024-06-10T13:40",
  },
  {
    id: 11,
    fullName: "Trịnh Văn L",
    email: "l@gmail.com",
    phone: "0956789012",
    gender: "MALE",
    dob: "1987-04-02",
    position: "Nhân viên bán hàng",
    active: true,
    createdAt: "2024-01-25T10:10",
    updatedAt: "2024-06-11T12:30",
  },
];

const genderLabels = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setEmployees(mockEmployees);
  }, []);

  // Lọc theo tên, email, hoặc số điện thoại và trạng thái
  const filteredEmployees = employees.filter(
    (e) =>
      (statusFilter === "Tất cả" ||
        (statusFilter === "Active" && e.active) ||
        (statusFilter === "Inactive" && !e.active)) &&
      (e.fullName.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.phone.includes(search))
  );

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý nhân viên</h1>
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-2/3"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-4 py-2"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Tạo nhân viên
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Giới tính</th>
              <th className="p-3 w-28">Ngày sinh</th>
              <th className="p-3">Chức vụ</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Ngày cập nhật</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-300">
                  <td className="p-3">{e.id}</td>
                  <td className="p-3 font-semibold">{e.fullName}</td>
                  <td className="p-3">{e.email}</td>
                  <td className="p-3">{e.phone}</td>
                  <td className="p-3">{genderLabels[e.gender] || "Khác"}</td>
                  <td className="p-3">{e.dob}</td>
                  <td className="p-3">{e.position}</td>
                  <td className="p-3">
                    {e.active ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3">{e.createdAt}</td>
                  <td className="p-3">{e.updatedAt}</td>
                  <td className="p-3 w-32">
                    <button className="text-blue-600 hover:text-blue-800 mr-2 cursor-pointer">
                      <IconEye className="inline-block mr-1" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-800 mr-2 cursor-pointer">
                      <IconEdit className="inline-block mr-1" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 cursor-pointer">
                      <IconTrash className="inline-block mr-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  Không có nhân viên nào.
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
    </div>
  );
}
