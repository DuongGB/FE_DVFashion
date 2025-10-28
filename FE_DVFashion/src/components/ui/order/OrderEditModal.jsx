import { useState, useEffect } from "react";
import { IconX, IconEdit } from "@tabler/icons-react";
import { useAdminUpdateOrder } from "../../../hooks/useOrder";
import { useTranslation } from "react-i18next";

const ORDER_STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "RETURNED",
];

const PAYMENT_STATUS_OPTIONS = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "CANCELED",
];

export default function OrderEditModal({
  order,
  open = true,
  onClose,
  onSave,
}) {
  const { t } = useTranslation();
  const adminUpdateOrderMutation = useAdminUpdateOrder();

  if (!open || !order) return null;

  // order may be mapped modal object or raw API object
  const o = order.__raw ?? order;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    country: "",
    city: "",
    district: "",
    ward: "",
    street: "",
    notes: "",
    orderStatus: "",
    paymentStatus: "",
  });

  useEffect(() => {
    if (!o) return;
    setFormData({
      fullName: o.shippingInfo?.fullName ?? "",
      phone: o.shippingInfo?.phone ?? "",
      country: o.shippingInfo?.country ?? "",
      city: o.shippingInfo?.city ?? "",
      district: o.shippingInfo?.district ?? "",
      ward: o.shippingInfo?.ward ?? "",
      street: o.shippingInfo?.fullAddress ?? o.shippingInfo?.street ?? "",
      notes: o.notes ?? "",
      orderStatus: o.status ?? "",
      paymentStatus: o.payment?.paymentStatus ?? "",
    });
  }, [o]);

  const handleChange = (field, value) => {
    setFormData((s) => ({ ...s, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build AdminUpdateOrderRequest shape
    const payload = {
      fullName: formData.fullName || undefined,
      phone: formData.phone || undefined,
      country: formData.country || undefined,
      city: formData.city || undefined,
      district: formData.district || undefined,
      ward: formData.ward || undefined,
      street: formData.street || undefined,
      notes: formData.notes ?? undefined,
      orderStatus: formData.orderStatus || undefined,
      paymentStatus: formData.paymentStatus || undefined,
    };
    // Gọi API update
    adminUpdateOrderMutation.mutate(
      {
        orderNumber: o.orderNumber ?? o.id,
        updateData: payload,
      },
      {
        onSuccess: (data) => {
          onSave?.(data?.data);
          onClose?.();
        },
        onError: () => {},
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/30 transition-colors cursor-pointer"
            aria-label={t("common.close")}
          >
            <IconX size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-md">
              <IconEdit size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {t("order.update_order") || "Chỉnh sửa đơn hàng"}
              </h2>
              <div className="text-sm text-blue-100 opacity-90">
                #{o.orderNumber ?? o.id}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">
                {t("cart.shipping_info")}
              </div>
              <div className="space-y-2">
                <input
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
                  placeholder={t("address.fullName")}
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                <input
                  className="w-full bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                  placeholder={t("address.phone")}
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <input
                  className="w-full bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                  placeholder={t("address.street")}
                  value={formData.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                    placeholder={t("address.district")}
                    value={formData.district}
                    onChange={(e) => handleChange("district", e.target.value)}
                  />
                  <input
                    className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                    placeholder={t("address.ward")}
                    value={formData.ward}
                    onChange={(e) => handleChange("ward", e.target.value)}
                  />
                  <input
                    className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                    placeholder={t("address.city")}
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>
                <input
                  className="w-full bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2"
                  placeholder={t("address.country")}
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  {t("order.status_label")} & {t("order.payment_method.title")}
                </div>

                <label className="text-sm text-gray-600">
                  {t("order.status_label")}
                </label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 mb-3"
                  value={formData.orderStatus}
                  onChange={(e) => handleChange("orderStatus", e.target.value)}
                >
                  <option value="">
                    {t("common.all") + " / " + t("common.cancel")}
                  </option>
                  {ORDER_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {t(`order.status.${s.toLowerCase()}`)}
                    </option>
                  ))}
                </select>

                <label className="text-sm text-gray-600">
                  {t("order.payment_method.title")}
                </label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 mb-3"
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    handleChange("paymentStatus", e.target.value)
                  }
                >
                  <option value="">
                    {t("common.all") + " / " + t("common.cancel")}
                  </option>
                  {PAYMENT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {t(`order.status.${s.toLowerCase()}`) || s}
                    </option>
                  ))}
                </select>

                <label className="text-sm text-gray-600">
                  {t("common.note") || "Ghi chú"}
                </label>
                <textarea
                  maxLength={500}
                  className="w-full bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 h-28 resize-none"
                  placeholder={t("common.note") + " (500)"}
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                />
              </div>

              <div className="mt-3 text-sm text-gray-500">
                {t("order.update_note") ||
                  "Lưu ý: chỉ thay đổi những trường bạn muốn. Để giữ nguyên trường nào thì để trống."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex justify-end gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:bg-blue-700 transition-colors"
            disabled={adminUpdateOrderMutation.isLoading}
          >
            {adminUpdateOrderMutation.isLoading
              ? t("common.saving")
              : t("common.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
