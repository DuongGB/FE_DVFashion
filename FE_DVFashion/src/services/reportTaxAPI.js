import api from "./api";

export const reportTaxAPI = {
  exportVATForm011: async ({ startDate, endDate }) => {
    const response = await api.get("/tax-reports/vat-form011/export/excel", {
      params: { startDate, endDate },
      responseType: "blob",
    });
    // Lấy tên file từ header nếu có
    const disposition = response.headers["content-disposition"];
    let filename = "BangKeHoaDonBanRa_01-1-GTGT.xlsx";
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) filename = decodeURIComponent(match[1]);
    }
    return { blob: response.data, filename };
  },
  exportVATForm04: async ({ startDate, endDate }) => {
    const response = await api.get("/tax-reports/vat-form04/export/excel", {
      params: { startDate, endDate },
      responseType: "blob",
    });
    const disposition = response.headers["content-disposition"];
    let filename = "ToKhaiThue_04_GTGT.xlsx";
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) filename = decodeURIComponent(match[1]);
    }
    return { blob: response.data, filename };
  },
  exportVATForm014A: async ({ startDate, endDate }) => {
    const response = await api.get("/tax-reports/vat-form014a/export/excel", {
      params: { startDate, endDate },
      responseType: "blob",
    });
    const disposition = response.headers["content-disposition"];
    let filename = "BangPhanBoSoThue_01-4A_GTGT.xlsx";
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) filename = decodeURIComponent(match[1]);
    }
    return { blob: response.data, filename };
  },
};
