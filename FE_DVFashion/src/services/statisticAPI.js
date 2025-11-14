import api from "./api";

export const statisticAPI = {
  /**
   * Lấy thống kê doanh thu theo khoảng thời gian và chu kỳ
   */
  getRevenueStatistics: async ({ period = "day", startDate, endDate } = {}) => {
    const params = { period };

    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get("/statistics/revenue", { params });
    // console.log("Revenue API response:", response.data);
    return response.data;
  },

  /**
   * Lấy doanh thu theo ngày trong một khoảng thời gian
   */
  getDailyRevenue: async ({ startDate, endDate }) => {
    const today = new Date().toISOString().split("T")[0];

    const params = {
      startDate: startDate ?? today,
      endDate: endDate ?? today,
    };

    const response = await api.get("/statistics/revenue/daily", { params });
    // console.log("Daily revenue API response:", response.data);
    return response.data;
  },

  /**
   * Lấy doanh thu theo tháng trong một năm
   */
  getMonthlyRevenue: async ({ year } = {}) => {
    const params = {};
    if (year) params.year = year;

    const response = await api.get("/statistics/revenue/monthly", { params });
    // console.log("Monthly revenue API response:", response.data);
    return response.data;
  },

  /**
   * Lấy doanh thu theo năm
   */
  getYearlyRevenue: async () => {
    const response = await api.get("/statistics/revenue/yearly");
    // console.log("Yearly revenue API response:", response.data);
    return response.data;
  },

  /**
   * Lấy top 10 sản phẩm bán chạy nhất
   */
  getTopBestSellingProducts: async () => {
    const response = await api.get("/statistics/products/best-selling");
    return response.data;
  },

  /**
   * Lấy top sản phẩm tồn kho cao nhất
   */
  getTopStockProducts: async (limit = 10) => {
    const response = await api.get("/statistics/stock-products/top-stock", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Lấy top sản phẩm tồn kho thấp nhất
   */
  getLowStockItems: async (limit = 10) => {
    const response = await api.get("/statistics/stock-products/low-stock", {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Lấy top khuyến mãi doanh thu cao nhất
   */
  getTopPromotionsByRevenue: async (limit = 10) => {
    const response = await api.get("/statistics/promotions/top-revenue", {
      params: { limit },
    });
    return response.data;
  },
};
