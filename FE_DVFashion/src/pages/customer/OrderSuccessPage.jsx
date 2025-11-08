import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrderByOrderNumber, useCancelOrder } from "../../hooks/useOrder";
import { useTranslation } from "react-i18next";
import { IconCheck, IconArrowLeft, IconX } from "@tabler/icons-react";
import { RingLoader } from "react-spinners";
import { useState } from "react";

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useOrderByOrderNumber(orderNumber);

  const cancelOrderMutation = useCancelOrder();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const order = response?.data;

  // Kiểm tra nếu đơn hàng có thể hủy
  const canCancelOrder = () => {
    if (!order) return false;
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return false;
    }
    // Kiểm tra thời gian hủy trong vòng 24 giờ
    const orderDate = new Date(order.orderDate);
    const cutoffTime = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    return now <= cutoffTime;
  };

  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync({
        orderNumber: order.orderNumber,
        cancellationReason: cancellationReason.trim(),
      });
      setShowCancelModal(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      //
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="backdrop-blur-xl bg-white/40 rounded-3xl p-12 shadow-2xl border border-white/30">
          <RingLoader color="#3b82f6" size={80} />
          <p className="mt-4 text-lg">{t("order.loading_details")}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="backdrop-blur-xl bg-white/50 rounded-3xl p-8 shadow-2xl border border-white/30">
          <h2 className="text-2xl font-bold mb-4">{t("common.error")}</h2>
          <p>{error.response?.data?.message || t("order.load_details_fail")}</p>
          <Link
            to="/"
            className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 backdrop-blur-sm text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
          >
            <IconArrowLeft size={20} />
            {t("order.back_to_home")}
          </Link>
        </div>
      </div>
    );
  }

  // Định dạng tiền tệ và ngày tháng
  const formatCurrency = (value) => {
    if (value == null) return "-";
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString() + "đ";
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="backdrop-blur-2xl bg-white/60 shadow-2xl rounded-xl p-8 border border-white/40 hover:bg-white/70 transition-all duration-500">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-xl border border-white/30">
              <IconCheck size={48} className="text-white drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t("order.success_title")}
            </h1>
            <p className="mt-2 text-gray-600">
              {t("order.success_message", { orderNumber: order.orderNumber })}
            </p>
          </div>

          {/* Order Summary */}
          <div className="border-t border-white/30 border-b py-2 my-2 backdrop-blur-sm bg-white/20 rounded-2xl px-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("order.summary")}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="backdrop-blur-sm bg-white/40 p-3 rounded-xl border border-white/30 hover:bg-white/50 transition-all duration-300">
                <p className="text-gray-500">{t("order.number")}</p>
                <p className="font-medium text-gray-900">{order.orderNumber}</p>
              </div>
              <div className="backdrop-blur-sm bg-white/40 p-3 rounded-xl border border-white/30 hover:bg-white/50 transition-all duration-300">
                <p className="text-gray-500">{t("order.date")}</p>
                <p className="font-medium text-gray-900">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white/40 p-3 rounded-xl border border-white/30 hover:bg-white/50 transition-all duration-300">
                <p className="text-gray-500">{t("order.total_amount")}</p>
                <p className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white/40 p-3 rounded-xl border border-white/30 hover:bg-white/50 transition-all duration-300">
                <p className="text-gray-500">{t("order.status_label")}</p>
                <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 backdrop-blur-sm rounded-full shadow-sm border border-green-200/50">
                  {t(`order.status.${order.status?.toLowerCase()}`)}
                </span>
              </div>

              {/* Shipping fee */}
              <div className="backdrop-blur-sm bg-white/40 p-3 rounded-xl border border-white/30 hover:bg-white/50 transition-all duration-300">
                <p className="text-gray-500">
                  {t("order.shipping_fee") || "Phí vận chuyển"}
                </p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(order.shippingFee)}
                </p>
              </div>

              {/* Estimated delivery time */}
              <div className="backdrop-blur-sm bg-white/40 p-3 rounded-xl border border-white/30 hover:bg-white/50 transition-all duration-300">
                <p className="text-gray-500">
                  {t("order.estimated_delivery") || "Dự kiến giao"}
                </p>
                <p className="font-medium text-gray-900">
                  {order.estimatedDeliveryTime
                    ? formatDateTime(order.estimatedDeliveryTime)
                    : order.deliveryTimeText || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("cart.shipping_info")}
            </h3>
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/50 to-white/30 p-4 rounded-lg text-sm text-gray-700 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
              <p className="font-bold">{order.shippingInfo.fullName}</p>
              <p>{order.shippingInfo.phone}</p>
              <p>{order.shippingInfo.fullAddress}</p>

              {/* show estimated delivery again near shipping info (if available) */}
              {order.estimatedDeliveryTime || order.deliveryTimeText ? (
                <p className="mt-2 text-sm text-gray-600 backdrop-blur-sm bg-blue-50/60 p-2 rounded-lg border border-blue-200/40">
                  <strong>
                    {t("order.estimated_delivery") || "Dự kiến giao"}:
                  </strong>{" "}
                  {order.estimatedDeliveryTime
                    ? formatDateTime(order.estimatedDeliveryTime)
                    : order.deliveryTimeText}
                </p>
              ) : null}
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {t("order.items_title")}
            </h3>
            <ul className="divide-y divide-white/30">
              {order.items.map((item) => (
                <li
                  key={item.productVariantId}
                  className="py-4 flex backdrop-blur-xl bg-white/30 rounded-xl mb-3 px-4 border border-white/30 hover:bg-white/40 hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-20 w-20 rounded-md object-cover shadow-md border-2 border-white/50"
                  />
                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 backdrop-blur-sm bg-gray-100/50 inline-block px-2 py-0.5 rounded-full">
                        {item.color} - {item.sizeName}
                      </p>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <p className="text-gray-500">
                        {t("cart.quantity")}: {item.quantity}
                      </p>
                      <p className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {item.totalPrice.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 backdrop-blur-sm text-white font-bold px-8 py-3 rounded-full text-base shadow-lg hover:shadow-xl hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 transition-all duration-300 border border-white/20"
            >
              <IconArrowLeft size={20} />
              {t("order.continue_shopping")}
            </Link>

            {/* Cancel Order Button */}
            {canCancelOrder() && (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={cancelOrderMutation.isLoading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 via-red-600 to-pink-600 backdrop-blur-sm text-white font-bold px-8 py-3 rounded-full text-base shadow-lg hover:shadow-xl hover:from-red-600 hover:via-red-700 hover:to-pink-700 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
              >
                {cancelOrderMutation.isLoading ? (
                  <IconLoader2 size={20} className="animate-spin" />
                ) : (
                  <IconX size={20} />
                )}
                {t("order.cancel_order")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            if (!cancelOrderMutation.isLoading) {
              setShowCancelModal(false);
            }
          }}
        >
          <div
            className="backdrop-blur-2xl bg-white/80 rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-white/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Loading overlay */}
            {cancelOrderMutation.isLoading && (
              <div className="absolute inset-0 backdrop-blur-xl bg-white/90 rounded-xl z-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <IconLoader2
                    size={48}
                    className="animate-spin text-red-600"
                  />
                  <p className="text-sm font-medium text-gray-700">
                    {t("order.cancelling")}
                  </p>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t("order.cancel_order_confirm_title")}
            </h2>
            <p className="text-gray-600 mb-4 backdrop-blur-sm bg-yellow-50/60 p-3 rounded-lg border border-yellow-200/40">
              {t("order.cancel_order_confirm_message", {
                orderNumber: order.orderNumber,
              })}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("order.cancellation_reason_label")}
              </label>
              <textarea
                className="w-full backdrop-blur-sm bg-white/70 border border-gray-300/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:bg-gray-100/50 disabled:cursor-not-allowed transition-all duration-300 shadow-inner"
                rows={4}
                maxLength={500}
                placeholder={t("order.cancellation_reason_placeholder")}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                disabled={cancelOrderMutation.isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {cancellationReason.length}/500
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 backdrop-blur-sm bg-gray-200/80 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300/80 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg border border-gray-300/30"
                disabled={cancelOrderMutation.isLoading}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={
                  !cancellationReason.trim() || cancelOrderMutation.isLoading
                }
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 disabled:from-red-300 disabled:to-pink-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl border border-white/20 cursor-pointer disabled:opacity-50"
              >
                {cancelOrderMutation.isLoading && (
                  <IconLoader2 size={16} className="animate-spin" />
                )}
                {cancelOrderMutation.isLoading
                  ? t("order.cancelling")
                  : t("order.cancel_order")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
