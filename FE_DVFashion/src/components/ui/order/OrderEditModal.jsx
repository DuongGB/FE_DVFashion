import { useState, useEffect } from "react";
import {
  IconX,
  IconEdit,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { useAdminUpdateOrder } from "../../../hooks/useOrder";
import { useTranslation } from "react-i18next";
import { useAddress, useProvinces } from "../../../hooks/useAddress";

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

const ORDER_STATUS_FLOW = {
  PENDING: ["CONFIRMED", "CANCELED"],
  CONFIRMED: ["PROCESSING", "CANCELED"],
  PROCESSING: ["SHIPPED", "CANCELED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELED: [],
  RETURNED: [],
};

const PAYMENT_STATUS_FLOW = {
  PENDING: ["COMPLETED", "CANCELED"],
  COMPLETED: [],
  FAILED: [],
  REFUNDED: [],
  CANCELED: [],
};

export default function OrderEditModal({
  order,
  open = true,
  onClose,
  onSave,
}) {
  const { t } = useTranslation();
  const adminUpdateOrderMutation = useAdminUpdateOrder();
  const [submitting, setSubmitting] = useState(false);
  const { data: provincesData = [], isLoading: isProvincesLoading } =
    useProvinces();
  const { fetchDistricts, fetchWards } = useAddress();

  const [locationData, setLocationData] = useState({
    provinces: [],
    districts: [],
    wards: [],
    isLoading: false,
  });

  // Khi provincesData thay đổi, map lại cho locationData
  useEffect(() => {
    if (provincesData.length > 0) {
      setLocationData((prev) => ({
        ...prev,
        provinces: provincesData,
      }));
    }
  }, [provincesData]);

  if (!open || !order) return null;

  const o = order.__raw ?? order;
  const isLoading = adminUpdateOrderMutation.isLoading;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    country: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    notes: "",
    orderStatus: "",
    paymentStatus: "",
    cancellationReason: "",
  });

  const [showCancellationReason, setShowCancellationReason] = useState(false);

  // Initialize form data from order
  useEffect(() => {
    if (!o || provincesData.length === 0) return;

    const initFormData = async () => {
      const initialData = {
        fullName: o.shippingInfo?.fullName ?? "",
        phone: o.shippingInfo?.phone ?? "",
        country: o.shippingInfo?.country ?? "Vietnam",
        province: "",
        district: "",
        ward: "",
        street: o.shippingInfo?.fullAddress ?? o.shippingInfo?.street ?? "",
        notes: o.notes ?? "",
        orderStatus: o.status ?? "",
        paymentStatus: o.payment?.paymentStatus ?? "",
        cancellationReason: "",
      };

      // Find province by name and set code
      if (o.shippingInfo?.city && provincesData.length > 0) {
        const province = provincesData.find(
          (p) => p.name === o.shippingInfo.city
        );
        if (province) {
          initialData.province = province.code?.toString();

          // Load districts for this province
          const districts = await loadDistrictsByProvince(province.code);

          // Find district by name and set code
          if (o.shippingInfo?.district && districts.length > 0) {
            const district = districts.find(
              (d) => d.name === o.shippingInfo.district
            );
            if (district) {
              initialData.district = district.code?.toString();

              // Load wards for this district
              const wards = await loadWardsByDistrict(district.id);

              // Find ward by name and set code
              if (o.shippingInfo?.ward && wards.length > 0) {
                const ward = wards.find((w) => w.name === o.shippingInfo.ward);
                if (ward) {
                  initialData.ward = ward.code?.toString();
                }
              }
            }
          }
        }
      }

      setFormData(initialData);
    };

    initFormData();
    // eslint-disable-next-line
  }, [o, provincesData]);

  const loadDistrictsByProvince = async (provinceCode) => {
    const provinceId = provinceCode ? parseInt(provinceCode, 10) : null;
    if (!provinceId) return [];

    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const districts = await fetchDistricts(provinceId);
      const mapped = (districts || []).map((d) => ({
        code: d.code,
        name: d.districtName,
        id: d.districtId,
      }));
      setLocationData((prev) => ({
        ...prev,
        districts: mapped,
        wards: [],
        isLoading: false,
      }));
      return mapped;
    } catch (error) {
      console.error("Error loading districts:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
      return [];
    }
  };

  const loadWardsByDistrict = async (districtId) => {
    if (!districtId) return [];

    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const wards = await fetchWards(districtId);
      const mapped = (wards || []).map((w) => ({
        code: w.wardCode,
        name: w.wardName,
      }));
      setLocationData((prev) => ({
        ...prev,
        wards: mapped,
        isLoading: false,
      }));
      return mapped;
    } catch (error) {
      console.error("Error loading wards:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
      return [];
    }
  };

  const handleProvinceChange = async (provinceCode) => {
    setFormData((prev) => ({
      ...prev,
      province: provinceCode,
      district: "",
      ward: "",
    }));

    if (!provinceCode) {
      setLocationData((prev) => ({ ...prev, districts: [], wards: [] }));
      return;
    }

    await loadDistrictsByProvince(provinceCode);
  };

  const handleDistrictChange = async (districtCode) => {
    setFormData((prev) => ({
      ...prev,
      district: districtCode,
      ward: "",
    }));

    if (!districtCode) {
      setLocationData((prev) => ({ ...prev, wards: [] }));
      return;
    }

    const districtObj = locationData.districts.find(
      (d) => d.code === districtCode
    );
    const districtId = districtObj ? districtObj.id : null;

    if (!districtId) {
      setLocationData((prev) => ({ ...prev, wards: [] }));
      return;
    }

    await loadWardsByDistrict(districtId);
  };

  const handleWardChange = (wardCode) => {
    setFormData((prev) => ({ ...prev, ward: wardCode }));
  };

  const getProvinceName = (code) => {
    const province = locationData.provinces.find(
      (p) => p.code?.toString() === code?.toString()
    );
    return province ? province.name : "";
  };

  const getDistrictName = (code) => {
    const district = locationData.districts.find(
      (d) => d.code?.toString() === code?.toString()
    );
    return district ? district.name : "";
  };

  const getWardName = (code) => {
    const ward = locationData.wards.find(
      (w) => w.code?.toString() === code?.toString()
    );
    return ward ? ward.name : "";
  };

  const handleChange = (field, value) => {
    setFormData((s) => ({ ...s, [field]: value }));

    if (field === "orderStatus") {
      setShowCancellationReason(
        value === "CANCELED" && o.status !== "CANCELED"
      );
    }
  };

  const getAllowedOrderStatuses = () => {
    const currentStatus = o.status;
    if (!currentStatus) return ORDER_STATUS_OPTIONS;

    const allowedNext = ORDER_STATUS_FLOW[currentStatus] || [];
    return [currentStatus, ...allowedNext];
  };

  const getAllowedPaymentStatuses = () => {
    const currentStatus = o.payment?.paymentStatus;
    if (!currentStatus) return PAYMENT_STATUS_OPTIONS;

    const allowedNext = PAYMENT_STATUS_FLOW[currentStatus] || [];
    return [currentStatus, ...allowedNext];
  };

  const canUpdateShippingInfo = () => {
    const status = o.status;
    return ["PENDING", "CONFIRMED"].includes(status);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoading || submitting) return;

    setSubmitting(true);

    if (showCancellationReason && !formData.cancellationReason?.trim()) {
      alert(
        t("order.cancellation_reason_required") || "Vui lòng nhập lý do hủy đơn"
      );
      setSubmitting(false);
      return;
    }

    const payload = {};

    if (canUpdateShippingInfo()) {
      if (formData.fullName && formData.fullName !== o.shippingInfo?.fullName) {
        payload.fullName = formData.fullName;
      }
      if (formData.phone && formData.phone !== o.shippingInfo?.phone) {
        payload.phone = formData.phone;
      }
      if (formData.country && formData.country !== o.shippingInfo?.country) {
        payload.country = formData.country;
      }

      const newCityName = getProvinceName(formData.province);
      if (newCityName && newCityName !== o.shippingInfo?.city) {
        payload.city = newCityName;
      }

      const newDistrictName = getDistrictName(formData.district);
      if (newDistrictName && newDistrictName !== o.shippingInfo?.district) {
        payload.district = newDistrictName;
      }

      const newWardName = getWardName(formData.ward);
      if (newWardName && newWardName !== o.shippingInfo?.ward) {
        payload.ward = newWardName;
      }

      if (
        formData.street &&
        formData.street !==
          (o.shippingInfo?.fullAddress ?? o.shippingInfo?.street)
      ) {
        payload.street = formData.street;
      }
    }

    if (formData.notes !== (o.notes ?? "")) {
      payload.notes = formData.notes || "";
    }

    if (formData.orderStatus && formData.orderStatus !== o.status) {
      payload.orderStatus = formData.orderStatus;

      if (formData.orderStatus === "CANCELED" && formData.cancellationReason) {
        payload.cancellationReason = formData.cancellationReason;
      }
    }

    if (
      formData.paymentStatus &&
      formData.paymentStatus !== o.payment?.paymentStatus
    ) {
      payload.paymentStatus = formData.paymentStatus;
    }

    if (Object.keys(payload).length === 0) {
      setSubmitting(false);
      onClose?.();
      return;
    }

    adminUpdateOrderMutation.mutate(
      {
        orderNumber: o.orderNumber ?? o.id,
        updateData: payload,
      },
      {
        onSuccess: (data) => {
          setSubmitting(false);
          onSave?.(data?.data);
          onClose?.();
        },
        onError: (error) => {
          console.error("Update failed:", error);
          setSubmitting(false);
        },
      }
    );
  };

  const allowedOrderStatuses = getAllowedOrderStatuses();
  const allowedPaymentStatuses = getAllowedPaymentStatuses();
  const shippingEditable = canUpdateShippingInfo();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <form
        className="relative backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        {isLoading && (
          <div
            className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl z-20 flex items-center justify-center cursor-not-allowed"
            style={{ pointerEvents: "all" }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconLoader2 size={48} className="animate-spin text-blue-600" />
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative rounded-t-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t("common.close")}
            disabled={isLoading}
          >
            <IconX size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-md backdrop-blur-sm">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!shippingEditable && (
            <div className="backdrop-blur-xl bg-amber-50/60 border border-amber-200/40 rounded-lg p-3 flex items-start gap-2">
              <IconAlertCircle
                size={20}
                className="text-amber-600 mt-0.5 flex-shrink-0"
              />
              <div className="text-sm text-amber-800">
                {t("order.shipping_not_editable") ||
                  "Thông tin giao hàng không thể chỉnh sửa cho đơn hàng đã xử lý (Processing/Shipped/Delivered)"}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
              <div className="text-sm text-gray-600 mb-2">
                {t("cart.shipping_info")}
              </div>
              <div className="space-y-2">
                <input
                  className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-3 py-2 shadow-inner disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                  placeholder={t("address.fullName")}
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  disabled={!shippingEditable || isLoading}
                />
                <input
                  className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow-inner px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                  placeholder={t("address.phone")}
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={!shippingEditable || isLoading}
                />

                {/* Province Select */}
                <select
                  className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-3 py-2 shadow-inner disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                  value={formData.province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  disabled={
                    !shippingEditable || isLoading || locationData.isLoading
                  }
                >
                  <option value="">{t("cart.select_province")}</option>
                  {locationData.provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  {/* District Select */}
                  <select
                    className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow-inner px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                    value={formData.district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={
                      !shippingEditable ||
                      !formData.province ||
                      isLoading ||
                      locationData.isLoading
                    }
                  >
                    <option value="">{t("cart.select_district")}</option>
                    {locationData.districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>

                  {/* Ward Select */}
                  <select
                    className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow-inner px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                    value={formData.ward}
                    onChange={(e) => handleWardChange(e.target.value)}
                    disabled={
                      !shippingEditable ||
                      !formData.district ||
                      isLoading ||
                      locationData.isLoading
                    }
                  >
                    <option value="">{t("cart.select_ward")}</option>
                    {locationData.wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street Input */}
                <textarea
                  className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow-inner px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 h-20 resize-none transition-all duration-300"
                  placeholder={t("address.street")}
                  maxLength={500}
                  value={formData.street}
                  readOnly
                  onChange={(e) => handleChange("street", e.target.value)}
                  disabled={!shippingEditable || isLoading}
                />

                {/* Read-only full address display when not editable */}
                {!shippingEditable && (
                  <div className="mt-2 p-2 backdrop-blur-sm bg-gray-50/80 border border-gray-200/40 rounded text-sm text-gray-600">
                    <div className="font-medium text-gray-700 mb-1">
                      {t("cart.shipping_info")}:
                    </div>
                    <div>
                      {[
                        formData.street,
                        getWardName(formData.ward),
                        getDistrictName(formData.district),
                        getProvinceName(formData.province),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg flex flex-col justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">
                  {t("order.status_label")} & {t("order.payment_method.title")}
                </div>

                <label className="text-sm text-gray-600">
                  {t("order.status_label")}
                </label>
                <select
                  className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow-inner px-3 py-2 mb-3 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                  value={formData.orderStatus}
                  onChange={(e) => handleChange("orderStatus", e.target.value)}
                  disabled={isLoading}
                >
                  {allowedOrderStatuses.map((s) => (
                    <option key={s} value={s}>
                      {t(`order.status.${s.toLowerCase()}`)}
                    </option>
                  ))}
                </select>

                {showCancellationReason && (
                  <div className="mb-3">
                    <label className="text-sm text-gray-600 mb-1 block">
                      {t("order.cancellation_reason") || "Lý do hủy"} *
                    </label>
                    <textarea
                      maxLength={200}
                      className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow-inner px-3 py-2 h-20 resize-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                      placeholder={
                        t("order.cancellation_reason_placeholder") ||
                        "Nhập lý do hủy đơn hàng..."
                      }
                      value={formData.cancellationReason}
                      onChange={(e) =>
                        handleChange("cancellationReason", e.target.value)
                      }
                      disabled={isLoading}
                      required
                    />
                  </div>
                )}

                <label className="text-sm text-gray-600">
                  {t("order.payment_status_label")}
                </label>
                <select
                  className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow-inner px-3 py-2 mb-3 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    handleChange("paymentStatus", e.target.value)
                  }
                  disabled={isLoading}
                >
                  {allowedPaymentStatuses.map((s) => (
                    <option key={s} value={s}>
                      {t(`order.payment_status.${s.toLowerCase()}`)}
                    </option>
                  ))}
                </select>

                <label className="text-sm text-gray-600">
                  {t("common.note") || "Ghi chú"}
                </label>
                <textarea
                  maxLength={500}
                  className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow-inner px-3 py-2 h-28 resize-none disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-300"
                  placeholder={t("common.note") + " (500)"}
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white/30 border-t border-white/30 flex justify-end gap-2 rounded-b-2xl">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            disabled={isLoading || submitting}
          >
            {(isLoading || submitting) && (
              <IconLoader2 size={16} className="animate-spin" />
            )}

            {isLoading || submitting
              ? t("common.saving") || "Đang lưu..."
              : t("common.save") || "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
