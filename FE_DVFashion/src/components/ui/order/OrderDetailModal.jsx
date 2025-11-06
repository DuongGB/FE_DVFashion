import { IconX, IconInfoCircle } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function OrderDetailModal({ order, onClose, open = true }) {
  const { t } = useTranslation();
  if (!open || !order) return null;

  // order may be either mapped modal object or raw API object
  const o = order.__raw ?? order;
  console.log("OrderDetailModal order:", o);

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

  const statusLabelMap = {
    DELIVERED: "Đã giao",
    CONFIRMED: "Xác nhận",
    PROCESSING: "Đang xử lý",
    PENDING: "Chờ xử lý",
    CANCELED: "Đã hủy",
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/30 transition-colors cursor-pointer"
            aria-label={t("common.close")}
          >
            <IconX size={16} />
          </button>

          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-md">
              <IconInfoCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t("order.summary")}</h2>
              <div className="text-sm text-blue-100 opacity-90">
                #{o.orderNumber ?? o.id} • {formatDate(o.orderDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">
                {t("account.main.full_name")}
              </div>
              <div className="font-medium text-gray-800">
                {o.customerName ?? o.customer}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {o.shippingInfo?.email || "-"} • {o.shippingInfo?.phone || "-"}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {o.shippingInfo?.fullAddress || "-"}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">
                {t("order.payment_method.title")}
              </div>
              <div className="font-medium">
                {paymentMethodMap[o.payment?.paymentMethod] ??
                  o.payment?.paymentMethod ??
                  "-"}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {t("order.status_label")}:{" "}
                <span className="font-semibold">
                  {paymentStatusMap[o.payment?.paymentStatus] ??
                    o.payment?.paymentStatus ??
                    "-"}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {t("order.total_amount")}:{" "}
                {formatCurrency(o.payment?.amount ?? o.totalAmount)}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {t("order.status_label")}
                </div>
                <span
                  className={`inline-block text-white text-sm px-3 py-1 rounded ${
                    statusColorMap[o.status] ?? "bg-gray-400"
                  }`}
                >
                  {t(`order.status.${o.status?.toLowerCase()}`) ?? o.status}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-sm text-gray-600">
                  {t("order.total_amount")}
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  {formatCurrency(o.totalAmount ?? o.total)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm overflow-hidden">
            <div className="p-3 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-gray-800">
                {t("order.items_title")} ({items.length})
              </h3>
            </div>

            <div className="p-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-600">
                  <tr>
                    <th className="py-2">{t("admin.product.detail.name")}</th>
                    <th className="py-2">
                      {t("product.detail.color") +
                        " & " +
                        t("product.detail.size")}
                    </th>
                    <th className="py-2">{t("product.detail.price")}</th>
                    <th className="py-2">{t("cart.quantity")}</th>
                    <th className="py-2">{t("order.total_amount")}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {items.map((it, idx) => (
                    <tr
                      key={idx}
                      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:bg-gray-50"
                    >
                      <td className="py-3 flex items-center gap-3">
                        {it.imageUrl && (
                          <img
                            src={it.imageUrl}
                            alt={it.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{it.productName}</div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="text-sm text-gray-600">
                          {t("product.detail.color")}: {it.color ?? "-"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("product.detail.size")}: {it.sizeName ?? "-"}
                        </div>
                      </td>
                      <td className="py-3">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-3">{it.quantity}</td>
                      <td className="py-3 font-semibold">
                        {formatCurrency(
                          it.totalPrice ?? it.unitPrice * it.quantity
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-lg p-6 shadow-sm bg-gray-50">
              <div className="flex justify-end flex-col gap-2 ml-auto">
                <div className="flex justify-between text-sm text-gray-600">
                  <div>{t("cart.title")}</div>
                  <div>{formatCurrency(o.subtotal)}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <div>{t("cart.shipping_info")}</div>
                  <div>{formatCurrency(o.shippingFee)}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <div>{t("cart.voucher")}</div>
                  <div>-{formatCurrency(o.discountAmount)}</div>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2bg-white border border-gray-200 rounded-lg p-6 shadow-sm  mt-2">
                  <div>{t("order.total_amount")}</div>
                  <div>{formatCurrency(o.totalAmount)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div>
              {t("common.note")}:{" "}
              <span className="text-gray-800">
                {o.notes || t("common.none")}
              </span>
            </div>
            <div>
              {t("order.date")}:{" "}
              <span className="text-gray-800">{formatDate(o.orderDate)}</span>
            </div>
            {o.estimatedDeliveryTime && (
              <div>
                {t("order.estimated_delivery_time")}:{" "}
                <span className="text-gray-800">
                  {formatDate(o.estimatedDeliveryTime)}
                </span>
              </div>
            )}
            {o.shippedDate && (
              <div>
                {t("order.status.shipped")}:{" "}
                <span className="text-gray-800">
                  {formatDate(o.shippedDate)}
                </span>
              </div>
            )}
            {o.deliveredDate && (
              <div>
                {t("order.status.delivered")}:{" "}
                <span className="text-gray-800">
                  {formatDate(o.deliveredDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
