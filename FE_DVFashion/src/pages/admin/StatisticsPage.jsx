import { useMemo, useState } from "react";
import { Chart } from "react-google-charts";
import { useTranslation } from "react-i18next";
import {
  IconCalendar,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconDownload,
  IconRefresh,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  useRevenueStatistics,
  useDailyRevenue,
  useMonthlyRevenue,
  useYearlyRevenue,
  useRevenueForecast,
} from "../../hooks/useStatistics";
import { useExportRevenueReport } from "../../hooks/useReport";
import { useQuarterlyRevenue } from "../../services/reportAPI";
import { toast } from "react-toastify";

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
  const [forecastDays, setForecastDays] = useState(30);

  const daily = useDailyRevenue({
    startDate,
    endDate,
    enabled: mode === "day",
  });

  const quarterly = useQuarterlyRevenue({
    startYear: year,
    endYear: year,
    enabled: mode === "quarter",
  });

  const monthly = useMonthlyRevenue({ year, enabled: mode === "month" });
  const yearly = useYearlyRevenue({ year, enabled: mode === "year" });
  const total = useRevenueStatistics({ period: mode });
  const exportReport = useExportRevenueReport();

  // Hàm xử lý xuất báo cáo
  const handleExportReport = async () => {
    try {
      const { blob, filename } = await exportReport({
        mode,
        year,
        startDate,
        endDate,
        yearlyData: yearly.data,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 100);
    } catch (e) {
      toast(t("admin.statistics.export.error"));
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
      const rows = Array.isArray(daily.data)
        ? daily.data.map((x) => [
            formatDateDMY(x.period), // <-- format ngày ở đây
            x.revenue,
            `${formatDateDMY(x.period)}: ${vnd(x.revenue)}`,
          ])
        : [];
      return [header, ...rows];
    }
    if (mode === "month") {
      const rows = Array.isArray(monthly.data)
        ? monthly.data.map((x) => [
            x.period.split("-")[1],
            x.revenue,
            `${x.period}: ${vnd(x.revenue)}`,
          ])
        : [];
      return [header, ...rows];
    }
    if (mode === "quarter") {
      const details = Array.isArray(quarterly.data?.details)
        ? quarterly.data.details
        : [];
      const rows = details.map((x) => [
        x.period,
        x.totalRevenue,
        `${x.period}: ${vnd(x.totalRevenue)}`,
      ]);
      return [header, ...rows];
    }
    const rows = Array.isArray(yearly.data)
      ? yearly.data.map((x) => [
          x.period,
          x.revenue,
          `${x.period}: ${vnd(x.revenue)}`,
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
    const data = Array.isArray(quarterly.data) ? quarterly.data : [];
    return [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [quarterly.data]);

  const sortedMonths = useMemo(() => {
    const data = Array.isArray(monthly.data) ? monthly.data : [];
    return [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [monthly.data]);

  // Tính tổng doanh thu dựa trên chế độ hiện tại
  const totalQuarterRevenue =
    mode === "quarter"
      ? quarterly.data?.totalRevenue ?? 0
      : mode === "day"
      ? (Array.isArray(daily.data) ? daily.data : []).reduce(
          (sum, x) => sum + (x.revenue || 0),
          0
        )
      : total.data ?? 0;

  const pieData = useMemo(() => {
    const header = [
      t("admin.statistics.pie.month") || "Tháng",
      t("admin.statistics.pie.revenue") || "Doanh thu",
    ];
    const rows = Array.isArray(monthly.data)
      ? monthly.data.map((x) => [`T${x.period.split("-")[1]}`, x.revenue])
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-800">
            {t("admin.statistics.title") || "Thống kê doanh thu"}
          </h1>
          {/* Nút xuất báo cáo */}
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer shadow-md"
            title={t("admin.statistics.export")}
          >
            <IconDownload size={18} />
            {t("admin.statistics.export")}
          </button>
        </div>

        {/* Mode Selector và Date Range */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Mode buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode("day")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("admin.statistics.date_range.from") || "Từ"}:
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t("admin.statistics.date_range.to") || "Đến"}:
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Nút chọn năm */}
            <div className="flex items-center gap-2 ml-auto">
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
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100 flex items-center gap-4  mt-2">
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
            <h3 className="text-2xl font-bold text-blue-600 leading-tight">
              {mode === "quarter"
                ? vnd(totalQuarterRevenue)
                : mode === "day"
                ? vnd(
                    (Array.isArray(daily.data) ? daily.data : []).reduce(
                      (sum, x) => sum + (x.revenue || 0),
                      0
                    )
                  )
                : vnd(total.data ?? 0)}
            </h3>
          </div>
          <div className="p-2 bg-blue-50 rounded-full">
            <IconChartBar size={24} className="text-blue-500" />
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconChartBar size={20} className="text-blue-500" />
              {mode === "day"
                ? t("admin.statistics.chart.title_daily")
                : mode === "month"
                ? t("admin.statistics.chart.title_monthly")
                : mode === "quarter"
                ? t("admin.statistics.chart.title_quarterly")
                : t("admin.statistics.chart.title_yearly")}
            </h3>
          </div>

          {chartData.length > 1 &&
          (mode !== "year" ||
            (mode === "year" && yearly.data && yearly.data.length > 0)) ? (
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="400px"
              data={chartData}
              options={columnOptions}
              loader={
                <div className="h-96 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-gray-500 text-sm">
                      {t("admin.statistics.chart.loading")}
                    </p>
                  </div>
                </div>
              }
            />
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
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IconChartPie size={20} className="text-purple-500" />
                {t("admin.statistics.pie_chart.title")}
              </h3>
              {pieData.length > 1 ? (
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
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">
                    {t("admin.statistics.chart.no_data")}
                  </p>
                </div>
              )}
            </div>

            {/* Top 5 Months */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IconTrendingUp size={20} className="text-yellow-500" />
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
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
                    <span className="text-blue-600 font-bold">
                      {vnd(m.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dự báo doanh thu */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconChartLine size={20} className="text-blue-500" />
              {t("admin.statistics.forecast.title") || "Dự báo doanh thu"}
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">
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
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">
                {t("admin.statistics.forecast.no_data")}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <IconRefresh size={18} />
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
