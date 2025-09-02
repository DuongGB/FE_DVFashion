import React from "react";
import {
  IconX,
  IconStar,
  IconStarFilled,
  IconUser,
  IconPackage,
  IconThumbUp,
  IconClock,
  IconNotes,
  IconCheck,
  IconAlertTriangle,
  IconBan,
} from "@tabler/icons-react";

export default function ReviewDetailModal({ review, open, onClose }) {
  if (!open || !review) return null;

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

  // Format date only
  const formatDateOnly = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <IconStarFilled key={i} size={20} className="text-yellow-400" />
        ) : (
          <IconStar key={i} size={20} className="text-gray-300" />
        )
      );
    }
    return stars;
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          label: "Chờ duyệt",
          icon: IconClock,
          description: "Đánh giá đang chờ được kiểm duyệt",
        };
      case "APPROVED":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          label: "Đã duyệt",
          icon: IconCheck,
          description: "Đánh giá đã được phê duyệt và hiển thị công khai",
        };
      case "REJECTED":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          label: "Từ chối",
          icon: IconBan,
          description: "Đánh giá bị từ chối do vi phạm quy định",
        };
      case "HIDDEN":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: "Ẩn",
          icon: IconAlertTriangle,
          description: "Đánh giá đã được ẩn khỏi hiển thị công khai",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: "Không xác định",
          icon: IconAlertTriangle,
          description: "Trạng thái không xác định",
        };
    }
  };

  // Get rating level
  const getRatingLevel = (rating) => {
    if (rating >= 5) return { level: "Xuất sắc", color: "text-green-600" };
    if (rating >= 4) return { level: "Tốt", color: "text-blue-600" };
    if (rating >= 3) return { level: "Trung bình", color: "text-yellow-600" };
    if (rating >= 2) return { level: "Kém", color: "text-orange-600" };
    return { level: "Rất kém", color: "text-red-600" };
  };

  const statusInfo = getStatusInfo(review.status);
  const ratingInfo = getRatingLevel(review.rating);
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconStar size={24} className="text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết đánh giá #{review.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Review Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Rating Display */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg text-center border border-yellow-200">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {review.rating}
                </div>
                <div className="flex justify-center gap-1 mb-3">
                  {renderStars(review.rating)}
                </div>
                <h3 className={`font-bold text-lg ${ratingInfo.color} mb-2`}>
                  {ratingInfo.level}
                </h3>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
                >
                  <StatusIcon size={14} className="inline mr-1" />
                  {statusInfo.label}
                </div>
              </div>
            </div>

            {/* Key Information */}
            <div className="lg:col-span-2 space-y-4">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconUser size={18} />
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600 mb-1">
                      Tên khách hàng
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {review.user?.fullName || "Không có"}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="text-lg font-medium text-blue-600">
                      {review.user?.email || "Không có"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconPackage size={18} />
                  Thông tin sản phẩm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600 mb-1">
                      Tên sản phẩm
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {review.productVariant?.product?.name || "Không có"}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600 mb-1">Biến thể</div>
                    <div className="text-lg font-medium text-gray-700">
                      {review.productVariant?.color} -{" "}
                      {review.productVariant?.size}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconNotes size={18} />
              Nội dung đánh giá
            </h3>
            <div className="bg-white p-4 rounded border">
              <p className="text-gray-700 text-lg leading-relaxed">
                "{review.comment || "Không có bình luận"}"
              </p>
            </div>
          </div>

          {/* Review Images */}
          {review.images && review.images.length > 0 && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Hình ảnh đính kèm ({review.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {review.images.map((image, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img
                      src={image.url || image}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-24 object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        // Handle image preview
                        window.open(image.url || image, "_blank");
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interaction Statistics */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconThumbUp size={18} />
              Thống kê tương tác
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border text-center">
                <div className="text-2xl font-bold text-green-600">
                  {review.helpfulCount || 0}
                </div>
                <div className="text-sm text-gray-600">Lượt hữu ích</div>
              </div>
              <div className="bg-white p-4 rounded border text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {review.viewCount || 0}
                </div>
                <div className="text-sm text-gray-600">Lượt xem</div>
              </div>
              <div className="bg-white p-4 rounded border text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {review.replyCount || 0}
                </div>
                <div className="text-sm text-gray-600">Phản hồi</div>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">
              Thông tin trạng thái
            </h3>
            <div className="bg-white p-4 rounded border">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
                >
                  <StatusIcon size={14} className="inline mr-1" />
                  {statusInfo.label}
                </span>
                <span className="text-sm text-gray-600">
                  {statusInfo.description}
                </span>
              </div>

              {/* Moderation Info */}
              {review.moderatedBy && (
                <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="text-sm text-blue-700">
                    <strong>Người kiểm duyệt:</strong> {review.moderatedBy}
                  </div>
                  {review.moderatedAt && (
                    <div className="text-sm text-blue-600 mt-1">
                      <strong>Thời gian:</strong>{" "}
                      {formatDate(review.moderatedAt)}
                    </div>
                  )}
                  {review.moderationNotes && (
                    <div className="text-sm text-blue-700 mt-2">
                      <strong>Ghi chú:</strong> {review.moderationNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Information */}
          {review.order && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Thông tin đơn hàng liên quan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600 mb-1">Mã đơn hàng</div>
                  <div className="text-lg font-bold text-blue-600">
                    #{review.order.orderNumber}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600 mb-1">
                    Trạng thái đơn hàng
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    {review.order.status}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600 mb-1">
                    Ngày đặt hàng
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    {formatDateOnly(review.order.createdAt)}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600 mb-1">
                    Ngày giao hàng
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    {review.order.deliveredAt
                      ? formatDateOnly(review.order.deliveredAt)
                      : "Chưa giao"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconClock size={18} />
              Thông tin thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600 mb-1">Ngày tạo</div>
                <div className="text-lg font-medium text-gray-700">
                  {formatDate(review.createdAt)}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600 mb-1">
                  Cập nhật lần cuối
                </div>
                <div className="text-lg font-medium text-gray-700">
                  {review.updatedAt
                    ? formatDate(review.updatedAt)
                    : "Chưa cập nhật"}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600 mb-1">
                  Thời gian tồn tại
                </div>
                <div className="text-lg font-medium text-gray-700">
                  {(() => {
                    const days = Math.floor(
                      (new Date() - new Date(review.createdAt)) /
                        (1000 * 60 * 60 * 24)
                    );
                    if (days === 0) return "Hôm nay";
                    if (days === 1) return "1 ngày";
                    return `${days} ngày`;
                  })()}
                </div>
              </div>
              {review.verifiedPurchase && (
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600 mb-1">
                    Xác thực mua hàng
                  </div>
                  <div className="text-lg font-medium text-green-600 flex items-center gap-1">
                    <IconCheck size={16} />
                    Đã xác thực
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
