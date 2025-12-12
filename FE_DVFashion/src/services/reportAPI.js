import api from "./api";
import { useQuery } from "@tanstack/react-query";

export const reportAPI = {
  exportRevenueReport: async ({
    periodType,
    startDate,
    endDate,
    onProgress,
  }) => {
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
      const response = await api.get(
        `/reports/revenue/export/excel?periodType=${periodType}&startDate=${startDate}&endDate=${endDate}`,
        {
          responseType: "blob",
          headers: { Accept: "application/octet-stream" },
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
        }
      );

      if (progressInterval) clearInterval(progressInterval);
      if (onProgress) onProgress(100);

      return response;
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      throw error;
    }
  },
};

export function useRevenue({ periodType, startDate, endDate, enabled = true }) {
  return useQuery({
    queryKey: ["revenueReport", periodType, startDate, endDate],
    enabled,
    queryFn: async () => {
      const res = await api.get(
        `/reports/revenue?periodType=${periodType}&startDate=${startDate}&endDate=${endDate}`,
        { timeout: 60000 }
      );
      return res.data?.data ?? null;
    },
  });
}
