import { IconEdit, IconEye, IconSearch, IconUsers } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import CustomerDetailModal from "../../components/ui/customer/CustomerDetailModal";
import CustomerForm from "../../components/ui/customer/CustomerForm";
import { useUser } from "../../hooks/useUser";
import { showConfirmationToast } from "../../utils/showConfirmationToast";
import { useTranslation } from "react-i18next";

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

export default function CustomerManagementPage() {
  const { t, i18n } = useTranslation();
  const { users, isLoadingUsers, usersError, updateUser, updateUserError } =
    useUser();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingItems, setLoadingItems] = useState({
    status: null,
  });
  const [originalOrder, setOriginalOrder] = useState([]);
  const pageSize = 10;

  // Get language from i18n instead of local state
  const language = i18n.language || "VI";

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

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

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(
      language === "VI" ? "vi-VN" : "en-US"
    );
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
    const actionText = newStatus
      ? t("admin.customer.actions.activate")
      : t("admin.customer.actions.deactivate");

    const confirmText = newStatus
      ? t("admin.customer.actions.activate")
      : t("admin.customer.actions.deactivate");

    const cancelText = language === "VI" ? "Hủy" : "Cancel";

    const title = newStatus
      ? t("admin.customer.actions.confirm_activate")
      : t("admin.customer.actions.confirm_deactivate");

    const message = t("admin.customer.actions.confirm_message", {
      action: actionText,
      name: customer.fullName,
    });

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

          const successMessage = newStatus
            ? t("admin.customer.actions.success_activate")
            : t("admin.customer.actions.success_deactivate");

          toast.success(successMessage);
        } catch (error) {
          console.error("❌ Error updating customer status:", error);
          console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });

          const errorMessage = newStatus
            ? t("admin.customer.actions.error_activate")
            : t("admin.customer.actions.error_deactivate");
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
        usersError.message ||
          (language === "VI"
            ? "Có lỗi xảy ra khi tải dữ liệu khách hàng"
            : "Error occurred while loading customer data")
      );
    }
  }, [usersError, language]);

  useEffect(() => {
    if (updateUserError) {
      toast.error(
        updateUserError.message ||
          (language === "VI"
            ? "Có lỗi xảy ra khi cập nhật khách hàng"
            : "Error occurred while updating customer")
      );
    }
  }, [updateUserError, language]);

  // Handle error state
  if (usersError && !users) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold mb-2">
            {t("admin.customer.error.loading_title")}
          </h3>
          <p className="text-sm">
            {usersError.message || t("admin.customer.error.loading_message")}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("admin.customer.error.try_again")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("admin.customer.title")}
        </h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.customer.total_customers")}
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
                {t("admin.customer.active_customers")}
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
                {t("admin.customer.inactive_customers")}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={t("admin.customer.search_placeholder")}
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
              <option value="">{t("admin.customer.all_status")}</option>
              <option value="active">
                {t("admin.customer.active_customers")}
              </option>
              <option value="inactive">
                {t("admin.customer.inactive_customers")}
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
              <option value="">{t("admin.customer.all_genders")}</option>
              <option value="MALE">{t("admin.customer.gender.MALE")}</option>
              <option value="FEMALE">
                {t("admin.customer.gender.FEMALE")}
              </option>
              <option value="OTHER">{t("admin.customer.gender.OTHER")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {t("admin.customer.showing_results", {
          current: paginatedCustomers.length,
          total: filteredCustomers.length,
        })}
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">{t("admin.customer.columns.id")}</th>
              <th className="p-3">{t("admin.customer.columns.full_name")}</th>
              <th className="p-3">{t("admin.customer.columns.email")}</th>
              <th className="p-3">{t("admin.customer.columns.phone")}</th>
              <th className="p-3">{t("admin.customer.columns.gender")}</th>
              <th className="p-3">
                {t("admin.customer.columns.date_of_birth")}
              </th>
              <th className="p-3">{t("admin.customer.columns.status")}</th>
              <th className="p-3">{t("admin.customer.columns.address")}</th>
              <th className="p-3">{t("admin.customer.columns.created_at")}</th>
              <th className="p-3">{t("admin.customer.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingUsers ? (
              <tr>
                <td colSpan={10} className="text-center text-gray-500 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    {t("admin.customer.loading")}
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
                    {t(`admin.customer.gender.${customer.gender}`) ||
                      t("admin.customer.gender.OTHER")}
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
                        customer.active
                          ? t("admin.customer.actions.tooltip_deactivate")
                          : t("admin.customer.actions.tooltip_activate")
                      }
                    >
                      {loadingItems.status === customer.id ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        </div>
                      ) : (
                        <>
                          {customer.active
                            ? t("admin.customer.status.active")
                            : t("admin.customer.status.inactive")}
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
                            {t("admin.customer.address.no_default_address")}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {t("admin.customer.address.no_address")}
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
                        title={t("admin.customer.actions.view_details")}
                      >
                        <IconEye size={24} />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                        title={t("admin.customer.actions.edit")}
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
                  {t("admin.customer.no_customers")}
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
