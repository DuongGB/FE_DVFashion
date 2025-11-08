import { useMemo, useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  IconCalendar,
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconDownload,
  IconRefresh,
} from "@tabler/icons-react";
import {
  useRevenueStatistics,
  useDailyRevenue,
  useMonthlyRevenue,
  useYearlyRevenue,
} from "../../hooks/useStatistics";

const StatisticsPage = () => {
  const { t } = useTranslation();

  // Chart view tabs
  const [chartView, setChartView] = useState("monthly");
  const [chartType, setChartType] = useState("combo");

  // Date states
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());

  // Daily date range
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  // Fetch data hooks
  const { data: overallData, isLoading: overallLoading } =
    useRevenueStatistics();
  const { data: dailyData, isLoading: dailyLoading } = useDailyRevenue(
    startDate,
    endDate
  );
  const { data: monthlyData, isLoading: monthlyLoading } =
    useMonthlyRevenue(year);
  const { data: yearlyData, isLoading: yearlyLoading } = useYearlyRevenue();

  // Loading state
  const loading =
    overallLoading || dailyLoading || monthlyLoading || yearlyLoading;

  // Helper function to format date
  const fmtDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(Number(amount || 0));
    } catch (error) {
      console.error("Currency format error:", error);
      return "0 ₫";
    }
  };

  // Calculate summary revenue based on chart view
  const summaryRevenue = useMemo(() => {
    if (chartView === "daily") {
      return (
        dailyData?.reduce((sum, item) => sum + Number(item.revenue || 0), 0) ||
        0
      );
    } else if (chartView === "monthly") {
      return (
        monthlyData?.reduce(
          (sum, item) => sum + Number(item.revenue || 0),
          0
        ) || 0
      );
    } else {
      return (
        yearlyData?.reduce((sum, item) => sum + Number(item.revenue || 0), 0) ||
        0
      );
    }
  }, [chartView, dailyData, monthlyData, yearlyData]);

  // Calculate growth rate for monthly view
  const growthRate = useMemo(() => {
    if (chartView !== "monthly" || !monthlyData || monthlyData.length < 2)
      return 0;

    const currentMonth = new Date().getMonth() + 1;
    const currentMonthData = monthlyData.find((item) => {
      const month = parseInt(item.period.split("-")[1]);
      return month === currentMonth;
    });
    const lastMonthData = monthlyData.find((item) => {
      const month = parseInt(item.period.split("-")[1]);
      return month === currentMonth - 1;
    });

    if (!currentMonthData || !lastMonthData) return 0;

    const current = Number(currentMonthData.revenue || 0);
    const last = Number(lastMonthData.revenue || 0);

    if (last === 0) return 0;
    return ((current - last) / last) * 100;
  }, [chartView, monthlyData]);

  // Linear regression for prediction
  const linearRegression = (data) => {
    const n = data.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;

    data.forEach((point, i) => {
      sumX += i;
      sumY += point.revenue;
      sumXY += i * point.revenue;
      sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Predict next 3 months
  const predictedData = useMemo(() => {
    if (chartView !== "monthly" || !monthlyData || monthlyData.length < 3)
      return [];

    const revenueData = monthlyData.map((item) => ({
      revenue: Number(item.revenue || 0),
    }));

    const { slope, intercept } = linearRegression(revenueData);
    const predictions = [];

    for (let i = 1; i <= 3; i++) {
      const predictedRevenue = slope * (monthlyData.length + i - 1) + intercept;
      const nextMonth = new Date(year, monthlyData.length + i - 1);
      predictions.push({
        period: `${nextMonth.getFullYear()}-${String(
          nextMonth.getMonth() + 1
        ).padStart(2, "0")}`,
        revenue: Math.max(0, predictedRevenue),
        isPredicted: true,
      });
    }

    return predictions;
  }, [chartView, monthlyData, year]);

  const predictedSummary = useMemo(() => {
    return {
      total: predictedData.reduce((sum, item) => sum + item.revenue, 0),
      items: predictedData,
    };
  }, [predictedData]);

  // Chart data preparation
  const dailyChartData = useMemo(() => {
    if (!dailyData || dailyData.length === 0) return [["Date", "Revenue"]];
    return [
      ["Date", t("admin.statistics.chart.legend.actual")],
      ...dailyData.map((item) => [item.period, Number(item.revenue || 0)]),
    ];
  }, [dailyData, t]);

  const monthlyChartWithForecast = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0)
      return [["Month", "Actual", "Predicted"]];

    const combined = [
      ...monthlyData.map((item) => ({
        period: item.period,
        revenue: Number(item.revenue || 0),
        isPredicted: false,
      })),
      ...predictedData,
    ];

    return [
      [
        "Month",
        t("admin.statistics.chart.legend.actual"),
        t("admin.statistics.chart.legend.predicted"),
      ],
      ...combined.map((item) => [
        item.period,
        item.isPredicted ? null : item.revenue,
        item.isPredicted ? item.revenue : null,
      ]),
    ];
  }, [monthlyData, predictedData, t]);

  const yearlyChartData = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return [["Year", "Revenue"]];
    return [
      ["Year", t("admin.statistics.chart.legend.actual")],
      ...yearlyData.map((item) => [
        String(item.period),
        Number(item.revenue || 0),
      ]),
    ];
  }, [yearlyData, t]);

  // Pie chart data for monthly view
  const pieChartData = useMemo(() => {
    if (chartView !== "monthly" || !monthlyData || monthlyData.length === 0)
      return null;

    return [
      ["Month", "Revenue"],
      ...monthlyData.map((item) => [item.period, Number(item.revenue || 0)]),
    ];
  }, [chartView, monthlyData]);

  // Chart visibility flags
  const showDailyChart = useMemo(
    () => chartView === "daily" && dailyData && dailyData.length > 0,
    [chartView, dailyData]
  );

  const showMonthlyChart = useMemo(
    () => chartView === "monthly" && monthlyData && monthlyData.length > 0,
    [chartView, monthlyData]
  );

  const showYearlyChart = useMemo(
    () => chartView === "yearly" && yearlyData && yearlyData.length > 0,
    [chartView, yearlyData]
  );

  // Chart options
  const getChartOptions = (type) => {
    const baseOptions = {
      backgroundColor: "transparent",
      legend: { position: "bottom", textStyle: { fontSize: 12 } },
      hAxis: {
        textStyle: { fontSize: 11 },
        slantedText: false,
        maxAlternation: 1,
      },
      vAxis: {
        format: "short",
        textStyle: { fontSize: 11 },
      },
      chartArea: { width: "85%", height: "70%" },
      colors: ["#3B82F6", "#F59E0B"],
      animation: {
        startup: true,
        duration: 1000,
        easing: "out",
      },
    };

    if (type === "area") {
      return {
        ...baseOptions,
        isStacked: false,
        areaOpacity: 0.3,
      };
    }

    return baseOptions;
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      let data = [];
      let filename = "";

      if (chartView === "daily") {
        data = dailyData || [];
        filename = `daily_revenue_${startDate}_${endDate}.csv`;
      } else if (chartView === "monthly") {
        data = monthlyData || [];
        filename = `monthly_revenue_${year}.csv`;
      } else {
        data = yearlyData || [];
        filename = `yearly_revenue.csv`;
      }

      if (data.length === 0) {
        toast.warning(t("admin.statistics.chart.no_data"));
        return;
      }

      const csvContent = [
        ["Period", "Revenue"],
        ...data.map((item) => [item.period, item.revenue]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      toast.success(t("admin.statistics.export.success"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("admin.statistics.export.error"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("admin.statistics.title")}
        </h1>
        <button
          onClick={handleExportCSV}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconDownload size={16} />
          {t("admin.statistics.export.button")}
        </button>
      </div>

      {/* Controls */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-lg p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          {/* View tabs */}
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
                chartView === "daily"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
              onClick={() => setChartView("daily")}
            >
              <IconCalendar size={16} />
              {t("admin.statistics.tabs.daily")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
                chartView === "monthly"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
              onClick={() => setChartView("monthly")}
            >
              <IconChartBar size={16} />
              {t("admin.statistics.tabs.monthly")}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2 ${
                chartView === "yearly"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
              onClick={() => setChartView("yearly")}
            >
              <IconChartLine size={16} />
              {t("admin.statistics.tabs.yearly")}
            </button>
          </div>

          {/* Date range for daily */}
          {chartView === "daily" && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">
                {t("admin.statistics.date_range.from")}
              </label>
              <input
                type="date"
                className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
              <label className="text-sm text-gray-600 font-medium">
                {t("admin.statistics.date_range.to")}
              </label>
              <input
                type="date"
                className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={fmtDate(today)}
              />
            </div>
          )}

          {/* Year selector for monthly */}
          {chartView === "monthly" && (
            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-white/80 rounded transition-colors"
                onClick={() => setYear((y) => y - 1)}
              >
                ◀
              </button>
              <input
                type="number"
                className="w-24 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-3 py-2 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={year}
                onChange={(e) =>
                  setYear(Number(e.target.value || new Date().getFullYear()))
                }
              />
              <button
                className="p-2 hover:bg-white/80 rounded transition-colors"
                onClick={() => setYear((y) => y + 1)}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue card */}
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">
              {t("admin.statistics.cards.revenue.title")} (
              {chartView === "daily"
                ? t("admin.statistics.cards.revenue.daily")
                : chartView === "monthly"
                ? t("admin.statistics.cards.revenue.monthly")
                : t("admin.statistics.cards.revenue.yearly")}
              )
            </p>
            <IconChartLine className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? (
              <div className="animate-pulse">…</div>
            ) : (
              formatCurrency(summaryRevenue)
            )}
          </p>
          {chartView === "monthly" && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  growthRate >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {growthRate >= 0 ? "↑" : "↓"} {Math.abs(growthRate).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">
                {t("admin.statistics.cards.revenue.growth")}
              </span>
            </div>
          )}
        </div>

        {/* Forecast card (only for monthly) */}
        {chartView === "monthly" ? (
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                {t("admin.statistics.cards.forecast.title")}
              </p>
              <IconChartPie className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {loading ? (
                <div className="animate-pulse">…</div>
              ) : (
                formatCurrency(predictedSummary.total)
              )}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              {t("admin.statistics.cards.forecast.note")}
            </p>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                {t("admin.statistics.cards.total_items.title")}
              </p>
              <IconChartBar className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading
                ? "…"
                : chartView === "daily"
                ? (dailyData || []).length
                : (yearlyData || []).length}
            </p>
          </div>
        )}

        {/* Status card */}
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">
              {t("admin.statistics.cards.status.title")}
            </p>
            <IconRefresh
              className={`text-green-600 ${loading ? "animate-spin" : ""}`}
              size={24}
            />
          </div>
          <p className="text-2xl font-bold">
            {loading ? (
              <span className="text-gray-500">
                {t("admin.statistics.cards.status.loading")}
              </span>
            ) : (
              <span className="text-green-600">
                {t("admin.statistics.cards.status.ready")}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Chart type selector */}
      {chartView !== "yearly" && (
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {t("admin.statistics.chart.types.combo")}:
            </span>
            <div className="flex gap-2">
              {[
                {
                  type: "combo",
                  label: t("admin.statistics.chart.types.combo"),
                  icon: IconChartBar,
                },
                {
                  type: "line",
                  label: t("admin.statistics.chart.types.line"),
                  icon: IconChartLine,
                },
                {
                  type: "area",
                  label: t("admin.statistics.chart.types.area"),
                  icon: IconChartPie,
                },
                {
                  type: "bar",
                  label: t("admin.statistics.chart.types.bar"),
                  icon: IconChartBar,
                },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                    chartType === type
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {t(`admin.statistics.chart.title.${chartView}`)}
          </h3>
          {chartView === "monthly" && (
            <div className="text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
              {t("admin.statistics.chart.legend.actual")}
              <span className="inline-block w-3 h-3 bg-orange-500 rounded ml-3 mr-2"></span>
              {t("admin.statistics.chart.legend.predicted")}
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              <span className="text-gray-500 text-sm font-medium">
                {t("admin.statistics.chart.loading")}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-96">
            {showDailyChart && (
              <Chart
                chartType={
                  chartType === "combo"
                    ? "ComboChart"
                    : chartType === "line"
                    ? "LineChart"
                    : chartType === "area"
                    ? "AreaChart"
                    : "ColumnChart"
                }
                width="100%"
                height="100%"
                data={dailyChartData}
                options={getChartOptions(chartType)}
              />
            )}

            {showMonthlyChart && (
              <Chart
                chartType="ComboChart"
                width="100%"
                height="100%"
                data={monthlyChartWithForecast}
                options={getChartOptions("combo")}
              />
            )}

            {showYearlyChart && (
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="100%"
                data={yearlyChartData}
                options={getChartOptions("bar")}
              />
            )}

            {!showDailyChart && chartView === "daily" && (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <IconChartBar
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                  />
                  <p className="text-gray-500 font-medium">
                    {t("admin.statistics.chart.no_data")}
                  </p>
                </div>
              </div>
            )}
            {!showMonthlyChart && chartView === "monthly" && (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <IconChartBar
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                  />
                  <p className="text-gray-500 font-medium">
                    {t("admin.statistics.chart.no_data")}
                  </p>
                </div>
              </div>
            )}
            {!showYearlyChart && chartView === "yearly" && (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <IconChartBar
                    size={48}
                    className="text-gray-300 mx-auto mb-4"
                  />
                  <p className="text-gray-500 font-medium">
                    {t("admin.statistics.chart.no_data")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pie chart for monthly distribution */}
      {chartView === "monthly" && pieChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t("admin.statistics.pie_chart.title")}
            </h3>
            <Chart
              chartType="PieChart"
              width="100%"
              height="300px"
              data={pieChartData}
              options={{
                backgroundColor: "transparent",
                legend: { position: "right", textStyle: { fontSize: 12 } },
                pieHole: 0.4,
                colors: [
                  "#3B82F6",
                  "#8B5CF6",
                  "#EC4899",
                  "#F59E0B",
                  "#10B981",
                  "#06B6D4",
                  "#6366F1",
                  "#F43F5E",
                  "#14B8A6",
                  "#A855F7",
                  "#EAB308",
                  "#22C55E",
                ],
                chartArea: { width: "90%", height: "85%" },
              }}
            />
          </div>

          <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t("admin.statistics.pie_chart.top_months")}
            </h3>
            <div className="space-y-3">
              {[...(monthlyData || [])]
                .sort((a, b) => Number(b.revenue) - Number(a.revenue))
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={item.period}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                            ? "bg-orange-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700">
                        {item.period}
                      </span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Report notes */}
      <div className="backdrop-blur-xl bg-blue-50/60 border border-blue-200/40 rounded-lg p-6 shadow-lg">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <IconChartLine size={20} />
          {t("admin.statistics.notes.title")}
        </h3>
        <ul className="list-disc ml-5 space-y-2 text-sm text-blue-700">
          <li>{t("admin.statistics.notes.csv_export")}</li>
          <li>{t("admin.statistics.notes.forecast_note")}</li>
          <li>{t("admin.statistics.notes.realtime")}</li>
          <li>{t("admin.statistics.notes.multiple_views")}</li>
        </ul>
      </div>
    </div>
  );
};

export default StatisticsPage;
