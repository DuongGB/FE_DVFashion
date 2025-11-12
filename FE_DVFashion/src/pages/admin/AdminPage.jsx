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
  IconBulb,
  IconClick,
  IconShoppingBag,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-google-charts";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useDashboardStats,
  useRevenueChartData,
  useTopProducts,
  useRecentActivities,
} from "../../hooks/useDashboard";
import {
  useTopRecommendedProducts,
  useRecommendationAnalytics,
} from "../../hooks/useProductRecomendations";
import { useMonthlyRevenue } from "../../hooks/useStatistics";
import { useOrderStatistics } from "../../hooks/useOrder";
import { useUser } from "../../hooks/useUser";

const AdminPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [recommendationDays, setRecommendationDays] = useState(30);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${currentMonth
    .toString()
    .padStart(2, "0")}`;

  const { data: monthlyRevenueData, isLoading: isMonthlyRevenueLoading } =
    useMonthlyRevenue({ year: currentYear });

  const currentMonthRevenue =
    monthlyRevenueData?.find((item) => item.period === currentMonthStr)
      ?.revenue || 0;

  // Lấy thống kê đơn hàng
  const { data: orderStats, isLoading: orderStatsLoading } =
    useOrderStatistics();

  // Fetch real data from API
  const { data: dashboardData, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueChartData();
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts();
  const { data: recentActivities, isLoading: activitiesLoading } =
    useRecentActivities();

  // Lấy danh sách khách hàng
  const { users, isLoadingUsers } = useUser();

  // Fetch recommendation data
  const { data: topRecommendedProducts, isLoading: topRecommendedLoading } =
    useTopRecommendedProducts({ limit: 5, days: recommendationDays });
  const { data: recommendationAnalytics, isLoading: analyticsLoading } =
    useRecommendationAnalytics({ days: recommendationDays });

  // Tính tổng số khách hàng (lọc role CUSTOMER)
  const totalCustomers = useMemo(() => {
    if (!users) return 0;
    return users.filter(
      (u) =>
        Array.isArray(u.roles) &&
        u.roles.includes("ROLE_CUSTOMER") &&
        !u.roles.includes("ROLE_ADMIN")
    ).length;
  }, [users]);

  useEffect(() => {
    const handleLanguageChange = () => {};
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Chuẩn hóa dữ liệu cho biểu đồ doanh thu tháng (trục X chỉ là số tháng)
  const revenueChartData = useMemo(() => {
    if (!monthlyRevenueData) return [];

    // Tạo mảng 12 tháng, mỗi tháng là 0 nếu không có dữ liệu
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthStr = `${currentYear}-${(i + 1).toString().padStart(2, "0")}`;
      const found = monthlyRevenueData.find((item) => item.period === monthStr);
      return [
        (i + 1).toString(), // Chỉ hiển thị số tháng
        found ? found.revenue : 0,
      ];
    });

    return [
      [
        t("admin.dashboard.charts.month_short") || "Tháng",
        t("admin.dashboard.charts.revenue_label"),
      ],
      ...months,
    ];
  }, [monthlyRevenueData, t, currentYear]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tổng đơn hàng và đơn hàng pending
  const totalOrders = orderStats?.totalOrders || 0;
  const pendingOrders = orderStats?.ordersByStatus?.PENDING || 0;

  const loading =
    statsLoading || revenueLoading || orderStatsLoading || isLoadingUsers;

  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    color = "blue",
    format = "number",
  }) => {
    const colorClasses = {
      blue: "text-blue-600",
      green: "text-green-600",
      yellow: "text-yellow-500",
      purple: "text-purple-600",
      red: "text-red-600",
      indigo: "text-indigo-600",
      orange: "text-orange-600",
      teal: "text-teal-600",
    };

    const bgClasses = {
      blue: "bg-blue-100",
      green: "bg-green-100",
      yellow: "bg-yellow-100",
      purple: "bg-purple-100",
      red: "bg-red-100",
      indigo: "bg-indigo-100",
      orange: "bg-orange-100",
      teal: "bg-teal-100",
    };

    const formatValue = (val) => {
      if (format === "currency") return formatCurrency(val);
      if (format === "rating") return val.toFixed(1);
      if (format === "percentage") return `${val.toFixed(2)}%`;
      return val.toLocaleString();
    };

    if (loading) {
      return (
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-w-[110px] min-h-[110px] animate-pulse">
          <div className="mb-2 p-2 rounded-full bg-gray-200 w-10 h-10"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      );
    }

    return (
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-w-[110px] min-h-[110px]">
        <div className={`mb-2 p-2 rounded-full ${bgClasses[color]} shadow`}>
          <Icon size={24} className={colorClasses[color]} />
        </div>
        <p className="text-xs font-medium text-gray-700 text-center">{title}</p>
        <p className={`text-xl font-bold ${colorClasses[color]} text-center`}>
          {formatValue(value)}
        </p>
        {change !== undefined && (
          <p
            className={`text-xs flex items-center mt-1 ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <IconTrendingUp
              size={14}
              className={`mr-1 ${change < 0 ? "rotate-180" : ""}`}
            />
            {change >= 0 ? "+" : ""}
            {change}% {t("admin.dashboard.stats.change_from_last_month")}
          </p>
        )}
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
        title: t("admin.dashboard.charts.month_short") || "Tháng",
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

    if (revenueLoading || revenueChartData.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-500 text-sm">
              {t("admin.dashboard.charts.loading")}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-80">
        <Chart
          chartType="ColumnChart"
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

    if (activitiesLoading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("admin.dashboard.recent_activity.title")}
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-3 animate-pulse"
              >
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t("admin.dashboard.recent_activity.title")}
        </h3>
        <div className="space-y-4">
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
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
                <span className="text-xs text-gray-500">
                  {activity.timeAgo}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              {t("admin.dashboard.recent_activity.no_activities")}
            </p>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => navigate("/admin/orders")}
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
    if (topProductsLoading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("admin.dashboard.top_products.title")}
            </h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 animate-pulse"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

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
          {topProducts && topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div
                key={product.productVariantId}
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
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              {t("admin.dashboard.top_products.no_products")}
            </p>
          )}
        </div>
      </div>
    );
  };

  const RecommendationAnalytics = () => {
    if (analyticsLoading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("admin.dashboard.recommendation_analytics.title")}
            </h3>
          </div>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    if (!recommendationAnalytics) {
      return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IconBulb size={20} className="text-orange-500" />
            {t("admin.dashboard.recommendation_analytics.title")}
          </h3>
          <select
            value={recommendationDays}
            onChange={(e) => setRecommendationDays(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>
              {t("admin.dashboard.recommendation_analytics.days_7")}
            </option>
            <option value={30}>
              {t("admin.dashboard.recommendation_analytics.days_30")}
            </option>
            <option value={90}>
              {t("admin.dashboard.recommendation_analytics.days_90")}
            </option>
            <option value={0}>
              {t("admin.dashboard.recommendation_analytics.days_all")}
            </option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconEye size={18} className="text-blue-600" />
              <p className="text-sm text-gray-600">
                {t(
                  "admin.dashboard.recommendation_analytics.total_recommendations"
                )}
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {recommendationAnalytics.totalRecommendations?.toLocaleString()}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconClick size={18} className="text-green-600" />
              <p className="text-sm text-gray-600">
                {t("admin.dashboard.recommendation_analytics.ctr")}
              </p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {recommendationAnalytics.clickThroughRate?.toFixed(2)}%
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconShoppingBag size={18} className="text-orange-600" />
              <p className="text-sm text-gray-600">
                {t("admin.dashboard.recommendation_analytics.cart_rate")}
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {recommendationAnalytics.cartConversionRate?.toFixed(2)}%
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconShoppingCart size={18} className="text-purple-600" />
              <p className="text-sm text-gray-600">
                {t("admin.dashboard.recommendation_analytics.purchase_rate")}
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {recommendationAnalytics.purchaseConversionRate?.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {t("admin.dashboard.recommendation_analytics.total_clicks", {
                count: recommendationAnalytics.totalClicks,
              })}
            </span>
            <span>
              {t(
                "admin.dashboard.recommendation_analytics.total_add_to_carts",
                { count: recommendationAnalytics.totalAddToCarts }
              )}
            </span>
            <span>
              {t("admin.dashboard.recommendation_analytics.total_purchases", {
                count: recommendationAnalytics.totalPurchases,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // TopRecommendedProducts
  const TopRecommendedProducts = () => {
    if (topRecommendedLoading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("admin.dashboard.top_recommended_products.title")}
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 animate-pulse"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <IconStar size={20} className="text-yellow-500" />
            {t("admin.dashboard.top_recommended_products.title")}
          </h3>
        </div>
        <div className="space-y-4">
          {topRecommendedProducts && topRecommendedProducts.length > 0 ? (
            topRecommendedProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-orange-600">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {product.productName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {product.categoryName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">
                    {t("admin.dashboard.top_recommended_products.count", {
                      count: product.recommendationCount,
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(product.averagePrice)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              {t("admin.dashboard.top_recommended_products.no_data")}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Primary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={IconUsers}
            title={t("admin.dashboard.stats.total_customers")}
            value={totalCustomers}
            change={12}
            color="blue"
          />
          <StatCard
            icon={IconPackage}
            title={t("admin.dashboard.stats.total_products")}
            value={dashboardData?.totalProducts || 0}
            change={5}
            color="green"
          />
          <StatCard
            icon={IconShoppingCart}
            title={t("admin.dashboard.stats.total_orders")}
            value={totalOrders}
            change={18}
            color="yellow"
          />
          <StatCard
            icon={IconCurrencyDollar}
            title={t("admin.dashboard.stats.monthly_revenue")}
            value={currentMonthRevenue}
            change={23}
            color="purple"
            format="currency"
          />
          <StatCard
            icon={IconCalendar}
            title={t("admin.dashboard.stats.pending_orders")}
            value={pendingOrders}
            color="red"
          />
          <StatCard
            icon={IconStar}
            title={t("admin.dashboard.stats.average_rating")}
            value={dashboardData?.averageRating || 0}
            color="yellow"
            format="rating"
          />
        </div>

        {/* Recommendation Statistics - NEW SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecommendationAnalytics />
          <TopRecommendedProducts />
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
