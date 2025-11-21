import api from "./api";

/**
 * Lấy sản phẩm gợi ý dựa trên hybrid recommendation.
 * @param {object} params - Parameters for the request.
 * @param {number} [params.productId] - The ID of the product (optional for homepage).
 * @param {number} [params.userId] - The ID of the current user (optional).
 * @param {number} [params.limit=10] - The maximum number of recommendations to return.
 * @returns {Promise<object>} The API response with a list of recommended products.
 */
export const getHybridRecommendations = async ({
  productId = null,
  userId = null,
  limit = 10,
}) => {
  const params = {
    limit,
  };

  // Chỉ thêm productId nếu nó tồn tại
  if (productId !== null && productId !== undefined) {
    params.productId = productId;
  }

  // chỉ thêm userId nếu nó tồn tại
  if (userId !== null && userId !== undefined) {
    params.userId = userId;
  }

  const response = await api.get("/recommendations/products", { params });
  return response.data;
};

/**
 * Lấy top sản phẩm được gợi ý nhiều nhất (Admin).
 * @param {object} params - The parameters for the request.
 * @param {number} [params.limit=10] - The number of top products to return.
 * @param {number} [params.days] - The number of past days to calculate stats for.
 * @returns {Promise<object>} The API response.
 */
export const getTopRecommendedProducts = async ({ limit = 10, days }) => {
  const params = { limit };
  if (days !== undefined && days !== null) {
    params.days = days;
  }

  const response = await api.get("/recommendations/stats/top-products", {
    params,
  });
  return response.data;
};

/**
 * Lấy phân tích về hệ thống gợi ý (Admin).
 * @param {object} params - The parameters for the request.
 * @param {number} [params.days] - Số ngày trong quá khứ để tính toán phân tích.
 * @returns {Promise<object>} The API response.
 */
export const getRecommendationAnalytics = async ({ days } = {}) => {
  const params = {};
  if (days !== undefined && days !== null) {
    params.days = days;
  }

  const response = await api.get("/recommendations/stats/analytics", {
    params,
  });
  return response.data;
};

/**
 * Lấy thống kê gợi ý sản phẩm cụ thể (Admin).
 * @param {object} params - The parameters for the request.
 * @param {number} [params.limit=10] - The number of products to return stats for.
 * @param {number} [params.days] - The number of past days to calculate stats for.
 * @returns {Promise<object>} The API response.
 */
export const getProductRecommendationStats = async ({ limit = 10, days }) => {
  const params = { limit };
  if (days !== undefined && days !== null) {
    params.days = days;
  }

  const response = await api.get("/recommendations/stats/products", {
    params,
  });
  return response.data;
};

// Lấy gợi ý hôm nay (có thể truyền userId)
export const getTodayRecommendations = async ({ userId, limit = 10 }) => {
  const params = { limit };
  if (userId) params.userId = userId;
  const res = await api.get("/recommendations/today", { params });
  return res.data?.data ?? [];
};

// Lấy sản phẩm vừa xem hôm nay
export const getTodayViewedProducts = async ({ limit = 20 }) => {
  const params = { interactionType: "VIEW", limit };
  const res = await api.get("/recommendations/user/today-interactions", {
    params,
  });
  return res.data?.data ?? [];
};
