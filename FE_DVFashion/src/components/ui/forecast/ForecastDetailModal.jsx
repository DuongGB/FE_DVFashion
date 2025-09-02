import React from "react";
import {
  IconX,
  IconChartLine,
  IconCalendar,
  IconCpu,
  IconTrendingUp,
  IconTrendingDown,
  IconWeight,
  IconClock,
  IconNotes,
  IconTarget,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";

export default function ForecastDetailModal({ forecast, open, onClose }) {
  if (!open || !forecast) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date only
  const formatDateOnly = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Chưa có";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get model info
  const getModelInfo = (model) => {
    switch (model) {
      case "Linear Regression":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          description:
            "Mô hình hồi quy tuyến tính đơn giản, phù hợp với dữ liệu có xu hướng rõ ràng",
          accuracy: "Trung bình",
          complexity: "Thấp",
        };
      case "ARIMA":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          description:
            "Mô hình chuỗi thời gian tự hồi quy tích hợp trung bình trượt",
          accuracy: "Cao",
          complexity: "Trung bình",
        };
      case "Neural Network":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          description:
            "Mạng nơ-ron nhân tạo, phù hợp với dữ liệu phức tạp và phi tuyến",
          accuracy: "Rất cao",
          complexity: "Cao",
        };
      case "Random Forest":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          description: "Ensemble learning với nhiều cây quyết định",
          accuracy: "Cao",
          complexity: "Trung bình",
        };
      case "Support Vector Machine":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          description: "Máy vector hỗ trợ, hiệu quả với dữ liệu có chiều cao",
          accuracy: "Cao",
          complexity: "Cao",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          description: "Mô hình dự báo tùy chỉnh",
          accuracy: "Không xác định",
          complexity: "Không xác định",
        };
    }
  };

  // Get accuracy info
  const getAccuracyInfo = (accuracy) => {
    if (!accuracy)
      return {
        color: "bg-gray-100 text-gray-800",
        level: "Chưa có",
        icon: IconAlertTriangle,
      };
    if (accuracy >= 95)
      return {
        color: "bg-green-100 text-green-800",
        level: "Xuất sắc",
        icon: IconCheck,
      };
    if (accuracy >= 90)
      return {
        color: "bg-yellow-100 text-yellow-800",
        level: "Tốt",
        icon: IconTrendingUp,
      };
    if (accuracy >= 80)
      return {
        color: "bg-orange-100 text-orange-800",
        level: "Trung bình",
        icon: IconTrendingDown,
      };
    return {
      color: "bg-red-100 text-red-800",
      level: "Thấp",
      icon: IconAlertTriangle,
    };
  };

  // Calculate forecast status
  const getForecastStatus = () => {
    const forecastDate = new Date(forecast.forecastDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    forecastDate.setHours(0, 0, 0, 0);

    if (forecastDate < today) {
      return forecast.actualRevenue
        ? {
            status: "Đã hoàn thành",
            color: "bg-green-100 text-green-800",
            icon: IconCheck,
          }
        : {
            status: "Chờ cập nhật",
            color: "bg-yellow-100 text-yellow-800",
            icon: IconAlertTriangle,
          };
    } else if (forecastDate.getTime() === today.getTime()) {
      return {
        status: "Đang diễn ra",
        color: "bg-blue-100 text-blue-800",
        icon: IconTrendingUp,
      };
    } else {
      return {
        status: "Sắp tới",
        color: "bg-purple-100 text-purple-800",
        icon: IconCalendar,
      };
    }
  };

  // Calculate variance
  const calculateVariance = () => {
    if (!forecast.actualRevenue || !forecast.predictedRevenue) return null;

    const variance =
      ((forecast.actualRevenue - forecast.predictedRevenue) /
        forecast.predictedRevenue) *
      100;
    return {
      value: Math.abs(variance).toFixed(2),
      isPositive: variance >= 0,
      difference: Math.abs(forecast.actualRevenue - forecast.predictedRevenue),
    };
  };

  const modelInfo = getModelInfo(forecast.model);
  const accuracyInfo = getAccuracyInfo(forecast.accuracy);
  const forecastStatus = getForecastStatus();
  const variance = calculateVariance();
  const AccuracyIcon = accuracyInfo.icon;
  const StatusIcon = forecastStatus.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconChartLine size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết dự báo #{forecast.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Forecast Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Visual Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center border border-blue-200">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  <IconChartLine size={32} />
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Dự báo ngày {formatDateOnly(forecast.forecastDate)}
                </h3>
                <div className="space-y-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${modelInfo.color}`}
                  >
                    {forecast.model}
                  </span>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-2 border ${forecastStatus.color}`}
                  >
                    <StatusIcon size={14} className="inline mr-1" />
                    {forecastStatus.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="lg:col-span-3 space-y-4">
              {/* Revenue Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconTrendingUp size={18} />
                  Thông tin doanh thu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600 mb-1">Dự báo</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(forecast.predictedRevenue)}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600 mb-1">Thực tế</div>
                    <div className="text-xl font-bold text-green-600">
                      {forecast.actualRevenue
                        ? formatCurrency(forecast.actualRevenue)
                        : "Chưa có"}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600 mb-1">Độ lệch</div>
                    {variance ? (
                      <div
                        className={`text-xl font-bold ${
                          variance.isPositive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {variance.isPositive ? "+" : "-"}
                        {variance.value}%
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-gray-400">N/A</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accuracy & Model Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconTarget size={18} />
                  Hiệu suất mô hình
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-600">Độ chính xác:</strong>
                    {forecast.accuracy ? (
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${accuracyInfo.color}`}
                      >
                        <AccuracyIcon size={14} />
                        {forecast.accuracy.toFixed(1)}% - {accuracyInfo.level}
                      </span>
                    ) : (
                      <span className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        <IconAlertTriangle size={14} className="inline mr-1" />
                        Chưa có
                      </span>
                    )}
                  </div>
                  <div>
                    <strong className="text-gray-600">Độ phức tạp:</strong>
                    <span className="ml-2 text-gray-800 font-medium">
                      {modelInfo.complexity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Details */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconCpu size={18} />
              Thông tin mô hình
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Mô hình sử dụng:</strong>
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${modelInfo.color}`}
                >
                  {forecast.model}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">
                  Độ chính xác ước tính:
                </strong>
                <span className="ml-2 text-gray-800 font-medium">
                  {modelInfo.accuracy}
                </span>
              </div>
              <div className="md:col-span-2">
                <strong className="text-gray-600">Mô tả:</strong>
                <p className="ml-2 mt-1 text-gray-700 italic">
                  {modelInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Forecasting Factors */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconWeight size={18} />
              Yếu tố dự báo
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left">Tên yếu tố</th>
                    <th className="p-3 text-center">Trọng số</th>
                    <th className="p-3 text-left">Giá trị</th>
                    <th className="p-3 text-center">Mức độ ảnh hưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.factors.map((factor, index) => {
                    const influence =
                      factor.weight >= 0.4
                        ? "Cao"
                        : factor.weight >= 0.2
                        ? "Trung bình"
                        : "Thấp";
                    const influenceColor =
                      factor.weight >= 0.4
                        ? "bg-red-100 text-red-800"
                        : factor.weight >= 0.2
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800";

                    return (
                      <tr
                        key={factor.id || index}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3 font-medium">{factor.factorName}</td>
                        <td className="p-3 text-center">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {(factor.weight * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {factor.value}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${influenceColor}`}
                          >
                            {influence}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Factor Summary */}
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-blue-800">
                  Tổng số yếu tố:
                </span>
                <span className="font-bold text-blue-600">
                  {forecast.factors.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="font-medium text-blue-800">
                  Tổng trọng số:
                </span>
                <span className="font-bold text-blue-600">
                  {forecast.factors
                    .reduce((sum, f) => sum + f.weight, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Variance Analysis */}
          {variance && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconTarget size={18} />
                Phân tích độ lệch
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border text-center">
                  <div
                    className={`text-2xl font-bold ${
                      variance.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {variance.isPositive ? "+" : ""}
                    {variance.value}%
                  </div>
                  <div className="text-sm text-gray-600">Độ lệch phần trăm</div>
                </div>
                <div className="bg-white p-4 rounded border text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(variance.difference)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Chênh lệch tuyệt đối
                  </div>
                </div>
                <div className="bg-white p-4 rounded border text-center">
                  <div
                    className={`text-2xl font-bold ${
                      variance.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {variance.isPositive ? "Vượt" : "Thiếu"}
                  </div>
                  <div className="text-sm text-gray-600">So với dự báo</div>
                </div>
              </div>
              <div
                className="mt-3 p-3 rounded"
                style={{
                  backgroundColor: variance.isPositive ? "#f0f9ff" : "#fef2f2",
                  border: `1px solid ${
                    variance.isPositive ? "#3b82f6" : "#ef4444"
                  }20`,
                }}
              >
                <p
                  className={`text-sm ${
                    variance.isPositive ? "text-blue-700" : "text-red-700"
                  }`}
                >
                  <strong>Phân tích:</strong> Doanh thu thực tế{" "}
                  {variance.isPositive ? "cao hơn" : "thấp hơn"}
                  dự báo {variance.value}%.{" "}
                  {variance.isPositive
                    ? "Đây là kết quả tích cực, cho thấy thị trường hoặc các chiến lược kinh doanh có hiệu quả tốt hơn dự kiến."
                    : "Cần xem xét lại các yếu tố ảnh hưởng và điều chỉnh mô hình dự báo."}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {forecast.notes && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconNotes size={18} />
                Ghi chú
              </h3>
              <div className="bg-white p-3 rounded border">
                <p className="text-gray-700 italic">"{forecast.notes}"</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconClock size={18} />
              Thông tin thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Ngày dự báo:</strong>
                <span className="ml-2 text-gray-800 font-medium">
                  {formatDateOnly(forecast.forecastDate)}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Thời gian tạo:</strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(forecast.generatedAt)}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Cập nhật lần cuối:</strong>
                <span className="ml-2 text-gray-800">
                  {forecast.updatedAt
                    ? formatDate(forecast.updatedAt)
                    : "Chưa cập nhật"}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Thời gian tồn tại:</strong>
                <span className="ml-2 text-gray-800 font-medium">
                  {(() => {
                    const days = Math.floor(
                      (new Date() - new Date(forecast.generatedAt)) /
                        (1000 * 60 * 60 * 24)
                    );
                    if (days === 0) return "Hôm nay";
                    if (days === 1) return "1 ngày";
                    return `${days} ngày`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
