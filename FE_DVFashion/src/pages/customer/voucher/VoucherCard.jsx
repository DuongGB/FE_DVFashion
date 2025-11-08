import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../../utils/formatCurrency";
import { toast } from "react-toastify";

export default function VoucherCard({ voucher }) {
  const { t } = useTranslation();

  const formatDiscount = () => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    }
    return formatCurrency(voucher.discountValue);
  };

  const isExpiringSoon = () => {
    const now = new Date();
    const endDate = new Date(voucher.endDate);
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft > 0;
  };

  // Thêm chú thích nếu là voucher áp dụng theo sản phẩm
  const isProductSpecific =
    voucher.voucherType === "PRODUCT_SPECIFIC" ||
    voucher.voucherType === "product_specific";

  return (
    <div className="relative bg-gray-100 border border-gray-300 rounded-md p-3 shadow hover:shadow-md transition-shadow duration-300 min-h-[180px] flex flex-col justify-between">
      {/* Expiring Soon Badge */}
      {isExpiringSoon() && (
        <div className="absolute top-2 right-2 bg-orange-400 text-white text-xs px-2 py-1 rounded-full z-10">
          {t("voucher.expiring_soon")}
        </div>
      )}

      {/* Voucher Content */}
      <div className="text-gray-900">
        <h3 className="text-base font-semibold mb-1 truncate">
          {voucher.name}
        </h3>

        {/* Discount Value */}
        <div className="flex items-center mb-2">
          <span className="text-xl font-bold">{formatDiscount()}</span>
          <span className="ml-1 text-xs">{t("voucher.discount")}</span>
        </div>

        {/* Voucher Code */}
        <div className="bg-gray-200 rounded px-2 py-1 mb-2">
          <div className="flex items-center">
            <span className="text-xs">{t("voucher.code")}</span>
            <span className="font-bold text-base tracking-wider">
              {voucher.code}
            </span>
          </div>
        </div>
        {/* Chú thích áp dụng cho một số sản phẩm */}
        {isProductSpecific && (
          <div className="text-xs text-orange-600 mb-1">
            {t("voucher.product_specific_note")}
          </div>
        )}

        {/* Conditions */}
        <div className="text-xs space-y-0.5 mb-2">
          {voucher.minOrderAmount > 0 && (
            <p>
              • {t("voucher.min_order")}:{" "}
              {formatCurrency(voucher.minOrderAmount)}
            </p>
          )}
          {voucher.hasMaxDiscount && voucher.maxDiscountAmount > 0 && (
            <p>
              • {t("voucher.max_discount")}:{" "}
              {formatCurrency(voucher.maxDiscountAmount)}
            </p>
          )}
          <p>
            • {t("voucher.usage_left")}:{" "}
            {voucher.maxTotalUsage - voucher.currentUsage}/
            {voucher.maxTotalUsage}
          </p>
        </div>

        {/* Expiry Date */}
        <div className="text-xs opacity-90">
          {t("voucher.valid_until")}:{" "}
          {new Date(voucher.endDate).toLocaleDateString()}
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(voucher.code);
          toast.success(t("voucher.copied"));
        }}
        className="w-full mt-2 bg-orange-100 text-orange-700 font-semibold py-1 rounded hover:bg-orange-200 transition-colors text-sm cursor-pointer"
      >
        {t("voucher.copy_code")}
      </button>
    </div>
  );
}
