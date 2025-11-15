import { useState, useEffect, useMemo } from "react";
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconRefresh,
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
  const language = i18n.language || "VI";
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isStaff = user?.roles?.includes("ROLE_STAFF") && !isAdmin;

  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1); // 1-based for UI
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailPromotion, setSelectedDetailPromotion] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingItems, setLoadingItems] = useState({ status: null });
  const pageSize = 10;

  // Debounce searchInput -> setSearch sau 1.5s không gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    usePromotionsPaging,
    useActivePromotionsPaging,
    deletePromotion,
    refetch,
  } = usePromotion(language);

  // Trigger both hooks but enable only the relevant one (avoid conditional hook calls)
  const adminQuery = usePromotionsPaging({
    page: currentPage - 1, // backend is 0-based
    size: pageSize,
    enabled: !isStaff,
  });
  const publicQuery = useActivePromotionsPaging({
    page: currentPage - 1,
    size: pageSize,
    enabled: isStaff,
  });

  const query = isStaff ? publicQuery : adminQuery;

  const promotionsPage = query.data ?? {
    page: currentPage - 1,
    size: pageSize,
    totalElements: 0,
    totalPages: 0,
    sorts: [],
    values: [],
    filters: null,
    last: true,
  };

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {};
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

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

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const time = date.toLocaleTimeString(
      language === "VI" ? "vi-VN" : "en-US",
      { hour: "2-digit", minute: "2-digit", second: "2-digit" }
    );
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${time} ${day}/${month}/${year}`;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Sort current page by id asc (server-side sort could be added later)
  const sortedPromotions = useMemo(() => {
    const values = promotionsPage?.values ?? [];
    return [...values].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [promotionsPage?.values]);

  // Filter only within current page (server doesn't support filters/search)
  const filteredPromotions = useMemo(() => {
    return sortedPromotions.filter((promo) => {
      const s = search.trim().toLowerCase();
      const matchesSearch =
        !s ||
        promo.name?.toLowerCase().includes(s) ||
        promo.description?.toLowerCase().includes(s) ||
        promo.id?.toString().includes(s);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && promo.active) ||
        (statusFilter === "inactive" && !promo.active);

      return matchesSearch && matchesStatus;
    });
  }, [sortedPromotions, search, statusFilter]);

  const totalPages = promotionsPage?.totalPages || 0;

  const stats = {
    // Total from backend across all items
    total: promotionsPage?.totalElements || 0,
    // Per-page stats (since server doesn’t provide global breakdowns)
    active: sortedPromotions?.filter((p) => p.active).length || 0,
    inactive: sortedPromotions?.filter((p) => !p.active).length || 0,
    expired:
      sortedPromotions?.filter(
        (p) =>
          (p.currentUsage ?? 0) >= (p.maxUsages ?? Number.POSITIVE_INFINITY)
      ).length || 0,
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle create/edit/view remain unchanged
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

  const handleViewPromotion = (promotion) => {
    setSelectedDetailPromotion(promotion);
    setShowDetailModal(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPromotion(null);
  };

  // Error UI (admin or staff query)
  if (query.error) {
    const resp = query.error?.response?.data ?? query.error;
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
            {query.error.message ||
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

      {/* Filters + Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
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
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearch(searchInput);
                        setCurrentPage(1);
                      }
                    }}
                    className="backdrop-blur-sm bg-white/80 border border-white/30 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl"
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
              <div className="flex items-center h-full">
                <button
                  type="button"
                  onClick={() => query.refetch && query.refetch()}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer"
                  title={t("common.refresh") || "Làm mới"}
                >
                  <IconRefresh size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {t("admin.promotion.showing_results", {
          current: filteredPromotions.length,
          total: promotionsPage.totalElements || 0,
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
            {query.isLoading ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    {t("admin.promotion.loading")}
                  </div>
                </td>
              </tr>
            ) : filteredPromotions.length > 0 ? (
              filteredPromotions.map((promo, index) => (
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
        totalItems={promotionsPage.totalElements || 0}
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
