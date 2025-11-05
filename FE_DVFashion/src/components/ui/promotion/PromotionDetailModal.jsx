import React, { useMemo } from "react";
import { IconX, IconExternalLink } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

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
  console.log("Promotion products:", products);

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

  const productImage = (pp) => {
    const p = pp.product || pp;
    const imageUrl =
      p?.variants
        ?.flatMap((v) => v?.images || [])
        ?.find((img) => img?.isPrimary)?.imageUrl ||
      p?.variants?.[0]?.images?.[0]?.imageUrl ||
      p?.image ||
      pp?.imageUrl ||
      null;
    return imageUrl;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: keep visual style consistent with PromotionForm */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 relative">
          <button
            onClick={onClose}
            aria-label="close"
            className="absolute top-4 right-4 bg-black/20 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/30 transition cursor-pointer"
          >
            <IconX size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{promotion.name}</h3>
              <p className="text-xs opacity-90">
                {promotion.type} •{" "}
                {promotion.active
                  ? t("admin.promotion.status.active")
                  : t("admin.promotion.status.inactive")}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm text-gray-600">
                {promotion.description || t("admin.promotion.no_description")}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.promotion.columns.start_date")}
                  </div>
                  <div className="font-medium">
                    {formatDateTime(promotion.startDate)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.promotion.columns.end_date")}
                  </div>
                  <div className="font-medium">
                    {formatDateTime(promotion.endDate)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.promotion.columns.value")}
                  </div>
                  <div className="font-medium">
                    {promotion.type === "PERCENTAGE"
                      ? `${promotion.value}%`
                      : promotion.type === "FIXED_AMOUNT"
                      ? `${promotion.value?.toLocaleString()} VND`
                      : promotion.type === "FREE_SHIPPING"
                      ? t("admin.promotion.value.free_shipping")
                      : promotion.value}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.promotion.columns.max_usage")}
                  </div>
                  <div className="font-medium">
                    {promotion.maxUsages ??
                      t("admin.promotion.value.unlimited")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
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
                    className="w-full h-36 object-cover rounded-md border shadow-sm"
                  />
                </a>
              ) : (
                <div className="w-full h-36 bg-gray-50 rounded-md border flex items-center justify-center text-gray-400">
                  {t("admin.promotion.no_banner") || "No banner"}
                </div>
              )}

              <div className="w-full bg-gray-50 rounded-md p-3 text-sm text-gray-700 border">
                <div className="flex justify-between">
                  <div>{t("admin.promotion.stats.total") || "Products"}</div>
                  <div className="font-medium">{stats.total}</div>
                </div>
                <div className="flex justify-between mt-1">
                  <div>{t("admin.promotion.stats.active") || "Active"}</div>
                  <div className="text-green-600 font-medium">
                    {stats.active}
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <div>{t("admin.promotion.stats.inactive") || "Inactive"}</div>
                  <div className="text-red-600 font-medium">
                    {stats.inactive}
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <div>
                    {t("admin.promotion.stats.avg_discount") || "Avg discount"}
                  </div>
                  <div className="font-medium">{stats.avgDiscount}%</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              {t("admin.promotion.selected_products") || "Applied products"}
            </h4>

            {products.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                {t("admin.promotion.no_products")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-xs text-gray-600">
                      <th className="p-2">#</th>
                      <th className="p-2">
                        {t("admin.promotion.columns.name")}
                      </th>
                      <th className="p-2">
                        {t("admin.promotion.columns.value")}
                      </th>
                      <th className="p-2">Promotion</th>
                      <th className="p-2">Discount %</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((pp, idx) => {
                      const prod = pp.product || pp;
                      const original = Number(pp.originalPrice);
                      const promoPrice = pp.promotionPrice;
                      return (
                        <tr key={pp.productId ?? prod?.id ?? idx}>
                          <td className="p-2 text-sm text-gray-600">
                            {idx + 1}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className="w-32 block text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap"
                                title={pp.productName}
                              >
                                {pp.productName}
                              </span>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailModal;
