import {
  IconCalendar,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconDownload,
  IconRefresh,
  IconTrendingUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Chart } from "react-google-charts";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useExportRevenueReport } from "../../hooks/useReport";
import { useExportTaxReport } from "../../hooks/useReportTax";
import { useRevenueForecast } from "../../hooks/useStatistics";
import { useRevenue } from "../../services/reportAPI";
import { Icon } from "leaflet";

const vnd = (n) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(Number(n || 0))) + " ₫";

export default function StatisticsPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("month");
  const [year, setYear] = useState(2025);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  //  state cho số ngày dự báo
  const [forecastDays, setForecastDays] = useState(10);

  // State cho dropdown và loading - Tách riêng cho từng loại
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showQuarterDropdown, setShowQuarterDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [isExportingTax, setIsExportingTax] = useState(false);
  const [exportingTaxType, setExportingTaxType] = useState("");
  const [exportProgress, setExportProgress] = useState(0);

  // Sử dụng useRevenue thay vì các hook cũ
  const daily = useRevenue({
    periodType: "DAILY",
    startDate,
    endDate,
    enabled: mode === "day",
  });

  const monthly = useRevenue({
    periodType: "MONTHLY",
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    enabled: mode === "month",
  });

  const quarterly = useRevenue({
    periodType: "QUARTERLY",
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    enabled: mode === "quarter",
  });

  const yearly = useRevenue({
    periodType: "YEARLY",
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    enabled: mode === "year",
  });

  const { exportVATForm011, exportVATForm04, exportVATForm014A } =
    useExportTaxReport();

  const exportReport = useExportRevenueReport();

  // Định nghĩa các quý
  const quarters = [
    {
      label: "Quý 1 (Q1)",
      value: "Q1",
      startDate: `${year}-01-01`,
      endDate: `${year}-03-31`,
    },
    {
      label: "Quý 2 (Q2)",
      value: "Q2",
      startDate: `${year}-04-01`,
      endDate: `${year}-06-30`,
    },
    {
      label: "Quý 3 (Q3)",
      value: "Q3",
      startDate: `${year}-07-01`,
      endDate: `${year}-09-30`,
    },
    {
      label: "Quý 4 (Q4)",
      value: "Q4",
      startDate: `${year}-10-01`,
      endDate: `${year}-12-31`,
    },
  ];

  // Định nghĩa các tháng
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthStr = month.toString().padStart(2, "0");
    const lastDay = new Date(year, month, 0).getDate();
    return {
      label: `T ${month}`,
      value: `M${month}`,
      startDate: `${year}-${monthStr}-01`,
      endDate: `${year}-${monthStr}-${lastDay}`,
    };
  });

  // Hàm đóng tất cả dropdown
  const closeAllDropdowns = () => {
    setShowMonthDropdown(false);
    setShowQuarterDropdown(false);
    setShowYearDropdown(false);
  };

  // Hàm dùng chung để tải file
  const handleExportTax = async (type, period) => {
    setIsExportingTax(true);
    setExportingTaxType(`${type}-${period.value}`);
    setExportProgress(0); // Reset progress
    closeAllDropdowns();

    try {
      let res;
      const params = {
        startDate: period.startDate,
        endDate: period.endDate,
        onProgress: (percent) => setExportProgress(percent),
      };
      if (type === "011") res = await exportVATForm011(params);
      if (type === "04") res = await exportVATForm04(params);
      if (type === "014A") res = await exportVATForm014A(params);

      const url = window.URL.createObjectURL(res.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 100);
      toast.success(`Xuất báo cáo ${type} ${period.label} thành công!`);
    } catch (e) {
      toast.error(
        e.message ||
          t("admin.statistics.export.error") ||
          "Xuất báo cáo thất bại!"
      );
      console.error(e);
    } finally {
      setIsExportingTax(false);
      setExportingTaxType("");
      setExportProgress(0);
    }
  };

  // Hàm xuất báo cáo thuế theo năm
  const handleExportTaxYear = async (type) => {
    setIsExportingTax(true);
    setExportingTaxType(`${type}-year`);
    setExportProgress(0);
    closeAllDropdowns();

    try {
      let res;
      const params = {
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        onProgress: (percent) => setExportProgress(percent),
      };
      if (type === "011") res = await exportVATForm011(params);
      if (type === "04") res = await exportVATForm04(params);
      if (type === "014A") res = await exportVATForm014A(params);

      const url = window.URL.createObjectURL(res.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 100);
      toast.success(`Xuất báo cáo ${type} năm ${year} thành công!`);
    } catch (e) {
      toast.error(
        e.message ||
          t("admin.statistics.export.error") ||
          "Xuất báo cáo thất bại!"
      );
      console.error(e);
    } finally {
      setIsExportingTax(false);
      setExportingTaxType("");
      setExportProgress(0);
    }
  };

  // Hàm xử lý xuất báo cáo
  const handleExportReport = async () => {
    setExportProgress(0);
    try {
      const yearlyData =
        mode === "quarter" || mode === "year" ? yearly.data : undefined;
      const { blob, filename } = await exportReport({
        mode,
        year,
        startDate,
        endDate,
        yearlyData,
        onProgress: (percent) => setExportProgress(percent),
      });

      // Tạo link download file
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || "BaoCaoDoanhThu.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Xuất báo cáo thành công!");
    } catch (err) {
      toast.error(
        err.message ||
          t("admin.statistics.export.error") ||
          "Xuất báo cáo thất bại!"
      );
      console.error(err);
    } finally {
      setExportProgress(0);
    }
  };

  // Hook lấy dự báo doanh thu
  const forecast = useRevenueForecast({ days: forecastDays, enabled: true });

  // Chuẩn bị dữ liệu cho biểu đồ dự báo
  const forecastChartData = useMemo(() => {
    const header = [
      t("admin.statistics.forecast.date"),
      t("admin.statistics.forecast.revenue"),
    ];
    const rows = Array.isArray(forecast.data)
      ? forecast.data.map((x) => [x.period, x.revenue])
      : [];
    return [header, ...rows];
  }, [forecast.data, t]);

  const chartData = useMemo(() => {
    const header = [
      t("admin.statistics.chart.time"),
      t("admin.statistics.chart.revenue"),
      { type: "string", role: "tooltip" },
    ];
    if (mode === "day") {
      const details = daily.data?.details ?? [];
      const rows = Array.isArray(details)
        ? details.map((x) => [
            x.period,
            x.totalRevenue,
            `${x.period}: ${vnd(x.totalRevenue)}`,
          ])
        : [];
      return [header, ...rows];
    }
    if (mode === "month") {
      const details = monthly.data?.details ?? [];
      const rows = Array.isArray(details)
        ? details.map((x) => [
            `T${x.period.split("/")[0]}`,
            x.totalRevenue,
            `${x.period}: ${vnd(x.totalRevenue)}`,
          ])
        : [];
      return [header, ...rows];
    }
    if (mode === "quarter") {
      const details = quarterly.data?.details ?? [];
      const rows = Array.isArray(details)
        ? details.map((x) => [
            x.period,
            x.totalRevenue,
            `${x.period}: ${vnd(x.totalRevenue)}`,
          ])
        : [];
      return [header, ...rows];
    }
    const details = yearly.data?.details ?? [];
    const rows = Array.isArray(details)
      ? details.map((x) => [
          x.period,
          x.totalRevenue,
          `${x.period}: ${vnd(x.totalRevenue)}`,
        ])
      : [];
    return [header, ...rows];
  }, [mode, daily.data, monthly.data, quarterly.data, yearly.data, t]);

  const columnOptions = useMemo(
    () => ({
      title:
        mode === "day"
          ? t("admin.statistics.chart.title_daily") || "Doanh thu theo ngày"
          : mode === "month"
          ? `${
              t("admin.statistics.chart.title_monthly") ||
              "Doanh thu theo tháng"
            } (${year})`
          : mode === "quarter"
          ? `${
              t("admin.statistics.chart.title_quarterly") ||
              "Doanh thu theo quý"
            } (${year})`
          : t("admin.statistics.chart.title_yearly") || "Doanh thu theo năm",
      titleTextStyle: {
        color: "#374151",
        fontSize: 18,
        fontName: "system-ui, -apple-system, sans-serif",
        bold: true,
      },
      backgroundColor: "transparent",
      legend: "none",
      chartArea: { left: 80, top: 80, right: 20, bottom: 60 },
      bar: { groupWidth: "70%" },
      hAxis: {
        title: t("admin.statistics.chart.time_axis") || "Thời gian",
        titleTextStyle: { color: "#6B7280", fontSize: 12 },
        textStyle: { color: "#6B7280", fontSize: 11 },
        gridlines: { color: "#F3F4F6" },
      },
      vAxis: {
        title: t("admin.statistics.chart.revenue_axis") || "Doanh thu (₫)",
        titleTextStyle: { color: "#3B82F6", fontSize: 12 },
        textStyle: { color: "#6B7280", fontSize: 11 },
        format: "#,###",
        gridlines: { color: "#F3F4F6" },
      },
      colors: ["#3B82F6"],
    }),
    [mode, year, t]
  );

  function formatDateDMY(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  const sortedQuarters = useMemo(() => {
    const details = quarterly.data?.details ?? [];
    const data = Array.isArray(details) ? details : [];
    return [...data]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [quarterly.data]);

  const sortedMonths = useMemo(() => {
    const details = monthly.data?.details ?? [];
    const data = Array.isArray(details) ? details : [];
    return [...data]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }, [monthly.data]);

  // Tính tổng doanh thu dựa trên chế độ hiện tại - sử dụng totalRevenue từ API
  const totalRevenue = useMemo(() => {
    if (mode === "day") {
      return daily.data?.totalRevenue ?? 0;
    }
    if (mode === "month") {
      return monthly.data?.totalRevenue ?? 0;
    }
    if (mode === "quarter") {
      return quarterly.data?.totalRevenue ?? 0;
    }
    if (mode === "year") {
      return yearly.data?.totalRevenue ?? 0;
    }
    return 0;
  }, [mode, daily.data, monthly.data, quarterly.data, yearly.data]);

  const pieData = useMemo(() => {
    const header = [
      t("admin.statistics.pie.month") || "Tháng",
      t("admin.statistics.pie.revenue") || "Doanh thu",
    ];
    const details = monthly.data?.details ?? [];
    const rows = Array.isArray(details)
      ? details.map((x) => [`T${x.period.split("/")[0]}`, x.totalRevenue])
      : [];
    return [header, ...rows];
  }, [monthly.data, t]);

  const pieOptions = useMemo(
    () => ({
      title: t("admin.statistics.pie.title") || "Phân bổ doanh thu theo tháng",
      titleTextStyle: {
        color: "#374151",
        fontSize: 16,
        fontName: "system-ui, -apple-system, sans-serif",
        bold: true,
      },
      backgroundColor: "transparent",
      pieHole: 0.5,
      chartArea: { width: "90%", height: "80%" },
      legend: {
        position: "right",
        textStyle: { color: "#6B7280", fontSize: 11 },
      },
      pieSliceText: "percentage",
      colors: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#EC4899",
        "#14B8A6",
        "#F97316",
        "#06B6D4",
        "#84CC16",
        "#6366F1",
        "#F43F5E",
      ],
      tooltip: { textStyle: { fontSize: 12 } },
    }),
    [t]
  );

  const loadingChart =
    (mode === "day" && daily.isLoading) ||
    (mode === "month" && monthly.isLoading) ||
    (mode === "quarter" && quarterly.isLoading) ||
    (mode === "year" && yearly.isLoading);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-2 gap-4">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-800">
            {t("admin.statistics.title") || "Thống kê doanh thu"}
          </h1>
          {/* Nút xuất báo cáo */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {/* Nút xuất báo cáo doanh thu */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer shadow-md w-full justify-center"
                title={t("admin.statistics.export")}
              >
                <IconDownload size={16} />
                <span className="whitespace-nowrap text-sm">
                  {t("admin.statistics.export")}
                </span>
              </button>
            </div>

            {/* Nút Xuất báo cáo thuế theo Tháng */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowQuarterDropdown(false);
                  setShowYearDropdown(false);
                }}
                disabled={isExportingTax}
                className={`flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer shadow-md w-full justify-center ${
                  isExportingTax ? "opacity-70 cursor-not-allowed" : ""
                }`}
                title="Xuất thuế theo tháng"
              >
                {isExportingTax && exportingTaxType.includes("M") ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <svg className="animate-spin" viewBox="0 0 50 50">
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          className="opacity-25"
                        />
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray="125.6"
                          strokeDashoffset={
                            125.6 - (125.6 * exportProgress) / 100
                          }
                          className="transition-all duration-300"
                          style={{
                            transformOrigin: "50% 50%",
                            transform: "rotate(-90deg)",
                          }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {exportProgress}%
                      </span>
                    </div>
                    <span className="whitespace-nowrap text-sm">
                      {t("admin.statistics.export_tax.exporting")}{" "}
                      {exportProgress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <IconDownload size={16} />
                    <span className="whitespace-nowrap text-sm">
                      {t("admin.statistics.export_tax.month")}
                    </span>
                    <IconChevronDown size={14} />
                  </>
                )}
              </button>

              {/* Dropdown Tháng */}
              {showMonthDropdown && !isExportingTax && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-bold text-gray-700 px-3 py-2 bg-green-50 rounded sticky top-0">
                      <IconCalendar size={12} className="inline mr-1" />
                      {t("admin.statistics.export_tax.select_month")}
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {months.map((month) => (
                        <div key={month.value} className="mb-1">
                          <div className="text-xs font-medium text-gray-600 px-2 py-1">
                            {month.label}
                          </div>
                          <div className="space-y-1 ml-1">
                            <button
                              onClick={() => handleExportTax("011", month)}
                              className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                            >
                              <IconDownload size={12} />
                              <span>01-1/GTGT</span>
                            </button>
                            <button
                              onClick={() => handleExportTax("014A", month)}
                              className="w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                            >
                              <IconDownload size={12} />
                              <span>01-4A/GTGT</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nút Xuất báo cáo thuế theo Quý */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => {
                  setShowQuarterDropdown(!showQuarterDropdown);
                  setShowMonthDropdown(false);
                  setShowYearDropdown(false);
                }}
                disabled={isExportingTax}
                className={`flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-md w-full justify-center ${
                  isExportingTax ? "opacity-70 cursor-not-allowed" : ""
                }`}
                title="Xuất thuế theo quý"
              >
                {isExportingTax && exportingTaxType.includes("Q") ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <svg className="animate-spin" viewBox="0 0 50 50">
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          className="opacity-25"
                        />
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray="125.6"
                          strokeDashoffset={
                            125.6 - (125.6 * exportProgress) / 100
                          }
                          className="transition-all duration-300"
                          style={{
                            transformOrigin: "50% 50%",
                            transform: "rotate(-90deg)",
                          }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {exportProgress}%
                      </span>
                    </div>
                    <span className="whitespace-nowrap text-sm">
                      Đang xuất... {exportProgress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <IconDownload size={16} />
                    <span className="whitespace-nowrap text-sm">
                      {t("admin.statistics.export_tax.quarter")}
                    </span>
                    <IconChevronDown size={14} />
                  </>
                )}
              </button>

              {/* Dropdown Quý */}
              {showQuarterDropdown && !isExportingTax && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-2">
                    <div className="text-xs font-bold text-gray-700 px-3 py-2 bg-blue-50 rounded sticky top-0">
                      <IconCalendar size={12} className="inline mr-1" />
                      {t("admin.statistics.export_tax.select_quarter")}
                    </div>
                    {quarters.map((quarter) => (
                      <div key={quarter.value} className="mb-2 mt-2">
                        <div className="text-xs font-medium text-gray-700 px-3 py-1 bg-gray-50 rounded">
                          {quarter.label}
                        </div>
                        <div className="space-y-1 mt-1 ml-2">
                          <button
                            onClick={() => handleExportTax("011", quarter)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors flex items-center gap-2"
                          >
                            <IconDownload size={14} />
                            <span>
                              {t("admin.statistics.export_tax.form_011")}
                            </span>
                          </button>
                          <button
                            onClick={() => handleExportTax("014A", quarter)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors flex items-center gap-2"
                          >
                            <IconDownload size={14} />
                            <span>
                              {t("admin.statistics.export_tax.form_014A")}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nút Xuất báo cáo thuế theo Năm */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                  setShowQuarterDropdown(false);
                }}
                disabled={isExportingTax}
                className={`flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer shadow-md w-full justify-center ${
                  isExportingTax ? "opacity-70 cursor-not-allowed" : ""
                }`}
                title="Xuất thuế theo năm"
              >
                {isExportingTax && exportingTaxType.includes("year") ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5">
                      <svg className="animate-spin" viewBox="0 0 50 50">
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          className="opacity-25"
                        />
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray="125.6"
                          strokeDashoffset={
                            125.6 - (125.6 * exportProgress) / 100
                          }
                          className="transition-all duration-300"
                          style={{
                            transformOrigin: "50% 50%",
                            transform: "rotate(-90deg)",
                          }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                        {exportProgress}%
                      </span>
                    </div>
                    <span className="whitespace-nowrap text-sm">
                      Đang xuất... {exportProgress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <IconDownload size={16} />
                    <span className="whitespace-nowrap text-sm">
                      {t("admin.statistics.export_tax.year")}
                    </span>
                    <IconChevronDown size={14} />
                  </>
                )}
              </button>

              {/* Dropdown Năm */}
              {showYearDropdown && !isExportingTax && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-2">
                    <div className="text-xs font-bold text-gray-700 px-3 py-2 bg-purple-50 rounded">
                      <IconCalendar size={12} className="inline mr-1" />
                      {t("admin.statistics.export_tax.select_year", { year })}
                    </div>
                    <div className="space-y-1 mt-2">
                      <button
                        onClick={() => handleExportTaxYear("011")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded transition-colors flex items-center gap-2"
                      >
                        <IconDownload size={14} />
                        <span>{t("admin.statistics.export_tax.form_011")}</span>
                      </button>
                      <button
                        onClick={() => handleExportTaxYear("014A")}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded transition-colors flex items-center gap-2"
                      >
                        <IconDownload size={14} />
                        <span>
                          {t("admin.statistics.export_tax.form_014A")}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay để đóng dropdown khi click bên ngoài */}
        {(showMonthDropdown || showQuarterDropdown || showYearDropdown) && (
          <div className="fixed inset-0 z-40" onClick={closeAllDropdowns}></div>
        )}

        {/* Mode Selector và Date Range */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
          <div className="flex flex-col xl:flex-row flex-wrap gap-4 items-start xl:items-center">
            {/* Mode buttons */}
            <div className="grid grid-cols-2 sm:flex gap-2 w-full xl:w-auto">
              <button
                onClick={() => setMode("day")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex justify-center items-center ${
                  mode === "day"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <IconCalendar size={18} className="inline mr-2" />
                {t("admin.statistics.tabs.daily") || "Theo ngày"}
              </button>
              <button
                onClick={() => setMode("month")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex justify-center items-center ${
                  mode === "month"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <IconChartBar size={18} className="inline mr-2" />
                {t("admin.statistics.tabs.monthly")}
              </button>
              <button
                onClick={() => setMode("quarter")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex justify-center items-center ${
                  mode === "quarter"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <IconChartPie size={18} className="inline mr-2" />
                {t("admin.statistics.tabs.quarterly")}
              </button>
              <button
                onClick={() => setMode("year")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex justify-center items-center ${
                  mode === "year"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <IconChartLine size={18} className="inline mr-2" />
                {t("admin.statistics.tabs.yearly")}
              </button>
            </div>

            {/* Date Range Filter (only for daily mode) */}
            {mode === "day" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto xl:ml-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700 min-w-[30px]">
                    {t("admin.statistics.date_range.from") || "Từ"}:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-sm font-medium text-gray-700 min-w-[30px]">
                    {t("admin.statistics.date_range.to") || "Đến"}:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  />
                </div>
              </div>
            )}

            {/* Nút chọn năm */}
            <div
              className={`flex items-center gap-2 ${
                mode !== "day" ? "ml-auto" : ""
              }`}
            >
              <button
                onClick={() => setYear(year - 1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ⏴
              </button>
              <span className="font-semibold text-gray-900 min-w-[60px] text-center">
                {t("admin.statistics.year_selector.label") || "Năm"} {year}
              </span>
              <button
                onClick={() => setYear(year + 1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                ⏵
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex items-center gap-4 mt-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-0.5">
              {mode === "day"
                ? t("admin.statistics.cards.revenue.daily")
                : mode === "month"
                ? t("admin.statistics.cards.revenue.monthly")
                : mode === "quarter"
                ? t("admin.statistics.cards.revenue.quarterly")
                : t("admin.statistics.cards.revenue.yearly")}
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-blue-600 leading-tight break-all">
              {vnd(totalRevenue)}
            </h3>
          </div>
          <div className="p-2 bg-blue-50 rounded-full flex-shrink-0">
            <IconChartBar size={24} className="text-blue-500" />
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconChartBar size={20} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">
                {mode === "day"
                  ? t("admin.statistics.chart.title_daily")
                  : mode === "month"
                  ? t("admin.statistics.chart.title_monthly")
                  : mode === "quarter"
                  ? t("admin.statistics.chart.title_quarterly")
                  : t("admin.statistics.chart.title_yearly")}
              </span>
            </h3>
          </div>

          {loadingChart ? (
            <div className="h-96 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 text-sm">
                  {t("admin.statistics.chart.loading")}
                </p>
              </div>
            </div>
          ) : chartData.length > 1 ? (
            <div className="-ml-4 sm:ml-0">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="400px"
                data={chartData}
                options={columnOptions}
              />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-500">
                {t("admin.statistics.chart.no_data")}
              </p>
            </div>
          )}
        </div>

        {/* Pie Chart and Top 5 Months (only show when mode is 'month') */}
        {mode === "month" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200 overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IconChartPie
                  size={20}
                  className="text-purple-500 flex-shrink-0"
                />
                {t("admin.statistics.pie_chart.title")}
              </h3>
              {pieData.length > 1 ? (
                <div className="-ml-4 sm:ml-0">
                  <Chart
                    chartType="PieChart"
                    width="100%"
                    height="360px"
                    data={pieData}
                    options={pieOptions}
                    loader={
                      <div className="h-80 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      </div>
                    }
                  />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">
                    {t("admin.statistics.chart.no_data")}
                  </p>
                </div>
              )}
            </div>

            {/* Top 5 Months */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IconTrendingUp
                  size={20}
                  className="text-yellow-500 flex-shrink-0"
                />
                {t("admin.statistics.pie_chart.top_months") ||
                  "Top 5 tháng cao nhất"}
              </h3>
              <div className="space-y-3">
                {sortedMonths.map((m, i) => (
                  <div
                    key={m.period}
                    className="flex justify-between items-center p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0 ${
                          i === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                            : i === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-500"
                            : i === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600"
                            : "bg-gradient-to-br from-blue-400 to-blue-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="font-medium text-gray-900">
                        {m.period}
                      </span>
                    </div>
                    <span className="text-blue-600 font-bold whitespace-nowrap">
                      {vnd(m.totalRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dự báo doanh thu */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 border border-gray-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconChartLine
                size={20}
                className="text-blue-500 flex-shrink-0"
              />
              {t("admin.statistics.forecast.title") || "Dự báo doanh thu"}
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">
                {t("admin.statistics.forecast.days") || "Số ngày dự báo"}:
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>
          </div>
          {forecast.isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : forecastChartData.length > 1 ? (
            <div className="-ml-4 sm:ml-0">
              <Chart
                chartType="LineChart"
                width="100%"
                height="350px"
                data={forecastChartData}
                options={{
                  title: t("admin.statistics.forecast.chart_title"),
                  backgroundColor: "transparent",
                  legend: { position: "bottom" },
                  hAxis: { title: t("admin.statistics.forecast.date") },
                  vAxis: {
                    title: t("admin.statistics.forecast.revenue"),
                  },
                  colors: ["#06b6d4"],
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">
                {t("admin.statistics.forecast.no_data")}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-blue-50 rounded-lg p-4 md:p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <IconRefresh size={18} className="flex-shrink-0" />
            {t("admin.statistics.notes.title")}
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>{t("admin.statistics.notes.realtime")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>{t("admin.statistics.notes.multiple_views")}</span>
            </li>
            {mode === "day" && (
              <div className="mt-2 text-sm text-gray-500">
                {t("admin.statistics.date_range.selected") || "Khoảng ngày"}:{" "}
                <span className="font-semibold text-blue-600">
                  {formatDateDMY(startDate)} - {formatDateDMY(endDate)}
                </span>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
