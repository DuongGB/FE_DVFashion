import api from "./api";

/**
 * Retrieves all reviews for admin with filtering and pagination.
 * @param {object} params - Filtering and pagination parameters.
 * @returns {Promise<object>} A paginated response of reviews.
 */
export const getAllReviewsForAdmin = async (params) => {
  const response = await api.get("/reviews/admin/all", { params });
  return response.data;
};

/**
 * Moderates a review by an admin (approve, reject, hide).
 * @param {number} reviewId - The ID of the review to moderate.
 * @param {object} request - The moderation request body.
 * @param {string} request.status - The new status (e.g., 'APPROVED', 'REJECTED', 'HIDDEN').
 * @param {string} [request.adminComment] - An optional comment from the admin.
 * @returns {Promise<object>} The updated review.
 */
export const moderateReview = async (reviewId, request) => {
  const response = await api.put(`/reviews/${reviewId}/moderate`, request);
  return response.data;
};

/**
 * Retrieves reviews for a specific product with filtering.
 * @param {number} productId - The ID of the product.
 * @param {object} params - Filtering parameters (e.g., rating, hasImages, page, size).
 * @returns {Promise<object>} The product reviews and statistics.
 */
export const getProductReviewsFilter = async (productId, params) => {
  const response = await api.get(`/reviews/product/${productId}`, { params });
  return response.data;
};

/**
 * Creates a new review for a product (for customers).
 * @param {object} data - The review data.
 * @param {object} data.review - The review JSON data (CreateReviewRequest).
 * @param {Array<File>} data.imageFiles - Optional list of image files.
 * @returns {Promise<object>} The created review.
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
 * Updates an existing review (for customers).
 * @param {object} data - The update data.
 * @param {number} data.reviewId - The ID of the review to update.
 * @param {object} [data.review] - The review JSON data (UpdateReviewRequest).
 * @param {Array<File>} [data.imageFiles] - Optional list of new image files.
 * @returns {Promise<object>} The updated review.
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
 * Checks if a user can review a specific product from an order.
 * @param {object} params - The parameters.
 * @param {number} params.orderId - The order ID.
 * @param {number} params.productVariantId - The product variant ID.
 * @returns {Promise<object>} A boolean indicating if the user can review.
 */
export const canReviewProduct = async ({ orderId, productVariantId }) => {
  const response = await api.get("/reviews/can-review", {
    params: { orderId, productVariantId },
  });
  return response.data;
};

/**
 * Checks if a user can edit their own review.
 * @param {number} reviewId - The ID of the review.
 * @returns {Promise<object>} A boolean indicating if the user can edit.
 */
export const canEditReview = async (reviewId) => {
  const response = await api.get(`/reviews/${reviewId}/can-edit`);
  return response.data;
};
