import { useQuery } from "@tanstack/react-query";
import {
  getHybridRecommendations,
  getTopRecommendedProducts,
  getRecommendationAnalytics,
  getProductRecommendationStats,
} from "../services/recommendationAPI";
import { useAuth } from "../hooks/useAuth";

/**
 * Hook to fetch hybrid product recommendations.
 * It automatically includes the userId if the user is authenticated.
 * @param {object} params - Parameters for recommendations.
 * @param {number} params.productId - The ID of the product.
 * @param {number} [params.limit=10] - The number of recommendations to fetch.
 */
export const useHybridRecommendations = ({ productId, limit = 10 }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = isAuthenticated ? user?.id : undefined;

  return useQuery({
    queryKey: ["recommendations", "hybrid", { productId, userId, limit }],
    queryFn: () => getHybridRecommendations({ productId, userId, limit }),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch top recommended products statistics (Admin).
 * @param {object} params - Parameters for the query.
 * @param {number} [params.limit=10] - The number of top products.
 * @param {number} [params.days] - The time window in days.
 */
export const useTopRecommendedProducts = ({ limit = 10, days } = {}) => {
  return useQuery({
    queryKey: ["recommendations", "stats", "top-products", { limit, days }],
    queryFn: () => getTopRecommendedProducts({ limit, days }),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Hook to fetch recommendation analytics (Admin).
 * @param {object} params - Parameters for the query.
 * @param {number} [params.days] - The time window in days.
 */
export const useRecommendationAnalytics = ({ days } = {}) => {
  return useQuery({
    queryKey: ["recommendations", "stats", "analytics", { days }],
    queryFn: () => getRecommendationAnalytics({ days }),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

/**
 * Hook to fetch product-specific recommendation statistics (Admin).
 * @param {object} params - Parameters for the query.
 * @param {number} [params.limit=10] - The number of products.
 * @param {number} [params.days] - The time window in days.
 */
export const useProductRecommendationStats = ({ limit = 10, days } = {}) => {
  return useQuery({
    queryKey: ["recommendations", "stats", "product-stats", { limit, days }],
    queryFn: () => getProductRecommendationStats({ limit, days }),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};
