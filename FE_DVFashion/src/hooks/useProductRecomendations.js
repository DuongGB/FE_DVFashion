import { useQuery } from "@tanstack/react-query";
import {
  getHybridRecommendations,
  getTopRecommendedProducts,
  getRecommendationAnalytics,
  getProductRecommendationStats,
  getTodayRecommendations,
  getTodayViewedProducts,
} from "../services/recommendationAPI";
import { useAuth } from "../hooks/useAuth";

/**
 * Hook lấy sản phẩm gợi ý dựa trên hybrid recommendation.
 * It automatically includes the userId if the user is authenticated.
 * @param {object} params - Parameters for recommendations.
 * @param {number} [params.productId] - The ID of the product (optional for homepage).
 * @param {number} [params.limit=10] - The number of recommendations to fetch.
 */
export const useHybridRecommendations = ({
  productId = null,
  limit = 10,
  enabled = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const userId = isAuthenticated ? user?.id : null;

  return useQuery({
    queryKey: ["recommendations", "hybrid", { productId, userId, limit }],
    queryFn: () => getHybridRecommendations({ productId, userId, limit }),
    enabled: enabled,
    staleTime: 1000 * 60 * 15,
    // Normalize response data
    select: (data) => {
      // Dữ liệu returns ApiResponse<List<ProductResponse>>
      return data?.data ?? data ?? [];
    },
  });
};

/**
 * Hook lấy top sản phẩm được gợi ý nhiều nhất (Admin).
 * @param {object} params - Parameters for the query.
 * @param {number} [params.limit=10] - Số lượng sản phẩm.
 * @param {number} [params.days] - Thời gian trong quá khứ tính toán.
 */
export const useTopRecommendedProducts = ({ limit = 10, days } = {}) => {
  return useQuery({
    queryKey: ["recommendations", "stats", "top-products", { limit, days }],
    queryFn: () => getTopRecommendedProducts({ limit, days }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    select: (data) => data?.data ?? data ?? [],
  });
};

/**
 * Hook lấy phân tích về hệ thống gợi ý sản phẩm (Admin).
 * @param {object} params - Parameters for the query.
 * @param {number} [params.days] - Thời gian trong quá khứ tính toán.
 */
export const useRecommendationAnalytics = ({ days } = {}) => {
  return useQuery({
    queryKey: ["recommendations", "stats", "analytics", { days }],
    queryFn: () => getRecommendationAnalytics({ days }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    select: (data) => data?.data ?? data ?? null,
  });
};

/**
 * Hook lấy thống kê gợi ý sản phẩm cụ thể (Admin).
 * @param {object} params - Parameters for the query.
 * @param {number} [params.limit=10] - The number of products.
 * @param {number} [params.days] - The time window in days.
 */
export const useProductRecommendationStats = ({ limit = 10, days } = {}) => {
  return useQuery({
    queryKey: ["recommendations", "stats", "product-stats", { limit, days }],
    queryFn: () => getProductRecommendationStats({ limit, days }),
    staleTime: 1000 * 60 * 15, // 15 minutes
    select: (data) => data?.data ?? data ?? [],
  });
};

export const useTodayRecommendations = (userId, limit = 10) =>
  useQuery({
    queryKey: ["todayRecommendations", userId, limit],
    queryFn: () => getTodayRecommendations({ userId, limit }),
    staleTime: 1000 * 60,
  });

export const useTodayViewedProducts = (limit = 20) =>
  useQuery({
    queryKey: ["todayViewedProducts", limit],
    queryFn: () => getTodayViewedProducts({ limit }),
    staleTime: 1000 * 60,
  });
