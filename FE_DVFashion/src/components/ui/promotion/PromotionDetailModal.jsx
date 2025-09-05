import React from "react";
import {
  IconX,
  IconTag,
  IconCalendar,
  IconUsers,
  IconPercentage,
  IconCurrencyDollar,
  IconTruck,
  IconGift,
  IconShoppingCart,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";

const typeLabels = {
  PERCENTAGE: "Phần trăm",
  FIXED_AMOUNT: "Tiền mặt",
  FREE_SHIPPING: "Miễn phí vận chuyển",
  BUY_ONE_GET_ONE: "Mua 1 tặng 1",
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
    promotion.maxUsages > 0
      ? Math.round((promotion.currentUsage / promotion.maxUsages) * 100)
      : 0;

  // Get promotion type icon
  const getTypeIcon = () => {
    switch (promotion.type) {
      case "PERCENTAGE":
        return <IconPercentage size={20} className="text-green-600" />;
      case "FIXED_AMOUNT":
        return <IconCurrencyDollar size={20} className="text-blue-600" />;
      case "FREE_SHIPPING":
        return <IconTruck size={20} className="text-purple-600" />;
      case "BUY_ONE_GET_ONE":
        return <IconGift size={20} className="text-orange-600" />;
      default:
        return <IconTag size={20} className="text-gray-600" />;
    }
  };

  // Get promotion value display
  const getValueDisplay = () => {
    switch (promotion.type) {
      case "PERCENTAGE":
        return `${promotion.value}%`;
      case "FIXED_AMOUNT":
        return formatCurrency(promotion.value);
      case "FREE_SHIPPING":
        return "Miễn phí vận chuyển";
      case "BUY_ONE_GET_ONE":
        return "Mua 1 tặng 1";
      default:
        return promotion.value;
    }
  };

  // Check if promotion is expired
  const isExpired = new Date(promotion.endDate) < new Date();
  const isUpcoming = new Date(promotion.startDate) > new Date();

  // Get status color and label
  const getStatusInfo = () => {
    if (isExpired) {
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Đã hết hạn",
        icon: <IconAlertCircle size={16} />,
      };
    }
    if (isUpcoming) {
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Sắp diễn ra",
        icon: <IconClock size={16} />,
      };
    }
    if (promotion.active) {
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Đang hoạt động",
        icon: <IconCheck size={16} />,
      };
    }
    return {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: "Không hoạt động",
      icon: <IconAlertCircle size={16} />,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            className="absolute top-4 right-4 bg-black backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
            onClick={onClose}
          >
            <IconX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              {getTypeIcon()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{promotion.name}</h2>
              <p className="text-blue-100 opacity-90">
                {promotion.description || "Không có mô tả"}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color} flex items-center gap-1`}
                >
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <IconTag size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">
                    Mã khuyến mãi
                  </p>
                  <p className="text-sm font-bold text-green-800">
                    {promotion.code}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  {getTypeIcon()}
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">Giá trị</p>
                  <p className="text-sm font-bold text-blue-800">
                    {getValueDisplay()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <IconUsers size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 font-medium">
                    Đã sử dụng
                  </p>
                  <p className="text-sm font-bold text-purple-800">
                    {promotion.currentUsage || 0}/{promotion.maxUsages || "∞"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <IconShoppingCart size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 font-medium">
                    Đơn tối thiểu
                  </p>
                  <p className="text-sm font-bold text-orange-800">
                    {promotion.minOrderAmount > 0
                      ? formatCurrency(promotion.minOrderAmount)
                      : "Không yêu cầu"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconInfoCircle size={20} className="text-blue-600" />
                  Thông tin cơ bản
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">ID:</span>
                    <span className="text-gray-800 font-mono">
                      {promotion.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      Loại khuyến mãi:
                    </span>
                    <span className="text-gray-800 flex items-center gap-2">
                      {getTypeIcon()}
                      {typeLabels[promotion.type] || promotion.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">
                      Trạng thái:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-1`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconCalendar size={20} className="text-purple-600" />
                  Thời gian áp dụng
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Bắt đầu:</span>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {formatDate(promotion.startDate)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
                    <span className="text-gray-600 font-medium">Kết thúc:</span>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {formatDate(promotion.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Usage Statistics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconUsers size={20} className="text-green-600" />
                  Thống kê sử dụng
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lượt sử dụng tối đa:</span>
                    <span className="text-gray-800 font-semibold">
                      {promotion.maxUsages || "Không giới hạn"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Đã sử dụng:</span>
                    <span className="text-blue-600 font-semibold">
                      {promotion.currentUsage || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Còn lại:</span>
                    <span className="text-orange-600 font-semibold">
                      {promotion.maxUsages
                        ? promotion.maxUsages - (promotion.currentUsage || 0)
                        : "Không giới hạn"}
                    </span>
                  </div>

                  {promotion.maxUsages && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Tiến độ sử dụng</span>
                        <span>{usagePercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${usagePercentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconShoppingCart size={20} className="text-orange-600" />
                  Điều kiện áp dụng
                </h3>
                <div className="space-y-3">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-800">
                      <IconShoppingCart size={16} />
                      <span className="font-medium">Đơn hàng tối thiểu:</span>
                    </div>
                    <p className="text-orange-700 mt-1">
                      {promotion.minOrderAmount > 0
                        ? formatCurrency(promotion.minOrderAmount)
                        : "Không yêu cầu giá trị tối thiểu"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applicable Products */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <IconTag size={20} className="text-blue-600" />
              Sản phẩm áp dụng
            </h3>
            {promotion.applicableProducts &&
            promotion.applicableProducts.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-3">
                  Khuyến mãi này áp dụng cho{" "}
                  <span className="font-semibold text-blue-600">
                    {promotion.applicableProducts.length}
                  </span>{" "}
                  sản phẩm:
                </p>
                <div className="flex flex-wrap gap-2">
                  {promotion.applicableProducts.map((product) => (
                    <span
                      key={product.id}
                      className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      {product.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-flex items-center gap-2">
                  <IconCheck size={20} className="text-green-600" />
                  <span className="text-green-700 font-medium">
                    🎉 Áp dụng cho tất cả sản phẩm
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Categories if available */}
          {promotion.applicableCategories &&
            promotion.applicableCategories.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconTag size={20} className="text-purple-600" />
                  Danh mục áp dụng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {promotion.applicableCategories.map((category) => (
                    <span
                      key={category.id}
                      className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
