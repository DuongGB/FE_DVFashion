import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconUsers,
  IconPackage,
  IconShoppingCart,
  IconCurrencyDollar,
  IconTrendingUp,
  IconCalendar,
  IconEye,
  IconUserCheck,
  IconStar,
} from "@tabler/icons-react";
import { Chart } from "react-google-charts";

const AdminPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    activeCustomers: 0,
    averageRating: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulated API call
    setDashboardData({
      totalUsers: 1247,
      totalProducts: 342,
      totalOrders: 856,
      totalRevenue: 125000,
      monthlyRevenue: 28500,
      pendingOrders: 23,
      activeCustomers: 189,
      averageRating: 4.8,
    });
    setRevenueChartData([
      ["Tháng", "Doanh thu (VNĐ)", "Số đơn hàng"],
      ["Tháng 1", 18500000, 120],
      ["Tháng 2", 22000000, 145],
      ["Tháng 3", 19800000, 132],
      ["Tháng 4", 25200000, 168],
      ["Tháng 5", 24800000, 162],
      ["Tháng 6", 28500000, 189],
    ]);
  }, []);

  const StatCard = ({ icon: Icon, title, value, change, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      indigo: "bg-indigo-500",
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p
                className={`text-sm ${
                  change >= 0 ? "text-green-600" : "text-red-600"
                } flex items-center`}
              >
                <IconTrendingUp size={16} className="mr-1" />
                {change >= 0 ? "+" : ""}
                {change}% từ tháng trước
              </p>
            )}
          </div>
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </div>
    );
  };

  // Revenue Chart Component với Tailwind CSS
  const RevenueChart = () => {
    const options = {
      title: "Doanh thu và Đơn hàng theo tháng",
      titleTextStyle: {
        color: "#374151", // gray-700
        fontSize: 16,
        fontName: "system-ui, -apple-system, sans-serif",
        bold: true,
      },
      backgroundColor: "transparent",
      hAxis: {
        title: "Tháng",
        titleTextStyle: {
          color: "#6B7280", // gray-500
          fontSize: 12,
        },
        textStyle: {
          color: "#6B7280", // gray-500
          fontSize: 11,
        },
        gridlines: {
          color: "#F3F4F6", // gray-100
        },
      },
      vAxes: {
        0: {
          title: "Doanh thu (VNĐ)",
          titleTextStyle: {
            color: "#3B82F6", // blue-500
            fontSize: 12,
          },
          textStyle: {
            color: "#6B7280", // gray-500
            fontSize: 11,
          },
          format: "#,###",
          gridlines: {
            color: "#F3F4F6", // gray-100
          },
        },
        1: {
          title: "Số đơn hàng",
          titleTextStyle: {
            color: "#10B981", // green-500
            fontSize: 12,
          },
          textStyle: {
            color: "#6B7280", // gray-500
            fontSize: 11,
          },
          gridlines: {
            color: "transparent",
          },
        },
      },
      series: {
        0: {
          type: "columns",
          targetAxisIndex: 0,
          color: "#3B82F6", // blue-500
        },
        1: {
          type: "line",
          targetAxisIndex: 1,
          color: "#10B981", // green-500
          lineWidth: 3,
          pointSize: 5,
        },
      },
      legend: {
        position: "top",
        alignment: "start",
        textStyle: {
          color: "#6B7280", // gray-500
          fontSize: 12,
        },
      },
      chartArea: {
        left: 80,
        top: 80,
        width: "80%",
        height: "75%",
        backgroundColor: "transparent",
      },
    };

    return (
      <div className="w-full h-80">
        <Chart
          chartType="ComboChart"
          width="100%"
          height="100%"
          data={revenueChartData}
          options={options}
          loader={
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 text-sm">Đang tải biểu đồ...</p>
              </div>
            </div>
          }
        />
      </div>
    );
  };

  const RecentActivity = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Hoạt động gần đây
      </h3>
      <div className="space-y-4">
        {[
          {
            action: "Đơn hàng mới",
            detail: "#ORD-001234",
            time: "5 phút trước",
            type: "order",
          },
          {
            action: "Khách hàng mới",
            detail: "Nguyễn Văn A",
            time: "10 phút trước",
            type: "user",
          },
          {
            action: "Sản phẩm cập nhật",
            detail: "Áo thun nam basic",
            time: "15 phút trước",
            type: "product",
          },
          {
            action: "Đánh giá mới",
            detail: "5 sao - Áo sơ mi",
            time: "20 phút trước",
            type: "review",
          },
          {
            action: "Thanh toán hoàn thành",
            detail: "#PAY-005678",
            time: "25 phút trước",
            type: "payment",
          },
        ].map((activity, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                activity.type === "order"
                  ? "bg-blue-500"
                  : activity.type === "user"
                  ? "bg-green-500"
                  : activity.type === "product"
                  ? "bg-yellow-500"
                  : activity.type === "review"
                  ? "bg-purple-500"
                  : "bg-indigo-500"
              }`}
            ></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.action}
              </p>
              <p className="text-sm text-gray-600">{activity.detail}</p>
            </div>
            <span className="text-xs text-gray-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const QuickActions = () => {
    const handleActionClick = (actionType) => {
      switch (actionType) {
        case "addAccount":
          navigate("/admin/users/add");
          break;
        case "manageOrders":
          navigate("/admin/orders");
          break;
        case "viewReports":
          navigate("/admin/reports");
          break;
        case "managePromotions":
          navigate("/admin/promotions");
          break;
        default:
          console.log("Unknown action:", actionType);
      }
    };

    const actions = [
      {
        label: "Thêm tài khoản",
        color: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300",
        type: "addAccount",
      },
      {
        label: "Quản lý đơn hàng",
        color: "bg-green-500 hover:bg-green-600 focus:ring-green-300",
        type: "manageOrders",
      },
      {
        label: "Xem báo cáo",
        color: "bg-purple-500 hover:bg-purple-600 focus:ring-purple-300",
        type: "viewReports",
      },
      {
        label: "Quản lý khuyến mãi",
        color: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300",
        type: "managePromotions",
      },
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action.type)}
              className={`${action.color} text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95 cursor-pointer`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-4"> Admin</h1>
          <p className="text-gray-600 mb-2">
            Chào mừng trở lại! Đây là tổng quan về hệ thống.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={IconUsers}
            title="Tổng khách hàng"
            value={dashboardData.totalUsers.toLocaleString()}
            change={12}
            color="blue"
          />
          <StatCard
            icon={IconPackage}
            title="Tổng sản phẩm"
            value={dashboardData.totalProducts.toLocaleString()}
            change={5}
            color="green"
          />
          <StatCard
            icon={IconShoppingCart}
            title="Tổng đơn hàng"
            value={dashboardData.totalOrders.toLocaleString()}
            change={18}
            color="yellow"
          />
          <StatCard
            icon={IconCurrencyDollar}
            title="Doanh thu tháng"
            value={`${(dashboardData.monthlyRevenue / 1000).toFixed(0)}K`}
            change={23}
            color="purple"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={IconCalendar}
            title="Đơn hàng chờ xử lý"
            value={dashboardData.pendingOrders}
            color="red"
          />
          <StatCard
            icon={IconUserCheck}
            title="Khách hàng hoạt động"
            value={dashboardData.activeCustomers}
            color="indigo"
          />
          <StatCard
            icon={IconStar}
            title="Đánh giá trung bình"
            value={dashboardData.averageRating}
            color="yellow"
          />
          <StatCard
            icon={IconEye}
            title="Lượt xem hôm nay"
            value="2.4K"
            change={8}
            color="green"
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Doanh thu theo tháng
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Doanh thu</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Đơn hàng</span>
                </div>
              </div>
            </div>
            <RevenueChart />
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Recent Activity and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sản phẩm bán chạy
            </h3>
            <div className="space-y-4">
              {[
                { name: "Áo thun nam basic", sales: 234, revenue: "4.2M" },
                { name: "Quần jeans slim fit", sales: 189, revenue: "3.8M" },
                { name: "Áo sơ mi công sở", sales: 156, revenue: "3.1M" },
                { name: "Giày sneaker trắng", sales: 143, revenue: "2.9M" },
                { name: "Áo hoodie unisex", sales: 128, revenue: "2.5M" },
              ].map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.sales} đã bán
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {product.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
