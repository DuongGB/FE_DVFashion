import { useState, useEffect, useMemo } from "react";
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import PromotionForm from "../../components/ui/promotion/PromotionForm";
import PromotionDetailModal from "../../components/ui/promotion/PromotionDetailModal";
import { showConfirmationToast } from "../../utils/showConfirmationToast";
import { usePromotion } from "../../hooks/usePromotion";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function PromotionPage() {
  const { t, i18n } = useTranslation();
  // Get language from i18n instead of local state
  const language = i18n.language || "VI";
  const [search, setSearch] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isStaff = user?.roles?.includes("ROLE_STAFF") && !isAdmin;

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailPromotion, setSelectedDetailPromotion] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingItems, setLoadingItems] = useState({
    status: null,
  });
  const pageSize = 10;

  // Use promotion hook
  const { promotions, isLoading, error, deletePromotion } =
    usePromotion(language);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {};

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Xử lý xóa khuyến mãi
  const handleDeletePromotion = (promotion) => {
    if (isStaff) {
      toast.error(
        t("admin.promotion.messages.staff_delete_denied") ||
          "Nhân viên không có quyền xóa khuyến mãi!",
        { autoClose: 2000, position: "top-center" }
      );
      return;
    }

    const title =
      t("admin.promotion.actions.confirm_delete") || "Xóa khuyến mãi";
    const message =
      t("admin.promotion.actions.confirm_delete_message", {
        name: promotion.name,
      }) || `Bạn có chắc muốn xóa khuyến mãi "${promotion.name}"?`;
    const confirmText = t("admin.promotion.actions.delete") || "Delete";
    const cancelText = t("admin.promotion.actions.cancel") || "Cancel";

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass:
        "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors cursor-pointer",
      onConfirm: async () => {
        setLoadingItems((prev) => ({ ...prev, status: promotion.id }));
        try {
          await deletePromotion({ promotionId: promotion.id, lang: language });
          toast.success(
            t("admin.promotion.actions.delete_success") || "Promotion deleted"
          );
        } catch (err) {
          console.error("Error deleting promotion:", err);
          const msg =
            err?.response?.data?.message ||
            err.message ||
            t("admin.promotion.actions.delete_error") ||
            "Delete failed";
          toast.error(msg);
        } finally {
          setLoadingItems((prev) => ({ ...prev, status: null }));
        }
      },
    });
  };

  // Helper function: Chuyển đổi định dạng ngày tháng theo ngôn ngữ
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const time = date.toLocaleTimeString(
      language === "VI" ? "vi-VN" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-based
    const year = date.getFullYear();
    return `${time} ${day}/${month}/${year}`;
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Sort promotions by id
  const sortedPromotions = useMemo(() => {
    if (!promotions) return [];
    return [...promotions].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
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
      sortedPromotions?.filter(
        (p) =>
          (p.currentUsage ?? 0) >= (p.maxUsages ?? Number.POSITIVE_INFINITY)
      ).length || 0,
  };

  // Xử lý tạo khuyến mãi mới
  const handleCreatePromotion = () => {
    if (isStaff) {
      toast.error(
        t("admin.promotion.messages.staff_create_denied") ||
          "Nhân viên không có quyền tạo khuyến mãi!",
        { autoClose: 2000, position: "top-center" }
      );
      return;
    }
    setSelectedPromotion(null);
    setShowForm(true);
  };

  // Xử lý chỉnh sửa khuyến mãi
  const handleEditPromotion = (promotion) => {
    if (isStaff) {
      toast.error(
        t("admin.promotion.messages.staff_edit_denied") ||
          "Nhân viên không có quyền chỉnh sửa khuyến mãi!",
        { autoClose: 2000, position: "top-right" }
      );
      return;
    }
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
      maxUsages: promotion.maxUsages || null,
      startDate: formatDateForAPI(promotion.startDate),
      endDate: formatDateForAPI(promotion.endDate),
      active: newStatus !== null ? newStatus : promotion.active,
      // keep promotionProducts if exists (backend requires it on create; on update it can be omitted)
      ...(promotion.promotionProducts
        ? { promotionProducts: promotion.promotionProducts }
        : {}),
      // bannerFile should be handled by PromotionForm when submitting; toggle action doesn't include file
    };
  };

  // Handle toggle status with position preservation
  // const handleToggleStatus = async (promotion) => {
  //   // Kiểm tra quyền trước khi thực hiện
  //   if (isStaff) {
  //     toast.error(
  //       t("admin.promotion.messages.staff_status_denied") ||
  //         "Nhân viên không có quyền thay đổi trạng thái khuyến mãi!",
  //       { autoClose: 2000, position: "top-center" }
  //     );
  //     return;
  //   }

  //   const newStatus = !promotion.active;
  //   const actionText = newStatus
  //     ? t("admin.promotion.actions.activate")
  //     : t("admin.promotion.actions.deactivate");

  //   // Sử dụng translation key thay vì hardcoded text
  //   const confirmText = newStatus
  //     ? t("admin.promotion.actions.activate")
  //     : t("admin.promotion.actions.deactivate");

  //   const cancelText = language === "VI" ? "Hủy" : "Cancel";

  //   const title = newStatus
  //     ? t("admin.promotion.actions.confirm_activate")
  //     : t("admin.promotion.actions.confirm_deactivate");

  //   const message = t("admin.promotion.actions.confirm_message", {
  //     action: actionText,
  //     name: promotion.name,
  //   });

  //   showConfirmationToast({
  //     title,
  //     message,
  //     confirmText,
  //     cancelText,
  //     confirmButtonClass: `${
  //       newStatus
  //         ? "bg-green-600 hover:bg-green-700"
  //         : "bg-red-600 hover:bg-red-700"
  //     } text-white px-3 py-1 rounded transition-colors cursor-pointer`,
  //     onConfirm: async () => {
  //       // Set loading state
  //       setLoadingItems((prev) => ({ ...prev, status: promotion.id }));

  //       try {
  //         // Sử dụng helper function để clean data
  //         const promotionData = cleanPromotionData(promotion, newStatus);

  //         await updatePromotion({
  //           promotionId: promotion.id,
  //           promotionData,
  //           lang: language,
  //         });

  //         const successMessage = newStatus
  //           ? t("admin.promotion.actions.success_activate")
  //           : t("admin.promotion.actions.success_deactivate");

  //         toast.success(successMessage);
  //       } catch (error) {
  //         console.error("Error updating promotion status:", error);

  //         // If unauthorized, show message and optionally redirect to login
  //         const status = error?.response?.status;
  //         const respData = error?.response?.data;

  //         if (status === 401) {
  //           const msg =
  //             respData?.error?.message ||
  //             respData?.message ||
  //             t("admin.promotion.errors.unauthorized") ||
  //             "Unauthorized. Please login.";
  //           toast.error(msg, { autoClose: 3000, position: "top-center" });
  //           // optional: navigate to login page
  //           // navigate("/login");
  //           return;
  //         }

  //         // Build friendly error message
  //         let errorMessage = t("admin.promotion.actions.error_activate");

  //         if (respData?.message) {
  //           errorMessage = respData.message;
  //         } else if (respData?.error?.message) {
  //           errorMessage = respData.error.message;
  //         } else if (error.message) {
  //           errorMessage = error.message;
  //         } else {
  //           errorMessage = newStatus
  //             ? t("admin.promotion.actions.error_activate")
  //             : t("admin.promotion.actions.error_deactivate");
  //         }

  //         toast.error(errorMessage);
  //       } finally {
  //         // Clear loading state
  //         setLoadingItems((prev) => ({ ...prev, status: null }));
  //       }
  //     },
  //   });
  // };

  // Handle error state
  if (error) {
    // Normalize possible axios error shapes
    const resp = error?.response?.data ?? error;
    const message =
      resp?.error?.message ||
      resp?.message ||
      (language === "VI"
        ? "Có lỗi xảy ra khi tải danh sách khuyến mãi"
        : "Error loading promotions");

    const details =
      resp?.error?.code || resp?.statusCode
        ? ` (${resp?.error?.code ?? resp?.statusCode})`
        : "";

    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">{message + details}</p>
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
          {t("admin.promotion.title")}
        </h1>
        <div className="flex items-center gap-4">
          {!isStaff && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2 transition-colors"
              onClick={handleCreatePromotion}
            >
              <IconPlus size={16} />
              {t("admin.promotion.create_promotion")}
            </button>
          )}
          {isStaff && (
            <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
              <span className="font-medium text-yellow-800">
                {t("admin.promotion.staff_view_only") ||
                  "Chế độ xem - Không thể chỉnh sửa"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.promotion.total_promotions")}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.promotion.active_promotions")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.promotion.inactive_promotions")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.promotion.expired_promotions")}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.expired}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={t("admin.promotion.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t("admin.promotion.all_status")}</option>
              <option value="active">
                {t("admin.promotion.active_promotions")}
              </option>
              <option value="inactive">
                {t("admin.promotion.inactive_promotions")}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {t("admin.promotion.showing_results", {
          current: paginatedPromotions.length,
          total: filteredPromotions.length,
        })}
      </div>

      {/* Table */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">{t("admin.promotion.columns.id")}</th>
              <th className="p-2">{t("admin.promotion.columns.name")}</th>
              <th className="p-2">
                {t("admin.promotion.columns.description")}
              </th>
              <th className="p-2">{t("admin.promotion.columns.type")}</th>
              <th className="p-2">{t("admin.promotion.columns.max_usage")}</th>
              <th className="p-2">{t("admin.promotion.columns.start_date")}</th>
              <th className="p-2">{t("admin.promotion.columns.end_date")}</th>
              <th className="p-2">{t("admin.promotion.columns.status")}</th>
              <th className="p-2">{t("admin.promotion.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    {t("admin.promotion.loading")}
                  </div>
                </td>
              </tr>
            ) : paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((promo, index) => (
                <tr
                  key={`promotion-${promo.id}-${index}`}
                  className="border-b hover:bg-white/80 transition-colors"
                >
                  <td className="p-2">{promo.id}</td>
                  <td className="p-2 font-semibold">{promo.name}</td>
                  <td className="p-2">
                    <div className="max-w-xs">
                      <p className="text-sm truncate" title={promo.description}>
                        {promo.description?.length > 40
                          ? promo.description.slice(0, 40) + "..."
                          : promo.description ||
                            t("admin.promotion.no_description")}
                      </p>
                    </div>
                  </td>
                  <td className="p-2">{promo.type}</td>
                  <td className="p-2">
                    {promo.maxUsages || t("admin.promotion.value.unlimited")}
                  </td>
                  <td className="p-2">{formatDateTime(promo.startDate)}</td>
                  <td className="p-2">{formatDateTime(promo.endDate)}</td>
                  <td className="p-2">
                    {isStaff ? (
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          promo.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {promo.active
                          ? t("admin.promotion.status.active")
                          : t("admin.promotion.status.inactive")}
                      </span>
                    ) : (
                      <button
                        disabled={loadingItems.status === promo.id}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all duration-150  disabled:opacity-50 hover:opacity-80 ${
                          promo.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        title={
                          promo.active
                            ? t("admin.promotion.actions.tooltip_deactivate")
                            : t("admin.promotion.actions.tooltip_activate")
                        }
                      >
                        {loadingItems.status === promo.id ? (
                          <div className="flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          </div>
                        ) : (
                          <>
                            {promo.active
                              ? t("admin.promotion.status.active")
                              : t("admin.promotion.status.inactive")}
                          </>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        onClick={() => handleViewPromotion(promo)}
                        title={t("admin.promotion.actions.view_details")}
                      >
                        <IconEye size={18} />
                      </button>
                      {!isStaff ? (
                        <button
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                          onClick={() => handleEditPromotion(promo)}
                          title={t("admin.promotion.actions.edit")}
                        >
                          <IconEdit size={18} />
                        </button>
                      ) : (
                        <button
                          className="text-gray-400 p-1 cursor-not-allowed opacity-50"
                          onClick={() => handleEditPromotion(promo)}
                          title={
                            t("admin.promotion.staff_no_permission") ||
                            "Không có quyền chỉnh sửa"
                          }
                        >
                          <IconEdit size={18} />
                        </button>
                      )}
                      {!isStaff && (
                        <button
                          className="text-red-600 hover:text-red-800 cursor-pointer p-1 rounded over:bg-red-50 transition-colors"
                          onClick={() => handleDeletePromotion(promo)}
                          title={t("admin.promotion.actions.delete")}
                        >
                          <IconTrash size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  {t("admin.promotion.no_promotions")}
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

      {!isStaff && showForm && (
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
