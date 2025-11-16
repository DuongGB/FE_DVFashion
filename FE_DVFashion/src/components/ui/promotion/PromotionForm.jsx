import React, { useState, useEffect, useRef } from "react";
import {
  IconX,
  IconCalendar,
  IconPercentage,
  IconCurrencyDollar,
  IconTag,
  IconDiscount,
  IconCheck,
  IconTruck,
  IconGift,
  IconLoader2,
  IconInfoCircle,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { usePromotion } from "../../../hooks/usePromotion";
import { useTranslation } from "react-i18next";
import ProductSelectModal from "./ProductSelectModal";

const PromotionForm = ({ isOpen, onClose, promotion = null }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "GENERAL_DISCOUNT",
    value: "",
    minOrderAmount: "",
    maxUsages: "",
    startDate: "",
    endDate: "",
    active: true,
    bannerFile: null,
    promotionProducts: [],
  });

  const [errors, setErrors] = useState({});
  const [removingProductId, setRemovingProductId] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const bannerInputRef = useRef();

  // state cho input chung
  const [bulkInput, setBulkInput] = useState({
    promotionPrice: "",
    discountPercentage: "",
    stockQuantity: "",
    maxQuantityPerUser: "",
  });

  // Hàm xử lý khi thay đổi input chung
  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm áp dụng cho tất cả sản phẩm
  const handleApplyBulkInput = () => {
    setFormData((prev) => ({
      ...prev,
      promotionProducts: prev.promotionProducts.map((p) => ({
        ...p,
        promotionPrice:
          bulkInput.promotionPrice !== ""
            ? Number(bulkInput.promotionPrice)
            : p.promotionPrice,
        discountPercentage:
          bulkInput.discountPercentage !== ""
            ? Number(bulkInput.discountPercentage)
            : p.discountPercentage,
        stockQuantity:
          bulkInput.stockQuantity !== ""
            ? Number(bulkInput.stockQuantity)
            : p.stockQuantity,
        maxQuantityPerUser:
          bulkInput.maxQuantityPerUser !== ""
            ? Number(bulkInput.maxQuantityPerUser)
            : p.maxQuantityPerUser,
      })),
    }));
  };

  // Get language from i18n
  const language = i18n.language || "VI";

  // Use promotion hook
  const {
    createPromotion,
    isCreating,
    updatePromotion,
    isUpdating,
    removeProduct,
  } = usePromotion(language);

  const isSubmitting = isCreating || isUpdating;

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Load dữ liệu khi edit promotion
  useEffect(() => {
    if (promotion && isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: promotion.name || "",
        description: promotion.description || "",
        type: promotion.type || "GENERAL_DISCOUNT",
        minOrderAmount: promotion.minOrderAmount || "",
        startDate: promotion.startDate ? promotion.startDate.split("T")[0] : "",
        endDate: promotion.endDate ? promotion.endDate.split("T")[0] : "",
        active: promotion.active !== undefined ? promotion.active : true,
        bannerFile: null,
        promotionProducts: (promotion.promotionProducts || []).map((pp) => ({
          id: pp.id ?? null,
          // prefer explicit productId from API, fall back to nested product.id
          productId: pp.productId ?? pp.product?.id ?? null,
          // name fallbacks in case API uses different keys
          name:
            pp.product?.name ??
            pp.productName ??
            pp.product?.title ??
            pp.name ??
            "",
          originalPrice:
            pp.originalPrice ??
            pp.product?.currentPrice ??
            pp.product?.salePrice ??
            pp.product?.price ??
            0,
          promotionPrice: pp.promotionPrice ?? pp.promotionPrice ?? "",
          discountPercentage:
            pp.discountPercentage ?? pp.discountPercentage ?? "",
          stockQuantity: pp.stockQuantity ?? pp.stockQuantity ?? 1,
          maxQuantityPerUser:
            pp.maxQuantityPerUser ?? pp.maxQuantityPerUser ?? 1,
          active: pp.active !== undefined ? pp.active : true,
        })),
      }));
    } else if (!promotion && isOpen) {
      // Reset form cho create mới
      setFormData({
        name: "",
        description: "",
        type: "GENERAL_DISCOUNT",
        value: "",
        minOrderAmount: "",
        maxUsages: "",
        startDate: "",
        endDate: "",
        active: true,
        bannerFile: null,
        promotionProducts: [],
      });
    }
    setErrors({});
  }, [promotion, isOpen]);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Xử lý thêm sản phẩm từ modal
  const handleAddProducts = (selectedProducts) => {
    // merge selected products into formData.promotionProducts, avoid duplicates
    setFormData((prev) => {
      const existingById = new Set(
        prev.promotionProducts.map((p) => p.productId)
      );
      const newItems = selectedProducts
        .filter((p) => !existingById.has(p.productId))
        .map((p) => ({
          id: null,
          productId: p.productId,
          name: p.name,
          originalPrice: p.originalPrice ?? 0,
          // use null for empty numeric fields so backend BigDecimal parsing won't fail
          promotionPrice: null,
          discountPercentage: null,
          stockQuantity: 1,
          maxQuantityPerUser: 1,
          active: true,
        }));
      return {
        ...prev,
        promotionProducts: [...prev.promotionProducts, ...newItems],
      };
    });
  };

  const handleRemoveProduct = async (identifier) => {
    if (identifier === null || identifier === undefined) return;

    // Tìm item hiện tại trong state (có thể match bằng promotionProduct.id (db id) hoặc productId)
    const item = formData.promotionProducts.find(
      (p) => p.id === identifier || p.productId === identifier
    );
    if (!item) return;

    // determine productId to send to backend (backend expects productId)
    const productIdToSend =
      item.productId ??
      (item.product && (item.product.id ?? item.productId)) ??
      null;

    // Nếu đang edit promotion và có productId hợp lệ -> gọi API DELETE
    if (promotion && productIdToSend != null) {
      try {
        // use promotionProduct id or productId as removing key for UI feedback
        setRemovingProductId(item.id ?? productIdToSend);
        await removeProduct({
          promotionId: promotion.id,
          productId: productIdToSend,
          lang: language,
        });
        // Remove locally after successful server removal
        setFormData((prev) => ({
          ...prev,
          promotionProducts: prev.promotionProducts.filter(
            (p) => p.id !== item.id && p.productId !== productIdToSend
          ),
        }));
        toast.success(
          t("admin.promotion.form.product_remove_success") ||
            "Product removed from promotion"
        );
      } catch (err) {
        console.error("Error removing product from promotion:", err);
        const msg =
          err?.response?.data?.message ||
          err.message ||
          t("admin.promotion.form.product_remove_error") ||
          "Failed to remove product";
        toast.error(msg);
      } finally {
        setRemovingProductId(null);
      }
    } else {
      // Nếu không có productId (ví dụ item chưa đầy đủ) hoặc đang tạo mới -> chỉ xóa local
      setFormData((prev) => ({
        ...prev,
        promotionProducts: prev.promotionProducts.filter(
          (p) => p.id !== identifier && p.productId !== identifier
        ),
      }));
      // Nếu đang edit nhưng không có productId, thông báo cho user
      if (promotion && item.id != null && productIdToSend == null) {
        toast.warn(
          t("admin.promotion.form.product_remove_local_only") ||
            "Removed locally (no productId available to sync with server)"
        );
      }
    }
  };

  // Xử lý thay đổi trường promotionPrice hoặc discountPercentage cho sản phẩm
  const handleProductFieldChange = (productId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      promotionProducts: prev.promotionProducts.map((p) => {
        if (p.productId !== productId) return p;
        // Đảm bảo chỉ một trong hai trường được điền
        const updated = { ...p, [field]: value };
        if (field === "promotionPrice" && value !== "" && value !== null) {
          updated.discountPercentage = "";
        }
        if (field === "discountPercentage" && value !== "" && value !== null) {
          updated.promotionPrice = "";
        }
        return updated;
      }),
    }));
  };

  // Xử lý thay đổi input form
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      const file = files[0] || null;
      setFormData((prev) => ({ ...prev, [name]: file }));
      // Preview image
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setBannerPreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setBannerPreview(null);
      }
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error khi user thay đổi
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Preview banner khi edit
  useEffect(() => {
    if (promotion && isOpen) {
      setBannerPreview(promotion.bannerUrl || null);
    } else if (!promotion && isOpen) {
      setBannerPreview(null);
    }
  }, [promotion, isOpen]);

  // helper: round to 2 decimals
  const round2 = (n) => {
    if (isNaN(n) || n === null) return null;
    return Math.round(Number(n) * 100) / 100;
  };

  // helper: calculate discount percentage given original & promotion price
  const calculateDiscountPercentage = (original, promo) => {
    if (!original || original <= 0) return 0;
    const disc = ((original - promo) / original) * 100;
    return round2(disc);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = t("admin.promotion.form.promotion_name_required");
    }

    if (!formData.type || !formData.type.trim()) {
      newErrors.type = t("admin.promotion.form.type_required");
    }

    if (!formData.startDate) {
      newErrors.startDate = t("admin.promotion.form.start_date_required");
    }

    if (!formData.endDate) {
      newErrors.endDate = t("admin.promotion.form.end_date_required");
    }

    // Validate startDate >= today
    if (formData.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(formData.startDate);
      if (start < today) {
        newErrors.startDate =
          t("admin.promotion.form.start_date_in_past") ||
          "Ngày bắt đầu phải từ hôm nay trở đi";
        toast.error(
          t("admin.promotion.form.start_date_in_past") ||
            "Ngày bắt đầu phải từ hôm nay trở đi"
        );
      }
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = t("admin.promotion.form.end_date_error");
    }

    // Validate optional numeric fields
    if (formData.minOrderAmount && parseFloat(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = t(
        "admin.promotion.form.min_order_amount_error"
      );
    }

    if (formData.maxUsages && parseInt(formData.maxUsages) <= 0) {
      newErrors.maxUsages = t("admin.promotion.form.max_usages_error");
    }

    // Validate promotionProducts presence (backend: @NotEmpty)
    if (
      !formData.promotionProducts ||
      formData.promotionProducts.length === 0
    ) {
      newErrors.promotionProducts = t(
        "admin.promotion.form.promotion_products_required"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[handleSubmit] start", { promotion: !!promotion, formData });

    if (!validateForm()) {
      console.log("[handleSubmit] validation failed", { errors });
      return;
    }

    const productErrors = [];
    const processedProducts = [];

    for (const p of formData.promotionProducts) {
      console.log(`[handleSubmit] processing product ${p.productId}`, p);
      const original = Number(p.originalPrice ?? 0);
      let promotionPrice =
        p.promotionPrice !== undefined &&
        p.promotionPrice !== null &&
        p.promotionPrice !== ""
          ? Number(p.promotionPrice)
          : null;
      let discountPercentage =
        p.discountPercentage !== undefined &&
        p.discountPercentage !== null &&
        p.discountPercentage !== ""
          ? Number(p.discountPercentage)
          : null;

      // If neither provided -> invalid (CreatePromotionRequest requires promotionPrice non-null)
      if (promotionPrice === null && discountPercentage === null) {
        productErrors.push(
          `product ${p.productId}: promotionPrice or discountPercentage required`
        );
        continue;
      }

      // If only discount -> compute promotionPrice
      if (promotionPrice === null && discountPercentage !== null) {
        if (discountPercentage < 0 || discountPercentage > 100) {
          productErrors.push(
            `product ${p.productId}: discountPercentage must be between 0 and 100`
          );
          continue;
        }
        promotionPrice = round2(original * (1 - discountPercentage / 100));
      }
      // If only promotionPrice -> compute discount
      else if (promotionPrice !== null && discountPercentage === null) {
        if (original <= 0) {
          discountPercentage = 0;
        } else {
          discountPercentage = calculateDiscountPercentage(
            original,
            promotionPrice
          );
        }
      } else if (promotionPrice !== null && discountPercentage !== null) {
        // both provided -> basic consistency check
        const expected = calculateDiscountPercentage(original, promotionPrice);
        if (Math.abs(expected - discountPercentage) > 1) {
          discountPercentage = expected;
        }
      }

      // Validate promotionPrice < original (if original > 0)
      if (p.id == null && original > 0 && promotionPrice >= original) {
        productErrors.push(
          `product ${p.productId}: promotionPrice must be less than original price`
        );
        continue;
      }

      // Validate promotionPrice < original (if original > 0)
      if (
        !promotion &&
        p.id == null &&
        original > 0 &&
        promotionPrice >= original
      ) {
        productErrors.push(
          `product ${p.productId}: promotionPrice must be less than original price`
        );
        continue;
      }

      // Validate stock & maxQuantity for new items (if id is null assume new)
      if (p.id == null) {
        if (p.stockQuantity == null || p.stockQuantity === "") {
          productErrors.push(
            `product ${p.productId}: stockQuantity is required for new promotion product`
          );
          continue;
        }
        if (p.maxQuantityPerUser == null || p.maxQuantityPerUser === "") {
          productErrors.push(
            `product ${p.productId}: maxQuantityPerUser is required for new promotion product`
          );
          continue;
        }
      }

      // normalize numeric fields
      const normalized = {
        id: p.id ?? undefined,
        productId: p.productId,
        promotionPrice: round2(promotionPrice),
        discountPercentage: round2(discountPercentage),
        stockQuantity:
          p.stockQuantity != null ? parseInt(p.stockQuantity) : null,
        maxQuantityPerUser:
          p.maxQuantityPerUser != null ? parseInt(p.maxQuantityPerUser) : null,
        active: p.active !== undefined ? p.active : true,
      };
      processedProducts.push(normalized);
    }

    if (productErrors.length > 0) {
      setErrors((prev) => ({
        ...prev,
        promotionProducts: productErrors.join("; "),
      }));
      return;
    }

    // Format data theo CreatePromotionRequest (backend expects part 'promotion' as JSON)
    const submitData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      type: formData.type, // must be one of backend enum strings
      startDate: formData.startDate, // yyyy-MM-dd
      endDate: formData.endDate, // yyyy-MM-dd
      active: formData.active,
      promotionProducts: processedProducts,
      // bannerFile handled by promotionAPI via FormData; we still attach here and promotionAPI will include it
      bannerFile: formData.bannerFile || undefined,
    };

    console.log("[handleSubmit] submitData prepared", submitData);

    try {
      if (promotion) {
        const res = await updatePromotion({
          promotionId: promotion.id,
          promotionData: submitData,
          lang: language,
        });
        // console.log("[handleSubmit] updatePromotion response", res);
        toast.success(t("admin.promotion.form.update_success"));
      } else {
        console.log("[handleSubmit] calling createPromotion", language);
        const res = await createPromotion({
          promotionData: submitData,
          lang: language,
        });
        // console.log("[handleSubmit] createPromotion response", res);
        toast.success(t("admin.promotion.form.create_success"));
      }

      // Đóng form sau khi thành công
      onClose();
    } catch (error) {
      console.error("[handleSubmit] Error submitting promotion:", error);
      if (error?.response) {
        console.error("[handleSubmit] error.response:", error.response);
      }

      // Improved error handling
      let errorMessage = t("admin.promotion.form.create_error");

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = promotion
          ? t("admin.promotion.form.update_error")
          : t("admin.promotion.form.create_error");
      }

      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative rounded-t-2xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-black/50 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <IconX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconDiscount size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {promotion
                  ? t("admin.promotion.form.edit_title")
                  : t("admin.promotion.form.create_title")}
              </h2>
              <p className="text-blue-100 opacity-90">
                {promotion
                  ? t("admin.promotion.form.edit_description")
                  : t("admin.promotion.form.create_description")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconTag size={20} className="text-blue-600" />
                {t("admin.promotion.form.basic_info")}
              </h3>
              {/* Tên khuyến mãi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.promotion.form.promotion_name")} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                    errors.name
                      ? "border-red-500 bg-red-50"
                      : "hover:border-gray-400"
                  }`}
                  placeholder={t(
                    "admin.promotion.form.promotion_name_placeholder"
                  )}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <IconX size={12} />
                    {errors.name}
                  </p>
                )}
              </div>
              {/* Mô tả */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.promotion.form.description") || "Description"}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-400"
                  placeholder={
                    t("admin.promotion.form.description_placeholder") ||
                    "Optional description..."
                  }
                />
              </div>
              {/* Banner file input + Select products button */}
              <div className="mb-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.promotion.form.banner_file")}
                  </label>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    name="bannerFile"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("admin.promotion.form.banner_file_note")}
                  </p>
                  {/* Banner preview */}
                  {bannerPreview && (
                    <div className="mt-2">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="max-h-32 rounded-lg border border-gray-300 shadow"
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          maxWidth: 400,
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="w-full md:w-44">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.promotion.form.select_products") ||
                      "Apply to products"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(true)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {t("admin.promotion.form.select_products_button") ||
                      "Select products"}
                  </button>
                </div>
              </div>
              {/* Show product-level validation errors */}
              {errors.promotionProducts && (
                <div className="mt-2">
                  <p className="text-red-500 text-sm flex items-start gap-2">
                    <IconX size={14} />
                    <span>{errors.promotionProducts}</span>
                  </p>
                </div>
              )}
              {/* Bulk vào input danh sách sản phẩm đã chọn */}
              {!promotion &&
                formData.promotionProducts &&
                formData.promotionProducts.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="text-xs text-gray-600">
                        Promotion Price
                      </label>
                      <input
                        type="number"
                        name="promotionPrice"
                        value={bulkInput.promotionPrice}
                        min="0"
                        step="10000"
                        onChange={handleBulkInputChange}
                        className="w-32 px-2 py-1 backdrop-blur-sm bg-white/80 border border-white/30 rounded-md shadow"
                        disabled={
                          bulkInput.discountPercentage !== "" &&
                          bulkInput.discountPercentage !== null
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        Discount %
                      </label>
                      <input
                        type="number"
                        name="discountPercentage"
                        value={bulkInput.discountPercentage}
                        min="0"
                        max="100"
                        step="1"
                        onChange={handleBulkInputChange}
                        className="w-24 px-2 py-1 backdrop-blur-sm bg-white/80 border border-white/30 rounded-md shadow"
                        disabled={
                          bulkInput.promotionPrice !== "" &&
                          bulkInput.promotionPrice !== null
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Stock</label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={bulkInput.stockQuantity}
                        min="0"
                        step="1"
                        onChange={handleBulkInputChange}
                        className="w-20 px-2 py-1 backdrop-blur-sm bg-white/80 border border-white/30 rounded-md shadow"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Max/User</label>
                      <input
                        type="number"
                        name="maxQuantityPerUser"
                        value={bulkInput.maxQuantityPerUser}
                        min="1"
                        step="1"
                        onChange={handleBulkInputChange}
                        className="w-20 px-2 py-1 backdrop-blur-sm bg-white/80 border border-white/30 rounded-md shadow"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyBulkInput}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                    >
                      {t("admin.promotion.form.apply_to_all")}
                    </button>
                  </div>
                )}
              {/* Selected products list */}
              {formData.promotionProducts &&
                formData.promotionProducts.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      {t("admin.promotion.selected_products") ||
                        "Selected products"}
                    </div>
                    <div className="space-y-3">
                      {formData.promotionProducts.map((p, idx) => (
                        <div
                          key={p.id ?? p.productId ?? idx}
                          className="flex items-center gap-3 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg shadow p-3"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">
                              Original:{" "}
                              {(p.originalPrice ?? 0).toLocaleString()} VND
                            </div>
                          </div>
                          <div className="w-36">
                            <label className="text-xs text-gray-600">
                              Promotion Price
                            </label>
                            <input
                              type="number"
                              value={p.promotionPrice ?? ""}
                              min="0"
                              step="10000"
                              onChange={(e) =>
                                handleProductFieldChange(
                                  p.productId,
                                  "promotionPrice",
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                              disabled={
                                isSubmitting ||
                                (p.discountPercentage !== null &&
                                  p.discountPercentage !== "")
                              }
                              className="w-full px-2 py-1 backdrop-blur-sm bg-white/80 border border-white/30 rounded-md shadow"
                            />
                          </div>
                          <div className="w-28">
                            <label className="text-xs text-gray-600">
                              Discount %
                            </label>
                            <input
                              type="number"
                              value={p.discountPercentage ?? ""}
                              min="0"
                              max="100"
                              step="1"
                              onChange={(e) =>
                                handleProductFieldChange(
                                  p.productId,
                                  "discountPercentage",
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                                )
                              }
                              disabled={
                                isSubmitting ||
                                (p.promotionPrice !== null &&
                                  p.promotionPrice !== "")
                              }
                              className="w-full px-2 py-1 backdrop-blur-sm bg-white/80 border border-white/30 rounded-md shadow"
                            />
                          </div>
                          <div className="w-24">
                            <label className="text-xs text-gray-600">
                              Stock
                            </label>
                            <input
                              type="number"
                              value={p.stockQuantity}
                              min="0"
                              step="1"
                              onChange={(e) =>
                                handleProductFieldChange(
                                  p.productId,
                                  "stockQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 backdrop-blur-sm bg-white/80 border border-white/30 rounded-md shadow"
                            />
                          </div>
                          <div className="w-28">
                            <label className="text-xs text-gray-600">
                              Max/User
                            </label>
                            <input
                              type="number"
                              value={p.maxQuantityPerUser}
                              min="1"
                              step="1"
                              onChange={(e) =>
                                handleProductFieldChange(
                                  p.productId,
                                  "maxQuantityPerUser",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 backdrop-blur-sm bg-white/80 border border-white/30 rounded-md shadow"
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveProduct(p.productId ?? p.id)
                              }
                              disabled={
                                isSubmitting ||
                                removingProductId === (p.id ?? p.productId)
                              }
                              className={`text-sm px-2 ${
                                removingProductId === (p.id ?? p.productId)
                                  ? "text-gray-500 cursor-not-allowed"
                                  : "text-red-600"
                              }`}
                            >
                              {removingProductId === (p.id ?? p.productId) ? (
                                <span className="inline-flex items-center gap-2">
                                  <IconLoader2
                                    size={12}
                                    className="animate-spin"
                                  />
                                  {t("admin.promotion.form.removing") ||
                                    "Removing..."}
                                </span>
                              ) : (
                                t("admin.promotion.form.remove") || "Remove"
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Promotion Type & Value Section */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconPercentage size={20} className="text-green-600" />
                {t("admin.promotion.form.type_value_section")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.promotion.form.type")} *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-400"
                    required
                  >
                    <option value="NEW_CUSTOMER_DISCOUNT">
                      New Customer Discount
                    </option>
                    <option value="FLASH_SALE">Flash Sale</option>
                    <option value="SEASONAL_EVENT">Seasonal Event</option>
                    <option value="CLEARANCE_SALE">Clearance Sale</option>
                    <option value="HOLIDAY_PROMOTION">Holiday Promotion</option>
                    <option value="GENERAL_DISCOUNT">General Discount</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.type}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Time & Limits Section */}
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCalendar size={20} className="text-purple-600" />
                {t("admin.promotion.form.time_limits_section")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.promotion.form.start_date")} *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.startDate
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                    required
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.promotion.form.end_date")} *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.endDate
                        ? "border-red-500 bg-red-50"
                        : "hover:border-gray-400"
                    }`}
                    required
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCheck size={20} className="text-green-600" />
                {t("admin.promotion.form.status_section")}
              </h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed transition-all duration-200"
                />
                <div>
                  <span className="text-sm font-medium text-green-800">
                    {t("admin.promotion.form.status_active")}
                  </span>
                  <p className="text-xs text-green-600 mt-1">
                    {t("admin.promotion.form.status_active_desc")}
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-white/30">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    {promotion
                      ? t("admin.promotion.form.updating")
                      : t("admin.promotion.form.creating")}
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    {promotion
                      ? t("admin.promotion.form.update_button")
                      : t("admin.promotion.form.create_button")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Product select modal */}
      <ProductSelectModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onConfirm={handleAddProducts}
        preSelected={formData.promotionProducts}
        lang={language}
        fromPromotionPage={true}
      />
    </div>
  );
};

export default PromotionForm;
