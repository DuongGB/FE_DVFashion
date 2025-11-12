import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconRefresh,
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const size = 12;

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
    const title = t("admin.voucher.actions.confirm_delete") || "Xóa voucher";
    const message =
      t("admin.voucher.actions.confirm_delete_message", {
        name: voucher.name || voucher.code,
      }) || `Bạn có chắc muốn xóa voucher "${voucher.name ?? voucher.code}"?`;
    const confirmText = t("admin.voucher.actions.delete") || "Delete";
    const cancelText = t("admin.voucher.actions.cancel") || "Cancel";

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
          toast.success(
            t("admin.voucher.actions.delete_success") || "Voucher deleted"
          );
          await refetchPaged();
        } catch (err) {
          console.error("Delete voucher error:", err);
          const msg =
            err?.response?.data?.message ||
            err.message ||
            t("admin.voucher.actions.delete_error") ||
            "Delete failed";
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

  const handleCloseForm = async () => {
    setShowForm(false);
    setSelectedVoucher(null);
    try {
      await refetchPaged();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {t("admin.voucher.title") || "Voucher Management"}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
          >
            <IconPlus size={16} />
            {t("admin.voucher.create") || "Create Voucher"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.voucher.stats.total") || "Total"}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.voucher.stats.active") || "Active"}
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
                {t("admin.voucher.stats.inactive") || "Inactive"}
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
                {t("admin.voucher.stats.expired") || "Expired"}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.expired}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + Refresh */}
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
                placeholder={
                  t("admin.voucher.search_placeholder") ||
                  "Search by id, code or name"
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg"
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
          <div className="flex items-center h-full">
            <button
              type="button"
              onClick={() => refetchPaged && refetchPaged()}
              className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer"
              title={t("common.refresh") || "Làm mới"}
            >
              <IconRefresh size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {t("admin.voucher.showing", {
          current: pagedVisible.length,
          total: filtered.length,
        }) || `Showing ${pagedVisible.length} of ${filtered.length}`}
      </div>

      {/* Table */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">ID</th>
              <th className="p-2">Code</th>
              <th className="p-2">
                {t("admin.voucher.columns.name") || "Name"}
              </th>
              <th className="p-2">
                {t("admin.voucher.columns.type") || "Type"}
              </th>
              <th className="p-2">
                {t("admin.voucher.columns.discount") || "Discount"}
              </th>
              <th className="p-2">
                {t("admin.voucher.columns.min_order") || "Min Order"}
              </th>
              <th className="p-2">
                {t("admin.voucher.columns.usage") || "Usage"}
              </th>
              <th className="p-2">
                {t("admin.voucher.columns.status") || "Status"}
              </th>
              <th className="p-2">
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
                  <td className="p-2">{v.id}</td>
                  <td className="p-2 font-mono">{v.code}</td>
                  <td className="p-2 font-semibold">{v.name}</td>
                  <td className="p-2">
                    {v.voucherType ?? v.type ?? v.voucherType}
                  </td>
                  <td className="p-2">
                    {v.discountType === "PERCENTAGE"
                      ? `${v.discountValue}%`
                      : v.discountType === "FIXED_AMOUNT"
                      ? `${v.discountValue?.toLocaleString()} VND`
                      : v.discountValue}
                  </td>
                  <td className="p-2">
                    {v.minOrderAmount
                      ? `${Number(v.minOrderAmount).toLocaleString()} VND`
                      : "0 VND"}
                  </td>
                  <td className="p-2">
                    {v.currentUsage ?? 0}/{v.maxTotalUsage ?? "∞"}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
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
                        title={t("admin.voucher.actions.edit") || "Edit"}
                        className="text-yellow-600 p-1 rounded hover:bg-yellow-50 cursor-pointer"
                      >
                        <IconEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        title={t("admin.voucher.actions.delete") || "Delete"}
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
                <td colSpan={9} className="text-center p-6 text-gray-500">
                  {t("admin.voucher.no_vouchers") || "No vouchers found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl">
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
