import api from "./api";

/**
 * Retrieves product recommendations for a given product.
 * @param {number} productId - The ID of the product to get recommendations for.
 * @param {number} limit - The maximum number of recommendations to return.
 * @returns {Promise<object>} The API response with a list of recommended products.
 */
export const getProductRecommendations = async (productId, limit = 5) => {
  const response = await api.get(
    `/recommendations/products/${productId}?limit=${limit}`
  );
  return response.data;
};

/**
 * Retrieves hybrid product recommendations for a given product and user.
 * @param {object} params - The parameters for the request.
 * @param {number} params.productId - The ID of the product to get recommendations for.
 * @param {number} [params.userId] - The ID of the current user (optional).
 * @param {number} [params.limit=10] - The maximum number of recommendations to return.
 * @returns {Promise<object>} The API response with a list of recommended products.
 */
export const getHybridRecommendations = async ({
  productId,
  userId,
  limit = 10,
}) => {
  const response = await api.get("/recommendations/products", {
    params: {
      productId,
      userId,
      limit,
    },
  });
  return response.data;
};

/**
 * Retrieves statistics for top recommended products (Admin).
 * @param {object} params - The parameters for the request.
 * @param {number} [params.limit=10] - The number of top products to return.
 * @param {number} [params.days] - The number of past days to calculate stats for.
 * @returns {Promise<object>} The API response.
 */
export const getTopRecommendedProducts = async ({ limit = 10, days }) => {
  const response = await api.get("/recommendations/stats/top-products", {
    params: { limit, days },
  });
  return response.data;
};

/**
 * Retrieves recommendation analytics (Admin).
 * @param {object} params - The parameters for the request.
 * @param {number} [params.days] - The number of past days to calculate stats for.
 * @returns {Promise<object>} The API response.
 */
export const getRecommendationAnalytics = async ({ days }) => {
  const response = await api.get("/recommendations/stats/analytics", {
    params: { days },
  });
  return response.data;
};

/**
 * Retrieves product-specific recommendation statistics (Admin).
 * @param {object} params - The parameters for the request.
 * @param {number} [params.limit=10] - The number of products to return stats for.
 * @param {number} [params.days] - The number of past days to calculate stats for.
 * @returns {Promise<object>} The API response.
 */
export const getProductRecommendationStats = async ({ limit = 10, days }) => {
  const response = await api.get("/recommendations/stats/products", {
    params: { limit, days },
  });
  return response.data;
};
