const typeLabels = {
  PERCENT: "Phần trăm",
  AMOUNT: "Tiền mặt",
};

export default function PromotionDetailModal({ promotion, open, onClose }) {
  if (!open || !promotion) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate usage percentage
  const usagePercentage =
    promotion.maxUsage > 0
      ? Math.round((promotion.currentUsage / promotion.maxUsage) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative overflow-auto scrollbar-hide max-h-[90vh]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl cursor-pointer hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Chi tiết khuyến mãi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Thông tin cơ bản
              </h3>
              <div className="space-y-2">
                <div>
                  <strong className="text-gray-600">ID:</strong>
                  <span className="ml-2">{promotion.id}</span>
                </div>
                <div>
                  <strong className="text-gray-600">Tên khuyến mãi:</strong>
                  <span className="ml-2 font-medium">{promotion.name}</span>
                </div>
                <div>
                  <strong className="text-gray-600">Mã khuyến mãi:</strong>
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                    {promotion.code}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Mô tả:</strong>
                  <p className="ml-2 mt-1 text-gray-700">
                    {promotion.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Discount Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Thông tin giảm giá
              </h3>
              <div className="space-y-2">
                <div>
                  <strong className="text-gray-600">Loại khuyến mãi:</strong>
                  <span className="ml-2">
                    {typeLabels[promotion.type] || promotion.type}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Giá trị:</strong>
                  <span className="ml-2 text-green-600 font-semibold">
                    {promotion.type === "PERCENT"
                      ? `${promotion.value}%`
                      : formatCurrency(promotion.value)}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Đơn hàng tối thiểu:</strong>
                  <span className="ml-2">
                    {promotion.minOrderAmount > 0
                      ? formatCurrency(promotion.minOrderAmount)
                      : "Không yêu cầu"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Usage and Status */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Trạng thái
              </h3>
              <div className="space-y-2">
                <div>
                  <strong className="text-gray-600">Tình trạng:</strong>
                  <span className="ml-2">
                    {promotion.active ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Không hoạt động
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Bắt đầu:</strong>
                  <span className="ml-2">
                    {formatDate(promotion.startDate)}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Kết thúc:</strong>
                  <span className="ml-2">{formatDate(promotion.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Thống kê sử dụng
              </h3>
              <div className="space-y-2">
                <div>
                  <strong className="text-gray-600">
                    Lượt sử dụng tối đa:
                  </strong>
                  <span className="ml-2">{promotion.maxUsage}</span>
                </div>
                <div>
                  <strong className="text-gray-600">Đã sử dụng:</strong>
                  <span className="ml-2 text-blue-600 font-medium">
                    {promotion.currentUsage}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Còn lại:</strong>
                  <span className="ml-2 text-orange-600 font-medium">
                    {promotion.maxUsage - promotion.currentUsage}
                  </span>
                </div>
                {/* Usage Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tiến độ sử dụng</span>
                    <span>{usagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usagePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applicable Products */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 text-gray-700">
            Sản phẩm áp dụng
          </h3>
          {promotion.applicableProducts &&
          promotion.applicableProducts.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Khuyến mãi này áp dụng cho {promotion.applicableProducts.length}{" "}
                sản phẩm:
              </p>
              <div className="flex flex-wrap gap-2">
                {promotion.applicableProducts.map((product) => (
                  <span
                    key={product.id}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {product.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-green-600 font-medium bg-green-100 px-4 py-2 rounded-lg">
                🎉 Áp dụng cho tất cả sản phẩm
              </span>
            </div>
          )}
        </div>

        {/* Categories if available */}
        {promotion.applicableCategories &&
          promotion.applicableCategories.length > 0 && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Danh mục áp dụng
              </h3>
              <div className="flex flex-wrap gap-2">
                {promotion.applicableCategories.map((category) => (
                  <span
                    key={category.id}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
