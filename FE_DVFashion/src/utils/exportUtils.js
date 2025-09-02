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
 * Tạo Excel file từ dữ liệu JSON mà không cần thư viện external
 * @param {Array} data - Mảng dữ liệu cần xuất
 * @param {string} filename - Tên file (không cần extension)
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Promise<boolean>} - Success status
 */
export const exportToExcel = async (data, filename, options = {}) => {
  try {
    if (!data || data.length === 0) {
      toast.warning("Không có dữ liệu để xuất!");
      return false;
    }

    const { showToast = true } = options;

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create Excel XML content
    let excelContent = `<?xml version="1.0" encoding="UTF-8"?>
    <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
              xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:x="urn:schemas-microsoft-com:office:excel"
              xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
              xmlns:html="http://www.w3.org/TR/REC-html40">
      <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
        <Title>Dự báo doanh thu</Title>
        <Author>DVFashion System</Author>
        <Created>${new Date().toISOString()}</Created>
      </DocumentProperties>
      <Worksheet ss:Name="Dự báo doanh thu">
        <Table>`;

    // Add header row
    excelContent += "<Row>";
    headers.forEach((header) => {
      excelContent += `<Cell><Data ss:Type="String">${header}</Data></Cell>`;
    });
    excelContent += "</Row>";

    // Add data rows
    data.forEach((row) => {
      excelContent += "<Row>";
      headers.forEach((header) => {
        let value = row[header];
        let dataType = "String";

        if (value === null || value === undefined) {
          value = "";
        } else {
          value = String(value);
          // Check if value is a number (for currency values)
          if (!isNaN(value.replace(/[₫,\s]/g, "")) && value.includes("₫")) {
            dataType = "String"; // Keep as string for formatted currency
          } else if (!isNaN(value) && value !== "") {
            dataType = "Number";
          }
        }

        // Escape XML characters
        value = value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

        excelContent += `<Cell><Data ss:Type="${dataType}">${value}</Data></Cell>`;
      });
      excelContent += "</Row>";
    });

    excelContent += `
        </Table>
      </Worksheet>
    </Workbook>`;

    // Create blob and download
    const blob = new Blob([excelContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}.xls`;

    // Ensure link is added to DOM for some browsers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    if (showToast) {
      toast.success("Xuất Excel thành công!");
    }

    return true;
  } catch (error) {
    console.error("Excel Export Error:", error);
    if (options.showToast !== false) {
      toast.error("Có lỗi xảy ra khi xuất Excel!");
    }
    return false;
  }
};

/**
 * Xuất dữ liệu ra PDF sử dụng HTML canvas và jsPDF simulation
 * @param {Array} data - Mảng dữ liệu cần xuất
 * @param {string} filename - Tên file (không cần extension)
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Promise<boolean>} - Success status
 */
export const exportToPDF = async (data, filename, options = {}) => {
  try {
    if (!data || data.length === 0) {
      toast.warning("Không có dữ liệu để xuất!");
      return false;
    }

    // Create HTML content for PDF
    const headers = Object.keys(data[0]);

    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Dự báo doanh thu</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px;
          font-size: 12px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #333;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BÁO CÁO DỰ BÁO DOANH THU</h1>
        <p>Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}</p>
        <p>Tổng số bản ghi: ${data.length}</p>
      </div>
      <table>
        <thead>
          <tr>`;

    headers.forEach((header) => {
      htmlContent += `<th>${header}</th>`;
    });

    htmlContent += `</tr></thead><tbody>`;

    data.forEach((row) => {
      htmlContent += "<tr>";
      headers.forEach((header) => {
        const value = row[header] || "";
        htmlContent += `<td>${value}</td>`;
      });
      htmlContent += "</tr>";
    });

    htmlContent += `
        </tbody>
      </table>
    </body>
    </html>`;

    // Create blob and download as HTML (can be converted to PDF by browser)
    const blob = new Blob([htmlContent], {
      type: "text/html;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${filename}.html`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success(
      "Đã xuất file HTML. Bạn có thể in thành PDF từ trình duyệt (Ctrl+P)."
    );
    return true;
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
    case "xls":
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
