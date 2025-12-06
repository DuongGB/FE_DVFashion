import { useState, useEffect, useMemo } from "react";
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconRefresh,
  IconFilter,
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
import LoadingSpinner from "../../utils/LoadingSpinner";

export default function PromotionPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

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
  const [loadingItems, setLoadingItems] = useState({ status: null });
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  // Debounce searchInput
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

  const adminQuery = usePromotionsPaging({
    page: currentPage - 1,
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

  useEffect(() => {
    const handleLanguageChange = () => {};
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const handleDeletePromotion = (promotion) => {
    if (isStaff) {
      toast.error(t("admin.promotion.messages.staff_delete_denied"), {
        autoClose: 2000,
        position: "top-center",
      });
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
          toast.success(t("admin.promotion.actions.delete_success"));
        } catch (err) {
          console.error("Error deleting promotion:", err);
          const msg = t("admin.promotion.actions.delete_error");
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

  const sortedPromotions = useMemo(() => {
    const values = promotionsPage?.values ?? [];
    return [...values].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [promotionsPage?.values]);

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
    total: promotionsPage?.totalElements || 0,
    active: sortedPromotions?.filter((p) => p.active).length || 0,
    inactive: sortedPromotions?.filter((p) => !p.active).length || 0,
    expired:
      sortedPromotions?.filter(
        (p) =>
          (p.currentUsage ?? 0) >= (p.maxUsages ?? Number.POSITIVE_INFINITY)
      ).length || 0,
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

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
      <div className="space-y-6 p-2 sm:p-4 lg:p-0">
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
          {t("admin.promotion.title")}
        </h1>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {!isStaff && (
            <button
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2 transition-colors text-sm sm:text-base flex-1 sm:flex-initial justify-center"
              onClick={handleCreatePromotion}
            >
              <IconPlus size={16} />
              <span className="hidden xs:inline">
                {t("admin.promotion.create_promotion")}
              </span>
              <span className="xs:hidden">
                {t("admin.promotion.create_promotion")}
              </span>
            </button>
          )}
          {isStaff && (
            <div className="text-xs sm:text-sm text-gray-600 bg-yellow-50 px-2 sm:px-3 py-2 rounded-lg border border-yellow-200 w-full sm:w-auto text-center">
              <span className="font-medium text-yellow-800">
                {t("admin.promotion.staff_view_only") ||
                  "Chế độ xem - Không thể chỉnh sửa"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {t("admin.promotion.total_promotions")}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {t("admin.promotion.active_promotions")}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {t("admin.promotion.inactive_promotions")}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {t("admin.promotion.expired_promotions")}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                {stats.expired}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Toggle Button - Mobile */}
      <div className="lg:hidden backdrop-blur-xl bg-white/60 border border-white/30 p-3 rounded-lg shadow-lg">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between text-gray-700 font-medium"
        >
          <span className="flex items-center gap-2 text-sm sm:text-base">
            <IconFilter size={18} />
            {t("common.filter")}
          </span>
          <span className="text-sm">{showFilters ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Filters */}
      <div
        className={`backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 rounded-lg shadow-lg ${
          showFilters ? "block" : "hidden"
        } lg:block`}
      >
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 lg:flex-[2]">
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
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl text-sm sm:text-base"
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

          {/* Refresh Button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => query.refetch && query.refetch()}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer text-sm sm:text-base"
              title={t("common.refresh") || "Làm mới"}
            >
              <IconRefresh size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="px-2 sm:px-0 text-xs sm:text-sm text-gray-600">
        {t("admin.promotion.showing_results", {
          current: filteredPromotions.length,
          total: promotionsPage.totalElements || 0,
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-400">
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.id")}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.name")}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.description")}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.type")}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.max_usage")}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.start_date")}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.end_date")}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.status")}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.promotion.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={11} className="text-center text-gray-500 p-4">
                    <LoadingSpinner
                      message={t("admin.promotion.loading")}
                      size="large"
                    />
                  </td>
                </tr>
              ) : filteredPromotions.length > 0 ? (
                filteredPromotions.map((promo, index) => (
                  <tr
                    key={`promotion-${promo.id}-${index}`}
                    className="border-b hover:bg-white/80 transition-colors"
                  >
                    <td className="p-2 text-sm">{promo.id}</td>
                    <td className="p-2 font-semibold text-sm">{promo.name}</td>
                    <td className="p-2">
                      <div className="max-w-xs">
                        <p
                          className="text-sm truncate"
                          title={promo.description}
                        >
                          {promo.description?.length > 40
                            ? promo.description.slice(0, 40) + "..."
                            : promo.description ||
                              t("admin.promotion.no_description")}
                        </p>
                      </div>
                    </td>
                    <td className="p-2 text-sm">{promo.type}</td>
                    <td className="p-2 text-sm">
                      {promo.maxUsages || t("admin.promotion.value.unlimited")}
                    </td>
                    <td className="p-2 text-sm">
                      {formatDateTime(promo.startDate)}
                    </td>
                    <td className="p-2 text-sm">
                      {formatDateTime(promo.endDate)}
                    </td>
                    <td className="p-2">
                      {isStaff ? (
                        <span
                          className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium ${
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
                          className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all duration-150 disabled:opacity-50 hover:opacity-80 ${
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
                    <td className="p-2">
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
                            className="text-red-600 hover:text-red-800 cursor-pointer p-1 rounded hover:bg-red-50 transition-colors"
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
                  <td
                    colSpan={11}
                    className="text-center py-6 text-gray-500 text-sm"
                  >
                    {t("admin.promotion.no_promotions")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {query.isLoading ? (
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg text-center">
            <LoadingSpinner
              message={t("admin.promotion.loading")}
              size="large"
            />
          </div>
        ) : filteredPromotions.length > 0 ? (
          filteredPromotions.map((promo, index) => (
            <div
              key={`promotion-${promo.id}-${index}`}
              className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{promo.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">ID: {promo.id}</p>
                </div>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs flex-shrink-0 ${
                    promo.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {promo.active
                    ? t("admin.promotion.status.active")
                    : t("admin.promotion.status.inactive")}
                </span>
              </div>

              {/* Description */}
              {promo.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {promo.description}
                </p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500 mb-1">
                    {t("admin.promotion.columns.type")}
                  </p>
                  <p className="font-medium">{promo.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">
                    {t("admin.promotion.columns.max_usage")}
                  </p>
                  <p className="font-medium">
                    {promo.maxUsages || t("admin.promotion.value.unlimited")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">
                    {t("admin.promotion.columns.start_date")}
                  </p>
                  <p className="font-medium text-xs">
                    {formatDateTime(promo.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">
                    {t("admin.promotion.columns.end_date")}
                  </p>
                  <p className="font-medium text-xs">
                    {formatDateTime(promo.endDate)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleViewPromotion(promo)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 cursor-pointer text-sm"
                >
                  <IconEye size={16} />
                  {t("admin.promotion.actions.view_details")}
                </button>
                {!isStaff ? (
                  <button
                    onClick={() => handleEditPromotion(promo)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 cursor-pointer text-sm"
                  >
                    <IconEdit size={16} />
                    {t("admin.promotion.actions.edit")}
                  </button>
                ) : (
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm"
                    disabled
                  >
                    <IconEdit size={16} />
                    {t("admin.promotion.actions.edit")}
                  </button>
                )}
                {!isStaff && (
                  <button
                    onClick={() => handleDeletePromotion(promo)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-sm"
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg text-center text-gray-500 text-sm">
            {t("admin.promotion.no_promotions")}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center px-2 sm:px-0">
        <Pagination
          currentPage={currentPage}
          totalItems={promotionsPage.totalElements || 0}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Modals */}
      {!isStaff && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <PromotionForm
              isOpen={showForm}
              promotion={selectedPromotion}
              onClose={handleCloseForm}
            />
          </div>
        </div>
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
