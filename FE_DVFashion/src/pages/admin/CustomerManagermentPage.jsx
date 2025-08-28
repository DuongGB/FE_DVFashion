import { useState, useEffect } from "react";
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import CustomerDetailModal from "../../components/ui/customer/CustomerDetailModal";
import Pagination from "../../components/common/Pagination";

// Mock data theo cấu trúc User và Address
const mockCustomers = [
  {
    id: 1,
    email: "john.doe@email.com",
    fullName: "John Doe",
    phone: "0901234567",
    gender: "MALE",
    dob: "1990-01-01",
    active: true,
    createdAt: "2024-01-01T10:00",
    updatedAt: "2024-06-01T12:00",
    addresses: [
      {
        id: 101,
        street: "12 Nguyễn Trãi",
        ward: "Phường 1",
        district: "Quận 1",
        city: "TP.HCM",
        country: "Việt Nam",
        zipCode: "700000",
        isDefault: true,
      },
      {
        id: 102,
        street: "45 Lê Lợi",
        ward: "Phường 2",
        district: "Quận 3",
        city: "TP.HCM",
        country: "Việt Nam",
        zipCode: "700000",
        isDefault: false,
      },
    ],
  },
  {
    id: 2,
    email: "jane.smith@email.com",
    fullName: "Jane Smith",
    phone: "0912345678",
    gender: "FEMALE",
    dob: "1992-05-12",
    active: false,
    createdAt: "2024-02-10T09:00",
    updatedAt: "2024-06-02T14:00",
    addresses: [
      {
        id: 103,
        street: "88 Trần Hưng Đạo",
        ward: "Phường 5",
        district: "Quận 5",
        city: "TP.HCM",
        country: "Việt Nam",
        zipCode: "700000",
        isDefault: true,
      },
    ],
  },
  {
    id: 3,
    email: "michael.j@email.com",
    fullName: "Michael Johnson",
    phone: "0987654321",
    gender: "MALE",
    dob: "1988-09-20",
    active: true,
    createdAt: "2024-03-15T11:00",
    updatedAt: "2024-06-03T16:00",
    addresses: [],
  },
  {
    id: 4,
    email: "davidbeckham@gmail.com",
    fullName: "David Beckham",
    phone: "0978123456",
    gender: "MALE",
    dob: "1975-05-02",
    active: true,
    createdAt: "2024-04-20T10:30",
    updatedAt: "2024-06-04T15:45",
    addresses: [
      {
        id: 104,
        street: "123 London Road",
        ward: "Chelsea",
        district: "London",
        city: "London",
        country: "UK",
        zipCode: "SW3 6LY",
        isDefault: true,
      },
    ],
  },
  {
    id: 5,
    email: "sontungmtp@gmail.com",
    fullName: "Sơn Tùng M-TP",
    phone: "0935123456",
    gender: "MALE",
    dob: "1994-07-05",
    active: true,
    createdAt: "2024-05-10T09:15",
    updatedAt: "2024-06-05T14:20",
    addresses: [
      {
        id: 105,
        street: "456 Cầu Giấy",
        ward: "Dịch Vọng Hậu",
        district: "Cầu Giấy",
        city: "Hà Nội",
        country: "Việt Nam",
        zipCode: "100000",
        isDefault: true,
      },
      {
        id: 106,
        street: "789 Hoàng Hoa Thám",
        ward: "Liễu Giai",
        district: "Ba Đình",
        city: "Hà Nội",
        country: "Việt Nam",
        zipCode: "100000",
        isDefault: false,
      },
    ],
  },
  {
    id: 6,
    email: "lionel@gmail.com",
    fullName: "Lionel Messi",
    phone: "0916123456",
    gender: "MALE",
    dob: "1987-06-24",
    active: false,
    createdAt: "2024-06-01T08:45",
    updatedAt: "2024-06-06T13:30",
    addresses: [
      {
        id: 107,
        street: "10 Barcelona St",
        ward: "Eixample",
        district: "Barcelona",
        city: "Barcelona",
        country: "Spain",
        zipCode: "08007",
        isDefault: true,
      },
    ],
  },
  {
    id: 7,
    email: "mytam@gmail.com",
    fullName: "Mỹ Tâm",
    phone: "0905123456",
    gender: "FEMALE",
    dob: "1981-01-16",
    active: true,
    createdAt: "2024-06-05T10:00",
    updatedAt: "2024-06-07T12:15",
    addresses: [
      {
        id: 108,
        street: "789 Lê Lợi",
        ward: "Phường 1",
        district: "Quận 3",
        city: "TP.HCM",
        country: "Việt Nam",
        zipCode: "700000",
        isDefault: true,
      },
    ],
  },
  {
    id: 8,
    email: "chipu@gmail.com",
    fullName: "Chi Pu",
    phone: "0989123456",
    gender: "FEMALE",
    dob: "1993-06-14",
    active: false,
    createdAt: "2024-06-10T09:30",
    updatedAt: "2024-06-08T11:45",
    addresses: [],
  },
  {
    id: 9,
    email: "jack@gmail.com",
    fullName: "Jack",
    phone: "0979123456",
    gender: "MALE",
    dob: "1997-04-12",
    active: true,
    createdAt: "2024-06-12T08:00",
    updatedAt: "2024-06-09T10:20",
    addresses: [
      {
        id: 109,
        street: "321 Trần Phú",
        ward: "Phường 5",
        district: "Quận 5",
        city: "TP.HCM",
        country: "Việt Nam",
        zipCode: "700000",
        isDefault: true,
      },
    ],
  },
  {
    id: 10,
    email: "thienan@gmail.com",
    fullName: "Thiên An",
    phone: "0969123456",
    gender: "FEMALE",
    dob: "1998-11-03",
    active: true,
    createdAt: "2024-06-15T07:30",
    updatedAt: "2024-06-10T09:50",
    addresses: [
      {
        id: 110,
        street: "654 Phan Đình Phùng",
        ward: "Phường 2",
        district: "Quận Phú Nhuận",
        city: "TP.HCM",
        country: "Việt Nam",
        zipCode: "700000",
        isDefault: true,
      },
    ],
  },
  {
    id: 11,
    email: "domixi@gmail.com",
    fullName: "Độ Mixi",
    phone: "095912345",
    gender: "MALE",
    dob: "1989-03-07",
    active: false,
    createdAt: "2024-06-18T11:15",
    updatedAt: "2024-06-11T13:40",
    addresses: [],
  },
];

const genderLabels = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export default function CustomerManagermentPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    setCustomers(mockCustomers);
  }, []);

  // Lọc theo tên, email, hoặc số điện thoại
  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý khách hàng</h1>
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-2/3"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Tạo khách hàng
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
              <th className="p-3">Ngày sinh</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Ngày cập nhật</th>
              <th className="p-3">Địa chỉ</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-300">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3 font-semibold">{c.fullName}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{genderLabels[c.gender] || "Khác"}</td>
                  <td className="p-3">{c.dob}</td>
                  <td className="p-3">
                    {c.active ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3">{c.createdAt}</td>
                  <td className="p-3">{c.updatedAt}</td>
                  <td className="p-3">
                    {c.addresses.length > 0 ? (
                      (() => {
                        const defaultAddress = c.addresses.find(
                          (a) => a.isDefault
                        );
                        return defaultAddress ? (
                          <span>
                            {defaultAddress.street}, {defaultAddress.ward},{" "}
                            {defaultAddress.district}, {defaultAddress.city},{" "}
                            {defaultAddress.country}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            Không có địa chỉ mặc định
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-gray-500">Chưa có địa chỉ</span>
                    )}
                  </td>
                  <td className="p-3 w-32">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-2 cursor-pointer"
                      onClick={() => handleViewDetail(c)}
                    >
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
                  Không có khách hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={filteredCustomers.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
      <CustomerDetailModal
        customer={selectedCustomer}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
