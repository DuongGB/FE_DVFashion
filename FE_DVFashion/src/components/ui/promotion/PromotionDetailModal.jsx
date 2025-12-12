import React, { useMemo } from "react";
import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useProductById } from "../../../hooks/useProduct";

function ProductImageCell({ productId, alt }) {
  const { data: product, isLoading } = useProductById(productId);
  if (isLoading) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 animate-pulse rounded-md" />
    );
  }
  const allImages = product?.variants?.flatMap((v) => v?.images || []) || [];
  const primaryImg = allImages.find((img) => img?.isPrimary);
  const imageUrl =
    primaryImg?.imageUrl ||
    product?.variants?.[0]?.images?.[0]?.imageUrl ||
    allImages[0]?.imageUrl ||
    null;
  return imageUrl ? (
    <img
      src={imageUrl}
      alt={alt}
      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md border border-white/30 shadow"
    />
  ) : (
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/60 rounded-md border border-white/30" />
  );
}

const PromotionDetailModal = ({ open, onClose, promotion = null }) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";

  if (!open || !promotion) return null;

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const time = date.toLocaleTimeString(
      language === "VI" ? "vi-VN" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${time} ${day}/${month}/${year}`;
  };

  const bannerUrl =
    promotion.bannerUrl ||
    promotion.banner?.url ||
    promotion.bannerImage ||
    promotion.bannerFileUrl ||
    null;

  const products = Array.isArray(promotion.promotionProducts)
    ? promotion.promotionProducts
    : [];

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const inactive = total - active;
    const avgDiscount =
      products.length === 0
        ? 0
        : Math.round(
            (products.reduce((acc, p) => acc + (p.discountPercentage || 0), 0) /
              products.length) *
              100
          ) / 100;
    return { total, active, inactive, avgDiscount };
  }, [products]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Responsive */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-5 relative rounded-t-2xl">
          <button
            onClick={onClose}
            aria-label="close"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/30 backdrop-blur-sm text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-black/50 transition cursor-pointer"
          >
            <IconX size={16} className="sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-start gap-3 sm:gap-4 pr-8">
            <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-2 rounded-lg flex-shrink-0">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold truncate">
                {promotion.name}
              </h3>
              <p className="text-xs opacity-90 truncate">
                {promotion.type} •{" "}
                {promotion.active
                  ? t("admin.promotion.status.active")
                  : t("admin.promotion.status.inactive")}
              </p>
            </div>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="md:col-span-2 space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-gray-600">
                {promotion.description || t("admin.promotion.no_description")}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.promotion.columns.start_date")}
                  </div>
                  <div className="font-medium truncate">
                    {formatDateTime(promotion.startDate)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.promotion.columns.end_date")}
                  </div>
                  <div className="font-medium truncate">
                    {formatDateTime(promotion.endDate)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 sm:gap-3">
              {bannerUrl ? (
                <a
                  href={bannerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <img
                    src={bannerUrl}
                    alt={promotion.name}
                    className="w-full h-28 sm:h-36 object-cover rounded-md border border-white/30 shadow"
                  />
                </a>
              ) : (
                <div className="w-full h-28 sm:h-36 bg-white/60 rounded-md border border-white/30 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
                  {t("admin.promotion.no_banner")}
                </div>
              )}

              <div className="w-full backdrop-blur-xl bg-white/60 rounded-md p-2 sm:p-3 text-xs sm:text-sm text-gray-700 border border-white/30 shadow">
                <div className="flex justify-between">
                  <div>{t("admin.promotion.stats.total")}</div>
                  <div className="font-medium">{stats.total}</div>
                </div>
                <div className="flex justify-between mt-1">
                  <div>{t("admin.promotion.stats.active")}</div>
                  <div className="text-green-600 font-medium">
                    {stats.active}
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <div>{t("admin.promotion.stats.inactive")}</div>
                  <div className="text-red-600 font-medium">
                    {stats.inactive}
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <div>{t("admin.promotion.stats.avg_discount")}</div>
                  <div className="font-medium">{stats.avgDiscount}%</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              {t("admin.promotion.selected_products")}
            </h4>

            {products.length === 0 ? (
              <div className="py-6 text-center text-gray-500 text-xs sm:text-sm">
                {t("admin.promotion.no_products")}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/60 text-xs text-gray-600 border-b border-white/30">
                        <th className="p-2">#</th>
                        <th className="p-2">
                          {t("admin.promotion.columns.product")}
                        </th>
                        <th className="p-2">
                          {t("admin.promotion.columns.value")}
                        </th>
                        <th className="p-2">Promotion</th>
                        <th className="p-2">Discount %</th>
                        <th className="p-2">Stock</th>
                        <th className="p-2">Max/User</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((pp, idx) => {
                        const prod = pp.product || pp;
                        const original = Number(pp.originalPrice);
                        const promoPrice = pp.promotionPrice;
                        return (
                          <tr
                            key={pp.productId ?? prod?.id ?? idx}
                            className="border-b border-white/30"
                          >
                            <td className="p-2 text-sm text-gray-600">
                              {idx + 1}
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <ProductImageCell
                                  productId={pp.productId}
                                  alt={pp.productName}
                                />
                                <div className="max-w-50 min-w-0">
                                  <div
                                    className="text-sm font-medium text-ellipsis overflow-hidden whitespace-wrap"
                                    title={pp.productName}
                                  >
                                    {pp.productName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-sm">
                              {original.toLocaleString()} VND
                            </td>
                            <td className="p-2 text-sm font-medium">
                              {promoPrice != null
                                ? `${Number(promoPrice).toLocaleString()} VND`
                                : "-"}
                            </td>
                            <td className="p-2 text-sm">
                              {(pp.discountPercentage ?? 0) + "%"}
                            </td>
                            <td className="p-2 text-sm">
                              {pp.stockQuantity ?? "-"}
                            </td>
                            <td className="p-2 text-sm">
                              {pp.maxQuantityPerUser ?? "-"}
                            </td>
                            <td className="p-2 text-sm">
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  pp.active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {pp.active
                                  ? t("admin.promotion.status.active")
                                  : t("admin.promotion.status.inactive")}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-2">
                  {products.map((pp, idx) => {
                    const original = Number(pp.originalPrice);
                    const promoPrice = pp.promotionPrice;
                    return (
                      <div
                        key={pp.productId ?? idx}
                        className="bg-white/60 p-3 rounded-lg border border-white/30"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <ProductImageCell
                            productId={pp.productId}
                            alt={pp.productName}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {pp.productName}
                            </div>
                            <div className="text-xs text-gray-500">
                              #{idx + 1}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                              pp.active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {pp.active
                              ? t("admin.promotion.status.active")
                              : t("admin.promotion.status.inactive")}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Original:</span>
                            <span className="font-medium ml-1">
                              {original.toLocaleString()} VND
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Promotion:</span>
                            <span className="font-medium ml-1">
                              {promoPrice != null
                                ? `${Number(promoPrice).toLocaleString()} VND`
                                : "-"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <span className="font-medium ml-1">
                              {(pp.discountPercentage ?? 0) + "%"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Stock:</span>
                            <span className="font-medium ml-1">
                              {pp.stockQuantity ?? "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailModal;
