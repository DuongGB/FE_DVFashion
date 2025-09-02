import { toast } from "react-toastify";

/**
 * Xuất dữ liệu ra CSV với encoding UTF-8 đúng cách
 * @param {Array} data - Mảng dữ liệu cần xuất
 * @param {string} filename - Tên file (không cần extension)
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Promise<boolean>} - Success status
 */
export const exportToCSV = async (data, filename, options = {}) => {
  try {
    if (!data || data.length === 0) {
      toast.warning("Không có dữ liệu để xuất!");
      return false;
    }

    const {
      delimiter = ",",
      includeHeaders = true,
      dateFormat = "vi-VN",
      showToast = true,
    } = options;

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Format data for CSV
    const csvRows = [];

    // Add headers if needed
    if (includeHeaders) {
      csvRows.push(headers.join(delimiter));
    }

    // Add data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        let value = row[header];

        // Handle null/undefined values
        if (value === null || value === undefined) {
          return "";
        }

        // Convert to string
        value = String(value);

        // Escape commas, quotes, and newlines
        if (
          value.includes(delimiter) ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      });
      csvRows.push(values.join(delimiter));
    });

    const csvContent = csvRows.join("\n");

    // Add BOM (Byte Order Mark) for proper UTF-8 encoding
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csvContent;

    // Create blob and download
    const blob = new Blob([csvWithBOM], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}.csv`;

    // Ensure link is added to DOM for some browsers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    if (showToast) {
      toast.success("Xuất CSV thành công!");
    }

    return true;
  } catch (error) {
    console.error("CSV Export Error:", error);
    if (options.showToast !== false) {
      toast.error("Có lỗi xảy ra khi xuất CSV!");
    }
    return false;
  }
};

/**
 * Xuất dữ liệu ra Excel (XLSX format)
 * @param {Array} data - Mảng dữ liệu cần xuất
 * @param {string} filename - Tên file (không cần extension)
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Promise<boolean>} - Success status
 */
export const exportToExcel = async (data, filename, options = {}) => {
  try {
    // For now, fallback to CSV since xlsx library is not installed
    toast.info(
      "Xuất Excel dưới dạng CSV. Để xuất XLSX, cần cài đặt thư viện xlsx."
    );
    return await exportToCSV(data, filename, { ...options, showToast: false });
  } catch (error) {
    console.error("Excel Export Error:", error);
    if (options.showToast !== false) {
      toast.error("Có lỗi xảy ra khi xuất Excel!");
    }
    return false;
  }
};

/**
 * Xuất dữ liệu ra PDF
 * @param {Array} data - Mảng dữ liệu cần xuất
 * @param {string} filename - Tên file (không cần extension)
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Promise<boolean>} - Success status
 */
export const exportToPDF = async (data, filename, options = {}) => {
  try {
    // For now, show notification that PDF export is in development
    toast.info(
      "Tính năng xuất PDF đang được phát triển. Vui lòng sử dụng CSV hoặc Excel."
    );
    return false;
  } catch (error) {
    console.error("PDF Export Error:", error);
    if (options.showToast !== false) {
      toast.error("Có lỗi xảy ra khi xuất PDF!");
    }
    return false;
  }
};

/**
 * Xuất dữ liệu với format được chỉ định
 * @param {Array} data - Mảng dữ liệu cần xuất
 * @param {string} format - Format xuất ('csv', 'excel', 'pdf')
 * @param {string} filename - Tên file (không cần extension)
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Promise<boolean>} - Success status
 */
export const exportData = async (data, format, filename, options = {}) => {
  if (!data || data.length === 0) {
    toast.warning("Không có dữ liệu để xuất!");
    return false;
  }

  const timestamp = new Date().toISOString().split("T")[0];
  const finalFilename = filename || `export-${timestamp}`;

  switch (format.toLowerCase()) {
    case "csv":
      return await exportToCSV(data, finalFilename, options);
    case "excel":
    case "xlsx":
      return await exportToExcel(data, finalFilename, options);
    case "pdf":
      return await exportToPDF(data, finalFilename, options);
    default:
      toast.error(`Format không hỗ trợ: ${format}`);
      return false;
  }
};

/**
 * Format dữ liệu dự báo cho việc xuất
 * @param {Array} forecasts - Mảng dự báo
 * @param {Function} formatCurrency - Function format tiền tệ
 * @param {Function} formatDate - Function format ngày
 * @param {Function} formatDateTime - Function format ngày giờ
 * @returns {Array} - Mảng dữ liệu đã được format
 */
export const formatForecastDataForExport = (
  forecasts,
  formatCurrency,
  formatDate,
  formatDateTime
) => {
  return forecasts.map((forecast) => ({
    ID: forecast.id,
    "Ngày dự báo": formatDate(forecast.forecastDate),
    "Doanh thu dự báo": formatCurrency(forecast.predictedRevenue),
    "Doanh thu thực tế": forecast.actualRevenue
      ? formatCurrency(forecast.actualRevenue)
      : "Chưa có",
    "Mô hình": forecast.model,
    "Độ chính xác": forecast.accuracy
      ? `${forecast.accuracy.toFixed(1)}%`
      : "Chưa có",
    "Ngày tạo": formatDateTime(forecast.generatedAt),
    "Ghi chú": forecast.notes || "",
    "Số yếu tố": forecast.factors?.length || 0,
    "Trạng thái": forecast.actualRevenue ? "Đã hoàn thành" : "Chờ xác nhận",
  }));
};

/**
 * Format dữ liệu lịch sử dự báo cho việc xuất
 * @param {Array} forecasts - Mảng dự báo đã hoàn thành
 * @param {Function} formatCurrency - Function format tiền tệ
 * @param {Function} formatDate - Function format ngày
 * @param {Function} calculateVariance - Function tính độ lệch
 * @returns {Array} - Mảng dữ liệu đã được format
 */
export const formatHistoryDataForExport = (
  forecasts,
  formatCurrency,
  formatDate,
  calculateVariance
) => {
  return forecasts.map((forecast) => {
    const variance = calculateVariance
      ? calculateVariance(forecast)
      : { value: 0, isPositive: true };
    return {
      ID: forecast.id,
      "Ngày dự báo": formatDate(forecast.forecastDate),
      "Doanh thu dự báo": formatCurrency(forecast.predictedRevenue),
      "Doanh thu thực tế": formatCurrency(forecast.actualRevenue),
      "Độ chính xác": forecast.accuracy
        ? `${forecast.accuracy.toFixed(1)}%`
        : "N/A",
      "Độ lệch": `${variance.isPositive ? "+" : "-"}${variance.value}%`,
      "Mô hình": forecast.model,
      "Ghi chú": forecast.notes || "",
      "Số yếu tố": forecast.factors?.length || 0,
    };
  });
};

// Default export
export default {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportData,
  formatForecastDataForExport,
  formatHistoryDataForExport,
};
