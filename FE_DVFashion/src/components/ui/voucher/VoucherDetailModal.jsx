import React, { useMemo } from "react";
import {
  IconX,
  IconGift,
  IconCalendar,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useProductById } from "../../../hooks/useProduct";

export default function VoucherDetailModal({ open, onClose, voucher = null }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";

  if (!open || !voucher) return null;

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

  const products = Array.isArray(voucher.products) ? voucher.products : [];

  // Chuẩn hoá giá trị an toàn hơn
  const hasMaxDiscount = [true, "true", 1, "1"].includes(
    voucher.hasMaxDiscount
  );

  const isShopWide = voucher.voucherType === "SHOP_WIDE";
  const stats = useMemo(() => {
    if (isShopWide) {
      return {
        total: t("common.all") || "All",
      };
    }
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [products, isShopWide, t]);

  const getProductImage = (prod, pp) => {
    const resolved = prod ?? pp.product ?? pp;
    return resolved?.variants?.flatMap((v) => v?.images || [])?.find(Boolean)
      ?.imageUrl;
  };

  // Dữ liệu hàng sản phẩm
  function ProductRow({ pp, idx }) {
    const productId = pp.productId ?? pp.id ?? null;
    const { data: prod, isLoading } = useProductById(productId, language);

    const resolved = prod;
    const price = resolved?.currentPrice;

    return (
      <tr key={pp.productId ?? resolved?.id ?? idx}>
        <td className="p-2 text-sm text-gray-600">{idx + 1}</td>
        <td className="p-2">
          <div className="flex items-center gap-3 min-w-0">
            {getProductImage(prod, pp) ? (
              <img
                src={getProductImage(prod, pp)}
                alt={resolved?.name}
                className="w-12 h-12 object-cover rounded-md"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-md" />
            )}
            <div className="min-w-0">
              <div
                className="text-sm font-medium truncate"
                title={resolved?.name}
              >
                {isLoading
                  ? t("common.loading") || "Loading..."
                  : resolved?.name ?? pp.productName}
              </div>
              <div className="text-xs text-gray-500">
                {`ID: ${resolved?.id ?? pp.productId ?? pp.id ?? "-"}`}
              </div>
            </div>
          </div>
        </td>
        <td className="p-2 text-sm">
          {price != null ? `${Number(price).toLocaleString()} VND` : "-"}
        </td>
        <td className="p-2 text-sm">
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              resolved?.active ?? pp.active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {resolved?.active ?? pp.active
              ? t("admin.voucher.status.active") || "Active"
              : t("admin.voucher.status.inactive") || "Inactive"}
          </span>
        </td>
      </tr>
    );
  }

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
              <IconGift size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{voucher.name}</h3>
              <p className="text-xs opacity-90">
                {voucher.code} •{" "}
                {isShopWide
                  ? t("admin.voucher.type.shop_wide") || "Shop wide"
                  : t("admin.voucher.type.product_specific") ||
                    "Product specific"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left */}
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.voucher.form.start_date") || "Start Date"}
                  </div>
                  <div className="font-medium">
                    {formatDateTime(voucher.startDate)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.voucher.form.end_date") || "End Date"}
                  </div>
                  <div className="font-medium">
                    {formatDateTime(voucher.endDate)}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.voucher.form.discount_type") || "Discount"}
                  </div>
                  <div className="font-medium">
                    {voucher.discountType === "PERCENTAGE"
                      ? `${voucher.discountValue}%`
                      : voucher.discountType === "FIXED_AMOUNT"
                      ? `${Number(voucher.discountValue).toLocaleString()} VND`
                      : voucher.discountValue}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    {t("admin.voucher.columns.usage") || "Usage"}
                  </div>
                  <div className="font-medium">
                    {voucher.currentUsage ?? 0}/{voucher.maxTotalUsage ?? "∞"}
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-full bg-gray-50 rounded-md p-3 text-sm text-gray-700 border">
                <div className="flex justify-between">
                  <div>{t("admin.voucher.stats.total") || "Products"}</div>
                  <div className="font-medium">{stats.total}</div>
                </div>
              </div>

              <div className="w-full text-sm text-gray-600 rounded-md p-2 border bg-gray-50">
                <div className="flex items-center gap-2">
                  <IconInfoCircle size={16} />
                  <span>
                    {hasMaxDiscount ? (
                      <>
                        <span className="text-gray-700">
                          {t("admin.voucher.form.max_discount_amount") ||
                            "Max discount"}
                          :
                        </span>{" "}
                        <span className="font-medium">
                          {Number(
                            voucher.maxDiscountAmount ?? 0
                          ).toLocaleString()}{" "}
                          VND
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-700">
                        {t("admin.voucher.form.no_max_discount") ||
                          "No max discount"}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              {t("admin.voucher.form.usage_section") || "Applied products"}
            </h4>

            {isShopWide ? (
              <div className="py-6 text-center text-gray-600">
                {t("admin.voucher.shop_wide_notice") ||
                  "This voucher applies to all products in the shop."}
                <div className="text-sm text-gray-500 mt-2">
                  {t("admin.voucher.form.min_order_amount") ||
                    t("admin.promotion.detail.fields.min_order_amount") ||
                    "Min order"}
                  : {Number(voucher.minOrderAmount ?? 0).toLocaleString()} VND
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="py-6 text-center text-gray-500">
                {t("admin.voucher.no_vouchers") || "No products applied"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-xs text-gray-600">
                      <th className="p-2">
                        {t("admin.voucher.table.index") || "#"}
                      </th>
                      <th className="p-2">
                        {t("admin.voucher.table.product") || "Product"}
                      </th>
                      <th className="p-2">
                        {t("admin.voucher.table.price") || "Price"}
                      </th>
                      <th className="p-2">
                        {t("admin.voucher.table.status") || "Status"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((pp, idx) => (
                      <ProductRow
                        pp={pp}
                        idx={idx}
                        key={pp.productId ?? pp.id ?? idx}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
