import { useState, useEffect } from "react";
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import CustomerDetailModal from "../../components/ui/customer/CustomerDetailModal";
import CustomerForm from "../../components/ui/customer/CustomerForm";
import Pagination from "../../components/common/Pagination";
import { showConfirmationToast } from "../../utils/showConfirmationToast";

// Enums theo class diagram
const BehaviorType = {
  VIEW: "VIEW",
  ADD_TO_CART: "ADD_TO_CART",
  PURCHASE: "PURCHASE",
  LIKE: "LIKE",
  SHARE: "SHARE",
  SEARCH: "SEARCH",
};

const UserRole = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
};

const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
};

// Translations for labels
const statusLabels = {
  vi: {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    total: "Tổng khách hàng",
    activeCount: "Đang hoạt động",
    inactiveCount: "Không hoạt động",
    allStatus: "Tất cả trạng thái",
    vietnamese: "Tiếng Việt",
    english: "Tiếng Anh",
  },
  en: {
    active: "Active",
    inactive: "Inactive",
    total: "Total Customers",
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

// Mock data theo cấu trúc class diagram User
const mockCustomers = [
  {
    id: 1,
    userName: "john.doe",
    email: "john.doe@email.com",
    fullName: "John Doe",
    lastName: "Doe",
    phone: "0901234567",
    gender: Gender.MALE,
    dob: new Date("1990-01-01"),
    role: UserRole.CUSTOMER,
    active: true,
    createdAt: new Date("2024-01-01T10:00"),
    updatedAt: new Date("2024-06-01T12:00"),
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
        user: null,
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
        user: null,
      },
    ],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 2,
    userName: "jane.smith",
    email: "jane.smith@email.com",
    fullName: "Jane Smith",
    lastName: "Smith",
    phone: "0912345678",
    gender: Gender.FEMALE,
    dob: new Date("1992-05-12"),
    role: UserRole.CUSTOMER,
    active: false,
    createdAt: new Date("2024-02-10T09:00"),
    updatedAt: new Date("2024-06-02T14:00"),
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
        user: null,
      },
    ],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 3,
    userName: "michael.j",
    email: "michael.j@email.com",
    fullName: "Michael Johnson",
    lastName: "Johnson",
    phone: "0987654321",
    gender: Gender.MALE,
    dob: new Date("1988-09-20"),
    role: UserRole.CUSTOMER,
    active: true,
    createdAt: new Date("2024-03-15T11:00"),
    updatedAt: new Date("2024-06-03T16:00"),
    addresses: [],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 4,
    userName: "davidbeckham",
    email: "davidbeckham@gmail.com",
    fullName: "David Beckham",
    lastName: "Beckham",
    phone: "0978123456",
    gender: Gender.MALE,
    dob: new Date("1975-05-02"),
    role: UserRole.CUSTOMER,
    active: true,
    createdAt: new Date("2024-04-20T10:30"),
    updatedAt: new Date("2024-06-04T15:45"),
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
        user: null,
      },
    ],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 5,
    userName: "sontungmtp",
    email: "sontungmtp@gmail.com",
    fullName: "Sơn Tùng M-TP",
    lastName: "M-TP",
    phone: "0935123456",
    gender: Gender.MALE,
    dob: new Date("1994-07-05"),
    role: UserRole.CUSTOMER,
    active: true,
    createdAt: new Date("2024-05-10T09:15"),
    updatedAt: new Date("2024-06-05T14:20"),
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
        user: null,
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
        user: null,
      },
    ],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 6,
    userName: "lionel",
    email: "lionel@gmail.com",
    fullName: "Lionel Messi",
    lastName: "Messi",
    phone: "0916123456",
    gender: Gender.MALE,
    dob: new Date("1987-06-24"),
    role: UserRole.CUSTOMER,
    active: false,
    createdAt: new Date("2024-06-01T08:45"),
    updatedAt: new Date("2024-06-06T13:30"),
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
        user: null,
      },
    ],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 7,
    userName: "mytam",
    email: "mytam@gmail.com",
    fullName: "Mỹ Tâm",
    lastName: "Tâm",
    phone: "0905123456",
    gender: Gender.FEMALE,
    dob: new Date("1981-01-16"),
    role: UserRole.CUSTOMER,
    active: true,
    createdAt: new Date("2024-06-05T10:00"),
    updatedAt: new Date("2024-06-07T12:15"),
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
        user: null,
      },
    ],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 8,
    userName: "chipu",
    email: "chipu@gmail.com",
    fullName: "Chi Pu",
    lastName: "Pu",
    phone: "0989123456",
    gender: Gender.FEMALE,
    dob: new Date("1993-06-14"),
    role: UserRole.CUSTOMER,
    active: false,
    createdAt: new Date("2024-06-10T09:30"),
    updatedAt: new Date("2024-06-08T11:45"),
    addresses: [],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 9,
    userName: "jack",
    email: "jack@gmail.com",
    fullName: "Jack",
    lastName: "Jack",
    phone: "0979123456",
    gender: Gender.MALE,
    dob: new Date("1997-04-12"),
    role: UserRole.CUSTOMER,
    active: true,
    createdAt: new Date("2024-06-12T08:00"),
    updatedAt: new Date("2024-06-09T10:20"),
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
        user: null,
      },
    ],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 10,
    userName: "thienan",
    email: "thienan@gmail.com",
    fullName: "Thiên An",
    lastName: "An",
    phone: "0969123456",
    gender: Gender.FEMALE,
    dob: new Date("1998-11-03"),
    role: UserRole.CUSTOMER,
    active: true,
    createdAt: new Date("2024-06-15T07:30"),
    updatedAt: new Date("2024-06-10T09:50"),
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
        user: null,
      },
    ],
    cart: null,
    reviews: [],
    wishlist: [],
  },
  {
    id: 11,
    userName: "domixi",
    email: "domixi@gmail.com",
    fullName: "Độ Mixi",
    lastName: "Mixi",
    phone: "095912345",
    gender: Gender.MALE,
    dob: new Date("1989-03-07"),
    role: UserRole.CUSTOMER,
    active: false,
    createdAt: new Date("2024-06-18T11:15"),
    updatedAt: new Date("2024-06-11T13:40"),
    addresses: [],
    cart: null,
    reviews: [],
    wishlist: [],
  },
];

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading] = useState(false);
  const [language, setLanguage] = useState("vi");
  const pageSize = 10;

  useEffect(() => {
    // Simulate API fetch
    setCustomers(mockCustomers);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, genderFilter]);

  // Helper function to get status labels
  const getStatusLabel = (key) => {
    return statusLabels[language][key] || statusLabels.vi[key];
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.userName.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search);

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && customer.active) ||
      (statusFilter === "inactive" && !customer.active);

    const matchesGender = !genderFilter || customer.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle actions
  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    const action = customer.active
      ? language === "vi"
        ? "vô hiệu hóa"
        : "deactivate"
      : language === "vi"
      ? "kích hoạt"
      : "activate";

    const confirmText = customer.active
      ? language === "vi"
        ? "Vô hiệu hóa"
        : "Deactivate"
      : language === "vi"
      ? "Kích hoạt"
      : "Activate";

    const cancelText = language === "vi" ? "Hủy" : "Cancel";

    showConfirmationToast({
      title:
        language === "vi"
          ? `Xác nhận ${action} khách hàng`
          : `Confirm ${action} customer`,
      message:
        language === "vi"
          ? `Bạn có chắc chắn muốn ${action} khách hàng "${customer.fullName}" không?`
          : `Are you sure you want to ${action} customer "${customer.fullName}"?`,
      confirmText,
      cancelText,
      confirmButtonClass: customer.active
        ? "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer"
        : "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === customerId ? { ...c, active: !c.active } : c
            )
          );
          const successMessage = customer.active
            ? language === "vi"
              ? "Vô hiệu hóa khách hàng thành công!"
              : "Customer deactivated successfully!"
            : language === "vi"
            ? "Kích hoạt khách hàng thành công!"
            : "Customer activated successfully!";

          toast.success(successMessage);
        } catch (error) {
          console.error("Error toggling customer status:", error);
          const errorMessage =
            language === "vi"
              ? `Có lỗi xảy ra khi ${action} khách hàng!`
              : `Error occurred while ${action} customer!`;
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleDelete = async (customerId) => {
    const customer = customers.find((c) => c.id === customerId);

    // Determine action based on current status
    const isActivating = !customer.active;
    const action = isActivating
      ? language === "vi"
        ? "kích hoạt"
        : "activate"
      : language === "vi"
      ? "vô hiệu hóa"
      : "deactivate";

    const confirmText = isActivating
      ? language === "vi"
        ? "Kích hoạt"
        : "Activate"
      : language === "vi"
      ? "Vô hiệu hóa"
      : "Deactivate";

    const cancelText = language === "vi" ? "Hủy" : "Cancel";

    const title = isActivating
      ? language === "vi"
        ? "Xác nhận kích hoạt khách hàng"
        : "Confirm activate customer"
      : language === "vi"
      ? "Xác nhận vô hiệu hóa khách hàng"
      : "Confirm deactivate customer";

    const message = isActivating
      ? language === "vi"
        ? `Bạn có chắc chắn muốn kích hoạt lại khách hàng "${customer.fullName}" không?`
        : `Are you sure you want to activate customer "${customer.fullName}"?`
      : language === "vi"
      ? `Bạn có chắc chắn muốn vô hiệu hóa khách hàng "${customer.fullName}" không? Khách hàng sẽ không thể đăng nhập và sử dụng dịch vụ.`
      : `Are you sure you want to deactivate customer "${customer.fullName}"? The customer will not be able to login and use services.`;

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass: isActivating
        ? "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer"
        : "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === customerId
                ? { ...c, active: !c.active, updatedAt: new Date() }
                : c
            )
          );

          const successMessage = isActivating
            ? language === "vi"
              ? "Kích hoạt khách hàng thành công!"
              : "Customer activated successfully!"
            : language === "vi"
            ? "Vô hiệu hóa khách hàng thành công!"
            : "Customer deactivated successfully!";

          toast.success(successMessage);
        } catch (error) {
          console.error("Error toggling customer status:", error);
          const errorMessage =
            language === "vi"
              ? `Có lỗi xảy ra khi ${action} khách hàng!`
              : `Error occurred while ${action} customer!`;
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleSubmitCustomer = async (customerData) => {
    try {
      if (selectedCustomer) {
        // Update existing customer
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === selectedCustomer.id
              ? { ...c, ...customerData, updatedAt: new Date() }
              : c
          )
        );
        const successMessage =
          language === "vi"
            ? "Cập nhật khách hàng thành công!"
            : "Customer updated successfully!";
        toast.success(successMessage);
      } else {
        // Create new customer
        const newCustomer = {
          id: Math.max(...customers.map((c) => c.id)) + 1,
          ...customerData,
          role: UserRole.CUSTOMER,
          createdAt: new Date(),
          updatedAt: new Date(),
          cart: null,
          reviews: [],
          wishlist: [],
        };
        setCustomers((prev) => [newCustomer, ...prev]);
        const successMessage =
          language === "vi"
            ? "Tạo khách hàng thành công!"
            : "Customer created successfully!";
        toast.success(successMessage);
      }
      setShowEditModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error submitting customer:", error);
      const errorMessage =
        language === "vi"
          ? "Có lỗi xảy ra khi lưu khách hàng!"
          : "Error occurred while saving customer!";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Calculate statistics
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.active).length,
    inactive: customers.filter((c) => !c.active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {language === "vi" ? "Quản lý khách hàng" : "Customer Management"}
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <IconPlus size={20} />
          {language === "vi" ? "Tạo khách hàng" : "Create Customer"}
        </button>
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
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={
                  language === "vi"
                    ? "Tìm kiếm theo tên, email, username, SĐT..."
                    : "Search by name, email, username, phone..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Gender Filter */}
          <div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {language === "vi" ? "Tất cả giới tính" : "All Genders"}
              </option>
              <option value="MALE">{language === "vi" ? "Nam" : "Male"}</option>
              <option value="FEMALE">
                {language === "vi" ? "Nữ" : "Female"}
              </option>
              <option value="OTHER">
                {language === "vi" ? "Khác" : "Other"}
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
          ? `Hiển thị ${paginatedCustomers.length} trên tổng số ${filteredCustomers.length} khách hàng`
          : `Showing ${paginatedCustomers.length} of ${filteredCustomers.length} customers`}
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">ID</th>
              <th className="p-2">
                {language === "vi" ? "Họ tên" : "Full Name"}
              </th>
              <th className="p-2">Email</th>
              <th className="p-2">{language === "vi" ? "SĐT" : "Phone"}</th>
              <th className="p-2">
                {language === "vi" ? "Giới tính" : "Gender"}
              </th>
              <th className="p-2">
                {language === "vi" ? "Ngày sinh" : "Date of Birth"}
              </th>
              <th className="p-2">
                {language === "vi" ? "Trạng thái" : "Status"}
              </th>
              <th className="p-2">
                {language === "vi" ? "Địa chỉ" : "Address"}
              </th>
              <th className="p-2">
                {language === "vi" ? "Ngày tạo" : "Created At"}
              </th>
              <th className="p-2">
                {language === "vi" ? "Hành động" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-4">
                  {language === "vi" ? "Đang tải..." : "Loading..."}
                </td>
              </tr>
            ) : paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-gray-300">
                  <td className="p-2">{customer.id}</td>
                  <td className="p-2 font-semibold">{customer.fullName}</td>
                  <td className="p-2">{customer.email}</td>
                  <td className="p-2">{customer.phone}</td>
                  <td className="p-2">
                    {genderLabels[customer.gender] || "Khác"}
                  </td>
                  <td className="p-2">{formatDate(customer.dob)}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleToggleStatus(customer.id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        customer.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {customer.active
                        ? getStatusLabel("active")
                        : getStatusLabel("inactive")}
                    </button>
                  </td>
                  <td className="p-2">
                    {customer.addresses.length > 0 ? (
                      (() => {
                        const defaultAddress = customer.addresses.find(
                          (a) => a.isDefault
                        );
                        return defaultAddress ? (
                          <div className="max-w-xs">
                            <p
                              className="text-sm truncate"
                              title={`${defaultAddress.street}, ${defaultAddress.ward}, ${defaultAddress.district}, ${defaultAddress.city}, ${defaultAddress.country}`}
                            >
                              {defaultAddress.street}, {defaultAddress.ward},{" "}
                              {defaultAddress.district}, {defaultAddress.city},{" "}
                              {defaultAddress.country}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {language === "vi"
                              ? "Không có địa chỉ mặc định"
                              : "No default address"}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {language === "vi" ? "Chưa có địa chỉ" : "No address"}
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-sm text-gray-600">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(customer)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title={
                          language === "vi" ? "Xem chi tiết" : "View Details"
                        }
                      >
                        <IconEye size={24} />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                        title={language === "vi" ? "Chỉnh sửa" : "Edit"}
                      >
                        <IconEdit size={24} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className={`cursor-pointer ${
                          customer.active
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                        title={
                          language === "vi"
                            ? customer.active
                              ? "Vô hiệu hóa khách hàng"
                              : "Kích hoạt khách hàng"
                            : customer.active
                            ? "Deactivate customer"
                            : "Activate customer"
                        }
                      >
                        <IconTrash size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-4">
                  {language === "vi"
                    ? "Không có khách hàng nào."
                    : "No customers found."}
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

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCustomer(null);
        }}
      />

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleSubmitCustomer}
        customer={selectedCustomer}
      />
    </div>
  );
}
