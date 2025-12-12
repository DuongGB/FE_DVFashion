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
 * Tự động bao gồm userId nếu user đã đăng nhập.
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
    staleTime: 30 * 60 * 1000, // 30 phút - gợi ý hybrid ít thay đổi
    gcTime: 60 * 60 * 1000, // 1 giờ
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => {
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
export const useTopRecommendedProducts = ({ limit = 10, days, lang } = {}) => {
  return useQuery({
    queryKey: [
      "recommendations",
      "stats",
      "top-products",
      { limit, days, lang },
    ],
    queryFn: () => getTopRecommendedProducts({ limit, days, lang }),
    staleTime: 15 * 60 * 1000, // 15 phút
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
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
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
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
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    select: (data) => data?.data ?? data ?? [],
  });
};

/**
 * Gợi ý hôm nay cho user - data thay đổi trong ngày
 */
export const useTodayRecommendations = (
  userId,
  limit = 10,
  lang = "VI",
  options = {}
) =>
  useQuery({
    queryKey: ["todayRecommendations", userId, limit, lang],
    queryFn: () => getTodayRecommendations({ userId, limit, lang }),
    staleTime: 5 * 60 * 1000, // 5 phút - data thay đổi trong ngày
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });
/**
 * Sản phẩm đã xem hôm nay - data thay đổi thường xuyên
 */
export const useTodayViewedProducts = (limit = 20, lang = "VI", options = {}) =>
  useQuery({
    queryKey: ["todayViewedProducts", limit, lang],
    queryFn: () => getTodayViewedProducts({ limit, lang }),
    staleTime: 2 * 60 * 1000, // 2 phút - data thay đổi khi user xem sản phẩm
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });
