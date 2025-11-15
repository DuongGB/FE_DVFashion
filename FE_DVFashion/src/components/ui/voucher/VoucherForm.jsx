import React, { useEffect, useState } from "react";
import {
  IconX,
  IconPercentage,
  IconCalendar,
  IconCheck,
  IconLoader2,
  IconInfoCircle,
  IconTag,
  IconGift,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useVoucher from "../../../hooks/useVoucher";
import { useProduct } from "../../../hooks/useProduct";
import ProductSelectModal from "../promotion/ProductSelectModal";

export default function VoucherForm({ voucher = null, onClose = null }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";
  const navigate = useNavigate();
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { createVoucher, isCreating, updateVoucher, isUpdating } = useVoucher();
  const { products = [] } = useProduct(language);

  const [values, setValues] = useState({
    voucherType: "SHOP_WIDE",
    name: "",
    code: "",
    startDate: "",
    endDate: "",
    allowSaveBeforeActive: false,
    discountType: "PERCENTAGE",
    discountValue: "",
    hasMaxDiscount: false,
    maxDiscountAmount: "",
    minOrderAmount: 0,
    maxTotalUsage: 1,
    maxUsagePerUser: 1,
    isActive: true,
    productIds: [],
    productIdsText: "",
  });

  const [errors, setErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Hàm đồng bộ dữ liệu voucher vào form khi voucher thay đổi
  useEffect(() => {
    if (voucher) {
      setValues({
        voucherType: voucher.voucherType ?? voucher.type ?? "SHOP_WIDE",
        name: voucher.name ?? "",
        code: voucher.code ?? "",
        startDate: voucher.startDate ? voucher.startDate.split("T")[0] : "",
        endDate: voucher.endDate ? voucher.endDate.split("T")[0] : "",
        allowSaveBeforeActive: voucher.allowSaveBeforeActive ?? false,
        discountType: voucher.discountType ?? "PERCENTAGE",
        discountValue: voucher.discountValue ?? "",
        hasMaxDiscount: voucher.hasMaxDiscount ?? false,
        maxDiscountAmount: voucher.maxDiscountAmount ?? "",
        minOrderAmount: voucher.minOrderAmount ?? 0,
        maxTotalUsage: voucher.maxTotalUsage ?? 1,
        maxUsagePerUser: voucher.maxUsagePerUser ?? 1,
        isActive: voucher.active ?? true,
        // productIds:
        //   voucher.products && voucher.products.length > 0
        //     ? voucher.products
        //         .map((p) => p.productId ?? p.id ?? null)
        //         .filter(Boolean)
        //     : [],
        // productIdsText: "",
        // });
        productIds:
          voucher.products && voucher.products.length > 0
            ? voucher.products
                .map((p) => p.productId ?? p.id ?? null)
                .filter(Boolean)
            : [],
        productIdsText: "",
      });
      // initialize selectedProducts for ProductSelectModal / UI
      const initialSelected =
        voucher.products && voucher.products.length > 0
          ? voucher.products
              .map((p) => ({
                productId: p.productId ?? p.id ?? null,
                name:
                  p.productName ??
                  p.name ??
                  p.product?.name ??
                  String(p.productId ?? p.id ?? ""),
                originalPrice:
                  p.originalPrice ??
                  p.price ??
                  p.currentPrice ??
                  p.product?.currentPrice ??
                  0,
              }))
              .filter((x) => x.productId)
          : [];
      setSelectedProducts(initialSelected);
    } else {
      // reset
      setValues((s) => ({ ...s, code: "", name: "" }));
    }
    setErrors({});
  }, [voucher]);

  const setField = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  // Hàm phân tích chuỗi IDs sản phẩm nhập tay thành mảng số
  const parseProductIds = (text) => {
    if (!text) return [];
    return text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const n = Number(s);
        return Number.isNaN(n) ? null : Math.floor(n);
      })
      .filter(Boolean);
  };

  // Hàm validate form
  const validate = () => {
    const newErrors = {};
    if (!values.name || values.name.trim().length < 3) {
      newErrors.name = t("admin.voucher.form.name_required");
    }
    if (!values.code || !/^[A-Z0-9_-]{3,20}$/.test(values.code)) {
      newErrors.code = t("admin.voucher.form.code_invalid");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.startDate)) {
      newErrors.startDate = t("admin.voucher.form.start_date_required");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.endDate)) {
      newErrors.endDate = t("admin.voucher.form.end_date_required");
    }

    // Ngày kết thúc phải >= hôm nay
    if (values.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(values.endDate);
      if (end < today) {
        newErrors.endDate = t("admin.voucher.form.end_date_in_past");
      }
    }

    if (
      values.startDate &&
      values.endDate &&
      new Date(values.endDate) < new Date(values.startDate)
    ) {
      newErrors.endDate = t("admin.voucher.form.end_after_start");
    }
    const dv = Number(values.discountValue);
    if (!dv || dv <= 0) {
      newErrors.discountValue = t("admin.voucher.form.discount_value_required");
    }
    if (values.discountType === "PERCENTAGE" && dv > 100) {
      newErrors.discountValue = t(
        "admin.voucher.form.discount_value_percentage_invalid"
      );
    }
    if (Number(values.maxUsagePerUser) > Number(values.maxTotalUsage)) {
      newErrors.maxUsagePerUser = t(
        "admin.voucher.form.max_usage_user_invalid"
      );
    }
    if (values.voucherType === "PRODUCT_SPECIFIC") {
      const ids = (selectedProducts || []).map((p) => p.productId);
      if (!ids.length) {
        newErrors.productIdsText = t("admin.voucher.form.product_ids_required");
      }
    }

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    return { valid, newErrors };
  };

  // Hàm xây dựng payload gửi lên server
  const buildPayload = () => {
    const payload = {
      voucherType: values.voucherType,
      name: values.name,
      code: values.code.toUpperCase(),
      startDate: values.startDate,
      endDate: values.endDate,
      allowSaveBeforeActive: !!values.allowSaveBeforeActive,
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : 0,
      maxTotalUsage: Number(values.maxTotalUsage),
      maxUsagePerUser: Number(values.maxUsagePerUser),
      isActive: !!values.isActive,
    };

    // Only include max discount fields for percentage type
    if (values.discountType === "PERCENTAGE") {
      payload.hasMaxDiscount = !!values.hasMaxDiscount;
      payload.maxDiscountAmount = values.hasMaxDiscount
        ? Number(values.maxDiscountAmount)
        : null;
    }

    if (values.voucherType === "PRODUCT_SPECIFIC") {
      payload.productIds = (selectedProducts || []).map((p) => p.productId);
    }
    return payload;
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // prevent double-submit
    if (formSubmitting) return;
    const { valid, newErrors } = validate();
    if (!valid) {
      const firstMsg =
        Object.values(newErrors)[0] ||
        t("admin.voucher.form.validation_failed") ||
        "Validation failed";
      toast.error(firstMsg);
      return;
    }

    const payload = buildPayload();

    setFormSubmitting(true);
    try {
      if (voucher && voucher.id) {
        await updateVoucher({ id: voucher.id, payload, lang: language });
        toast.success(t("admin.voucher.actions.update_success"));
      } else {
        await createVoucher({ payload, lang: language });
        toast.success(t("admin.voucher.actions.create_success"));
      }
      if (onClose) onClose();
      else navigate("/admin/vouchers");
    } catch (err) {
      const msg = t("admin.voucher.actions.save_error");
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Hàm thêm sản phẩm từ chuỗi IDs nhập tay
  const addProductFromText = () => {
    const ids = parseProductIds(values.productIdsText);
    if (!ids.length) return;
    const missing = [];
    const foundItems = [];
    ids.forEach((id) => {
      // tìm trong products
      const prod = (products || []).find(
        (p) =>
          p.id === id ||
          p.productId === id ||
          Number(p.id) === Number(id) ||
          Number(p.productId) === Number(id)
      );
      // nếu tìm thấy, thêm vào foundItems
      if (prod) {
        foundItems.push({
          productId: prod.id ?? prod.productId,
          name:
            prod.name ?? prod.productName ?? String(prod.id ?? prod.productId),
          originalPrice: prod.currentPrice ?? prod.price ?? 0,
        });
      } else {
        missing.push(id);
      }
    });
    if (missing.length) {
      toast.error(t("admin.voucher.form.product_not_found"));
    }
    if (!foundItems.length) {
      // không tìm thấy sản phẩm nào
      setValues((s) => ({ ...s, productIdsText: "" }));
      return;
    }
    // gộp vào selectedProducts, tránh trùng lặp
    const merged = [...(selectedProducts || [])];
    foundItems.forEach((p) => {
      if (!merged.find((m) => String(m.productId) === String(p.productId)))
        merged.push(p);
    });
    setSelectedProducts(merged);
    setValues((s) => ({ ...s, productIdsText: "" }));
  };

  // Hàm xóa sản phẩm khỏi danh sách đã chọn
  const removeProductId = (id) => {
    // xóa khỏi selectedProducts
    setSelectedProducts((prev) =>
      (prev || []).filter((p) => p.productId !== id)
    );
    // giữ lại các IDs còn lại trong values.productIds
    setValues((s) => ({
      ...s,
      productIds: (s.productIds || []).filter((x) => x !== id),
    }));
  };

  // Xóa tất cả sản phẩm đã chọn
  const clearAllSelectedProducts = () => {
    setSelectedProducts([]);
    setValues((s) => ({ ...s, productIds: [] }));
  };

  const onProductInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addProductFromText();
    }
  };

  const isSubmitting = formSubmitting || isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative rounded-t-2xl">
          <button
            onClick={() => onClose && onClose()}
            disabled={isSubmitting}
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer"
          >
            <IconX size={18} />
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconGift size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                {voucher
                  ? t("admin.voucher.edit") || "Edit Voucher"
                  : t("admin.voucher.create") || "Create Voucher"}
              </h2>
              <p className="text-blue-100 opacity-90">
                {voucher
                  ? t("admin.voucher.edit_description") || ""
                  : t("admin.voucher.create_description") || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconTag size={18} className="text-blue-600" />
                {t("admin.voucher.form.basic_info") || "Basic information"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.columns.name")}
                  </label>
                  <input
                    value={values.name}
                    onChange={(e) => setField("name", e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                    placeholder={t("admin.voucher.form.name_placeholder") || ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code
                  </label>
                  <input
                    value={values.code}
                    onChange={(e) =>
                      setField("code", e.target.value.toUpperCase())
                    }
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 font-mono backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none ${
                      errors.code
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                    placeholder="SALE_..."
                  />
                  {errors.code && (
                    <p className="text-red-500 text-sm mt-1">{errors.code}</p>
                  )}
                </div>
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.columns.type") || "Type"}
                  </label>
                  <select
                    value={values.voucherType}
                    onChange={(e) => setField("voucherType", e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg"
                  >
                    <option value="SHOP_WIDE">{"Shop-wide"}</option>
                    <option value="PRODUCT_SPECIFIC">
                      {"Product-specific"}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Time & options */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCalendar size={18} className="text-purple-600" />
                {t("admin.voucher.form.time_limits") || "Time & options"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.form.start_date") || "Start Date"}
                  </label>
                  <input
                    type="date"
                    value={values.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none ${
                      errors.startDate
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.form.end_date") || "End Date"}
                  </label>
                  <input
                    type="date"
                    value={values.endDate}
                    onChange={(e) => setField("endDate", e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none ${
                      errors.endDate
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
                {/* Allow Save Before Active */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allowSave"
                    checked={values.allowSaveBeforeActive}
                    onChange={(e) =>
                      setField("allowSaveBeforeActive", e.target.checked)
                    }
                    disabled={isSubmitting}
                    className="w-5 h-5 rounded border-white/30 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="allowSave" className="text-sm text-gray-700">
                    {t("admin.voucher.form.allow_save_before_active") ||
                      "Allow save before active"}
                  </label>
                </div>
              </div>
            </div>

            {/* Discount */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconPercentage size={18} className="text-green-600" />
                {t("admin.voucher.form.discount_section") || "Discount"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.form.discount_type") || "Discount Type"}
                  </label>
                  <select
                    value={values.discountType}
                    onChange={(e) => setField("discountType", e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg"
                  >
                    <option value="PERCENTAGE">
                      {t("admin.promotion.type.PERCENTAGE") || "Percentage"}
                    </option>
                    <option value="FIXED_AMOUNT">
                      {t("admin.promotion.type.FIXED_AMOUNT") || "Fixed amount"}
                    </option>
                  </select>
                </div>
                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.form.discount_value") || "Discount Value"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.discountValue}
                    onChange={(e) => setField("discountValue", e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none ${
                      errors.discountValue
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                  />
                  {errors.discountValue && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.discountValue}
                    </p>
                  )}
                </div>
                {/* Max Discount (if percentage) */}
                {values.discountType === "PERCENTAGE" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("admin.voucher.form.has_max_discount") ||
                          "Has Max Discount"}
                      </label>
                      <select
                        value={values.hasMaxDiscount ? "yes" : "no"}
                        onChange={(e) =>
                          setField("hasMaxDiscount", e.target.value === "yes")
                        }
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    {values.hasMaxDiscount && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("admin.voucher.form.max_discount_amount") ||
                            "Max Discount Amount"}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={values.maxDiscountAmount}
                          onChange={(e) =>
                            setField("maxDiscountAmount", e.target.value)
                          }
                          disabled={!values.hasMaxDiscount || isSubmitting}
                          className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Usage & products */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCheck size={18} className="text-green-600" />
                {t("admin.voucher.form.usage_section") || "Usage & Products"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Min Order Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.form.min_order_amount_label")}
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    value={values.minOrderAmount}
                    onChange={(e) => setField("minOrderAmount", e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg"
                  />
                </div>
                {/* Max Total Usage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.form.max_total_usage_label")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={values.maxTotalUsage}
                    onChange={(e) => setField("maxTotalUsage", e.target.value)}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg ${
                      errors.maxUsagePerUser
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                  />
                </div>
                {/* Max Usage Per User */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.form.max_usage_per_user_label")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={values.maxUsagePerUser}
                    onChange={(e) =>
                      setField("maxUsagePerUser", e.target.value)
                    }
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg ${
                      errors.maxUsagePerUser
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                  />
                  {errors.maxUsagePerUser && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.maxUsagePerUser}
                    </p>
                  )}
                </div>
              </div>
              {/* Product-specific voucher: select products */}
              {values.voucherType === "PRODUCT_SPECIFIC" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.voucher.form.product_ids")}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(selectedProducts || []).length > 0 ? (
                      (selectedProducts || []).map((p) => (
                        <span
                          key={p.productId}
                          className="flex items-center gap-2 bg-white/80 border border-white/30 text-sm px-2 py-1 rounded"
                        >
                          <div className="min-w-0">
                            <div className="text-xs text-gray-500">
                              <span className="font-mono">{p.productId}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProductId(p.productId)}
                            disabled={isSubmitting}
                            className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">
                        {t("admin.voucher.form.no_products_added")}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={values.productIdsText}
                      onChange={(e) =>
                        setField("productIdsText", e.target.value)
                      }
                      onKeyDown={onProductInputKeyDown}
                      placeholder={t(
                        "admin.voucher.form.product_ids_placeholder"
                      )}
                      disabled={isSubmitting}
                      className={`flex-1 px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg ${
                        errors.productIdsText
                          ? "border-red-500 bg-red-50"
                          : "hover:border-gray-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setProductModalOpen(true)}
                      disabled={isSubmitting}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
                      title="Select products"
                    >
                      {t("admin.promotion.select_products") ||
                        "Select products"}
                    </button>
                    <button
                      type="button"
                      onClick={clearAllSelectedProducts}
                      disabled={
                        isSubmitting || (selectedProducts || []).length === 0
                      }
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all flex items-center gap-2 cursor-pointer"
                      title="Clear all selected products"
                    >
                      {t("admin.promotion.clear_selection") || "Clear all"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                    <IconInfoCircle size={14} />
                    {t("admin.voucher.form.product_ids_note") ||
                      "Only active products accepted by server."}
                  </p>
                  {errors.productIdsText && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.productIdsText}
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-white/30">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    {voucher
                      ? t("admin.voucher.actions.updating")
                      : t("admin.voucher.actions.creating")}
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    {voucher
                      ? t("admin.voucher.actions.update_button")
                      : t("admin.voucher.actions.create_button")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        {/* Product selection modal */}
        <ProductSelectModal
          open={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          preSelected={selectedProducts.map((p) => ({
            productId: p.productId,
          }))}
          lang={language}
          onConfirm={(items) => {
            const merged = [...(selectedProducts || [])];
            items.forEach((it) => {
              if (!merged.find((m) => m.productId === it.productId))
                merged.push(it);
            });
            setSelectedProducts(merged);
            setProductModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
