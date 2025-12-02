import { useCustomerVoucher } from "../../../hooks/useVoucher";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../common/Pagination";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )} ${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
};

const VoucherCard = ({ voucher }) => {
  const { t } = useTranslation();
  // Determine discount type for display
  let discountDisplay = "";
  if (
    voucher.discountType === "PERCENTAGE" ||
    voucher.discountType === "PERCENT"
  ) {
    discountDisplay = `${voucher.discountValue}%`;
  } else {
    discountDisplay = `${voucher.discountValue.toLocaleString()}${t(
      "voucher.currency"
    )}`;
  }
  // Max discount display (only if > 0)
  let maxDiscountDisplay = "";
  if (
    (voucher.hasMaxDiscount || voucher.maxDiscountAmount > 0) &&
    voucher.maxDiscountAmount > 0
  ) {
    maxDiscountDisplay = (
      <p className="text-xs text-gray-500">
        {t("voucher.max_discount")}:{" "}
        {voucher.maxDiscountAmount.toLocaleString()}
        {t("voucher.currency")}
      </p>
    );
  }

  return (
    <div className="mb-6 border border-white/30 rounded-2xl bg-white/30 backdrop-blur-md shadow-xl transition hover:shadow-2xl p-6 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold text-lg text-blue-700">{voucher.code}</p>
          <p className="text-gray-700">{voucher.name}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-green-600">{discountDisplay}</p>
          {maxDiscountDisplay}
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-600">
          {t("voucher.valid_from")}: {formatDateTime(voucher.startDate)} -{" "}
          {formatDateTime(voucher.endDate)}
        </p>
        <p className="text-sm text-gray-600">
          {t("voucher.status")}:{" "}
          <span className={voucher.active ? "text-green-600" : "text-red-600"}>
            {voucher.active ? t("voucher.active") : t("voucher.inactive")}
          </span>
        </p>
      </div>
    </div>
  );
};

export default function MyVoucher() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);

  const { availableVouchers, isLoading, isError } = useCustomerVoucher({
    page,
    size: 4,
  });

  const pagedData = availableVouchers;
  const vouchers = pagedData?.values || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = pagedData?.totalPages || 0;

  const handlePageChange = (newPage) => setPage(newPage - 1);

  if (isLoading) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 border rounded-lg text-red-600">
        <p>{t("voucher.load_error")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-100/60 via-white/60 to-blue-200/60 p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-2xl backdrop-blur-lg">
      <div className="flex-shrink-0">
        <h2 className="text-xl sm:text-3xl font-bold mb-2 drop-shadow">
          {t("account.sidebar.voucher_wallet")}
        </h2>
        <div className="mb-4 sm:mb-6 text-gray-700/80 text-sm sm:text-base">
          {t("voucher.total")}: {totalElements}
        </div>
      </div>
      <div className="relative flex-grow overflow-y-auto pr-2">
        {vouchers.length > 0 ? (
          vouchers.map((voucher) => (
            <VoucherCard key={voucher.id} voucher={voucher} />
          ))
        ) : (
          <div className="text-center py-10 border rounded-lg bg-white/30 backdrop-blur">
            <p>{t("voucher.no_vouchers_found")}</p>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 mt-4">
        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
