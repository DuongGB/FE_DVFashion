import {
  IconCalendar,
  IconChartBar,
  IconCurrencyDollar,
  IconDiscount,
  IconEye,
  IconPackage,
  IconShoppingCart,
  IconStar,
  IconTrendingUp,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    activeCustomers: 0,
    averageRating: 0,
    dailyViews: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLanguageChange = () => {};
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

        setDashboardData({
          totalUsers: 1247,
          totalProducts: 342,
          totalOrders: 856,
          totalRevenue: 125000000,
          monthlyRevenue: 28500000,
          pendingOrders: 23,
          activeCustomers: 189,
          averageRating: 4.8,
          dailyViews: 2400,
        });

        setRevenueChartData([
          [
            t("admin.dashboard.charts.month"),
            t("admin.dashboard.charts.revenue_label"),
            t("admin.dashboard.charts.orders_label"),
          ],
          [t("admin.dashboard.charts.month_1"), 18500000, 120],
          [t("admin.dashboard.charts.month_2"), 22000000, 145],
          [t("admin.dashboard.charts.month_3"), 19800000, 132],
          [t("admin.dashboard.charts.month_4"), 25200000, 168],
          [t("admin.dashboard.charts.month_5"), 24800000, 162],
          [t("admin.dashboard.charts.month_6"), 28500000, 189],
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    color = "blue",
    format = "number",
  }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      indigo: "bg-indigo-500",
    };

    const formatValue = (val) => {
      if (format === "currency") return formatCurrency(val);
      if (format === "rating") return val.toFixed(1);
      if (format === "percentage") return `${val}%`;
      return val.toLocaleString();
    };

    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatValue(value)}
            </p>
            {change !== undefined && (
              <p
                className={`text-sm flex items-center mt-2 ${
                  change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <IconTrendingUp
                  size={16}
                  className={`mr-1 ${change < 0 ? "rotate-180" : ""}`}
                />
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

  const RevenueChart = () => {
    const options = {
      title: t("admin.dashboard.charts.revenue_chart_title"),
      titleTextStyle: {
        color: "#374151",
        fontSize: 18,
        fontName: "system-ui, -apple-system, sans-serif",
        bold: true,
      },
      backgroundColor: "transparent",
      hAxis: {
        title: t("admin.dashboard.charts.month"),
        titleTextStyle: { color: "#6B7280", fontSize: 12 },
        textStyle: { color: "#6B7280", fontSize: 11 },
        gridlines: { color: "#F3F4F6" },
      },
      vAxes: {
        0: {
          title: t("admin.dashboard.charts.revenue_label"),
          titleTextStyle: { color: "#3B82F6", fontSize: 12 },
          textStyle: { color: "#6B7280", fontSize: 11 },
          format: "#,###",
          gridlines: { color: "#F3F4F6" },
        },
        1: {
          title: t("admin.dashboard.charts.orders_label"),
          titleTextStyle: { color: "#10B981", fontSize: 12 },
          textStyle: { color: "#6B7280", fontSize: 11 },
          gridlines: { color: "transparent" },
        },
      },
      series: {
        0: {
          type: "columns",
          targetAxisIndex: 0,
          color: "#3B82F6",
        },
        1: {
          type: "line",
          targetAxisIndex: 1,
          color: "#10B981",
          lineWidth: 3,
          pointSize: 5,
        },
      },
      legend: {
        position: "top",
        alignment: "start",
        textStyle: { color: "#6B7280", fontSize: 12 },
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
                <p className="text-gray-500 text-sm">
                  {t("admin.dashboard.charts.loading")}
                </p>
              </div>
            </div>
          }
        />
      </div>
    );
  };

  const RecentActivity = () => {
    const activities = [
      {
        action: t("admin.dashboard.recent_activity.activities.new_order"),
        detail: "#ORD-001234",
        time: t("admin.dashboard.recent_activity.time.minutes_ago", {
          count: 5,
        }),
        type: "order",
      },
      {
        action: t("admin.dashboard.recent_activity.activities.new_customer"),
        detail: "Nguyễn Văn A",
        time: t("admin.dashboard.recent_activity.time.minutes_ago", {
          count: 10,
        }),
        type: "user",
      },
      {
        action: t("admin.dashboard.recent_activity.activities.product_update"),
        detail: t("admin.dashboard.top_products.sample_products.basic_tshirt"),
        time: t("admin.dashboard.recent_activity.time.minutes_ago", {
          count: 15,
        }),
        type: "product",
      },
      {
        action: t("admin.dashboard.recent_activity.activities.new_review"),
        detail: "5 sao - Áo sơ mi",
        time: t("admin.dashboard.recent_activity.time.minutes_ago", {
          count: 20,
        }),
        type: "review",
      },
      {
        action: t(
          "admin.dashboard.recent_activity.activities.payment_completed"
        ),
        detail: "#PAY-005678",
        time: t("admin.dashboard.recent_activity.time.minutes_ago", {
          count: 25,
        }),
        type: "payment",
      },
    ];

    const getActivityColor = (type) => {
      const colors = {
        order: "bg-blue-500",
        user: "bg-green-500",
        product: "bg-yellow-500",
        review: "bg-purple-500",
        payment: "bg-indigo-500",
      };
      return colors[type] || "bg-gray-500";
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("admin.dashboard.recent_activity.title")}
        </h3>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
            >
              <div
                className={`w-2 h-2 rounded-full ${getActivityColor(
                  activity.type
                )}`}
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
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => navigate("/admin/activity-log")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {t("admin.dashboard.recent_activity.view_all")}
          </button>
        </div>
      </div>
    );
  };

  const QuickActions = () => {
    const actions = [
      {
        label: t("admin.dashboard.quick_actions.manage_products"),
        icon: IconPackage,
        color: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300",
        route: "/admin/products",
      },
      {
        label: t("admin.dashboard.quick_actions.manage_orders"),
        icon: IconShoppingCart,
        color: "bg-green-500 hover:bg-green-600 focus:ring-green-300",
        route: "/admin/orders",
      },
      {
        label: t("admin.dashboard.quick_actions.manage_customers"),
        icon: IconUsers,
        color: "bg-purple-500 hover:bg-purple-600 focus:ring-purple-300",
        route: "/admin/customers",
      },
      {
        label: t("admin.dashboard.quick_actions.reports_analytics"),
        icon: IconChartBar,
        color: "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-300",
        route: "/admin/reports",
      },
      {
        label: t("admin.dashboard.quick_actions.manage_promotions"),
        icon: IconDiscount,
        color: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300",
        route: "/admin/promotions",
      },
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("admin.dashboard.quick_actions.title")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.route)}
              className={`${action.color} text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center space-x-2`}
            >
              <action.icon size={16} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const TopProducts = () => {
    const products = [
      { name: "Áo thun nam basic", sales: 234, revenue: 4200000 },
      { name: "Quần jeans slim fit", sales: 189, revenue: 3800000 },
      { name: "Áo sơ mi công sở", sales: 156, revenue: 3100000 },
      { name: "Giày sneaker trắng", sales: 143, revenue: 2900000 },
      { name: "Áo hoodie unisex", sales: 128, revenue: 2500000 },
    ];

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("admin.dashboard.top_products.title")}
          </h3>
          <button
            onClick={() => navigate("/admin/products")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {t("admin.dashboard.top_products.view_all")}
          </button>
        </div>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600">
                    #{index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {t("admin.dashboard.top_products.sold", {
                      count: product.sales,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={IconUsers}
            title={t("admin.dashboard.stats.total_customers")}
            value={dashboardData.totalUsers}
            change={12}
            color="blue"
          />
          <StatCard
            icon={IconPackage}
            title={t("admin.dashboard.stats.total_products")}
            value={dashboardData.totalProducts}
            change={5}
            color="green"
          />
          <StatCard
            icon={IconShoppingCart}
            title={t("admin.dashboard.stats.total_orders")}
            value={dashboardData.totalOrders}
            change={18}
            color="yellow"
          />
          <StatCard
            icon={IconCurrencyDollar}
            title={t("admin.dashboard.stats.monthly_revenue")}
            value={dashboardData.monthlyRevenue}
            change={23}
            color="purple"
            format="currency"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={IconCalendar}
            title={t("admin.dashboard.stats.pending_orders")}
            value={dashboardData.pendingOrders}
            color="red"
          />
          <StatCard
            icon={IconUserCheck}
            title={t("admin.dashboard.stats.active_customers")}
            value={dashboardData.activeCustomers}
            color="indigo"
          />
          <StatCard
            icon={IconStar}
            title={t("admin.dashboard.stats.average_rating")}
            value={dashboardData.averageRating}
            color="yellow"
            format="rating"
          />
          <StatCard
            icon={IconEye}
            title={t("admin.dashboard.stats.daily_views")}
            value={dashboardData.dailyViews}
            change={8}
            color="green"
          />
        </div>

        {/* Charts and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("admin.dashboard.charts.revenue_title")}
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">
                    {t("admin.dashboard.charts.revenue")}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">
                    {t("admin.dashboard.charts.orders")}
                  </span>
                </div>
              </div>
            </div>
            <RevenueChart />
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Activity and Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <TopProducts />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
