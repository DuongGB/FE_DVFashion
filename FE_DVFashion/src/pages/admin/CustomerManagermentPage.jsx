import { IconEdit, IconEye, IconSearch, IconUsers } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import CustomerDetailModal from "../../components/ui/customer/CustomerDetailModal";
import CustomerForm from "../../components/ui/customer/CustomerForm";
import { useUser } from "../../hooks/useUser";
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

export default function CustomerManagementPage() {
  const { users, isLoadingUsers, usersError, updateUser, updateUserError } =
    useUser();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [language, setLanguage] = useState("vi");
  const [loadingItems, setLoadingItems] = useState({
    status: null,
  });
  const [originalOrder, setOriginalOrder] = useState([]); // Store original order
  const pageSize = 10;

  // Store original order when users first load
  useEffect(() => {
    if (users && users.length > 0 && originalOrder.length === 0) {
      const customerIds = users
        .filter((user) => user.role === "CUSTOMER")
        .map((customer) => customer.id);
      setOriginalOrder(customerIds);
    }
  }, [users, originalOrder.length]);

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

  // Filter customers with stable sorting (similar to BrandPage)
  const customers = useMemo(() => {
    if (!users) return [];
    return users
      .filter((user) => user.role === "CUSTOMER")
      .sort((a, b) => a.id - b.id);
  }, [users]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase()) ||
        customer.userName?.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone?.includes(search);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && customer.active) ||
        (statusFilter === "inactive" && !customer.active);

      const matchesGender = !genderFilter || customer.gender === genderFilter;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }, [customers, search, statusFilter, genderFilter]);

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

  // Handle toggle status with position preservation (similar to BrandPage)
  const handleToggleStatus = async (customer) => {
    const newStatus = !customer.active;
    console.log("🔄 Toggle status for customer:", {
      customerId: customer.id,
      currentStatus: customer.active,
      newStatus: newStatus,
      customerData: customer,
    });

    const actionText = newStatus
      ? language === "vi"
        ? "kích hoạt lại"
        : "activate"
      : language === "vi"
      ? "vô hiệu hóa"
      : "deactivate";

    const confirmText = newStatus
      ? language === "vi"
        ? "Kích hoạt"
        : "Activate"
      : language === "vi"
      ? "Vô hiệu hóa"
      : "Deactivate";

    const cancelText = language === "vi" ? "Hủy" : "Cancel";

    const title =
      language === "vi"
        ? `Xác nhận ${actionText} khách hàng`
        : `Confirm ${actionText} customer`;

    const message =
      language === "vi"
        ? `Bạn có chắc chắn muốn ${actionText} khách hàng "${customer.fullName}" không?`
        : `Are you sure you want to ${actionText} customer "${customer.fullName}"?`;

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
        console.log("✅ User confirmed the action");
        // Set loading state
        setLoadingItems((prev) => ({ ...prev, status: customer.id }));

        try {
          console.log("📤 Sending update request:", {
            userId: customer.id,
            userData: { active: newStatus },
          });

          const response = await updateUser({
            userId: customer.id,
            userData: { active: newStatus },
          });

          console.log("📥 Update response:", response);

          const successMessage =
            language === "vi"
              ? `${
                  newStatus ? "Kích hoạt lại" : "Vô hiệu hóa"
                } khách hàng thành công!`
              : `Customer ${
                  newStatus ? "activated" : "deactivated"
                } successfully!`;

          toast.success(successMessage);
        } catch (error) {
          console.error("❌ Error updating customer status:", error);
          console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });

          const errorMessage =
            language === "vi"
              ? `Có lỗi xảy ra khi ${actionText} khách hàng!`
              : `Error occurred while ${actionText.replace(
                  " ",
                  "ing"
                )} customer!`;
          toast.error(errorMessage);
        } finally {
          console.log("🔄 Clearing loading state");
          // Clear loading state
          setLoadingItems((prev) => ({ ...prev, status: null }));
        }
      },
    });
  };

  // Calculate statistics
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.active).length,
    inactive: customers.filter((c) => !c.active).length,
  };

  // Show error if any
  useEffect(() => {
    if (usersError) {
      toast.error(
        usersError.message || "Có lỗi xảy ra khi tải dữ liệu khách hàng"
      );
    }
  }, [usersError]);

  useEffect(() => {
    if (updateUserError) {
      toast.error(
        updateUserError.message || "Có lỗi xảy ra khi cập nhật khách hàng"
      );
    }
  }, [updateUserError]);

  // Handle error state
  if (usersError && !users) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold mb-2">
            {language === "vi" ? "Lỗi tải dữ liệu" : "Error Loading Data"}
          </h3>
          <p className="text-sm">
            {usersError.message ||
              (language === "vi"
                ? "Không thể tải danh sách khách hàng"
                : "Unable to load customer list")}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {language === "vi" ? "Quản lý khách hàng" : "Customer Management"}
        </h1>
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
              <th className="p-3">ID</th>
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
              <th className="p-3">
                {language === "vi" ? "Trạng thái" : "Status"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Địa chỉ" : "Address"}
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
                <td colSpan={10} className="text-center text-gray-500 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    {language === "vi" ? "Đang tải..." : "Loading..."}
                  </div>
                </td>
              </tr>
            ) : paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer, index) => (
                <tr
                  key={`customer-${customer.id}-${index}`}
                  className="border-b hover:bg-gray-300 transition-colors"
                >
                  <td className="p-3">{customer.id}</td>
                  <td className="p-3 font-semibold">
                    {customer.fullName || "N/A"}
                  </td>
                  <td className="p-3">{customer.email}</td>
                  <td className="p-3">{customer.phone || "N/A"}</td>
                  <td className="p-3">
                    {genderLabels[customer.gender] || "Khác"}
                  </td>
                  <td className="p-3">
                    {customer.dob ? formatDate(customer.dob) : "N/A"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(customer)}
                      disabled={loadingItems.status === customer.id}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${
                        customer.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      title={
                        language === "vi"
                          ? `Click để ${
                              customer.active ? "vô hiệu hóa" : "kích hoạt lại"
                            }`
                          : `Click to ${
                              customer.active ? "deactivate" : "activate"
                            }`
                      }
                    >
                      {loadingItems.status === customer.id ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        </div>
                      ) : (
                        <>
                          {customer.active
                            ? getStatusLabel("active")
                            : getStatusLabel("inactive")}
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3">
                    {customer.addresses && customer.addresses.length > 0 ? (
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
                  <td className="p-3 text-sm text-gray-600">
                    {formatDate(customer.createAt)}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(customer)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        title={
                          language === "vi" ? "Xem chi tiết" : "View Details"
                        }
                      >
                        <IconEye size={24} />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
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
                <td colSpan={10} className="text-center text-gray-500 p-4">
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
        customer={selectedCustomer}
      />
    </div>
  );
}
