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
