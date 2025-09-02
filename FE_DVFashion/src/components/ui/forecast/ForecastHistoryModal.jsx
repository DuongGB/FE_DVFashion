import React, { useState, useMemo } from "react";
import {
  IconX,
  IconHistory,
  IconChartLine,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconClock,
  IconFilter,
  IconSearch,
  IconEye,
  IconDownload,
  IconChartBar,
} from "@tabler/icons-react";
import {
  exportData as exportUtils,
  formatHistoryDataForExport,
} from "../../../utils/exportUtils";
import { toast } from "react-toastify";

export default function ForecastHistoryModal({
  forecasts,
  open,
  onClose,
  onViewDetails,
}) {
  const [historyFilters, setHistoryFilters] = useState({
    dateFrom: "",
    dateTo: "",
    model: "all",
    accuracyRange: "all",
    search: "",
  });
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Get completed forecasts (with actual revenue)
  const completedForecasts =
    forecasts?.filter((f) => f.actualRevenue !== null) || [];

  // Apply filters
  const filteredHistory = useMemo(() => {
    return completedForecasts.filter((forecast) => {
      const forecastDate = new Date(forecast.forecastDate);
      const dateFromFilter = historyFilters.dateFrom
        ? new Date(historyFilters.dateFrom)
        : null;
      const dateToFilter = historyFilters.dateTo
        ? new Date(historyFilters.dateTo)
        : null;

      const matchesDateRange =
        (!dateFromFilter || forecastDate >= dateFromFilter) &&
        (!dateToFilter || forecastDate <= dateToFilter);

      const matchesModel =
        historyFilters.model === "all" ||
        forecast.model === historyFilters.model;

      const matchesAccuracy = (() => {
        if (historyFilters.accuracyRange === "all") return true;
        if (!forecast.accuracy)
          return historyFilters.accuracyRange === "unknown";

        switch (historyFilters.accuracyRange) {
          case "excellent":
            return forecast.accuracy >= 95;
          case "good":
            return forecast.accuracy >= 90 && forecast.accuracy < 95;
          case "average":
            return forecast.accuracy >= 80 && forecast.accuracy < 90;
          case "poor":
            return forecast.accuracy < 80;
          default:
            return true;
        }
      })();

      const matchesSearch =
        historyFilters.search === "" ||
        forecast.notes
          ?.toLowerCase()
          .includes(historyFilters.search.toLowerCase()) ||
        forecast.id.toString().includes(historyFilters.search);

      return (
        matchesDateRange && matchesModel && matchesAccuracy && matchesSearch
      );
    });
  }, [completedForecasts, historyFilters]);

  // Sort forecasts
  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.forecastDate);
          bValue = new Date(b.forecastDate);
          break;
        case "accuracy":
          aValue = a.accuracy || 0;
          bValue = b.accuracy || 0;
          break;
        case "variance":
          aValue = Math.abs(
            (a.actualRevenue - a.predictedRevenue) / a.predictedRevenue
          );
          bValue = Math.abs(
            (b.actualRevenue - b.predictedRevenue) / b.predictedRevenue
          );
          break;
        case "revenue":
          aValue = a.actualRevenue;
          bValue = b.actualRevenue;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredHistory, sortBy, sortOrder]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        totalForecasts: 0,
        avgAccuracy: 0,
        totalPredicted: 0,
        totalActual: 0,
        avgVariance: 0,
        successRate: 0,
      };
    }

    const totalPredicted = filteredHistory.reduce(
      (sum, f) => sum + f.predictedRevenue,
      0
    );
    const totalActual = filteredHistory.reduce(
      (sum, f) => sum + f.actualRevenue,
      0
    );
    const avgAccuracy =
      filteredHistory.reduce((sum, f) => sum + (f.accuracy || 0), 0) /
      filteredHistory.length;
    const variances = filteredHistory.map((f) =>
      Math.abs(
        ((f.actualRevenue - f.predictedRevenue) / f.predictedRevenue) * 100
      )
    );
    const avgVariance =
      variances.reduce((sum, v) => sum + v, 0) / variances.length;
    const successRate =
      (filteredHistory.filter((f) => f.accuracy >= 90).length /
        filteredHistory.length) *
      100;

    return {
      totalForecasts: filteredHistory.length,
      avgAccuracy: avgAccuracy.toFixed(1),
      totalPredicted,
      totalActual,
      avgVariance: avgVariance.toFixed(1),
      successRate: successRate.toFixed(1),
    };
  }, [filteredHistory]);

  // Di chuyển early return sau tất cả hooks
  if (!open) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Get accuracy color
  const getAccuracyColor = (accuracy) => {
    if (!accuracy) return "bg-gray-100 text-gray-800";
    if (accuracy >= 95) return "bg-green-100 text-green-800";
    if (accuracy >= 90) return "bg-yellow-100 text-yellow-800";
    if (accuracy >= 80) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // Calculate variance
  const calculateVariance = (forecast) => {
    const variance =
      ((forecast.actualRevenue - forecast.predictedRevenue) /
        forecast.predictedRevenue) *
      100;
    return {
      value: Math.abs(variance).toFixed(1),
      isPositive: variance >= 0,
    };
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setHistoryFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Export history data
  const handleExportHistory = async () => {
    try {
      // Format data for export
      const exportData = formatHistoryDataForExport(
        sortedHistory,
        formatCurrency,
        formatDate,
        calculateVariance
      );

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `lich-su-du-bao-${timestamp}`;

      // Export using utility function
      const success = await exportUtils(exportData, "csv", filename, {
        includeHeaders: true,
        showToast: true,
      });

      if (success) {
        console.log("History export completed successfully");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất dữ liệu!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <IconHistory size={28} className="text-orange-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Lịch sử dự báo
              </h2>
              <p className="text-sm text-gray-600">
                Phân tích và theo dõi hiệu suất các dự báo đã hoàn thành
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportHistory}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <IconDownload size={16} />
              Xuất dữ liệu
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Statistics Overview */}
          <div className="p-6 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IconChartBar size={18} />
              Tổng quan thống kê
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.totalForecasts}
                </div>
                <div className="text-sm text-gray-600">Tổng dự báo</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.avgAccuracy}%
                </div>
                <div className="text-sm text-gray-600">Độ chính xác TB</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.successRate}%
                </div>
                <div className="text-sm text-gray-600">Tỷ lệ thành công</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-2xl font-bold text-orange-600">
                  {statistics.avgVariance}%
                </div>
                <div className="text-sm text-gray-600">Độ lệch TB</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-lg font-bold text-gray-600">
                  {formatCurrency(statistics.totalPredicted)}
                </div>
                <div className="text-sm text-gray-600">Tổng dự báo</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center border">
                <div className="text-lg font-bold text-gray-600">
                  {formatCurrency(statistics.totalActual)}
                </div>
                <div className="text-sm text-gray-600">Tổng thực tế</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 bg-white border-b">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <IconFilter size={18} />
              Bộ lọc và tìm kiếm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={historyFilters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={historyFilters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô hình
                </label>
                <select
                  value={historyFilters.model}
                  onChange={(e) => handleFilterChange("model", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="Linear Regression">Linear Regression</option>
                  <option value="ARIMA">ARIMA</option>
                  <option value="Neural Network">Neural Network</option>
                  <option value="Random Forest">Random Forest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ chính xác
                </label>
                <select
                  value={historyFilters.accuracyRange}
                  onChange={(e) =>
                    handleFilterChange("accuracyRange", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="excellent">Xuất sắc (≥95%)</option>
                  <option value="good">Tốt (90-95%)</option>
                  <option value="average">Trung bình (80-90%)</option>
                  <option value="poor">Kém (&lt;80%)</option>
                  <option value="unknown">Chưa có</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ID hoặc ghi chú..."
                    value={historyFilters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <IconSearch
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 self-center">
                Sắp xếp theo:
              </span>
              {[
                { key: "date", label: "Ngày" },
                { key: "accuracy", label: "Độ chính xác" },
                { key: "variance", label: "Độ lệch" },
                { key: "revenue", label: "Doanh thu" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    sortBy === key
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {label}
                  {sortBy === key && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Kết quả ({sortedHistory.length} dự báo)
              </h3>
            </div>

            {sortedHistory.length > 0 ? (
              <div className="space-y-4">
                {sortedHistory.map((forecast) => {
                  const variance = calculateVariance(forecast);
                  return (
                    <div
                      key={forecast.id}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <IconChartLine
                              size={18}
                              className="text-blue-600"
                            />
                            <h4 className="font-semibold text-lg">
                              Dự báo #{forecast.id}
                            </h4>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getAccuracyColor(
                              forecast.accuracy
                            )}`}
                          >
                            {forecast.accuracy
                              ? `${forecast.accuracy.toFixed(1)}%`
                              : "N/A"}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {forecast.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              onViewDetails && onViewDetails(forecast)
                            }
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                            title="Xem chi tiết"
                          >
                            <IconEye size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <IconCalendar size={16} className="text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Ngày dự báo
                            </div>
                            <div className="font-medium">
                              {formatDate(forecast.forecastDate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconTrendingUp size={16} className="text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-600">Dự báo</div>
                            <div className="font-medium text-blue-600">
                              {formatCurrency(forecast.predictedRevenue)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IconTarget size={16} className="text-green-500" />
                          <div>
                            <div className="text-sm text-gray-600">Thực tế</div>
                            <div className="font-medium text-green-600">
                              {formatCurrency(forecast.actualRevenue)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {variance.isPositive ? (
                            <IconTrendingUp
                              size={16}
                              className="text-green-500"
                            />
                          ) : (
                            <IconTrendingDown
                              size={16}
                              className="text-red-500"
                            />
                          )}
                          <div>
                            <div className="text-sm text-gray-600">Độ lệch</div>
                            <div
                              className={`font-medium ${
                                variance.isPositive
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {variance.isPositive ? "+" : "-"}
                              {variance.value}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {forecast.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600 flex items-start gap-2">
                            <IconClock
                              size={14}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <span className="italic">"{forecast.notes}"</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <IconHistory size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không có dữ liệu lịch sử
                </h3>
                <p className="text-gray-500">
                  Không tìm thấy dự báo nào phù hợp với bộ lọc hiện tại.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
