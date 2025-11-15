import { useCallback } from "react";
import { reportAPI } from "../services/reportAPI";

// mode: "day" | "month" | "quarter" | "year"
export const useExportRevenueReport = () => {
  const exportReport = useCallback(
    async ({ mode, year, startDate, endDate, yearlyData }) => {
      let periodType = "DAILY";
      let start = startDate;
      let end = endDate;

      if (mode === "month") {
        periodType = "MONTHLY";
        start = `${year}-01-01`;
        end = `${year}-12-31`;
      } else if (mode === "quarter") {
        periodType = "QUARTERLY";
        // Nếu có nhiều năm, lấy min/max từ dữ liệu hoặc mặc định 1 năm
        const years = (yearlyData ?? []).map((x) => Number(x.period));
        const minYear = years.length ? Math.min(...years) : year;
        const maxYear = years.length ? Math.max(...years) : year;
        start = `${minYear}-01-01`;
        end = `${maxYear}-12-31`;
      } else if (mode === "year") {
        periodType = "YEARLY";
        const years = (yearlyData ?? []).map((x) => Number(x.period));
        const minYear = years.length ? Math.min(...years) : year;
        const maxYear = years.length ? Math.max(...years) : year;
        start = `${minYear}-01-01`;
        end = `${maxYear}-12-31`;
      }

      const res = await reportAPI.exportRevenueReport({
        periodType,
        startDate: start,
        endDate: end,
      });

      // Lấy tên file từ header hoặc mặc định
      let filename = "BaoCaoDoanhThu.xlsx";
      const disposition =
        res.headers["content-disposition"] ||
        res.headers.get?.("content-disposition");
      if (disposition && disposition.includes("filename=")) {
        filename = decodeURIComponent(
          disposition.split("filename=")[1].replace(/['"]/g, "")
        );
      }
      return { blob: res.data, filename };
    },
    []
  );

  return exportReport;
};
