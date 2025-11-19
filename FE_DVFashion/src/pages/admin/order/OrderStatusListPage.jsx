import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/common/Pagination";
import OrderDetailModal from "../../../components/ui/order/OrderDetailModal";
import OrderEditModal from "../../../components/ui/order/OrderEditModal";
import { useOrdersByStatusPaging } from "../../../hooks/useOrder";
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
} from "@tabler/icons-react";
import { formatVND } from "../../../utils/formatVND";

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

const StatCard = ({ title, value, icon, color = "text-gray-900" }) => (
  <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow flex flex-col items-center justify-center min-w-[90px] min-h-[90px]">
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

  // Advanced filter states (input vs. applied)
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [minTotalInput, setMinTotalInput] = useState("");
  const [maxTotalInput, setMaxTotalInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minTotal, setMinTotal] = useState("");
  const [maxTotal, setMaxTotal] = useState("");

  // Payment method filter (applies immediately)
  const [paymentMethod, setPaymentMethod] = useState("");
  const pageSize = 10;

  // Debounce search input (1s)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // API params
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

  // Only apply advanced filter when submit
  const handleAdvancedFilterSubmit = (e) => {
    e.preventDefault();
    setMinTotal(minTotalInput);
    setMaxTotal(maxTotalInput);
    setStartDate(startDateInput);
    setEndDate(endDateInput);
    setCurrentPage(1);
  };

  if (isLoading) return <div>{t("common.loading")}...</div>;
  if (isError) return <div className="text-red-600">{t("common.error")}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        {statusIcons[status]}
        {t(`order.status.${status.toLowerCase()}`)}
      </h1>

      {/* Statistics Card */}
      <div className="mb-6">
        <StatCard
          title={t(`order.status.${status.toLowerCase()}`)}
          value={totalStatusOrders}
          icon={statusIcons[status]}
          color={statusColorsText[status]}
        />
      </div>

      {/* Filter bar */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow-lg mb-2">
        <div className="flex flex-col md:flex-row gap-3 items-center flex-wrap">
          <div className="relative w-full md:w-100">
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
              className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-4 py-2 w-full shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <IconSearch
              className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              size={18}
            />
          </div>
          {/* Payment method filter luôn hiển thị */}
          <div className="w-full md:w-60">
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full"
            >
              {paymentMethodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={`flex items-center gap-1 px-3 py-2 border rounded-lg transition-colors shadow cursor-pointer
              ${
                showAdvanced
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-gray-100 border-white/30 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            <IconFilter size={16} />
            {t("admin.inventory.advanced_filters")}
            {showAdvanced ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer"
          >
            <IconRefresh size={18} />
          </button>
        </div>
        {/* Advanced filter */}
        {showAdvanced && (
          <form
            onSubmit={handleAdvancedFilterSubmit}
            className="mt-4 pt-4 border-t space-y-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t("order.min_total") || "Min total"}
                </label>
                <input
                  type="number"
                  min={0}
                  value={minTotalInput}
                  onChange={(e) => setMinTotalInput(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full"
                  placeholder={t("order.min_total") || "Min total"}
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
                  className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full"
                  placeholder={t("order.max_total") || "Max total"}
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
                  className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full"
                  placeholder="Start date"
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
                  className="px-3 py-2 rounded-lg border border-gray-200 shadow bg-white/80 w-full"
                  placeholder="End date"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
              >
                {t("common.filter") || "Filter"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Summary search */}
      <div className="text-sm text-gray-600 mb-2">{summaryText}</div>

      {/* Table */}
      <div className="backdrop-blur-xl bg-white/60 shadow-lg rounded-lg overflow-hidden border border-white/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-400">
              <tr>
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
                <th className="p-3 whitespace-nowrap">
                  {t("admin.brand.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const payment =
                  order.payment?.paymentMethod || order.paymentMethod;
                return (
                  <tr
                    key={order.orderNumber ?? order.id}
                    className="border-b hover:bg-white/80 transition-colors"
                  >
                    <td className="p-3 whitespace-nowrap">
                      {order.orderNumber ?? order.id}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {order.customerName}
                    </td>
                    <td className="p-3 whitespace-nowrap">{order.orderDate}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`text-white text-xs px-3 py-1 rounded-lg shadow whitespace-nowrap ${
                          statusColors[order.status] ?? "bg-gray-400"
                        }`}
                      >
                        {t(`order.status.${order.status?.toLowerCase()}`) ||
                          order.status}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`flex items-center gap-2 ${
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
                    <td className="p-3 font-semibold whitespace-nowrap">
                      {formatVND(order.totalAmount)}
                    </td>
                    <td className="p-3 space-x-2 whitespace-nowrap">
                      <button
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                        title={t("common.view_details")}
                      >
                        <IconEye size={18} />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                        onClick={() => setEditingOrder(order)}
                        title={t("common.edit")}
                      >
                        <IconEdit size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    {t("order.no_orders_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
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
