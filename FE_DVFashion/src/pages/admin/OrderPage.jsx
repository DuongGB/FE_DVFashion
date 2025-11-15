import { useState, useMemo, useEffect } from "react";
import {
  IconEye,
  IconEdit,
  IconPackage,
  IconCheck,
  IconClock,
  IconX,
  IconCash,
  IconBrandPaypal,
  IconBuildingBank,
  IconRefresh,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import OrderDetailModal from "../../components/ui/order/OrderDetailModal";
import OrderEditModal from "../../components/ui/order/OrderEditModal";
import Pagination from "../../components/common/Pagination";
import { useAllOrdersPaging, useOrderStatistics } from "../../hooks/useOrder";

const statusColors = {
  PENDING: "bg-gray-500",
  CONFIRMED: "bg-blue-600",
  PROCESSING: "bg-yellow-500",
  DELIVERED: "bg-green-600",
  SHIPPED: "bg-cyan-600",
  RETURNED: "bg-indigo-600",
  CANCELED: "bg-red-500",
};

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

const StatCard = ({ title, value, icon, color = "text-gray-900" }) => (
  <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-w-[110px] min-h-[110px]">
    <div className={`mb-2 p-2 rounded-full bg-gray-100 shadow ${color}`}>
      {icon}
    </div>
    <p className="text-xs font-medium text-gray-700 text-center">{title}</p>
    <p className={`text-xl font-bold ${color} text-center`}>{value}</p>
  </div>
);

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const params = {
    page: currentPage - 1,
    size: pageSize,
    sort: "orderDate,desc",
  };

  // Debounce searchInput -> setSearch sau 1.5s không gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 1500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data: statsApi, isLoading: statsLoading } = useOrderStatistics();

  const stats = useMemo(() => {
    if (!statsApi)
      return {
        all: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        delivered: 0,
        shipped: 0,
        returned: 0,
        canceled: 0,
      };
    const byStatus = statsApi.ordersByStatus || {};
    return {
      all: statsApi.totalOrders || 0,
      pending: byStatus.PENDING || 0,
      confirmed: byStatus.CONFIRMED || 0,
      processing: byStatus.PROCESSING || 0,
      delivered: byStatus.DELIVERED || 0,
      shipped: byStatus.SHIPPED || 0,
      returned: byStatus.RETURNED || 0,
      canceled: byStatus.CANCELED || 0,
    };
  }, [statsApi]);

  const { data, isLoading, isError, refetch } = useAllOrdersPaging(params);

  const orders = data?.values || [];

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "Tất cả" && order.status !== statusFilter)
      return false;
    // Lấy paymentMethod từ order.payment.paymentMethod
    const paymentMethod = order.payment?.paymentMethod || order.paymentMethod;
    if (
      paymentMethodFilter !== "Tất cả" &&
      paymentMethod !== paymentMethodFilter
    )
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
      paymentMethod: order.payment?.paymentMethod || order.paymentMethod,
      __raw: order,
    };
  };

  if (isLoading || statsLoading) {
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
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
          title={t("order.status.returned")}
          value={stats.returned}
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
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
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
          className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-4 py-2 flex-1 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-4 py-2 md:w-48 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Tất cả">{t("common.all")} - Trạng thái</option>
          <option value="DELIVERED">{t("order.status.delivered")}</option>
          <option value="CONFIRMED">{t("order.status.confirmed")}</option>
          <option value="PROCESSING">{t("order.status.processing")}</option>
          <option value="PENDING">{t("order.status.pending")}</option>
          <option value="RETURNED">{t("order.status.returned")}</option>
          <option value="CANCELED">{t("order.status.canceled")}</option>
        </select>
        <select
          value={paymentMethodFilter}
          onChange={(e) => {
            setPaymentMethodFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-4 py-2 md:w-48 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Tất cả">{t("common.all")} - Thanh toán</option>
          <option value="CASH_ON_DELIVERY">Tiền mặt</option>
          <option value="PAYPAL">PayPal</option>
          <option value="BANK_TRANSFER">Chuyển khoản</option>
        </select>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer"
        >
          <IconRefresh size={18} />
        </button>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 mb-2">
        {t("admin.inventory.showing_results", {
          current: paginatedOrders.length,
          total: filteredOrders.length,
        })}
      </div>
      {/* Bảng đơn hàng */}
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
                <th className="p-3 whitespace-nowrap">Thanh toán</th>
                <th className="p-3 whitespace-nowrap">
                  {t("order.total_amount")}
                </th>
                <th className="p-3 whitespace-nowrap">
                  {t("admin.brand.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                // Lấy paymentMethod từ order.payment.paymentMethod hoặc order.paymentMethod
                const paymentMethod =
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
                    <td className="p-3 whitespace-nowrap">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-white text-sm px-3 py-1 rounded-lg shadow whitespace-nowrap ${
                          statusColors[order.status] ?? "bg-gray-400"
                        }`}
                      >
                        {t(`order.status.${order.status?.toLowerCase()}`) ||
                          order.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div
                        className={`flex items-center gap-2 ${
                          paymentMethodColors[paymentMethod] ?? "text-gray-600"
                        }`}
                      >
                        {paymentMethodIcons[paymentMethod]}
                        <span className="text-sm whitespace-nowrap">
                          {paymentMethod === "CASH_ON_DELIVERY" && "Tiền mặt"}
                          {paymentMethod === "PAYPAL" && "PayPal"}
                          {paymentMethod === "BANK_TRANSFER" && "Chuyển khoản"}
                          {!paymentMethod && "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="p-3 space-x-2 whitespace-nowrap">
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
                );
              })}
              {paginatedOrders.length === 0 && (
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
  );
}
