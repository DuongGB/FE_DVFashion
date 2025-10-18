import { useMyOrdersPaging } from "../../../hooks/useOrder";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getOrderStatusLabel } from "../../../utils/getOrderStatusLabel";
import Pagination from "../../common/Pagination";
import { getPaymentMethodLabel } from "../../../utils/getPaymentMethodLabel";

const OrderCard = ({ order }) => {
  const { t } = useTranslation();
  const orderDate = new Date(order.orderDate).toLocaleDateString("vi-VN");
  const paymentMethod = order?.payment?.paymentMethod;

  return (
    <div className="mb-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
        <div>
          <p className="font-bold text-lg tracking-wider">
            {order.orderNumber}
          </p>
          <p className="text-sm opacity-90">{orderDate}</p>
        </div>
        <span className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
          {getOrderStatusLabel(order.status, t)}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 divide-y divide-gray-200">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex items-start py-4 first:pt-0 last:pb-0"
          >
            <img
              src={item.imageUrl}
              alt={item.productName}
              className="w-20 h-20 object-cover rounded-md mr-4"
            />
            <div className="flex-grow">
              <p className="font-semibold text-base">{item.productName}</p>
              <p className="text-sm text-gray-500">
                {item.color} / {item.sizeName}{" "}
                {/* Sửa từ item.size thành item.sizeName */}
              </p>
              {item.unitPrice === 0 && (
                <p className="text-sm font-bold text-blue-600">
                  {t("order.gift")}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold">
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
      <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-between items-center rounded-b-lg">
        <div>
          <p className="text-gray-600">{t("order.total_amount")}:</p>
          <p className="font-bold text-xl text-red-600">
            {order.totalAmount.toLocaleString()}đ
          </p>
          {paymentMethod && (
            <p className="text-sm text-gray-500 mt-1">
              {t("order.payment_method.title")}:{" "}
              <span className="font-medium text-gray-700">
                {getPaymentMethodLabel(paymentMethod, t)}
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="border border-gray-400 rounded-full px-6 py-2 font-bold text-sm hover:bg-gray-100">
            {t("order.return_exchange")}
          </button>
          <button className="bg-black text-white rounded-full px-6 py-2 font-bold text-sm hover:opacity-80">
            {t("order.review")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OrderHistory() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const { data: responseData, isLoading } = useMyOrdersPaging({
    page,
    size: 2,
  });

  const pagedData = responseData?.data;
  const orders = pagedData?.values || []; // Sửa từ content thành values
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 0;

  const handlePageChange = (newPage) => {
    // Pagination component uses 1-based index, so convert to 0-based for API
    setPage(newPage - 1);
  };

  if (isLoading) {
    return (
      // Thêm return
      <div className="text-center py-10 border rounded-lg">
        <p>{t("loading")}...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <h2 className="text-3xl font-bold mb-2">
          {t("account.sidebar.order_history")}
        </h2>
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {t("order.your_orders")}: {totalElements} {t("order.orders_count")}
          </p>
          <Link
            to="/policy/return"
            className="text-blue-600 font-semibold flex items-center gap-1"
          >
            {t("order.return_policy_60_days")} →
          </Link>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} />
          ))
        ) : (
          <div className="text-center py-10 border rounded-lg">
            <p>{t("order.no_orders_found")}</p>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 mt-4">
        <Pagination
          currentPage={page + 1} // Convert back to 1-based for display
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
