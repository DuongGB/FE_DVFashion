import { useState, useMemo } from "react";
import {
  IconEye,
  IconEdit,
  IconPackage,
  IconCheck,
  IconClock,
  IconX,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import OrderDetailModal from "../../components/ui/order/OrderDetailModal";
import OrderEditModal from "../../components/ui/order/OrderEditModal";
import Pagination from "../../components/common/Pagination";
import { useAllOrdersPaging } from "../../hooks/useOrder";

const statusColors = {
  PENDING: "bg-gray-500",
  CONFIRMED: "bg-blue-600",
  PROCESSING: "bg-yellow-500",
  DELIVERED: "bg-green-600",
  SHIPPED: "bg-cyan-600",
  REFUNDED: "bg-indigo-600",
  CANCELED: "bg-red-500",
};

// Format ISO date to readable string
function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatCurrency(amount) {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  } catch {
    return amount;
  }
}

// Statistics Card Component
const StatCard = ({ title, value, icon, color = "text-gray-900" }) => (
  <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg flex flex-col items-center justify-center min-w-[110px] min-h-[110px] transition-all duration-300 hover:bg-white/60">
    <div className={`mb-2 p-2 rounded-full bg-white/60 shadow ${color}`}>
      {icon}
    </div>
    <p className="text-xs font-medium text-gray-700 text-center">{title}</p>
    <p className={`text-xl font-bold ${color} text-center`}>{value}</p>
  </div>
);

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Build params for API
  const params = {
    page: currentPage - 1,
    size: pageSize,
    sort: "orderDate,desc",
  };

  const { data, isLoading, isError } = useAllOrdersPaging(params);

  // data is PageResponse<OrderResponse>
  const orders = data?.values || [];

  // Client-side filter on the current page's values (backend paging still used)
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "Tất cả" && order.status !== statusFilter)
      return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (order.customerName && order.customerName.toLowerCase().includes(s)) ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(s))
    );
  });

  const paginatedOrders = filteredOrders;
  const totalPages = data?.totalPages ?? 1;

  // Statistics calculation (useMemo for performance)
  const stats = useMemo(() => {
    const all = orders.length;
    let pending = 0,
      confirmed = 0,
      processing = 0,
      delivered = 0,
      shipped = 0,
      returned = 0,
      canceled = 0,
      totalAmount = 0;
    orders.forEach((o) => {
      if (o.status === "PENDING") pending++;
      if (o.status === "CONFIRMED") confirmed++;
      if (o.status === "PROCESSING") processing++;
      if (o.status === "DELIVERED") delivered++;
      if (o.status === "SHIPPED") shipped++;
      if (o.status === "RETURNED") returned++;
      if (o.status === "CANCELED") canceled++;
      totalAmount += Number(o.totalAmount || 0);
    });
    return {
      all,
      pending,
      confirmed,
      processing,
      delivered,
      shipped,
      returned,
      canceled,
      totalAmount,
    };
  }, [orders]);

  // Helpers to adapt API order shape to modal components' expected props
  const mapToModalOrder = (order) => {
    if (!order) return null;
    return {
      id: order.orderNumber ?? order.id,
      customer:
        order.customerName ?? (order.customer && order.customer.name) ?? "",
      date: order.orderDate,
      status: order.status,
      total: order.totalAmount ?? order.total,
      items: order.items ?? [],
      // keep original for potential further use
      __raw: order,
    };
  };

  if (isLoading) {
    return <div>{t("common.loading")}...</div>;
  }

  if (isError) {
    return (
      <div className="text-red-600">
        {t("common.error") || "Có lỗi khi tải danh sách đơn hàng."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Liquid glass background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
          {t("order.your_orders")}
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <StatCard
            title={t("order.stats.total_orders") || "Tổng đơn"}
            value={stats.all}
            icon={<IconPackage size={24} />}
          />
          <StatCard
            title={t("order.status.pending")}
            value={stats.pending}
            icon={<IconClock size={24} />}
            color="text-gray-500"
          />
          <StatCard
            title={t("order.status.confirmed")}
            value={stats.confirmed}
            icon={<IconCheck size={24} />}
            color="text-blue-600"
          />
          <StatCard
            title={t("order.status.processing")}
            value={stats.processing}
            icon={<IconClock size={24} />}
            color="text-yellow-500"
          />
          <StatCard
            title={t("order.status.delivered")}
            value={stats.delivered}
            icon={<IconCheck size={24} />}
            color="text-green-600"
          />
          <StatCard
            title={t("order.status.shipped")}
            value={stats.shipped}
            icon={<IconPackage size={24} />}
            color="text-cyan-600"
          />
          <StatCard
            title={t("order.status.refunded")}
            value={stats.refunded}
            icon={<IconPackage size={24} />}
            color="text-indigo-600"
          />
          <StatCard
            title={t("order.status.canceled")}
            value={stats.canceled}
            icon={<IconX size={24} />}
            color="text-red-600"
          />
        </div>

        {/* Thanh công cụ */}
        <div className="flex justify-between mb-4 items-center">
          <div className="flex gap-4 w-2/3">
            <input
              type="text"
              placeholder={t("admin.order.search")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="backdrop-blur-sm bg-white/60 border border-white/30 rounded-lg px-4 py-2 w-2/3 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="backdrop-blur-sm bg-white/60 border border-white/30 rounded-lg px-4 py-2 w-1/3 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            >
              <option value="Tất cả">{t("common.all")}</option>
              <option value="DELIVERED">{t("order.status.delivered")}</option>
              <option value="CONFIRMED">{t("order.status.confirmed")}</option>
              <option value="PROCESSING">{t("order.status.processing")}</option>
              <option value="PENDING">{t("order.status.pending")}</option>
              <option value="CANCELED">{t("order.status.canceled")}</option>
            </select>
          </div>
        </div>

        {/* Bảng đơn hàng */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-lg rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
              <tr>
                <th className="p-3">{t("order.number")}</th>
                <th className="p-3">{t("account.main.full_name")}</th>
                <th className="p-3">{t("order.date")}</th>
                <th className="p-3">{t("order.status_label")}</th>
                <th className="p-3">{t("order.total_amount")}</th>
                <th className="p-3">{t("admin.brand.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr
                  key={order.orderNumber ?? order.id}
                  className="border-b hover:bg-white/60 transition-all"
                >
                  <td className="p-3">{order.orderNumber ?? order.id}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3">{formatDate(order.orderDate)}</td>
                  <td className="p-3">
                    <span
                      className={`text-white text-sm px-3 py-1 rounded-lg shadow ${
                        statusColors[order.status] ?? "bg-gray-400"
                      }`}
                    >
                      {t(`order.status.${order.status?.toLowerCase()}`) ||
                        order.status}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() => setSelectedOrder(mapToModalOrder(order))}
                    >
                      <IconEye className="inline-block mr-1" />
                    </button>
                    <button
                      className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                      onClick={() => setEditingOrder(mapToModalOrder(order))}
                    >
                      <IconEdit className="inline-block mr-1" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    {t("order.no_orders_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
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
    </div>
  );
}
