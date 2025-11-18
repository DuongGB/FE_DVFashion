import { useQuery, useMutation } from "@tanstack/react-query";
import { statisticAPI } from "../services/statisticAPI";

/**
 * Hook lấy thống kê doanh thu theo khoảng thời gian.
 */
export const useRevenueStatistics = ({
  period = "day",
  startDate,
  endDate,
  year,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: ["statistics", "revenue", { period, startDate, endDate, year }],
    queryFn: async () => {
      if (period === "year") {
        const res = await statisticAPI.getYearlyRevenue({ year });
        const arr = res?.data ?? [];
        return arr.length > 0 ? parseFloat(arr[0].revenue) || 0 : 0;
      }
      return statisticAPI.getRevenueStatistics({ period, startDate, endDate });
    },
    enabled,
    staleTime: 1000 * 60 * 15,
    select: (response) => {
      if (typeof response === "number") return response;
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
    staleTime: 1000 * 60 * 15,
    select: (response) => {
      // console.log("Daily revenue response:", response);
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
    staleTime: 1000 * 60 * 15,
    select: (response) => {
      // console.log("Monthly revenue response:", response);
      // Backend returns: { success: true, data: [{ period: "2025-11", revenue: 841400.00 }] }
      const data = response?.data ?? [];
      return Array.isArray(data) ? data : [];
    },
  });
};

/**
 * Hook lấy thống kê doanh thu theo năm
 */
export const useYearlyRevenue = ({ year, enabled = true } = {}) => {
  return useQuery({
    queryKey: ["statistics", "revenue", "yearly", year],
    queryFn: () => statisticAPI.getYearlyRevenue({ year }),
    enabled,
    staleTime: 1000 * 60 * 15,
    select: (response) => {
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
    staleTime: 1000 * 60 * 15,
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
    staleTime: 1000 * 60 * 15,
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
    staleTime: 1000 * 60 * 15,
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
    staleTime: 1000 * 60 * 15,
    select: (response) => response?.data ?? [],
  });
};

/**
 * Hook lấy toàn bộ chuỗi thời gian doanh thu (time series) cho ML/training
 */
export const useRevenueTimeSeries = ({
  period = "DAILY",
  enabled = true,
} = {}) =>
  useQuery({
    queryKey: ["statistics", "revenue", "timeseries", period],
    queryFn: () => statisticAPI.getRevenueTimeSeries(period),
    enabled,
    select: (response) => response?.data ?? [],
    staleTime: 1000 * 60 * 15,
  });

/**
 * Hook lấy dự báo doanh thu
 */
export const useRevenueForecast = ({ days = 30, enabled = true } = {}) => {
  return useQuery({
    queryKey: ["statistics", "revenue", "forecast", days],
    queryFn: () => statisticAPI.getRevenueForecast(days),
    enabled,
    staleTime: 1000 * 60 * 15,
    select: (response) => response?.data ?? [],
  });
};

/**
 * Hook retrain model dự báo doanh thu
 */
export const useRetrainRevenueForecastModel = () => {
  return useMutation({
    mutationFn: () => statisticAPI.retrainRevenueForecastModel(),
  });
};
