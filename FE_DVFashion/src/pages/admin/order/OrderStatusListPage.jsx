import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/common/Pagination";
import OrderDetailModal from "../../../components/ui/order/OrderDetailModal";
import OrderEditModal from "../../../components/ui/order/OrderEditModal";
import {
  useOrdersByStatusPaging,
  useBatchUpdateOrderStatus,
} from "../../../hooks/useOrder";
import LoadingSpinner from "../../../utils/LoadingSpinner";
import {
  IconEye,
  IconEdit,
  IconPackage,
  IconCheck,
  IconClock,
  IconX,
  IconRefresh,
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconBrandPaypal,
  IconCash,
  IconBuildingBank,
  IconFilter,
  IconLoader2,
} from "@tabler/icons-react";
import { formatVND } from "../../../utils/formatVND";

const ORDER_STATUS_FLOW = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["PROCESSING", "CANCELED"],
  PROCESSING: ["SHIPPED", "CANCELED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELED: [],
  RETURNED: [],
};

function getAllowedBatchTargetStatuses(selectedOrders, orders) {
  if (selectedOrders.length === 0) return [];
  const selectedOrderObjs = orders.filter((o) =>
    selectedOrders.includes(o.orderNumber ?? o.id)
  );
  const currentStatuses = selectedOrderObjs.map((o) => o.status);

  let allowed = null;
  for (const status of currentStatuses) {
    const nexts = ORDER_STATUS_FLOW[status] || [];
    // KHÔNG cho phép giữ nguyên trạng thái hiện tại
    const allowedForThis = [...nexts];
    if (allowed === null) {
      allowed = allowedForThis;
    } else {
      allowed = allowed.filter((s) => allowedForThis.includes(s));
    }
  }
  return allowed || [];
}

const statusColors = {
  PENDING: "bg-gray-500",
  CONFIRMED: "bg-blue-600",
  PROCESSING: "bg-yellow-500",
  DELIVERED: "bg-green-600",
  SHIPPED: "bg-cyan-600",
  RETURNED: "bg-indigo-600",
  CANCELED: "bg-red-500",
};

const statusIcons = {
  PENDING: <IconClock size={24} />,
  CONFIRMED: <IconCheck size={24} />,
  PROCESSING: <IconClock size={24} />,
  DELIVERED: <IconCheck size={24} />,
  SHIPPED: <IconPackage size={24} />,
  RETURNED: <IconPackage size={24} />,
  CANCELED: <IconX size={24} />,
};

const statusColorsText = {
  PENDING: "text-gray-500",
  CONFIRMED: "text-blue-600",
  PROCESSING: "text-yellow-500",
  DELIVERED: "text-green-600",
  SHIPPED: "text-cyan-600",
  RETURNED: "text-indigo-600",
  CANCELED: "text-red-600",
};

const paymentMethodOptions = [
  { value: "", label: "order.payment_method.title" },
  { value: "CASH_ON_DELIVERY", label: "order.payment_method.cod" },
  { value: "PAYPAL", label: "order.payment_method.paypal" },
  { value: "BANK_TRANSFER", label: "Bank" },
];

const paymentMethodIcons = {
  CASH_ON_DELIVERY: <IconCash size={18} />,
  PAYPAL: <IconBrandPaypal size={18} />,
  BANK_TRANSFER: <IconBuildingBank size={18} />,
};

const paymentMethodColors = {
  CASH_ON_DELIVERY: "text-green-600",
  PAYPAL: "text-blue-600",
  BANK_TRANSFER: "text-purple-600",
};

const StatCard = ({
  title,
  value,
  icon,
  color = "text-gray-900",
  className = "",
}) => (
  <div
    className={`backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow flex flex-col items-center justify-center min-w-[90px] min-h-[90px] w-full sm:w-auto ${className}`}
  >
    <div className={`mb-1 p-2 rounded-full bg-gray-100 shadow ${color}`}>
      {icon}
    </div>
    <p className="text-xs font-medium text-gray-700 text-center">{title}</p>
    <p className={`text-lg font-bold ${color} text-center`}>{value}</p>
  </div>
);

export default function OrderStatusListPage({ status }) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchStatus, setBatchStatus] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const selectAllRef = useRef();

  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [minTotalInput, setMinTotalInput] = useState("");
  const [maxTotalInput, setMaxTotalInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");
  const [batchProgress, setBatchProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");
  const pageSize = 10;

  const { mutate: batchUpdateOrderStatus, isLoading: isBatchUpdating } =
    useBatchUpdateOrderStatus();

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const params = {
    page: currentPage - 1,
    size: pageSize,
    sort: "orderDate,desc",
    search: search || undefined,
    startDate: showAdvanced && startDate ? startDate : undefined,
    endDate: showAdvanced && endDate ? endDate : undefined,
    minTotal: showAdvanced && minTotal ? minTotal : undefined,
    maxTotal: showAdvanced && maxTotal ? maxTotal : undefined,
    paymentMethod: paymentMethod || undefined,
  };

  const { data, isLoading, isError, refetch } = useOrdersByStatusPaging(
    status,
    params
  );

  const orders = data?.values || [];
  const totalPages = data?.totalPages ?? 1;
  const totalStatusOrders = data?.totalElements ?? 0;

  const allowedBatchStatuses = getAllowedBatchTargetStatuses(selectedOrders, [
    ...orders,
  ]);

  function formatDateTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds()) +
      " " +
      pad(date.getDate()) +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      date.getFullYear()
    );
  }

  const summaryText =
    search && search.trim()
      ? t("admin.brand.showing_results", {
          current: orders.length,
          total: totalStatusOrders,
        }) + ` | "${search}"`
      : t("admin.brand.showing_results", {
          current: orders.length,
          total: totalStatusOrders,
        });

  const handleSelectAll = (e) => {
    const pageOrderNumbers = orders.map((o) => o.orderNumber ?? o.id);
    if (e.target.checked) {
      setSelectedOrders((prev) => [
        ...prev,
        ...pageOrderNumbers.filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedOrders((prev) =>
        prev.filter((id) => !pageOrderNumbers.includes(id))
      );
    }
  };

  const handleSelectOrder = (orderNumber) => {
    setSelectedOrders((prev) =>
      prev.includes(orderNumber)
        ? prev.filter((id) => id !== orderNumber)
        : [...prev, orderNumber]
    );
  };

  const handleBatchUpdate = async (e) => {
    e.preventDefault();
    if (!batchStatus || selectedOrders.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setBatchProgress(0);

    const progressInterval = setInterval(() => {
      setBatchProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    batchUpdateOrderStatus(
      {
        orderNumbers: selectedOrders,
        targetStatus: batchStatus,
        notes: batchNotes,
      },
      {
        onSuccess: () => {
          clearInterval(progressInterval);
          setBatchProgress(100);
          setTimeout(() => {
            setShowBatchModal(false);
            setSelectedOrders([]);
            setBatchStatus("");
            setBatchNotes("");
            setBatchProgress(0);
            setIsProcessing(false);
          }, 500);
        },
        onError: () => {
          clearInterval(progressInterval);
          setBatchProgress(0);
          setIsProcessing(false);
        },
      }
    );
  };

  const handleAdvancedFilterSubmit = (e) => {
    e.preventDefault();
    setMinTotal(minTotalInput);
    setMaxTotal(maxTotalInput);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setCurrentPage(1);
  };

  if (isLoading) return <LoadingSpinner size="large" />;

  if (isError) return <div className="text-red-600">{t("common.error")}</div>;

  const isAllPageSelected =
    orders.length > 0 &&
    orders.every((o) => selectedOrders.includes(o.orderNumber ?? o.id));

  return (
    <div className="w-full">
      <h1 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
        {statusIcons[status]}
        <span>{t(`order.status.${status.toLowerCase()}`)}</span>
      </h1>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={t(`order.status.${status.toLowerCase()}`)}
          value={totalStatusOrders}
          icon={statusIcons[status]}
          color={statusColorsText[status]}
          className="col-span-2 md:col-span-4"
        />
      </div>

      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow-lg mb-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="relative w-full lg:flex-1">
            <input
              type="text"
              placeholder={t("admin.order.search")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                  setCurrentPage(1);
                }
              }}
              className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg pl-4 pr-10 py-2 w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
            />
            <IconSearch
              className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              size={18}
            />
          </div>

          <div className="w-full lg:w-48">
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full text-sm md:text-base cursor-pointer"
            >
              {paymentMethodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-1 px-3 py-2 border rounded-lg transition-colors shadow cursor-pointer text-sm md:text-base
                ${
                  showAdvanced
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-gray-100 border-white/30 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <IconFilter size={16} />
              <span className="whitespace-nowrap">
                {t("admin.inventory.advanced_filters")}
              </span>
              {showAdvanced ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer"
            >
              <IconRefresh size={18} />
            </button>
          </div>
        </div>

        {showAdvanced && (
          <form
            onSubmit={handleAdvancedFilterSubmit}
            className="mt-4 pt-4 border-t space-y-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("order.min_total") || "Min total"}
                </label>
                <input
                  type="number"
                  min={0}
                  value={minTotalInput}
                  onChange={(e) => setMinTotalInput(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full text-sm"
                  placeholder="Min total"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("order.max_total") || "Max total"}
                </label>
                <input
                  type="number"
                  min={0}
                  value={maxTotalInput}
                  onChange={(e) => setMaxTotalInput(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full text-sm"
                  placeholder="Max total"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("order.start_date") || "Start date"}
                </label>
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("order.end_date") || "End date"}
                </label>
                <input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="mt-2 w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t("common.filter") || "Filter"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3 bg-white/50 p-2 rounded-lg border border-white/40">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            ref={selectAllRef}
            checked={isAllPageSelected}
            onChange={handleSelectAll}
            disabled={orders.length === 0}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {t("common.select")}
          </span>
        </label>
        <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block"></div>
        <button
          className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          disabled={selectedOrders.length === 0}
          onClick={() => setShowBatchModal(true)}
        >
          {t("order.update_order") || "Update Status"}
        </button>
        {selectedOrders.length > 0 && (
          <span className="w-full sm:w-auto text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
            {selectedOrders.length} {t("order.orders_count")}
          </span>
        )}
      </div>

      <div className="text-xs md:text-sm text-gray-600 mb-3 px-1">
        {summaryText}
      </div>

      {/* Mobile Card View (Visible < md) */}
      <div className="md:hidden space-y-4">
        {orders.length === 0 && (
          <div className="text-center py-8 bg-white/60 rounded-lg shadow border border-white/30 text-gray-500">
            {t("order.no_orders_found")}
          </div>
        )}
        {orders.map((order) => {
          const payment = order.payment?.paymentMethod || order.paymentMethod;
          const orderNumber = order.orderNumber ?? order.id;
          return (
            <div
              key={orderNumber}
              className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${
                selectedOrders.includes(orderNumber)
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
            >
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(orderNumber)}
                      onChange={() => handleSelectOrder(orderNumber)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <div>
                      <div className="font-bold text-gray-900">
                        #{orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(order.orderDate)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-sm ${
                      statusColors[order.status] ?? "bg-gray-400"
                    }`}
                  >
                    {t(`order.status.${order.status?.toLowerCase()}`) ||
                      order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm border-t border-b border-gray-100 py-3">
                  <div>
                    <span className="text-gray-500 text-xs block">
                      {t("account.main.full_name")}
                    </span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-xs block">
                      {t("order.total_amount")}
                    </span>
                    <span className="font-bold text-blue-700">
                      {formatVND(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div
                    className={`flex items-center gap-1.5 text-sm ${
                      paymentMethodColors[payment] ?? "text-gray-600"
                    }`}
                  >
                    {paymentMethodIcons[payment]}
                    <span className="truncate max-w-[120px]">
                      {payment === "CASH_ON_DELIVERY" && "COD"}
                      {payment === "PAYPAL" && "PayPal"}
                      {payment === "BANK_TRANSFER" && "Bank"}
                      {!payment && "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <IconEye size={18} />
                    </button>
                    <button
                      className="p-2 bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100 transition"
                      onClick={() => setEditingOrder(order)}
                    >
                      <IconEdit size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (Visible >= md) */}
      <div className="hidden md:block backdrop-blur-xl bg-white/60 shadow-lg rounded-lg overflow-hidden border border-white/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-400 ">
              <tr>
                <th className="p-3 w-10"></th>
                <th className="p-3 whitespace-nowrap">{t("order.number")}</th>
                <th className="p-3 whitespace-nowrap">
                  {t("account.main.full_name")}
                </th>
                <th className="p-3 whitespace-nowrap">{t("order.date")}</th>
                <th className="p-3 whitespace-nowrap">
                  {t("order.status_label")}
                </th>
                <th className="p-3 whitespace-nowrap">
                  {t("order.payment_method.title") || "Payment"}
                </th>
                <th className="p-3 whitespace-nowrap">
                  {t("order.total_amount")}
                </th>
                <th className="p-3 whitespace-nowrap text-right">
                  {t("admin.brand.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const payment =
                  order.payment?.paymentMethod || order.paymentMethod;
                const orderNumber = order.orderNumber ?? order.id;
                return (
                  <tr
                    key={orderNumber}
                    className="border-b hover:bg-white/80 transition-colors last:border-b-0"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(orderNumber)}
                        onChange={() => handleSelectOrder(orderNumber)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-gray-900">
                      {orderNumber}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {order.customerName}
                    </td>
                    <td className="p-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(order.orderDate)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`text-white text-xs px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap font-medium ${
                          statusColors[order.status] ?? "bg-gray-400"
                        }`}
                      >
                        {t(`order.status.${order.status?.toLowerCase()}`) ||
                          order.status}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`flex items-center gap-2 text-sm font-medium ${
                          paymentMethodColors[payment] ?? "text-gray-600"
                        }`}
                      >
                        {paymentMethodIcons[payment]}
                        <span>
                          {payment === "CASH_ON_DELIVERY" &&
                            t("order.payment_method.cod")}
                          {payment === "PAYPAL" &&
                            t("order.payment_method.paypal")}
                          {payment === "BANK_TRANSFER" && "Bank"}
                          {!payment && "N/A"}
                        </span>
                      </span>
                    </td>
                    <td className="p-3 font-bold whitespace-nowrap text-gray-900">
                      {formatVND(order.totalAmount)}
                    </td>
                    <td className="p-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                          title={t("common.view_details")}
                        >
                          <IconEye size={20} />
                        </button>
                        <button
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => setEditingOrder(order)}
                          title={t("common.edit")}
                        >
                          <IconEdit size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <IconPackage size={48} className="text-gray-300 mb-2" />
                      <p>{t("order.no_orders_found")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch update modal - RESPONSIVE: Width and Max Height */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md w-[90%] md:w-full flex flex-col overflow-hidden animate-scaleIn max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                aria-label={t("common.close")}
                disabled={isProcessing}
              >
                <IconX size={20} />
              </button>
              <h2 className="text-lg font-bold">{t("order.update_order")}</h2>
              <div className="text-xs text-blue-100 opacity-90 mt-1">
                {t("order.orders_count")}: {selectedOrders.length}
              </div>
            </div>

            {/* Body - Scrollable */}
            <form
              onSubmit={handleBatchUpdate}
              className="flex-1 flex flex-col gap-4 p-6 overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("order.status_label")}
                </label>
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  disabled={isProcessing}
                >
                  <option value="">{t("common.select")}</option>
                  {allowedBatchStatuses.map((status) => (
                    <option key={status} value={status}>
                      {t(`order.status.${status.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("common.note")}
                </label>
                <textarea
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  rows={3}
                  placeholder={t("common.note")}
                  disabled={isProcessing}
                />
              </div>

              {/* Progress indicator */}
              {isProcessing && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      {t("common.processing") || "Processing"}...
                    </span>
                    <span className="font-semibold text-blue-600">
                      {batchProgress}%
                    </span>
                  </div>
                  <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300 ease-out"
                      style={{ width: `${batchProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium text-sm"
                  onClick={() => setShowBatchModal(false)}
                  disabled={isProcessing}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 font-medium text-sm disabled:opacity-70 disabled:shadow-none flex items-center gap-2"
                  disabled={!batchStatus || isProcessing}
                >
                  {isProcessing && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          open={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
}
