import api from "./api";
import { useQuery } from "@tanstack/react-query";

// Gọi API export báo cáo doanh thu ra Excel
export const reportAPI = {
  exportRevenueReport: ({ periodType, startDate, endDate }) => {
    return api.get(
      `/reports/revenue/export/excel?periodType=${periodType}&startDate=${startDate}&endDate=${endDate}`,
      {
        responseType: "blob",
        headers: { Accept: "application/octet-stream" },
      }
    );
  },
};

export function useRevenue({
  periodType, // DAILY | MONTHLY | QUARTERLY | YEARLY
  startDate, // yyyy-MM-dd
  endDate, // yyyy-MM-dd
  enabled = true,
}) {
  return useQuery({
    queryKey: ["revenueReport", periodType, startDate, endDate],
    enabled,
    queryFn: async () => {
      const res = await api.get(
        `/reports/revenue?periodType=${periodType}&startDate=${startDate}&endDate=${endDate}`
      );
      return res.data?.data ?? null;
    },
  });
}
