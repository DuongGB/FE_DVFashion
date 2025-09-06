import { useState, useEffect, useMemo } from "react";
import { IconEdit, IconEye, IconPlus, IconSearch } from "@tabler/icons-react";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import PromotionForm from "../../components/ui/promotion/PromotionForm";
import PromotionDetailModal from "../../components/ui/promotion/PromotionDetailModal";
import { showConfirmationToast } from "../../utils/showConfirmationToast";
import { usePromotion } from "../../hooks/usePromotion";

const typeLabels = {
  PERCENTAGE: "Phần trăm",
  FIXED_AMOUNT: "Tiền mặt",
  FREE_SHIPPING: "Miễn phí vận chuyển",
  BUY_ONE_GET_ONE: "Mua 1 tặng 1",
};

// Translations for status labels
const statusLabels = {
  vi: {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    total: "Tổng khuyến mãi",
    activeCount: "Đang hoạt động",
    inactiveCount: "Không hoạt động",
    expired: "Hết hạn sử dụng",
    allStatus: "Tất cả trạng thái",
    vietnamese: "Tiếng Việt",
    english: "Tiếng Anh",
    managePromotions: "Quản lý Khuyến mãi",
    createPromotion: "Tạo khuyến mãi",
    searchPlaceholder: "Tìm kiếm theo tên, mô tả, ID...",
    showing: "Hiển thị",
    of: "trên tổng số",
    promotions: "khuyến mãi",
    noPromotions: "Không có khuyến mãi nào.",
    loading: "Đang tải...",
    viewDetails: "Xem chi tiết",
    edit: "Chỉnh sửa",
    id: "ID",
    name: "Tên",
    description: "Mô tả",
    type: "Loại",
    value: "Giá trị",
    minOrder: "Min Đơn",
    maxUsage: "Max Lượt",
    startDate: "Bắt đầu",
    endDate: "Kết thúc",
    status: "Trạng thái",
    actions: "Hành động",
  },
  en: {
    active: "Active",
    inactive: "Inactive",
    total: "Total Promotions",
    activeCount: "Active",
    inactiveCount: "Inactive",
    expired: "Expired",
    allStatus: "All Status",
    vietnamese: "Vietnamese",
    english: "English",
    managePromotions: "Manage Promotions",
    createPromotion: "Create Promotion",
    searchPlaceholder: "Search by name, description, ID...",
    showing: "Showing",
    of: "of",
    promotions: "promotions",
    noPromotions: "No promotions found.",
    loading: "Loading...",
    viewDetails: "View Details",
    edit: "Edit",
    id: "ID",
    name: "Name",
    description: "Description",
    type: "Type",
    value: "Value",
    minOrder: "Min Order",
    maxUsage: "Max Usage",
    startDate: "Start Date",
    endDate: "End Date",
    status: "Status",
    actions: "Actions",
  },
};

export default function PromotionPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailPromotion, setSelectedDetailPromotion] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [language, setLanguage] = useState("VI");
  const [loadingItems, setLoadingItems] = useState({
    status: null,
  });
  const [originalOrder, setOriginalOrder] = useState([]);
  const pageSize = 10;

  // Use promotion hook
  const { promotions, isLoading, error, updatePromotion } =
    usePromotion(language);

  // Store original order when promotions first load
  useEffect(() => {
    if (promotions && promotions.length > 0) {
      setOriginalOrder((prev) => {
        if (
          prev.length === 0 ||
          Math.abs(prev.length - promotions.length) > 1
        ) {
          return promotions.map((promotion) => promotion.id);
        }
        return prev;
      });
    }
  }, [promotions]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Helper function to get status labels
  const getStatusLabel = (key) => {
    const langKey = language === "VI" ? "vi" : "en";
    return statusLabels[langKey][key] || statusLabels.vi[key];
  };

  // Sort promotions by original order to maintain position
  const sortedPromotions = useMemo(() => {
    if (!promotions) return [];
    return [...promotions].sort((a, b) => a.id - b.id);
  }, [promotions]);

  // Lọc theo tên và trạng thái
  const filteredPromotions = useMemo(() => {
    return sortedPromotions.filter((promo) => {
      const matchesSearch =
        promo.name?.toLowerCase().includes(search.toLowerCase()) ||
        promo.description?.toLowerCase().includes(search.toLowerCase()) ||
        promo.id?.toString().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && promo.active) ||
        (statusFilter === "inactive" && !promo.active);

      return matchesSearch && matchesStatus;
    });
  }, [sortedPromotions, search, statusFilter]);

  const totalPages = Math.ceil(filteredPromotions.length / pageSize);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate statistics
  const stats = {
    total: sortedPromotions?.length || 0,
    active: sortedPromotions?.filter((p) => p.active).length || 0,
    inactive: sortedPromotions?.filter((p) => !p.active).length || 0,
    expired:
      sortedPromotions?.filter((p) => p.currentUsage >= p.maxUsages).length ||
      0,
  };

  // Xử lý tạo khuyến mãi mới
  const handleCreatePromotion = () => {
    setSelectedPromotion(null);
    setShowForm(true);
  };

  // Xử lý chỉnh sửa khuyến mãi
  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setShowForm(true);
  };

  // Xử lý xem chi tiết khuyến mãi
  const handleViewPromotion = (promotion) => {
    setSelectedDetailPromotion(promotion);
    setShowDetailModal(true);
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPromotion(null);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // Helper function: dùng để làm sạch và chuẩn hóa dữ liệu khuyến mãi trước khi gửi lên API
  const cleanPromotionData = (promotion, newStatus = null) => {
    // Helper function để format date
    const formatDateForAPI = (dateString) => {
      if (!dateString) return null;
      // Nếu đã có format yyyy-MM-dd thì return luôn
      if (dateString.includes("T")) {
        return dateString.split("T")[0];
      }
      return dateString;
    };

    return {
      name: promotion.name,
      description: promotion.description || null,
      type: promotion.type,
      value: promotion.value,
      minOrderAmount: promotion.minOrderAmount || null,
      maxUsages: promotion.maxUsages || null,
      startDate: formatDateForAPI(promotion.startDate),
      endDate: formatDateForAPI(promotion.endDate),
      active: newStatus !== null ? newStatus : promotion.active,
    };
  };

  // Handle toggle status with position preservation
  const handleToggleStatus = async (promotion) => {
    const newStatus = !promotion.active;
    const langKey = language === "VI" ? "vi" : "en";
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
        ? `Xác nhận ${actionText} khuyến mãi`
        : `Confirm ${actionText} promotion`;

    const message =
      langKey === "vi"
        ? `Bạn có chắc chắn muốn ${actionText} khuyến mãi "${promotion.name}" không?`
        : `Are you sure you want to ${actionText} promotion "${promotion.name}"?`;

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
        // Set loading state
        setLoadingItems((prev) => ({ ...prev, status: promotion.id }));

        try {
          // Sử dụng helper function để clean data
          const promotionData = cleanPromotionData(promotion, newStatus);

          await updatePromotion({
            promotionId: promotion.id,
            promotionData,
            lang: language,
          });

          const successMessage =
            langKey === "vi"
              ? `${
                  newStatus ? "Kích hoạt lại" : "Vô hiệu hóa"
                } khuyến mãi thành công!`
              : `Promotion ${
                  newStatus ? "activated" : "deactivated"
                } successfully!`;

          toast.success(successMessage);
        } catch (error) {
          console.error("Error updating promotion status:", error);

          // Log chi tiết lỗi để debug
          if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
          }

          let errorMessage = "Có lỗi xảy ra!";

          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response?.data) {
            // Nếu response.data là string
            errorMessage =
              typeof error.response.data === "string"
                ? error.response.data
                : JSON.stringify(error.response.data);
          } else if (error.message) {
            errorMessage = error.message;
          } else {
            errorMessage =
              langKey === "vi"
                ? `Có lỗi xảy ra khi ${actionText} khuyến mãi!`
                : `Error occurred while ${actionText.replace(
                    " ",
                    "ing"
                  )} promotion!`;
          }

          toast.error(errorMessage);
        } finally {
          // Clear loading state
          setLoadingItems((prev) => ({ ...prev, status: null }));
        }
      },
    });
  };

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">
            {language === "VI"
              ? "Có lỗi xảy ra khi tải danh sách khuyến mãi"
              : "Error loading promotions"}
          </p>
          <p className="text-gray-500 mt-2">
            {error.message ||
              (language === "VI"
                ? "Vui lòng thử lại sau"
                : "Please try again later")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {getStatusLabel("managePromotions")}
        </h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2 transition-colors"
          onClick={handleCreatePromotion}
        >
          <IconPlus size={16} />
          {getStatusLabel("createPromotion")}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {getStatusLabel("total")}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
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
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {getStatusLabel("expired")}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.expired}
              </p>
            </div>
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
                placeholder={getStatusLabel("searchPlaceholder")}
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
              onChange={handleStatusFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{getStatusLabel("allStatus")}</option>
              <option value="active">{getStatusLabel("activeCount")}</option>
              <option value="inactive">
                {getStatusLabel("inactiveCount")}
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
              <option value="VI">{getStatusLabel("vietnamese")}</option>
              <option value="EN">{getStatusLabel("english")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {`${getStatusLabel("showing")} ${
          paginatedPromotions.length
        } ${getStatusLabel("of")} ${filteredPromotions.length} ${getStatusLabel(
          "promotions"
        )}`}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">{getStatusLabel("id")}</th>
              <th className="p-2">{getStatusLabel("name")}</th>
              <th className="p-2">{getStatusLabel("description")}</th>
              <th className="p-2">{getStatusLabel("type")}</th>
              <th className="p-2">{getStatusLabel("value")}</th>
              <th className="p-2">{getStatusLabel("minOrder")}</th>
              <th className="p-2">{getStatusLabel("maxUsage")}</th>
              <th className="p-2">{getStatusLabel("startDate")}</th>
              <th className="p-2">{getStatusLabel("endDate")}</th>
              <th className="p-2">{getStatusLabel("status")}</th>
              <th className="p-2">{getStatusLabel("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    {getStatusLabel("loading")}
                  </div>
                </td>
              </tr>
            ) : paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((promo, index) => (
                <tr
                  key={`promotion-${promo.id}-${index}`}
                  className="border-b hover:bg-gray-300 transition-colors"
                >
                  <td className="p-2">{promo.id}</td>
                  <td className="p-2 font-semibold">{promo.name}</td>
                  <td className="p-2">
                    <div className="max-w-xs">
                      <p className="text-sm truncate" title={promo.description}>
                        {promo.description?.length > 40
                          ? promo.description.slice(0, 40) + "..."
                          : promo.description ||
                            (language === "VI"
                              ? "Không có mô tả"
                              : "No description")}
                      </p>
                    </div>
                  </td>
                  <td className="p-2">
                    {typeLabels[promo.type] || promo.type}
                  </td>
                  <td className="p-2">
                    {promo.type === "PERCENTAGE"
                      ? `${promo.value}%`
                      : promo.type === "FIXED_AMOUNT"
                      ? `${promo.value?.toLocaleString()} VND`
                      : promo.type === "FREE_SHIPPING"
                      ? language === "VI"
                        ? "Miễn phí ship"
                        : "Free shipping"
                      : promo.type === "BUY_ONE_GET_ONE"
                      ? language === "VI"
                        ? "Mua 1 tặng 1"
                        : "Buy 1 Get 1"
                      : promo.value}
                  </td>
                  <td className="p-2">
                    {promo.minOrderAmount?.toLocaleString() || 0} VND
                  </td>
                  <td className="p-2">
                    {promo.maxUsages ||
                      (language === "VI" ? "Không giới hạn" : "Unlimited")}
                  </td>
                  <td className="p-2">{promo.startDate}</td>
                  <td className="p-2">{promo.endDate}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleToggleStatus(promo)}
                      disabled={loadingItems.status === promo.id}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${
                        promo.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      title={
                        language === "VI"
                          ? `Click để ${
                              promo.active ? "vô hiệu hóa" : "kích hoạt lại"
                            }`
                          : `Click to ${
                              promo.active ? "deactivate" : "activate"
                            }`
                      }
                    >
                      {loadingItems.status === promo.id ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        </div>
                      ) : (
                        <>
                          {promo.active
                            ? getStatusLabel("active")
                            : getStatusLabel("inactive")}
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        onClick={() => handleViewPromotion(promo)}
                        title={getStatusLabel("viewDetails")}
                      >
                        <IconEye size={24} />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                        onClick={() => handleEditPromotion(promo)}
                        title={getStatusLabel("edit")}
                      >
                        <IconEdit size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  {getStatusLabel("noPromotions")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredPromotions.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {showForm && (
        <PromotionForm
          isOpen={showForm}
          promotion={selectedPromotion}
          onClose={handleCloseForm}
        />
      )}

      {showDetailModal && (
        <PromotionDetailModal
          open={showDetailModal}
          promotion={selectedDetailPromotion}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDetailPromotion(null);
          }}
        />
      )}
    </div>
  );
}
