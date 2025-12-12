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
  getYearlyRevenue: async ({ year } = {}) => {
    const params = {};
    if (year) params.year = year;
    const response = await api.get("/statistics/revenue/yearly", { params });
    // console.log("Yearly revenue API response:", response.data);
    return response.data;
  },

  /**
   * Lấy top 10 sản phẩm bán chạy nhất
   */
  getTopBestSellingProducts: async (lang = "VI") => {
    const response = await api.get("/statistics/products/best-selling", {
      params: { lang },
    });
    return response.data;
  },

  /**
   * Lấy top sản phẩm tồn kho cao nhất
   */
  getTopStockProducts: async (limit = 10, lang = "VI") => {
    const response = await api.get("/statistics/stock-products/top-stock", {
      params: { limit, lang },
    });
    return response.data;
  },

  /**
   * Lấy top sản phẩm tồn kho thấp nhất
   */
  getLowStockItems: async (limit = 10, lang = "VI") => {
    const response = await api.get("/statistics/stock-products/low-stock", {
      params: { limit, lang },
    });
    return response.data;
  },

  /**
   * Lấy top khuyến mãi doanh thu cao nhất
   */
  getTopPromotionsByRevenue: async (limit = 10, lang = "VI") => {
    const response = await api.get("/statistics/promotions/top-revenue", {
      params: { limit, lang },
    });
    return response.data;
  },
  /**
   * Lấy toàn bộ chuỗi thời gian doanh thu (time series) cho ML/training
   */
  getRevenueTimeSeries: async (period = "DAILY") => {
    const response = await api.get("/internal/revenue-timeseries", {
      params: { period },
    });
    return response.data;
  },

  /**
   * Lấy dự báo doanh thu
   */
  getRevenueForecast: async (days = 30) => {
    const response = await api.get("/statistics/revenue/forecast", {
      params: { days },
    });
    return response.data;
  },

  /**
   * Gửi yêu cầu retrain model dự báo doanh thu
   */
  retrainRevenueForecastModel: async () => {
    const response = await api.post("/statistics/revenue/forecast/retrain");
    return response.data;
  },
};
