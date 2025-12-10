import { useMyOrdersPaging } from "../../../hooks/useOrder";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { getOrderStatusLabel } from "../../../utils/getOrderStatusLabel";
import Pagination from "../../common/Pagination";
import { getPaymentMethodLabel } from "../../../utils/getPaymentMethodLabel";
import { queryClient } from "../../../lib/queryClient";
import { getMyOrdersPaging } from "../../../services/orderAPI";

// Hàm trả về class màu cho status
const getStatusColorClass = (status) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700 border-green-300";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "CANCELED":
      return "bg-red-100 text-red-700 border-red-300";
    case "SHIPPING":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "CONFIRMED":
      return "bg-purple-100 text-purple-700 border-purple-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const OrderCard = ({ order, onReviewClick }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const orderDate = new Date(order.orderDate).toLocaleDateString("vi-VN");
  const paymentMethod = order?.payment?.paymentMethod;

  const backgroundLocation = {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    key: location.key,
  };

  return (
    <div className="mb-8 border border-white/30 rounded-2xl bg-white/30 backdrop-blur-md shadow-xl transition hover:shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-700 text-white p-4 rounded-t-2xl backdrop-blur-sm gap-2">
        <p className="text-sm opacity-90">{orderDate}</p>
        <span
          className={`px-3 py-1.5 rounded-full font-bold text-xs border backdrop-blur-sm ${getStatusColorClass(
            order.status
          )}`}
        >
          {getOrderStatusLabel(order.status, t)}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 divide-y divide-white/30">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center py-4 first:pt-0 last:pb-0 gap-3 sm:gap-4"
          >
            <img
              src={item.imageUrl}
              alt={item.productName}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-white/40 shadow flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.3)" }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base sm:text-lg truncate">
                {item.productName}
              </p>
              <p className="text-sm text-gray-700/80">
                {item.color} / {item.sizeName}
              </p>
              {item.unitPrice === 0 && (
                <p className="text-sm font-bold text-blue-600">
                  {t("order.gift")}
                </p>
              )}
            </div>
            <div className="text-right min-w-[80px]">
              <p className="font-semibold text-base sm:text-lg">
                {item.unitPrice.toLocaleString()}đ
              </p>
              {item.discount > 0 && (
                <p className="text-sm text-gray-400 line-through">
                  {(item.unitPrice + item.discount).toLocaleString()}đ
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/30 bg-white/40 backdrop-blur-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-b-2xl gap-3 sm:gap-0">
        <div>
          <p className="text-gray-700/80">{t("order.total_amount")}:</p>
          <p className="font-bold text-xl sm:text-2xl text-red-600 drop-shadow">
            {order.totalAmount.toLocaleString()}đ
          </p>
          {paymentMethod && (
            <p className="text-sm text-gray-700/80 mt-1">
              {t("order.payment_method.title")}:{" "}
              <span className="font-medium text-gray-900/80">
                {getPaymentMethodLabel(paymentMethod, t)}
              </span>
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-0">
          {/* Nút xem hóa đơn */}
          {order.status !== "PENDING" && order.status !== "CANCELED" && (
            <Link
              to={`/invoices/${order.orderNumber}/preview?as=pdf&autoprint=1`}
              state={{ background: backgroundLocation }}
              className="border border-white/40 bg-white/30 backdrop-blur px-4 sm:px-6 py-2 font-bold w-full sm:w-fit cursor-pointer hover:bg-white/60 hover:text-blue-700 transition rounded-full shadow flex items-center justify-center text-sm sm:text-base"
              title={t("order.preview_invoice")}
            >
              {t("order.preview_invoice")}
            </Link>
          )}
          {/* Nút đánh giá */}
          {order.status === "DELIVERED" &&
            (order.hasReview ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold select-none opacity-70 cursor-not-allowed text-sm sm:text-base">
                {t("order.reviewed")}
              </div>
            ) : (
              <button
                className="border border-white/40 bg-white/30 backdrop-blur px-4 sm:px-6 py-2 font-bold w-full sm:w-fit cursor-pointer hover:bg-white/60 hover:text-blue-700 transition rounded-full shadow text-sm sm:text-base"
                onClick={() => onReviewClick(order)}
              >
                {t("order.review")}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default function OrderHistory({ onReviewClick, refreshKey = 0 }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [page, setPage] = useState(0);

  // Xác định ngôn ngữ hiện tại
  const lang = (i18n.language || "VI").toUpperCase().startsWith("VI")
    ? "VI"
    : "EN";

  const {
    data: responseData,
    isLoading,
    isFetching,
  } = useMyOrdersPaging(
    {
      page,
      size: 2,
      refreshKey,
      lang,
    },
    { keepPreviousData: true }
  );

  const pagedData = responseData?.data;
  const orders = pagedData?.values || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 0;

  useEffect(() => {
    if (page < totalPages - 1) {
      queryClient.prefetchQuery({
        queryKey: ["myOrders", { page: page + 1, size: 2, refreshKey, lang }],
        queryFn: () =>
          getMyOrdersPaging({ page: page + 1, size: 2, refreshKey, lang }),
      });
    }
  }, [page, totalPages, refreshKey, lang]);

  const handlePageChange = (newPage) => setPage(newPage - 1);

  if (isLoading) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p>{t("loading")}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-100/60 via-white/60 to-blue-200/60 p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-2xl backdrop-blur-lg">
      {/* Header */}
      <div className="flex-shrink-0">
        <h2 className="text-xl sm:text-3xl font-bold mb-2 drop-shadow">
          {t("account.sidebar.order_history")}
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
          <p className="text-gray-700/80 text-sm sm:text-base">
            {t("order.your_orders")}: {totalElements} {t("order.orders_count")}
          </p>
          <Link
            to="/policy/return"
            className="text-blue-700 font-semibold flex items-center gap-1 hover:underline text-sm sm:text-base"
          >
            {t("order.return_policy_60_days")} →
          </Link>
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="relative flex-grow overflow-y-auto pr-2">
        {orders.length > 0 ? (
          <>
            {orders.map((order) => (
              <OrderCard
                key={order.orderNumber}
                order={order}
                onReviewClick={onReviewClick}
              />
            ))}
            {isFetching && (
              <div className="absolute top-2 right-2 text-sm text-gray-500 animate-pulse">
                {t("loading")}...
              </div>
            )}
          </>
        ) : (
          !isFetching && (
            <div className="text-center py-10 border rounded-lg bg-white/30 backdrop-blur">
              <p>{t("order.no_orders_found")}</p>
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      <div className="flex-shrink-0 mt-4">
        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
