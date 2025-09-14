import api from "./api";

export const inventoryAPI = {
  // Lấy báo cáo tồn kho
  getInventoryReport: (lang = "VI") => {
    return api.get(`/inventories/report?lang=${lang}`);
  },

  // Nhập kho
  importStock: (data, lang = "VI") => {
    return api.post(`/inventories/import/${lang}`, data, {
      headers: { "Content-Type": "application/json" },
    });
  },

  // Xuất kho
  exportStock: (data, lang = "VI") => {
    return api.post(`/inventories/export/${lang}`, data, {
      headers: { "Content-Type": "application/json" },
    });
  },

  // Điều chỉnh kho
  adjustStock: (data, lang = "VI") => {
    return api.post(`/inventories/adjust/${lang}`, data, {
      headers: { "Content-Type": "application/json" },
    });
  },

  // Lấy danh sách tồn kho theo size
  getInventoryBySize: (sizeId, lang = "VI") => {
    return api.get(`/inventories/size/${sizeId}?lang=${lang}`);
  },

  // Lấy số liệu thống kê tồn kho
  getInventoryStats: () => api.get("/inventories/stats"),

  // Lấy số lượng tồn kho thấp
  getLowStockItems: () => api.get(`/inventories/low-stock`),

  // Lấy số lượng hêt hàng
  getOutOfStockItems: () => api.get(`/inventories/out-of-stock`),
};
