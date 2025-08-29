import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  IconPackage,
  IconShoppingCart,
  IconUsers,
  IconStar,
  IconTruck,
  IconClock,
  IconCheck,
  IconX,
  IconEye,
  IconEdit,
  IconBell,
  IconTrendingUp,
  IconAlertCircle,
} from "@tabler/icons-react";

const StaffPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    todayOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulated API call for staff dashboard
    setDashboardData({
      totalOrders: 156,
      pendingOrders: 23,
      completedOrders: 128,
      canceledOrders: 5,
      totalProducts: 342,
      lowStockProducts: 12,
      totalCustomers: 89,
      todayOrders: 8,
    });

    // Mock recent orders
    setRecentOrders([
      {
        id: "ORD-001234",
        customer: "Nguyễn Văn A",
        total: 250000,
        status: "pending",
        time: "10:30 AM",
        items: 2,
      },
      {
        id: "ORD-001235",
        customer: "Trần Thị B",
        total: 180000,
        status: "processing",
        time: "11:15 AM",
        items: 1,
      },
      {
        id: "ORD-001236",
        customer: "Lê Văn C",
        total: 320000,
        status: "shipping",
        time: "12:00 PM",
        items: 3,
      },
      {
        id: "ORD-001237",
        customer: "Phạm Thị D",
        total: 150000,
        status: "completed",
        time: "02:30 PM",
        items: 1,
      },
      {
        id: "ORD-001238",
        customer: "Hoàng Văn E",
        total: 420000,
        status: "pending",
        time: "03:45 PM",
        items: 4,
      },
    ]);

    // Mock notifications
    setNotifications([
      {
        id: 1,
        type: "order",
        message: "Đơn hàng mới #ORD-001239",
        time: "2 phút trước",
        isRead: false,
      },
      {
        id: 2,
        type: "stock",
        message: "Sản phẩm 'Áo thun basic' sắp hết hàng",
        time: "15 phút trước",
        isRead: false,
      },
      {
        id: 3,
        type: "customer",
        message: "Khách hàng yêu cầu hỗ trợ",
        time: "30 phút trước",
        isRead: true,
      },
    ]);
  }, []);

  const StatCard = ({
    icon: Icon,
    title,
    value,
    color = "blue",
    trend,
    onClick,
  }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
      indigo: "bg-indigo-500",
    };

    return (
      <div
        className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${
          onClick
            ? "cursor-pointer hover:shadow-lg transition-shadow duration-200"
            : ""
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p
                className={`text-sm flex items-center mt-1 ${
                  trend >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <IconTrendingUp size={16} className="mr-1" />
                {trend >= 0 ? "+" : ""}
                {trend}% hôm nay
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

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipping: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipping: "Đang giao",
      completed: "Hoàn thành",
      canceled: "Đã hủy",
    };
    return texts[status] || status;
  };

  const RecentOrders = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Đơn hàng gần đây
        </h3>
        <button
          onClick={() => navigate("/staff/orders")}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Xem tất cả
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm font-medium text-gray-600">
                Mã đơn
              </th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">
                Khách hàng
              </th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">
                Tổng tiền
              </th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">
                Trạng thái
              </th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">
                Thời gian
              </th>
              <th className="text-left py-2 text-sm font-medium text-gray-600">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 text-sm font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="py-3 text-sm text-gray-600">{order.customer}</td>
                <td className="py-3 text-sm text-gray-900">
                  {order.total.toLocaleString()} đ
                </td>
                <td className="py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-600">{order.time}</td>
                <td className="py-3">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <IconEye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <IconEdit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const NotificationPanel = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo</h3>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${
              notification.isRead
                ? "bg-gray-50 border-gray-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-1 rounded-full ${
                  notification.type === "order"
                    ? "bg-blue-100"
                    : notification.type === "stock"
                    ? "bg-yellow-100"
                    : "bg-green-100"
                }`}
              >
                {notification.type === "order" && (
                  <IconShoppingCart size={16} className="text-blue-600" />
                )}
                {notification.type === "stock" && (
                  <IconAlertCircle size={16} className="text-yellow-600" />
                )}
                {notification.type === "customer" && (
                  <IconUsers size={16} className="text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.time}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Thao tác nhanh
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/staff/orders/new")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <IconShoppingCart size={16} />
          <span>Tạo đơn hàng</span>
        </button>
        <button
          onClick={() => navigate("/staff/products")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <IconPackage size={16} />
          <span>Quản lý kho</span>
        </button>
        <button
          onClick={() => navigate("/staff/customers")}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <IconUsers size={16} />
          <span>Khách hàng</span>
        </button>
        <button
          onClick={() => navigate("/staff/support")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <IconBell size={16} />
          <span>Hỗ trợ</span>
        </button>
      </div>
    </div>
  );

  const TaskList = () => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Công việc hôm nay
      </h3>
      <div className="space-y-3">
        {[
          {
            task: "Xử lý 23 đơn hàng chờ duyệt",
            priority: "high",
            completed: false,
          },
          {
            task: "Kiểm tra 12 sản phẩm sắp hết hàng",
            priority: "medium",
            completed: false,
          },
          {
            task: "Trả lời 5 câu hỏi khách hàng",
            priority: "medium",
            completed: true,
          },
          {
            task: "Cập nhật thông tin sản phẩm mới",
            priority: "low",
            completed: false,
          },
          {
            task: "Gọi điện xác nhận đơn hàng lớn",
            priority: "high",
            completed: false,
          },
        ].map((item, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
          >
            <input
              type="checkbox"
              checked={item.completed}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
              onChange={() => {}}
            />
            <div className="flex-1">
              <p
                className={`text-sm ${
                  item.completed
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {item.task}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.priority === "high"
                  ? "bg-red-100 text-red-800"
                  : item.priority === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {item.priority === "high"
                ? "Cao"
                : item.priority === "medium"
                ? "Trung bình"
                : "Thấp"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng, {user?.name || "Nhân viên"}!
          </h1>
          <p className="text-gray-600">
            Hôm nay là ngày {new Date().toLocaleDateString("vi-VN")} - Hãy bắt
            đầu công việc hiệu quả!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={IconShoppingCart}
            title="Đơn hàng hôm nay"
            value={dashboardData.todayOrders}
            color="blue"
            trend={12}
            onClick={() => navigate("/staff/orders")}
          />
          <StatCard
            icon={IconClock}
            title="Đơn chờ xử lý"
            value={dashboardData.pendingOrders}
            color="yellow"
            onClick={() => navigate("/staff/orders?status=pending")}
          />
          <StatCard
            icon={IconPackage}
            title="Sản phẩm sắp hết"
            value={dashboardData.lowStockProducts}
            color="red"
            onClick={() => navigate("/staff/products?filter=low-stock")}
          />
          <StatCard
            icon={IconUsers}
            title="Khách hàng mới"
            value={dashboardData.totalCustomers}
            color="green"
            trend={8}
            onClick={() => navigate("/staff/customers")}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <NotificationPanel />

          {/* Task List */}
          <TaskList />
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
