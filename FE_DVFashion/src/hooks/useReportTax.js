import { reportTaxAPI } from "../services/reportTaxAPI";

export function useExportTaxReport() {
  // Hàm retry với exponential backoff
  const exportWithRetry = async (exportFn, params, maxRetries = 2) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Export] Attempt ${attempt + 1}/${maxRetries + 1}`);
        return await exportFn(params);
      } catch (error) {
        lastError = error;

        // Kiểm tra nếu là timeout hoặc server error
        const isTimeout =
          error.code === "ECONNABORTED" || error.message?.includes("timeout");
        const isServerError = error.response?.status >= 500;

        console.error(`[Export] Attempt ${attempt + 1} failed:`, {
          isTimeout,
          isServerError,
          status: error.response?.status,
          message: error.message,
        });

        // Nếu chưa hết retry và là lỗi có thể retry
        if (attempt < maxRetries && (isTimeout || isServerError)) {
          const waitTime = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
          console.log(`[Export] Retrying after ${waitTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // Throw error với message rõ ràng hơn
        if (isTimeout) {
          throw new Error(
            "Thời gian xuất báo cáo quá lâu. Vui lòng thử lại hoặc giảm khoảng thời gian báo cáo."
          );
        }

        throw error;
      }
    }

    throw lastError;
  };

  const exportVATForm011 = async ({ startDate, endDate, onProgress }) => {
    return await exportWithRetry(reportTaxAPI.exportVATForm011, {
      startDate,
      endDate,
      onProgress,
    });
  };

  const exportVATForm04 = async ({ startDate, endDate, onProgress }) => {
    return await exportWithRetry(reportTaxAPI.exportVATForm04, {
      startDate,
      endDate,
      onProgress,
    });
  };

  const exportVATForm014A = async ({ startDate, endDate, onProgress }) => {
    return await exportWithRetry(reportTaxAPI.exportVATForm014A, {
      startDate,
      endDate,
      onProgress,
    });
  };

  return { exportVATForm011, exportVATForm04, exportVATForm014A };
}
