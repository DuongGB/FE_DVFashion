import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconRefresh,
  IconFilter,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import VoucherDetailModal from "../../components/ui/voucher/VoucherDetailModal";
import VoucherForm from "../../components/ui/voucher/VoucherForm";
import useVoucher from "../../hooks/useVoucher";
import { showConfirmationToast } from "../../utils/showConfirmationToast";

export default function VoucherPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const size = 12;
  const [showFilters, setShowFilters] = useState(false);

  // Debounce searchInput -> setSearch sau 1s không gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    pagedVouchers,
    isLoadingPagedVouchers,
    deleteVoucher,
    isDeleting,
    refetchPaged,
  } = useVoucher({ page: page - 1, size });

  const [showForm, setShowForm] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailVoucher, setSelectedDetailVoucher] = useState(null);

  const handleView = (v) => {
    setSelectedDetailVoucher(v);
    setShowDetailModal(true);
  };

  const vouchersContent = useMemo(() => {
    if (!pagedVouchers) return [];
    return pagedVouchers.values || [];
  }, [pagedVouchers]);

  const totalPages =
    pagedVouchers?.totalPages ??
    Math.ceil(
      (pagedVouchers?.totalElements ?? vouchersContent.length) / size
    ) ??
    0;
  const totalElements = pagedVouchers?.totalElements ?? vouchersContent.length;

  useEffect(() => {
    const onLang = () => {};
    i18n.on("languageChanged", onLang);
    return () => void i18n.off("languageChanged", onLang);
  }, [i18n]);

  // sort & filter
  const sortedVouchers = useMemo(() => {
    return [...(vouchersContent || [])].sort(
      (a, b) => (a.id ?? 0) - (b.id ?? 0)
    );
  }, [vouchersContent]);

  const filtered = useMemo(() => {
    return sortedVouchers.filter((v) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(v.id).includes(q) ||
        (v.code || "").toLowerCase().includes(q) ||
        (v.name || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && v.active) ||
        (statusFilter === "inactive" && !v.active);
      return matchesSearch && matchesStatus;
    });
  }, [sortedVouchers, search, statusFilter]);

  // stats
  const stats = {
    total: sortedVouchers.length,
    active: sortedVouchers.filter((s) => s.active).length,
    inactive: sortedVouchers.filter((s) => !s.active).length,
    expired: sortedVouchers.filter((v) => {
      try {
        const now = new Date();
        return v.endDate && new Date(v.endDate) < now;
      } catch {
        return false;
      }
    }).length,
  };

  const pagedVisible = useMemo(() => {
    // show filtered results on current page
    const start = (page - 1) * size;
    return filtered.slice(start, start + size);
  }, [filtered, page, size]);

  const handleDelete = (voucher) => {
    const title = t("admin.voucher.actions.confirm_delete");
    const message =
      t("admin.voucher.actions.confirm_delete_message", {
        name: voucher.name || voucher.code,
      }) || `Bạn có chắc muốn xóa voucher "${voucher.name ?? voucher.code}"?`;
    const confirmText = t("admin.voucher.actions.delete");
    const cancelText = t("admin.voucher.actions.cancel");

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass:
        "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          await deleteVoucher({ id: voucher.id, lang: language });
          toast.success(t("admin.voucher.actions.delete_success"));
          await refetchPaged();
        } catch (err) {
          console.error("Delete voucher error:", err);
          const msg = t("admin.voucher.actions.delete_error");
          toast.error(msg);
        }
      },
    });
  };

  const handleEdit = (v) => {
    setSelectedVoucher(v);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedVoucher(null);
    setShowForm(true);
  };

  const handleCloseForm = async (shouldRefetch = false) => {
    setShowForm(false);
    setSelectedVoucher(null);
    if (shouldRefetch) {
      try {
        await refetchPaged();
      } catch {}
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          {t("admin.voucher.title")}
        </h1>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer text-sm sm:text-base flex-1 sm:flex-initial justify-center"
          >
            <IconPlus size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">
              {t("admin.voucher.create")}
            </span>
            <span className="xs:hidden">{t("admin.voucher.create")}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {t("admin.voucher.stats.total")}
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
                {t("admin.voucher.stats.active")}
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
                {t("admin.voucher.stats.inactive")}
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
                {t("admin.voucher.stats.expired")}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                {stats.expired}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Mobile Toggle Button */}
      <div className="lg:hidden backdrop-blur-xl bg-white/60 border border-white/30 p-3 rounded-lg shadow-lg">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between text-gray-700 font-medium"
        >
          <span className="flex items-center gap-2">
            <IconFilter size={18} />
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
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={
                  t("admin.voucher.search_placeholder") ||
                  "Search by id, code or name"
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(searchInput);
                    setPage(1);
                  }
                }}
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg text-sm sm:text-base"
            >
              <option value="all">
                {t("admin.voucher.all_status") || "All status"}
              </option>
              <option value="active">
                {t("admin.voucher.status.active") || "Active"}
              </option>
              <option value="inactive">
                {t("admin.voucher.status.inactive") || "Inactive"}
              </option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => refetchPaged && refetchPaged()}
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
        {t("admin.voucher.showing", {
          current: pagedVisible.length,
          total: filtered.length,
        }) || `Showing ${pagedVisible.length} of ${filtered.length}`}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-400">
                <th className="p-2 text-sm">ID</th>
                <th className="p-2 text-sm">Code</th>
                <th className="p-2 text-sm">
                  {t("admin.voucher.columns.name") || "Name"}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.voucher.columns.type") || "Type"}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.voucher.columns.discount") || "Discount"}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.voucher.columns.min_order") || "Min Order"}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.voucher.columns.usage") || "Usage"}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.voucher.columns.status") || "Status"}
                </th>
                <th className="p-2 text-sm">
                  {t("admin.voucher.columns.actions") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingPagedVouchers ? (
                <tr>
                  <td colSpan={9} className="text-center p-6 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      {t("admin.voucher.loading") || "Loading..."}
                    </div>
                  </td>
                </tr>
              ) : pagedVisible.length > 0 ? (
                pagedVisible.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b hover:bg-white/80 transition-colors"
                  >
                    <td className="p-2 text-sm">{v.id}</td>
                    <td className="p-2 font-mono text-sm">{v.code}</td>
                    <td className="p-2 font-semibold text-sm">{v.name}</td>
                    <td className="p-2 text-sm">
                      {v.voucherType ?? v.type ?? v.voucherType}
                    </td>
                    <td className="p-2 text-sm">
                      {v.discountType === "PERCENTAGE"
                        ? `${v.discountValue}%`
                        : v.discountType === "FIXED_AMOUNT"
                        ? `${v.discountValue?.toLocaleString()} VND`
                        : v.discountValue}
                    </td>
                    <td className="p-2 text-sm">
                      {v.minOrderAmount
                        ? `${Number(v.minOrderAmount).toLocaleString()} VND`
                        : "0 VND"}
                    </td>
                    <td className="p-2 text-sm">
                      {v.currentUsage ?? 0}/{v.maxTotalUsage ?? "∞"}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          v.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {v.active
                          ? t("admin.voucher.status.active") || "Active"
                          : t("admin.voucher.status.inactive") || "Inactive"}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleView(v)}
                          title={t("admin.voucher.actions.view") || "View"}
                          className="text-blue-600 p-1 rounded hover:bg-blue-50 cursor-pointer"
                        >
                          <IconEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(v)}
                          title={t("admin.voucher.actions.edit")}
                          className="text-yellow-600 p-1 rounded hover:bg-yellow-50 cursor-pointer"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          title={t("admin.voucher.actions.delete")}
                          className="text-red-600 p-1 rounded hover:bg-red-50 cursor-pointer"
                        >
                          {isDeleting ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <IconTrash size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center p-6 text-gray-500 text-sm"
                  >
                    {t("admin.voucher.no_vouchers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {isLoadingPagedVouchers ? (
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              {t("admin.voucher.loading") || "Loading..."}
            </div>
          </div>
        ) : pagedVisible.length > 0 ? (
          pagedVisible.map((v) => (
            <div
              key={v.id}
              className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{v.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {v.code}
                  </p>
                </div>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs flex-shrink-0 ${
                    v.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {v.active
                    ? t("admin.voucher.status.active") || "Active"
                    : t("admin.voucher.status.inactive") || "Inactive"}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500 mb-1">
                    {t("admin.voucher.columns.type") || "Type"}
                  </p>
                  <p className="font-medium">{v.voucherType ?? v.type}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">
                    {t("admin.voucher.columns.discount") || "Discount"}
                  </p>
                  <p className="font-medium">
                    {v.discountType === "PERCENTAGE"
                      ? `${v.discountValue}%`
                      : v.discountType === "FIXED_AMOUNT"
                      ? `${v.discountValue?.toLocaleString()} VND`
                      : v.discountValue}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">
                    {t("admin.voucher.columns.min_order") || "Min Order"}
                  </p>
                  <p className="font-medium">
                    {v.minOrderAmount
                      ? `${Number(v.minOrderAmount).toLocaleString()} VND`
                      : "0 VND"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">
                    {t("admin.voucher.columns.usage") || "Usage"}
                  </p>
                  <p className="font-medium">
                    {v.currentUsage ?? 0}/{v.maxTotalUsage ?? "∞"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleView(v)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 cursor-pointer text-sm"
                >
                  <IconEye size={16} />
                  {t("common.view_details")}
                </button>
                <button
                  onClick={() => handleEdit(v)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 cursor-pointer text-sm"
                >
                  <IconEdit size={16} />
                  {t("admin.promotion.actions.edit")}
                </button>
                <button
                  onClick={() => handleDelete(v)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-sm"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <IconTrash size={16} />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg text-center text-gray-500 text-sm">
            {t("admin.voucher.no_vouchers") || "No vouchers found"}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center px-2 sm:px-0">
        <Pagination
          currentPage={page}
          totalItems={totalElements}
          pageSize={size}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* VoucherForm modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <VoucherForm voucher={selectedVoucher} onClose={handleCloseForm} />
          </div>
        </div>
      )}

      {/* VoucherDetailModal */}
      {showDetailModal && (
        <VoucherDetailModal
          open={showDetailModal}
          voucher={selectedDetailVoucher}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDetailVoucher(null);
          }}
        />
      )}
    </div>
  );
}
