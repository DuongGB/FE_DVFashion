import { useState, useEffect } from "react";
import {
  IconEye,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconStarFilled,
  IconSearch,
  IconFilter,
  IconDownload,
  IconPlus,
  IconUser,
  IconPackage,
  IconCalendar,
  IconThumbUp,
  IconMessage,
  IconClock,
} from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";
import ReviewDetailModal from "../../components/ui/review/ReviewDetailModal";
import ReviewForm from "../../components/ui/review/ReviewForm";
import { showConfirmationToast } from "../../utils/showConfirmationToast";
import { toast } from "react-toastify";

// Mock data cho bảng Review (dựa trên database schema)
const mockReviews = [
  {
    id: 1,
    user: {
      id: 1,
      fullName: "Nguyễn Văn A",
      email: "a@email.com",
      avatar:
        "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
    },
    productVariant: {
      id: 1,
      product: { name: "Áo thun Nike Basic" },
      color: "Đen",
      size: "L",
      sku: "NIKE-001-L-BLACK",
    },
    order: {
      id: 1,
      orderNumber: "ORD-2024-001",
      status: "DELIVERED",
      createdAt: "2024-05-15",
      deliveredAt: "2024-05-20",
    },
    rating: 5,
    comment: "Sản phẩm rất tốt! Chất liệu mát mẻ, form dáng đẹp. Sẽ mua lại.",
    status: "APPROVED",
    helpfulCount: 12,
    viewCount: 45,
    replyCount: 2,
    verifiedPurchase: true,
    images: [
      {
        id: 1,
        url: "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
      },
      {
        id: 2,
        url: "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
      },
    ],
    createdAt: "2024-06-01T10:30:00Z",
    updatedAt: "2024-06-02T15:45:00Z",
    moderatedBy: "Admin User",
    moderatedAt: "2024-06-01T16:00:00Z",
  },
  {
    id: 2,
    user: {
      id: 2,
      fullName: "Trần Thị B",
      email: "b@email.com",
      avatar:
        "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
    },
    productVariant: {
      id: 2,
      product: { name: "Quần Adidas Originals" },
      color: "Xám",
      size: "M",
      sku: "ADIDAS-002-M-GRAY",
    },
    order: {
      id: 2,
      orderNumber: "ORD-2024-002",
      status: "DELIVERED",
      createdAt: "2024-05-18",
      deliveredAt: "2024-05-23",
    },
    rating: 4,
    comment: "Chất lượng ổn, giao hàng nhanh. Nhưng màu hơi khác so với hình.",
    status: "APPROVED",
    helpfulCount: 5,
    viewCount: 28,
    replyCount: 1,
    verifiedPurchase: true,
    images: [],
    createdAt: "2024-06-03T14:15:00Z",
    updatedAt: "2024-06-04T09:20:00Z",
    moderatedBy: "Admin User",
    moderatedAt: "2024-06-03T16:30:00Z",
  },
  {
    id: 3,
    user: {
      id: 3,
      fullName: "Lê Văn C",
      email: "c@email.com",
      avatar:
        "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
    },
    productVariant: {
      id: 3,
      product: { name: "Giày Puma RS-X" },
      color: "Trắng",
      size: "42",
      sku: "PUMA-003-42-WHITE",
    },
    order: {
      id: 3,
      orderNumber: "ORD-2024-003",
      status: "RETURNED",
      createdAt: "2024-05-20",
      deliveredAt: "2024-05-25",
    },
    rating: 2,
    comment: "Giày hơi chật, không vừa ý. Chất liệu cứng.",
    status: "APPROVED",
    helpfulCount: 1,
    viewCount: 15,
    replyCount: 3,
    verifiedPurchase: true,
    images: [
      {
        id: 3,
        url: "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
      },
    ],
    createdAt: "2024-06-05T11:45:00Z",
    updatedAt: "2024-06-06T08:30:00Z",
    moderatedBy: "Admin User",
    moderatedAt: "2024-06-05T17:00:00Z",
  },
  {
    id: 4,
    user: {
      id: 4,
      fullName: "Phạm Thị D",
      email: "d@gmail.com",
      avatar:
        "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
    },
    productVariant: {
      id: 4,
      product: { name: "Áo khoác Zara Bomber" },
      color: "Xanh Navy",
      size: "S",
      sku: "ZARA-004-S-NAVY",
    },
    order: {
      id: 4,
      orderNumber: "ORD-2024-004",
      status: "DELIVERED",
      createdAt: "2024-05-22",
      deliveredAt: "2024-05-27",
    },
    rating: 5,
    comment: "Rất hài lòng với sản phẩm này! Thiết kế đẹp, chất liệu cao cấp.",
    status: "APPROVED",
    helpfulCount: 8,
    viewCount: 52,
    replyCount: 0,
    verifiedPurchase: true,
    images: [
      {
        id: 4,
        url: "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
      },
      {
        id: 5,
        url: "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
      },
    ],
    createdAt: "2024-06-07T16:20:00Z",
    updatedAt: "2024-06-08T12:15:00Z",
    moderatedBy: "Admin User",
    moderatedAt: "2024-06-07T18:45:00Z",
  },
  {
    id: 5,
    user: {
      id: 5,
      fullName: "Hoàng Văn E",
      email: "e@gmail.com",
      avatar:
        "https://ann.com.vn/wp-content/uploads/24037_z5353248646831-af29fa873b5e9926fa277e529fae4485_20240416063754.jpg",
    },
    productVariant: {
      id: 5,
      product: { name: "Túi xách Gucci Mini" },
      color: "Đen",
      size: "OneSize",
      sku: "GUCCI-005-OS-BLACK",
    },
    order: {
      id: 5,
      orderNumber: "ORD-2024-005",
      status: "DELIVERED",
      createdAt: "2024-05-25",
      deliveredAt: "2024-05-30",
    },
    rating: 3,
    comment:
      "Chất lượng trung bình, không như mong đợi. Giá hơi cao so với chất lượng.",
    status: "PENDING",
    helpfulCount: 2,
    viewCount: 22,
    replyCount: 0,
    verifiedPurchase: true,
    images: [],
    createdAt: "2024-06-09T13:10:00Z",
    updatedAt: "2024-06-10T10:25:00Z",
  },
];

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  HIDDEN: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusLabels = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  HIDDEN: "Ẩn",
};

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [setLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    // Giả lập fetch API
    setLoading(true);
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 500);
  }, [setLoading]);

  // Lọc theo các tiêu chí
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      review.productVariant.product.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      review.comment.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || review.status === statusFilter;
    const matchesRating =
      !ratingFilter || review.rating === parseInt(ratingFilter);
    const matchesVerified =
      verifiedFilter === "" ||
      (verifiedFilter === "true" && review.verifiedPurchase) ||
      (verifiedFilter === "false" && !review.verifiedPurchase);

    return matchesSearch && matchesStatus && matchesRating && matchesVerified;
  });

  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <IconStarFilled
          key={i}
          size={14}
          className={i <= rating ? "text-yellow-400" : "text-gray-300"}
        />
      );
    }
    return stars;
  };

  // Handle actions
  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handleEdit = (review) => {
    setSelectedReview(review);
    setShowEditModal(true);
  };

  // Xử lý ẩn đánh giá với confirmation toast
  const handleHide = async (reviewId) => {
    const review = reviews.find((r) => r.id === reviewId);

    // Determine action based on current status
    const isUnhiding = review.status === "HIDDEN";
    const action = isUnhiding ? "hiển thị lại" : "ẩn";
    const actionEn = isUnhiding ? "unhide" : "hide";

    const confirmText = isUnhiding ? "Hiển thị lại" : "Ẩn đánh giá";
    const cancelText = "Hủy";

    const title = isUnhiding
      ? "Xác nhận hiển thị lại đánh giá"
      : "Xác nhận ẩn đánh giá";

    const message = isUnhiding
      ? `Bạn có chắc chắn muốn hiển thị lại đánh giá của khách hàng "${review?.user.fullName}" không? Đánh giá sẽ được hiển thị công khai trở lại.`
      : `Bạn có chắc chắn muốn ẩn đánh giá của khách hàng "${review?.user.fullName}" không? Đánh giá sẽ không hiển thị cho khách hàng khác.`;

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass: isUnhiding
        ? "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer"
        : "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          // API call to toggle review visibility
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    status: isUnhiding ? "APPROVED" : "HIDDEN",
                    moderatedAt: new Date().toISOString(),
                    moderatedBy: "Current Admin",
                    updatedAt: new Date().toISOString(),
                  }
                : r
            )
          );

          const successMessage = isUnhiding
            ? "Hiển thị lại đánh giá thành công!"
            : "Ẩn đánh giá thành công!";

          toast.success(successMessage);
        } catch (error) {
          console.error(`Error ${actionEn} review:`, error);
          const errorMessage = `Có lỗi xảy ra khi ${action} đánh giá!`;
          toast.error(errorMessage);
        }
      },
    });
  };

  // Duyệt hoặc từ chối đánh giá
  const handleApprove = async (reviewId) => {
    const review = reviews.find((r) => r.id === reviewId);

    showConfirmationToast({
      title: "Xác nhận duyệt đánh giá",
      message: `Bạn có chắc chắn muốn duyệt đánh giá của khách hàng "${review?.user.fullName}" không?`,
      confirmText: "Duyệt",
      cancelText: "Hủy",
      confirmButtonClass:
        "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          // API call to approve review
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    status: "APPROVED",
                    moderatedAt: new Date().toISOString(),
                    moderatedBy: "Current Admin",
                  }
                : r
            )
          );
          toast.success("Duyệt đánh giá thành công!");
        } catch (error) {
          console.error("Error approving review:", error);
          toast.error("Có lỗi xảy ra khi duyệt đánh giá!");
        }
      },
    });
  };

  // Từ chối đánh giá
  const handleReject = async (reviewId) => {
    const review = reviews.find((r) => r.id === reviewId);

    showConfirmationToast({
      title: "Xác nhận từ chối đánh giá",
      message: `Bạn có chắc chắn muốn từ chối đánh giá của khách hàng "${review?.user.fullName}" không?`,
      confirmText: "Từ chối",
      cancelText: "Hủy",
      confirmButtonClass:
        "bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          // API call to reject review
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    status: "REJECTED",
                    moderatedAt: new Date().toISOString(),
                    moderatedBy: "Current Admin",
                  }
                : r
            )
          );
          toast.success("Từ chối đánh giá thành công!");
        } catch (error) {
          console.error("Error rejecting review:", error);
          toast.error("Có lỗi xảy ra khi từ chối đánh giá!");
        }
      },
    });
  };

  // Lưu đánh giá (tạo mới hoặc cập nhật)
  const handleSubmitReview = async (reviewData) => {
    try {
      if (selectedReview) {
        // Update existing review
        setReviews((prev) =>
          prev.map((r) =>
            r.id === selectedReview.id
              ? { ...r, ...reviewData, updatedAt: new Date().toISOString() }
              : r
          )
        );
        toast.success("Cập nhật đánh giá thành công!");
      } else {
        // Create new review (if needed)
        const newReview = {
          id: Math.max(...reviews.map((r) => r.id)) + 1,
          ...reviewData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setReviews((prev) => [newReview, ...prev]);
        toast.success("Tạo đánh giá thành công!");
      }
      setShowEditModal(false);
      setSelectedReview(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Có lỗi xảy ra khi lưu đánh giá!");
      throw error;
    }
  };

  // Calculate statistics
  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "PENDING").length,
    approved: reviews.filter((r) => r.status === "APPROVED").length,
    avgRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý đánh giá</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <IconMessage className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <IconClock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <IconCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Điểm TB</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.avgRating}
              </p>
            </div>
            <IconStarFilled className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng, sản phẩm, bình luận..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
              <option value="HIDDEN">Ẩn</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả đánh giá</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>

          {/* Verified Filter */}
          <div>
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Đã xác thực</option>
              <option value="false">Chưa xác thực</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {`Hiển thị ${paginatedReviews.length} trên tổng số ${filteredReviews.length} đánh giá`}
      </div>

      {/* Reviews Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Đánh giá</th>
              <th className="p-3">Bình luận</th>
              <th className="p-3 w-28">Trạng thái</th>
              <th className="p-3">Tương tác</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <tr key={review.id} className="border-b hover:bg-gray-300">
                  <td className="p-3">{review.id}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          review.user.avatar ||
                          "https://via.placeholder.com/32x32?text=User"
                        }
                        alt={review.user.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/32x32?text=User")
                        }
                      />
                      <div>
                        <p className="font-semibold">{review.user.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {review.user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div>
                      <p className="font-semibold">
                        {review.productVariant.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {review.productVariant.color},{" "}
                        {review.productVariant.size}
                      </p>
                      <p className="text-xs text-gray-400">
                        {review.productVariant.sku}
                      </p>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(review.rating)}
                      <span className="text-sm ml-1">({review.rating})</span>
                    </div>
                    {review.verifiedPurchase && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        Xác thực
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="max-w-xs">
                      <p className="text-sm truncate" title={review.comment}>
                        {review.comment}
                      </p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {review.images.slice(0, 2).map((image, index) => (
                            <img
                              key={index}
                              src={image.url || image}
                              alt={`Review ${index + 1}`}
                              className="w-6 h-6 rounded object-cover"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          ))}
                          {review.images.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{review.images.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-3 w-24">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        statusColors[review.status]
                      }`}
                    >
                      {statusLabels[review.status]}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="text-sm text-gray-600">
                      <div>👍 {review.helpfulCount}</div>
                      <div>👁 {review.viewCount}</div>
                      <div>💬 {review.replyCount}</div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="text-sm">
                      {formatDate(review.createdAt)}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(review)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <IconEye size={24} />
                      </button>
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <IconEdit size={24} />
                      </button>
                      {review.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="text-green-600 hover:text-green-800 cursor-pointer"
                            title="Duyệt đánh giá"
                          >
                            <IconCheck size={24} />
                          </button>
                          <button
                            onClick={() => handleReject(review.id)}
                            className="text-orange-600 hover:text-orange-800 cursor-pointer"
                            title="Từ chối đánh giá"
                          >
                            <IconX size={24} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleHide(review.id)}
                        className={`cursor-pointer ${
                          review.status === "HIDDEN"
                            ? "text-green-600 hover:text-green-800"
                            : "text-red-600 hover:text-red-800"
                        }`}
                        title={
                          review.status === "HIDDEN"
                            ? "Hiển thị lại đánh giá"
                            : "Ẩn đánh giá"
                        }
                      >
                        <IconTrash size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 p-4">
                  Không có đánh giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReview(null);
        }}
      />

      {/* Review Edit Modal */}
      <ReviewForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedReview(null);
        }}
        onSubmit={handleSubmitReview}
        review={selectedReview}
      />
    </div>
  );
}
