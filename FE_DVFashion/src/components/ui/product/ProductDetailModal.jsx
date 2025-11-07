import React from "react";
import {
  IconX,
  IconPackage,
  IconTag,
  IconCurrencyDollar,
  IconStar,
  IconCalendar,
  IconDiscount,
  IconPhoto,
  IconShoppingBag,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function ProductDetailModal({ product, open, onClose }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";

  if (!open || !product) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "...";
    const date = new Date(dateString);
    return date.toLocaleString(language === "VI" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return (
      new Intl.NumberFormat(language === "VI" ? "vi-VN" : "en-US").format(
        amount
      ) + " ₫"
    );
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          color: "bg-green-100 text-green-800",
          text: t("admin.product.status.active"),
        };
      case "INACTIVE":
        return {
          color: "bg-red-100 text-red-800",
          text: t("admin.product.status.inactive"),
        };
      case "DISCONTINUED":
        return {
          color: "bg-gray-100 text-gray-800",
          text: t("admin.product.status.discontinued"),
        };
      default:
        return { color: "bg-gray-100 text-gray-800", text: status };
    }
  };

  const statusInfo = getStatusInfo(product.status);

  // Gom tất cả ảnh từ các variant
  const allImages =
    product.variants?.flatMap((variant) =>
      (variant.images || []).map((img) => ({
        ...img,
        color: variant.color,
      }))
    ) || [];

  // Lấy ảnh chính (primary) đầu tiên
  const primaryImage =
    allImages.find((img) => img.isPrimary) || allImages[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col transition-all duration-300 animate-scaleIn"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <IconPackage size={28} className="text-white" />
            <h2 className="text-2xl font-bold">
              {t("admin.product.detail.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-3 flex-1 overflow-y-auto">
          {/* Product Images and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
            {/* Images */}
            <div className="lg:col-span-1">
              <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconPhoto size={18} className="text-purple-600" />
                  {t("admin.product.detail.images")}
                </h3>
                {primaryImage ? (
                  <div className="space-y-3">
                    <img
                      src={primaryImage.imageUrl}
                      alt=""
                      className="w-full h-64 object-cover rounded-lg border"
                    />
                    {allImages.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {allImages
                          .filter((img) => img !== primaryImage)
                          .slice(0, 3)
                          .map((img, index) => (
                            <img
                              key={index}
                              src={img.imageUrl}
                              alt=""
                              className="w-full h-16 object-cover rounded border"
                            />
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">
                      {t("admin.product.detail.no_image")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-4">
              <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconTag size={18} className="text-blue-600" />
                  {t("admin.product.detail.basic_info")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.product.detail.id")}:
                    </strong>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                      #{product.id}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.product.detail.name")}:
                    </strong>
                    <span className="ml-2 font-medium text-lg">
                      {product.name}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.product.detail.brand")}:
                    </strong>
                    <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      {product.brandName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.product.detail.category")}:
                    </strong>
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {product.categoryName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.product.detail.material")}:
                    </strong>
                    <span className="ml-2">{product.material}</span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.product.detail.status")}:
                    </strong>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <strong className="text-gray-600">
                      {t("admin.product.detail.description")}:
                    </strong>
                    <p className="ml-2 mt-1 text-gray-700 leading-relaxed">
                      {product.description ||
                        t("admin.product.detail.no_description")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price and Status */}
              <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconCurrencyDollar size={18} className="text-green-600" />
                  {t("admin.product.detail.price_status")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <strong className="text-gray-600">
                        {t("admin.product.detail.original_price")}:
                      </strong>
                      <span className="ml-2 text-lg font-bold text-gray-800">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <div>
                      <strong className="text-gray-600">
                        {t("admin.product.detail.sale_price")}:
                      </strong>
                      <span className="ml-2 text-lg font-bold text-green-600">
                        {formatCurrency(product.salePrice)}
                      </span>
                    </div>
                    {product.onSale && (
                      <div className="flex items-center gap-2">
                        <IconDiscount size={16} className="text-red-500" />
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                          {t("admin.product.detail.on_sale")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IconStar size={16} className="text-yellow-500" />
                      <span className="text-gray-600">
                        {t("admin.product.detail.review_count")}:
                      </span>
                      <span className="font-medium">
                        {product.reviewCount || 0}{" "}
                        {t("admin.product.detail.review_unit")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-3 backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconShoppingBag size={18} className="text-blue-600" />
                {t("admin.product.detail.variants", {
                  count: product.variants.length,
                })}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/60">
                      <th className="p-2">{t("admin.product.detail.color")}</th>
                      <th className="p-2">
                        {t("admin.product.detail.additional_price")}
                      </th>
                      <th className="p-2">{t("admin.product.detail.sizes")}</th>
                      <th className="p-2">
                        {t("admin.product.detail.images")}
                      </th>
                      <th className="p-2 text-center">
                        {t("admin.product.detail.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant, idx) => (
                      <tr key={idx} className="border-b border-white/30">
                        <td className="p-2">{variant.color}</td>
                        <td className="p-2">
                          {formatCurrency(variant.additionalPrice)}
                        </td>
                        <td className="p-2">
                          {variant.sizes &&
                            variant.sizes.map((size, sidx) => (
                              <span
                                key={sidx}
                                className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1"
                              >
                                {size.sizeName}
                              </span>
                            ))}
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {variant.images &&
                              variant.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img.imageUrl}
                                  alt=""
                                  className={`w-8 h-8 object-cover rounded border ${
                                    img.isPrimary ? "ring-2 ring-green-500" : ""
                                  }`}
                                  title={
                                    img.isPrimary
                                      ? t("admin.product.detail.primary_image")
                                      : ""
                                  }
                                />
                              ))}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              variant.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : variant.status === "OUT_OF_STOCK"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {getStatusInfo(variant.status).text}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconCalendar size={18} className="text-green-600" />
              {t("admin.product.detail.timestamps")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">
                  {t("admin.product.detail.created_at")}:
                </strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(product.createdAt)}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">
                  {t("admin.product.detail.updated_at")}:
                </strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(product.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
