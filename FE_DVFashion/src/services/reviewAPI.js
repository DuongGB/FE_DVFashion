import api from "./api";

// ==================== REVIEW APIs ====================

/**
 * Lấy tất cả đánh giá cho admin với bộ lọc và phân trang.
 */
export const getAllReviewsForAdmin = async (params) => {
  const response = await api.get("/reviews/admin/all", { params });
  return response.data;
};

/**
 * Duyệt một đánh giá bởi admin.
 */
export const moderateReview = async (reviewId, request) => {
  const response = await api.put(`/reviews/${reviewId}/moderate`, request);
  return response.data;
};

/**
 * Lấy đánh giá của một sản phẩm với bộ lọc và phân trang.
 */
export const getProductReviewsFilter = async (productId, params) => {
  const response = await api.get(`/reviews/product/${productId}`, { params });
  return response.data;
};

/**
 * Tạo một đánh giá mới.
 */
export const createReview = async ({ review, imageFiles }) => {
  const formData = new FormData();
  formData.append(
    "review",
    new Blob([JSON.stringify(review)], { type: "application/json" })
  );
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => formData.append("imageFiles", file));
  }
  const response = await api.post("/reviews", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Cập nhật một đánh giá hiện có.
 */
export const updateReview = async ({ reviewId, review, imageFiles }) => {
  const formData = new FormData();
  if (review) {
    formData.append(
      "review",
      new Blob([JSON.stringify(review)], { type: "application/json" })
    );
  }
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => formData.append("imageFiles", file));
  }
  const response = await api.put(`/reviews/${reviewId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Kiểm tra xem người dùng có thể đánh giá sản phẩm hay không.
 */
export const canReviewProduct = async ({ orderId, productVariantId }) => {
  const response = await api.get("/reviews/can-review", {
    params: { orderId, productVariantId },
  });
  return response.data;
};

/**
 * Kiểm tra xem người dùng có thể chỉnh sửa đánh giá hay không.
 */
export const canEditReview = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}/can-edit`);
  return response.data;
};

/**
 * Lấy tất cả đánh giá của người dùng hiện tại.
 */
export const getMyReviews = async (params = {}) => {
  const response = await api.get("/reviews/my-reviews", { params });
  return response.data.data;
};

// ==================== REVIEW REPLY APIs ====================

/**
 * Tạo một phản hồi đánh giá mới.
 */
export const createReviewReply = async (request) => {
  const response = await api.post("/review-replies", request);
  return response.data;
};

/**
 * Cập nhật một phản hồi đánh giá.
 */
export const updateReviewReply = async ({ replyId, request }) => {
  const response = await api.put(`/review-replies/${replyId}`, request);
  return response.data;
};

/**
 * Xóa một phản hồi đánh giá.
 */
export const deleteReviewReply = async (replyId) => {
  const response = await api.delete(`/review-replies/${replyId}`);
  return response.data;
};

/**
 * Lấy tất cả phản hồi đánh giá cho khách hàng.
 */
export const getReviewRepliesForCustomer = async (reviewId, lang = "VI") => {
  const response = await api.get(
    `/review-replies/review/${reviewId}/customer`,
    { params: { lang } }
  );
  return response.data;
};

/**
 * Lấy tất cả phản hồi đánh giá cho admin.
 */
export const getAllReviewRepliesForAdmin = async (reviewId) => {
  const response = await api.get(`/review-replies/review/${reviewId}/admin`);
  return response.data;
};

/**
 * Admin duyệt một phản hồi đánh giá.
 */
export const moderateReviewReply = async ({ replyId, request }) => {
  const response = await api.put(
    `/review-replies/${replyId}/moderate`,
    request
  );
  return response.data;
};
