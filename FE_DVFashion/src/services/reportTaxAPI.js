import api from "./api";

export const reportTaxAPI = {
  exportVATForm011: async ({ startDate, endDate, onProgress }) => {
    // Simulate progress khi không có total
    let progressInterval;
    let simulatedProgress = 0;

    if (onProgress) {
      progressInterval = setInterval(() => {
        if (simulatedProgress < 90) {
          simulatedProgress += Math.random() * 15;
          if (simulatedProgress > 90) simulatedProgress = 90;
          onProgress(Math.round(simulatedProgress));
        }
      }, 500);
    }

    try {
      const response = await api.get("/tax-reports/vat-form011/export/excel", {
        params: { startDate, endDate },
        responseType: "blob",
        timeout: 120000,
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            // Nếu có total, dùng progress thật
            clearInterval(progressInterval);
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      // Hoàn thành
      if (progressInterval) clearInterval(progressInterval);
      if (onProgress) onProgress(100);

      const disposition = response.headers["content-disposition"];
      let filename = "BangKeHoaDonBanRa_01-1-GTGT.xlsx";
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = decodeURIComponent(match[1]);
      }
      return { blob: response.data, filename };
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      throw error;
    }
  },

  exportVATForm04: async ({ startDate, endDate, onProgress }) => {
    let progressInterval;
    let simulatedProgress = 0;

    if (onProgress) {
      progressInterval = setInterval(() => {
        if (simulatedProgress < 90) {
          simulatedProgress += Math.random() * 15;
          if (simulatedProgress > 90) simulatedProgress = 90;
          onProgress(Math.round(simulatedProgress));
        }
      }, 500);
    }

    try {
      const response = await api.get("/tax-reports/vat-form04/export/excel", {
        params: { startDate, endDate },
        responseType: "blob",
        timeout: 120000,
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            clearInterval(progressInterval);
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      if (progressInterval) clearInterval(progressInterval);
      if (onProgress) onProgress(100);

      const disposition = response.headers["content-disposition"];
      let filename = "ToKhaiThue_04_GTGT.xlsx";
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = decodeURIComponent(match[1]);
      }
      return { blob: response.data, filename };
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      throw error;
    }
  },

  exportVATForm014A: async ({ startDate, endDate, onProgress }) => {
    let progressInterval;
    let simulatedProgress = 0;

    if (onProgress) {
      progressInterval = setInterval(() => {
        if (simulatedProgress < 90) {
          simulatedProgress += Math.random() * 15;
          if (simulatedProgress > 90) simulatedProgress = 90;
          onProgress(Math.round(simulatedProgress));
        }
      }, 500);
    }

    try {
      const response = await api.get("/tax-reports/vat-form014a/export/excel", {
        params: { startDate, endDate },
        responseType: "blob",
        timeout: 120000,
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            clearInterval(progressInterval);
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      if (progressInterval) clearInterval(progressInterval);
      if (onProgress) onProgress(100);

      const disposition = response.headers["content-disposition"];
      let filename = "BangPhanBoSoThue_01-4A_GTGT.xlsx";
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = decodeURIComponent(match[1]);
      }
      return { blob: response.data, filename };
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      throw error;
    }
  },
};
