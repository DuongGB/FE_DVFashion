import { useQuery } from "@tanstack/react-query";
import { statisticAPI } from "../services/statisticAPI";

/**
 * Hook lấy thống kê doanh thu theo khoảng thời gian.
 */
export const useRevenueStatistics = ({
  period = "day",
  startDate,
  endDate,
} = {}) => {
  return useQuery({
    queryKey: ["statistics", "revenue", { period, startDate, endDate }],
    queryFn: () =>
      statisticAPI.getRevenueStatistics({ period, startDate, endDate }),
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      console.log("Revenue response:", response);
      // Backend returns: { success: true, data: 841400.00, message: "..." }
      return parseFloat(response?.data ?? 0) || 0;
    },
  });
};

/**
 * Hook lấy thống kê doanh thu theo ngày trong một khoảng thời gian.
 */
export const useDailyRevenue = ({
  startDate,
  endDate,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ["statistics", "revenue", "daily", { startDate, endDate }],
    queryFn: () => statisticAPI.getDailyRevenue({ startDate, endDate }),
    enabled,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      console.log("Daily revenue response:", response);
      // Backend returns: { success: true, data: [{period, revenue}] }
      const data = response?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
  });
};

/**
 * Hook lấy thống kê doanh thu theo tháng trong một năm
 */
export const useMonthlyRevenue = ({ year, enabled = true } = {}) => {
  return useQuery({
    queryKey: ["statistics", "revenue", "monthly", { year }],
    queryFn: () => statisticAPI.getMonthlyRevenue({ year }),
    enabled: enabled,
    staleTime: 1000 * 60 * 10,
    select: (response) => {
      console.log("Monthly revenue response:", response);
      // Backend returns: { success: true, data: [{ period: "2025-11", revenue: 841400.00 }] }
      const data = response?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
  });
};

/**
 * Hook lấy thống kê doanh thu theo năm
 */
export const useYearlyRevenue = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ["statistics", "revenue", "yearly"],
    queryFn: () => statisticAPI.getYearlyRevenue(),
    enabled: enabled,
    staleTime: 1000 * 60 * 15,
    select: (response) => {
      console.log("Yearly revenue response:", response);
      // Backend returns: { success: true, data: [{ period: "2025", revenue: 841400.00 }] }
      const data = response?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
  });
};

/**
 * Hook lấy top 10 sản phẩm bán chạy nhất
 */
export const useTopBestSellingProducts = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ["statistics", "products", "best-selling"],
    queryFn: () => statisticAPI.getTopBestSellingProducts(),
    enabled,
    staleTime: 1000 * 60 * 10,
    select: (response) => response?.data ?? [],
  });
};

/**
 * Hook lấy top sản phẩm tồn kho cao nhất
 */
export const useTopStockProducts = ({ limit = 10, enabled = true } = {}) => {
  return useQuery({
    queryKey: ["statistics", "stock-products", "top-stock", limit],
    queryFn: () => statisticAPI.getTopStockProducts(limit),
    enabled,
    staleTime: 1000 * 60 * 10,
    select: (response) => response?.data ?? [],
  });
};

/**
 * Hook lấy top sản phẩm tồn kho thấp nhất
 */
export const useLowStockItems = ({ limit = 10, enabled = true } = {}) => {
  return useQuery({
    queryKey: ["statistics", "stock-products", "low-stock", limit],
    queryFn: () => statisticAPI.getLowStockItems(limit),
    enabled,
    staleTime: 1000 * 60 * 10,
    select: (response) => response?.data ?? [],
  });
};

/**
 * Hook lấy top khuyến mãi doanh thu cao nhất
 */
export const useTopPromotionsByRevenue = ({
  limit = 10,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ["statistics", "promotions", "top-revenue", limit],
    queryFn: () => statisticAPI.getTopPromotionsByRevenue(limit),
    enabled,
    staleTime: 1000 * 60 * 10,
    select: (response) => response?.data ?? [],
  });
};
