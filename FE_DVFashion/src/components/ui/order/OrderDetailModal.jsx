import { IconX, IconInfoCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function OrderDetailModal({ order, onClose, open = true }) {
  const { t } = useTranslation();
  if (!open || !order) return null;

  // order may be either mapped modal object or raw API object
  const o = order.__raw ?? order;

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("vi-VN");
    } catch {
      return iso;
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return "-";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount));
  };

  const statusColorMap = {
    DELIVERED: "bg-green-600",
    CONFIRMED: "bg-blue-500",
    PROCESSING: "bg-yellow-500",
    PENDING: "bg-gray-500",
    CANCELED: "bg-red-500",
    RETURNED: "bg-gray-400",
    SHIPPED: "bg-blue-400",
  };

  const paymentMethodMap = {
    CASH_ON_DELIVERY: t("order.payment_method.cod"),
    PAYPAL: t("order.payment_method.paypal"),
    BANK_TRANSFER: t("order.payment_method.bank_transfer") || "Chuyển khoản",
  };

  const paymentStatusMap = {
    PENDING: t("order.status.pending"),
    COMPLETED: t("order.status.completed"),
    FAILED: t("order.status.failed"),
    REFUNDED: t("order.status.refunded"),
    CANCELED: t("order.status.canceled"),
  };

  const items = o.items ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 md:p-4"
      aria-modal="true"
    >
      <div
        className="bg-white md:backdrop-blur-xl md:bg-white/90 border-0 md:border md:border-white/30 rounded-none md:rounded-2xl shadow-2xl w-full max-w-3xl h-full md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative md:rounded-t-2xl flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer z-10"
            aria-label={t("common.close")}
          >
            <IconX size={18} />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="bg-white/20 p-2 rounded-md backdrop-blur-sm hidden sm:block">
              <IconInfoCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("order.summary")}</h2>
              <div className="text-sm text-blue-100 opacity-90 truncate">
                #{o.orderNumber ?? o.id} • {formatDate(o.orderDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 md:bg-transparent">
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Customer Info */}
            <div className="bg-white md:backdrop-blur-xl md:bg-white/60 border border-gray-200 md:border-white/30 rounded-xl p-4 shadow-sm md:shadow-lg">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                {t("account.main.full_name")}
              </div>
              <div className="font-medium text-gray-800 break-words">
                {o.customerName ?? o.customer}
              </div>
              <div className="text-sm text-gray-500 mt-1 break-all">
                {o.shippingInfo?.email}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {o.shippingInfo?.phone}
              </div>
              <div className="text-sm text-gray-500 mt-2 border-t pt-2 border-gray-100">
                {o.shippingInfo?.fullAddress || "-"}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white md:backdrop-blur-xl md:bg-white/60 border border-gray-200 md:border-white/30 rounded-xl p-4 shadow-sm md:shadow-lg">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                {t("order.payment_method.title")}
              </div>
              <div className="font-medium text-blue-700">
                {paymentMethodMap[o.payment?.paymentMethod] ??
                  o.payment?.paymentMethod ??
                  "-"}
              </div>
              <div className="text-sm text-gray-600 mt-2 flex justify-between">
                <span>{t("order.status_label")}:</span>
                <span className="font-semibold">
                  {paymentStatusMap[o.payment?.paymentStatus] ??
                    o.payment?.paymentStatus ??
                    "-"}
                </span>
              </div>
            </div>

            {/* Status & Total Info */}
            <div className="bg-white md:backdrop-blur-xl md:bg-white/60 border border-gray-200 md:border-white/30 rounded-xl p-4 shadow-sm md:shadow-lg flex flex-row md:flex-col justify-between items-center md:items-start">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  {t("order.status_label")}
                </div>
                <span
                  className={`inline-block text-white text-xs font-bold px-2 py-1 rounded ${
                    statusColorMap[o.status] ?? "bg-gray-400"
                  }`}
                >
                  {t(`order.status.${o.status?.toLowerCase()}`) ?? o.status}
                </span>
              </div>

              <div className="text-right md:text-left mt-0 md:mt-3">
                <div className="text-xs font-semibold text-gray-500 uppercase">
                  {t("order.total_amount")}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(o.totalAmount ?? o.total)}
                </div>
              </div>
            </div>
          </div>

          {/* Items List Section */}
          <div className="bg-white md:backdrop-blur-xl md:bg-white/60 border border-gray-200 md:border-white/30 rounded-xl shadow-sm md:shadow-lg overflow-hidden">
            <div className="p-3 bg-gray-50/50 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                {t("order.items_title")} ({items.length})
              </h3>
            </div>

            {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
            <div className="hidden md:block p-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-2 font-medium">
                      {t("admin.product.detail.name")}
                    </th>
                    <th className="py-2 font-medium">
                      {t("product.detail.color")} & {t("product.detail.size")}
                    </th>
                    <th className="py-2 font-medium">
                      {t("product.detail.price")}
                    </th>
                    <th className="py-2 font-medium">{t("cart.quantity")}</th>
                    <th className="py-2 font-medium text-right">
                      {t("order.total_amount")}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {items.map((it, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 last:border-0 hover:bg-white/40"
                    >
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={it.imageUrl || "/placeholder.png"}
                          alt={it.productName}
                          className="w-12 h-12 object-cover rounded shadow-sm bg-gray-100"
                        />
                        <span className="font-medium line-clamp-2">
                          {it.productName}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 whitespace-nowrap">
                          {it.color} / {it.sizeName}
                        </span>
                      </td>
                      <td className="py-3">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-3 pl-4">{it.quantity}</td>
                      <td className="py-3 font-semibold text-right">
                        {formatCurrency(
                          it.totalPrice ?? it.unitPrice * it.quantity
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE LIST VIEW (Visible on Mobile) --- */}
            <div className="md:hidden">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 border-b border-gray-100 last:border-0"
                >
                  {/* Left: Image */}
                  <div className="w-20 h-24 flex-shrink-0">
                    <img
                      src={it.imageUrl || "/placeholder.png"}
                      alt={it.productName}
                      className="w-full h-full object-cover rounded-md bg-gray-100 border border-gray-200"
                    />
                  </div>
                  {/* Right: Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-medium text-gray-900 line-clamp-2 mb-1">
                        {it.productName}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {t("product.detail.color")}: {it.color}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("product.detail.size")}: {it.sizeName}
                      </div>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <div className="text-sm text-gray-500">
                        {formatCurrency(it.unitPrice)}{" "}
                        <span className="text-xs">x</span> {it.quantity}
                      </div>
                      <div className="font-bold text-gray-900">
                        {formatCurrency(
                          it.totalPrice ?? it.unitPrice * it.quantity
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
              <div className="flex flex-col gap-2 ml-auto w-full md:w-1/2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t("cart.title")}</span>
                  <span>{formatCurrency(o.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t("cart.shipping_info")}</span>
                  <span>{formatCurrency(o.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t("cart.voucher")}</span>
                  <span>-{formatCurrency(o.discountAmount)}</span>
                </div>
                <div className="h-px bg-gray-200 my-1"></div>
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>{t("order.total_amount")}</span>
                  <span>{formatCurrency(o.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info (Dates/Notes) */}
          <div className="bg-white md:bg-transparent rounded-xl p-4 shadow-sm md:shadow-none text-sm space-y-2">
            <div>
              <span className="font-medium text-gray-700">
                {t("common.note")}:{" "}
              </span>
              <span className="text-gray-500 italic">
                {o.notes || t("common.none")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
              <div>
                {t("order.date")}:{" "}
                <span className="text-gray-900">{formatDate(o.orderDate)}</span>
              </div>
              {o.estimatedDeliveryTime && (
                <div>
                  {t("order.estimated_delivery_time")}:{" "}
                  <span className="text-gray-900">
                    {formatDate(o.estimatedDeliveryTime)}
                  </span>
                </div>
              )}
              {o.shippedDate && (
                <div>
                  {t("order.status.shipped")}:{" "}
                  <span className="text-gray-900">
                    {formatDate(o.shippedDate)}
                  </span>
                </div>
              )}
              {o.deliveredDate && (
                <div>
                  {t("order.status.delivered")}:{" "}
                  <span className="text-gray-900">
                    {formatDate(o.deliveredDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
