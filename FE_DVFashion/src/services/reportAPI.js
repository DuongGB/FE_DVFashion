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

export function useQuarterlyRevenue({ startYear, endYear, enabled }) {
  return useQuery({
    queryKey: ["quarterlyRevenue", startYear, endYear],
    enabled,
    queryFn: async () => {
      const res = await api.get(
        `/reports/revenue?periodType=QUARTERLY&startDate=${startYear}-01-01&endDate=${endYear}-12-31`
      );
      return res.data?.data ?? [];
    },
  });
}
