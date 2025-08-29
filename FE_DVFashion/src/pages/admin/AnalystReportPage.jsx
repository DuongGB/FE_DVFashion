import { useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import {
  handleExportReport,
  exportToExcel,
  exportToPDF,
} from "../../utils/exportReport";

export default function AnalystReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    revenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    productGrowth: 0,
    customerGrowth: 0,
  });

  // Các hàm export
  const handlePrint = () => {
    handleExportReport(reportData, selectedPeriod);
    setShowExportMenu(false);
  };

  const handlePDFExport = () => {
    exportToPDF(reportData, selectedPeriod);
    setShowExportMenu(false);
  };

  const handleExcelExport = () => {
    exportToExcel(reportData, selectedPeriod);
    setShowExportMenu(false);
  };

  // Dữ liệu cho biểu đồ doanh thu theo thời gian
  const revenueChartData = [
    ["Ngày", "Doanh thu (triệu VNĐ)"],
    ["Thứ 2", 12],
    ["Thứ 3", 19],
    ["Thứ 4", 15],
    ["Thứ 5", 25],
    ["Thứ 6", 22],
    ["Thứ 7", 30],
    ["Chủ nhật", 35],
  ];

  // Dữ liệu cho biểu đồ phân bổ danh mục
  const categoryChartData = [
    ["Danh mục", "Doanh thu (%)"],
    ["Áo thun", 30],
    ["Áo polo", 25],
    ["Quần short", 20],
    ["Phụ kiện", 15],
    ["Đồ bơi", 10],
  ];

  // Dữ liệu cho biểu đồ sản phẩm bán chạy
  const topProductsData = [
    ["Sản phẩm", "Số lượng bán"],
    ["Áo thun basic", 150],
    ["Polo nam", 120],
    ["Short kaki", 100],
    ["Áo tank top", 85],
    ["Quần jean", 70],
  ];

  // Dữ liệu cho biểu đồ đơn hàng theo trạng thái
  const orderStatusData = [
    ["Trạng thái", "Số lượng"],
    ["Hoàn thành", 450],
    ["Đang giao", 120],
    ["Chờ xử lý", 80],
    ["Đã hủy", 25],
  ];

  // Dữ liệu cho biểu đồ khách hàng mới
  const newCustomersData = [
    ["Tháng", "Khách hàng mới"],
    ["Tháng 1", 45],
    ["Tháng 2", 52],
    ["Tháng 3", 68],
    ["Tháng 4", 75],
    ["Tháng 5", 82],
    ["Tháng 6", 95],
  ];

  // Cấu hình cho các biểu đồ
  const chartOptions = {
    backgroundColor: "transparent",
    chartArea: { width: "80%", height: "70%" },
    legend: { position: "bottom" },
    hAxis: { textStyle: { fontSize: 12 } },
    vAxis: { textStyle: { fontSize: 12 } },
    titleTextStyle: { fontSize: 16, bold: true },
  };

  const pieChartOptions = {
    ...chartOptions,
    pieHole: 0.4,
    colors: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"],
  };

  const lineChartOptions = {
    ...chartOptions,
    curveType: "function",
    colors: ["#3b82f6"],
    pointSize: 5,
  };

  const barChartOptions = {
    ...chartOptions,
    colors: ["#22c55e"],
    bar: { groupWidth: "75%" },
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setReportData({
        revenue: 245000000,
        totalOrders: 1250,
        totalProducts: 450,
        totalCustomers: 2800,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        productGrowth: 5.2,
        customerGrowth: 15.7,
      });
      setLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4">Phân tích báo cáo</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="3months">3 tháng qua</option>
            <option value="year">Năm nay</option>
          </select>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Xuất báo cáo</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={handlePrint}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    In báo cáo
                  </button>
                  <button
                    onClick={handlePDFExport}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    Xuất PDF
                  </button>
                  <button
                    onClick={handleExcelExport}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      className="w-4 h-4 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Xuất Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowExportMenu(false)}
        ></div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng doanh thu
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(reportData.revenue)}
              </p>
            </div>
            <div className="text-green-500">
              <span className="text-sm font-medium">
                +{reportData.revenueGrowth}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.totalOrders.toLocaleString()}
              </p>
            </div>
            <div className="text-green-500">
              <span className="text-sm font-medium">
                +{reportData.orderGrowth}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.totalProducts}
              </p>
            </div>
            <div className="text-green-500">
              <span className="text-sm font-medium">
                +{reportData.productGrowth}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportData.totalCustomers.toLocaleString()}
              </p>
            </div>
            <div className="text-green-500">
              <span className="text-sm font-medium">
                +{reportData.customerGrowth}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Biểu đồ doanh thu theo ngày
          </h3>
          <Chart
            chartType="LineChart"
            width="100%"
            height="300px"
            data={revenueChartData}
            options={lineChartOptions}
          />
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Phân bổ doanh thu theo danh mục
          </h3>
          <Chart
            chartType="PieChart"
            width="100%"
            height="300px"
            data={categoryChartData}
            options={pieChartOptions}
          />
        </div>
      </div>

      {/* Charts Section Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Top sản phẩm bán chạy
          </h3>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={topProductsData}
            options={barChartOptions}
          />
        </div>

        {/* Order Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Trạng thái đơn hàng
          </h3>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={orderStatusData}
            options={{
              ...pieChartOptions,
              colors: ["#22c55e", "#3b82f6", "#eab308", "#ef4444"],
            }}
          />
        </div>
      </div>

      {/* Charts Section Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Customers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Khách hàng mới theo tháng
          </h3>
          <Chart
            chartType="AreaChart"
            width="100%"
            height="300px"
            data={newCustomersData}
            options={{
              ...chartOptions,
              colors: ["#8b5cf6"],
              areaOpacity: 0.3,
            }}
          />
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Đơn hàng gần đây
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  {
                    id: "#DH001",
                    customer: "Nguyễn Văn A",
                    value: 450000,
                    status: "Hoàn thành",
                  },
                  {
                    id: "#DH002",
                    customer: "Trần Thị B",
                    value: 320000,
                    status: "Đang giao",
                  },
                  {
                    id: "#DH003",
                    customer: "Lê Văn C",
                    value: 750000,
                    status: "Hoàn thành",
                  },
                  {
                    id: "#DH004",
                    customer: "Phạm Thị D",
                    value: 280000,
                    status: "Chờ xử lý",
                  },
                  {
                    id: "#DH005",
                    customer: "Hoàng Văn E",
                    value: 520000,
                    status: "Đang giao",
                  },
                ].map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.value)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "Hoàn thành"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Đang giao"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-6 text-gray-800">
          Chỉ số hiệu suất
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">87%</div>
            <div className="text-sm text-gray-600 mt-2">Tỷ lệ chuyển đổi</div>
            <div className="text-xs text-green-600 mt-1">
              +5% so với tháng trước
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">4.2/5</div>
            <div className="text-sm text-gray-600 mt-2">
              Đánh giá trung bình
            </div>
            <div className="text-xs text-green-600 mt-1">
              +0.3 so với tháng trước
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">24h</div>
            <div className="text-sm text-gray-600 mt-2">Thời gian xử lý TB</div>
            <div className="text-xs text-red-600 mt-1">
              +2h so với tháng trước
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">92%</div>
            <div className="text-sm text-gray-600 mt-2">Tỷ lệ hài lòng</div>
            <div className="text-xs text-green-600 mt-1">
              +3% so với tháng trước
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-center">
              Đang tải dữ liệu...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
