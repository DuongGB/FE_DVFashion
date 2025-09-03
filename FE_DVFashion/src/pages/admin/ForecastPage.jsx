import React, { useState, useEffect } from "react";
import {
  IconTrendingUp,
  IconChartLine,
  IconCalendar,
  IconCurrency,
  IconRefresh,
  IconDownload,
  IconFilter,
  IconEye,
  IconPlus,
  IconEdit,
  IconTrash,
  IconFileSpreadsheet,
  IconHistory,
  IconChartBar,
  IconTrendingDown,
  IconCalendarStats,
} from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";
import ForecastForm from "../../components/ui/forecast/ForecastForm";
import ForecastDetailModal from "../../components/ui/forecast/ForecastDetailModal";
import ForecastHistoryModal from "../../components/ui/forecast/ForecastHistoryModal";
import { toast } from "react-toastify";
import { showDeleteConfirmationToast } from "../../utils/showConfirmationToast";
import {
  exportData as exportUtils,
  formatForecastDataForExport,
} from "../../utils/exportUtils";

// Mock data for SalesForecasting
const mockForecasts = [
  {
    id: 1,
    forecastDate: "2024-09-01",
    predictedRevenue: 15000000,
    actualRevenue: 14500000,
    model: "Linear Regression",
    accuracy: 96.67,
    generatedAt: "2024-08-28T10:00:00",
    notes: "Dự báo cho ngày đầu tháng với promotion mạnh",
    factors: [
      { id: 1, factorName: "Seasonal Trend", weight: 0.4, value: "High" },
      { id: 2, factorName: "Weather", weight: 0.3, value: "Sunny" },
      { id: 3, factorName: "Promotion", weight: 0.3, value: "30% Off" },
    ],
  },
  {
    id: 2,
    forecastDate: "2024-09-02",
    predictedRevenue: 12000000,
    actualRevenue: 11800000,
    model: "ARIMA",
    accuracy: 98.33,
    generatedAt: "2024-08-29T09:30:00",
    notes: "Ngày thường, ít promotion",
    factors: [
      { id: 4, factorName: "Seasonal Trend", weight: 0.5, value: "Medium" },
      { id: 5, factorName: "Day of Week", weight: 0.2, value: "Monday" },
      { id: 6, factorName: "Stock Level", weight: 0.3, value: "Low" },
    ],
  },
  {
    id: 3,
    forecastDate: "2024-09-03",
    predictedRevenue: 18000000,
    actualRevenue: null, // Future forecast
    model: "Neural Network",
    accuracy: null,
    generatedAt: "2024-09-01T14:15:00",
    notes: "Dự báo với chiến dịch marketing mới",
    factors: [
      { id: 7, factorName: "Marketing Campaign", weight: 0.4, value: "Active" },
      { id: 8, factorName: "Economic Index", weight: 0.3, value: "Positive" },
      { id: 9, factorName: "Competition", weight: 0.3, value: "Medium" },
    ],
  },
  {
    id: 4,
    forecastDate: "2024-09-04",
    predictedRevenue: 16500000,
    actualRevenue: null,
    model: "Random Forest",
    accuracy: null,
    generatedAt: "2024-09-01T16:00:00",
    notes: "Dự báo cuối tuần",
    factors: [
      { id: 10, factorName: "Holiday Effect", weight: 0.5, value: "None" },
      { id: 11, factorName: "Inventory Level", weight: 0.3, value: "High" },
      {
        id: 12,
        factorName: "Customer Sentiment",
        weight: 0.2,
        value: "Positive",
      },
    ],
  },
];

// Mock data for available forecasting models
const forecastingModels = [
  "Linear Regression",
  "ARIMA",
  "Neural Network",
  "Random Forest",
  "Support Vector Machine",
  "Polynomial Regression",
];

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState([]);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForecastForm, setShowForecastForm] = useState(false);
  const [editingForecast, setEditingForecast] = useState(null);
  const [setShowTrendAnalysis] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    model: "all",
    hasActual: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setForecasts(mockForecasts);
  }, []);

  // Filter forecasts
  const filteredForecasts = forecasts.filter((forecast) => {
    const forecastDate = new Date(forecast.forecastDate);
    const dateFromFilter = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const dateToFilter = filters.dateTo ? new Date(filters.dateTo) : null;

    const matchesDateRange =
      (!dateFromFilter || forecastDate >= dateFromFilter) &&
      (!dateToFilter || forecastDate <= dateToFilter);

    const matchesModel =
      filters.model === "all" || forecast.model === filters.model;

    const matchesActual =
      filters.hasActual === "all" ||
      (filters.hasActual === "true" && forecast.actualRevenue !== null) ||
      (filters.hasActual === "false" && forecast.actualRevenue === null);

    return matchesDateRange && matchesModel && matchesActual;
  });

  const totalPages = Math.ceil(filteredForecasts.length / pageSize);
  const paginatedForecasts = filteredForecasts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Chưa có";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Calculate accuracy color
  const getAccuracyColor = (accuracy) => {
    if (!accuracy) return "bg-gray-100 text-gray-800";
    if (accuracy >= 95) return "bg-green-100 text-green-800";
    if (accuracy >= 90) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle view forecast detail
  const handleViewForecast = (forecast) => {
    setSelectedForecast(forecast);
    setShowDetailModal(true);
  };

  // Handle create new forecast
  const handleCreateForecast = () => {
    setEditingForecast(null);
    setShowForecastForm(true);
  };

  // Handle edit forecast
  const handleEditForecast = (forecast) => {
    setEditingForecast(forecast);
    setShowForecastForm(true);
  };

  // Handle form submit
  const handleFormSubmit = async (forecastData) => {
    try {
      if (editingForecast) {
        // Update existing forecast
        setForecasts((prev) =>
          prev.map((f) =>
            f.id === editingForecast.id
              ? {
                  ...forecastData,
                  id: editingForecast.id,
                  updatedAt: new Date().toISOString(),
                  generatedAt: editingForecast.generatedAt, // Keep original generated time
                  actualRevenue: editingForecast.actualRevenue, // Keep actual revenue if exists
                  accuracy: editingForecast.accuracy, // Keep accuracy if exists
                }
              : f
          )
        );
        toast.success("Cập nhật dự báo thành công!");
      } else {
        // Create new forecast
        const newForecast = {
          ...forecastData,
          id: Math.max(...forecasts.map((f) => f.id)) + 1,
          generatedAt: new Date().toISOString(),
          actualRevenue: null,
          accuracy: null,
          // Auto-generate predicted revenue if not provided
          predictedRevenue:
            forecastData.predictedRevenue ||
            Math.floor(Math.random() * 20000000) + 10000000,
        };
        setForecasts((prev) => [newForecast, ...prev]);
        toast.success("Tạo dự báo thành công!");
      }

      setShowForecastForm(false);
      setEditingForecast(null);
    } catch (error) {
      console.error("Error submitting forecast:", error);
      toast.error("Có lỗi xảy ra khi lưu dự báo!");
    }
  };

  // Handle close form
  const handleCloseForecastForm = () => {
    setShowForecastForm(false);
    setEditingForecast(null);
  };

  // Handle close detail modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedForecast(null);
  };

  // Handle delete forecast
  const handleDeleteForecast = (forecast) => {
    if (!forecast) {
      toast.error("Dự báo không tồn tại!");
      return;
    }

    showDeleteConfirmationToast({
      itemName: `dự báo ngày ${formatDate(forecast.forecastDate)}`,
      itemType: "dự báo",
      isActive: true, // Forecasts are always "active" for deletion
      onConfirm: () => {
        setForecasts((prev) => prev.filter((f) => f.id !== forecast.id));
        toast.success("Xóa dự báo thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
      },
      onCancel: () => {
        console.log("User đã hủy xóa dự báo");
      },
    });
  };

  // USE CASE: Xuất PDF/Excel - Export functionality
  const handleExportData = async (format) => {
    try {
      // Format data for export
      const formattedData = formatForecastDataForExport(
        filteredForecasts,
        formatCurrency,
        formatDate,
        formatDateTime
      );

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `du-bao-doanh-thu-${timestamp}`;

      // Export using utility function
      const success = await exportUtils(formattedData, format, filename, {
        includeHeaders: true,
        showToast: true,
      });

      if (success) {
        // Additional success handling if needed
        console.log(`Export ${format} completed successfully`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất dữ liệu!");
    }
  };

  // USE CASE: Lấy dữ liệu lịch sử - Historical data
  const handleViewHistory = () => {
    setShowHistoryModal(true);
  };

  // Handle view forecast from history modal
  const handleViewForecastFromHistory = (forecast) => {
    setSelectedForecast(forecast);
    setShowHistoryModal(false);
    setShowDetailModal(true);
  };

  // USE CASE: Phân tích xu hướng - Trend analysis
  const handleTrendAnalysis = (period) => {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          break;
        case "year":
          startDate = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          );
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const trendData = forecasts.filter((f) => {
        const forecastDate = new Date(f.forecastDate);
        return (
          forecastDate >= startDate && forecastDate <= now && f.actualRevenue
        );
      });

      if (trendData.length < 2) {
        toast.warning("Không đủ dữ liệu để phân tích xu hướng!");
        return;
      }

      // Calculate trend
      const avgAccuracy =
        trendData.reduce((sum, f) => sum + (f.accuracy || 0), 0) /
        trendData.length;
      const totalPredicted = trendData.reduce(
        (sum, f) => sum + f.predictedRevenue,
        0
      );
      const totalActual = trendData.reduce(
        (sum, f) => sum + f.actualRevenue,
        0
      );
      const variance = (
        ((totalActual - totalPredicted) / totalPredicted) *
        100
      ).toFixed(2);

      const trendInfo = {
        period: period,
        dataPoints: trendData.length,
        avgAccuracy: avgAccuracy.toFixed(2),
        totalPredicted: formatCurrency(totalPredicted),
        totalActual: formatCurrency(totalActual),
        variance: variance,
        trend: variance > 5 ? "Tăng" : variance < -5 ? "Giảm" : "Ổn định",
      };

      // Show trend analysis modal or toast
      toast.success(
        <div>
          <strong>
            Phân tích xu hướng{" "}
            {period === "week" ? "tuần" : period === "month" ? "tháng" : "năm"}:
          </strong>
          <br />• Điểm dữ liệu: {trendInfo.dataPoints}
          <br />• Độ chính xác TB: {trendInfo.avgAccuracy}%
          <br />• Xu hướng: {trendInfo.trend} ({variance}%)
        </div>,
        { autoClose: 8000 }
      );

      setShowTrendAnalysis(true);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi phân tích xu hướng!");
      console.error("Trend analysis error:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <IconChartLine size={32} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Dự báo doanh thu</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateForecast}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <IconPlus size={16} />
            Tạo dự báo mới
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors cursor-pointer">
              <IconDownload size={16} />
              Xuất dữ liệu
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleExportData("csv")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer border-b"
              >
                <IconFileSpreadsheet size={16} />
                Xuất CSV
              </button>
              <button
                onClick={() => handleExportData("excel")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer border-b"
              >
                <IconFileSpreadsheet size={16} />
                Xuất Excel
              </button>
              <button
                onClick={() => handleExportData("pdf")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              >
                <IconDownload size={16} />
                Xuất PDF
              </button>
            </div>
          </div>

          {/* Trend Analysis Dropdown */}
          <div className="relative group">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors cursor-pointer">
              <IconChartBar size={16} />
              Phân tích xu hướng
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <button
                onClick={() => handleTrendAnalysis("week")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              >
                <IconCalendarStats size={16} />
                Xu hướng theo tuần
              </button>
              <button
                onClick={() => handleTrendAnalysis("month")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              >
                <IconTrendingUp size={16} />
                Xu hướng theo tháng
              </button>
              <button
                onClick={() => handleTrendAnalysis("year")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
              >
                <IconTrendingDown size={16} />
                Xu hướng theo năm
              </button>
            </div>
          </div>

          <button
            onClick={handleViewHistory}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <IconHistory size={16} />
            Lịch sử dự báo
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <IconRefresh size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <IconFilter size={18} />
          Bộ lọc
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô hình
            </label>
            <select
              value={filters.model}
              onChange={(e) => handleFilterChange("model", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả mô hình</option>
              {forecastingModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filters.hasActual}
              onChange={(e) => handleFilterChange("hasActual", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="true">Đã có thực tế</option>
              <option value="false">Chưa có thực tế</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng số dự báo</p>
              <p className="text-2xl font-bold text-gray-800">
                {forecasts.length}
              </p>
            </div>
            <IconChartLine size={32} className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Độ chính xác trung bình</p>
              <p className="text-2xl font-bold text-green-600">
                {forecasts.filter((f) => f.accuracy).length > 0
                  ? (
                      forecasts
                        .filter((f) => f.accuracy)
                        .reduce((sum, f) => sum + f.accuracy, 0) /
                      forecasts.filter((f) => f.accuracy).length
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <IconTrendingUp size={32} className="text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Dự báo chờ xác nhận</p>
              <p className="text-2xl font-bold text-orange-600">
                {forecasts.filter((f) => !f.actualRevenue).length}
              </p>
            </div>
            <IconCalendar size={32} className="text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Doanh thu dự báo hôm nay</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  forecasts.find(
                    (f) =>
                      f.forecastDate === new Date().toISOString().split("T")[0]
                  )?.predictedRevenue || 0
                )}
              </p>
            </div>
            <IconCurrency size={32} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị {paginatedForecasts.length} trong tổng số{" "}
        {filteredForecasts.length} dự báo
      </div>

      {/* Forecasts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Ngày dự báo</th>
              <th className="p-3">Doanh thu dự báo</th>
              <th className="p-3">Doanh thu thực tế</th>
              <th className="p-3">Mô hình</th>
              <th className="p-3">Độ chính xác</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Số yếu tố</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedForecasts.length > 0 ? (
              paginatedForecasts.map((forecast) => (
                <tr key={forecast.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono">#{forecast.id}</td>
                  <td className="p-3">{formatDate(forecast.forecastDate)}</td>
                  <td className="p-3 font-semibold text-blue-600">
                    {formatCurrency(forecast.predictedRevenue)}
                  </td>
                  <td className="p-3">
                    {forecast.actualRevenue ? (
                      <span className="font-semibold text-green-600">
                        {formatCurrency(forecast.actualRevenue)}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa có</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {forecast.model}
                    </span>
                  </td>
                  <td className="p-3">
                    {forecast.accuracy ? (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getAccuracyColor(
                          forecast.accuracy
                        )}`}
                      >
                        {forecast.accuracy.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa có</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {formatDateTime(forecast.generatedAt)}
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      {forecast.factors.length}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewForecast(forecast)}
                        className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <IconEye />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-800 p-1 cursor-pointer"
                        title="Chỉnh sửa"
                        onClick={() => handleEditForecast(forecast)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                        title="Xóa"
                        onClick={() => handleDeleteForecast(forecast)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">
                  Không có dự báo nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredForecasts.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Forecast Form Modal */}
      <ForecastForm
        isOpen={showForecastForm}
        onClose={handleCloseForecastForm}
        onSubmit={handleFormSubmit}
        forecast={editingForecast}
      />

      {/* Forecast Detail Modal */}
      <ForecastDetailModal
        forecast={selectedForecast}
        open={showDetailModal}
        onClose={handleCloseDetailModal}
      />

      {/* Forecast History Modal */}
      <ForecastHistoryModal
        forecasts={forecasts}
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onViewDetails={handleViewForecastFromHistory}
      />
    </div>
  );
}
