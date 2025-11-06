import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomerVoucher } from "../../../hooks/useVoucher";
import VoucherCard from "./VoucherCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VoucherSection() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const size = 4; // Show 4 vouchers per page

  const { availableVouchers, isLoading, isError } = useCustomerVoucher({
    page,
    size,
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="text-center">{t("voucher.loading")}</div>
      </div>
    );
  }

  // Kiểm tra cấu trúc dữ liệu đúng
  const vouchers = availableVouchers?.values || [];
  const totalPages = availableVouchers?.totalPages || 0;
  const currentPage = availableVouchers?.page || 0;

  // Không hiển thị nếu không có voucher hoặc có lỗi
  if (isError || vouchers.length === 0) {
    return null;
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setPage(currentPage + 1);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {t("voucher.section_title")}
          </h2>
          <p className="text-gray-600 mt-1">{t("voucher.section_subtitle")}</p>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-600">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vouchers.map((voucher) => (
          <VoucherCard key={voucher.id} voucher={voucher} />
        ))}
      </div>
    </div>
  );
}
