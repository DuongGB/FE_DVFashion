import {
  IconBulb,
  IconCalendar,
  IconClick,
  IconCurrencyDollar,
  IconDiscount,
  IconEye,
  IconPackage,
  IconShoppingBag,
  IconShoppingCart,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrderStatistics } from "../../hooks/useOrder";
import { useProductStatistics } from "../../hooks/useProduct";
import {
  useRecommendationAnalytics,
  useTopRecommendedProducts,
} from "../../hooks/useProductRecomendations";
import { useAdminReviews } from "../../hooks/useReview";
import {
  useLowStockItems,
  useMonthlyRevenue,
  useTopBestSellingProducts,
  useTopPromotionsByRevenue,
  useTopStockProducts,
} from "../../hooks/useStatistics";
import { useUser } from "../../hooks/useUser";

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const [recommendationDays, setRecommendationDays] = useState(30);

  const now = new Date();
  const currentYear = now.getFullYear();

  // Fetch monthly revenue for current year
  const { data: monthlyRevenueData } = useMonthlyRevenue({ year: currentYear });

  const { data: reviewsData } = useAdminReviews({
    page: 0,
    size: 1000,
    sort: "createdAt,desc",
  });
  const allReviews = reviewsData?.data?.reviews || [];

  // Tính điểm trung bình rating
  const averageRating = useMemo(() => {
    if (!allReviews.length) return 0;
    const total = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return allReviews.length ? total / allReviews.length : 0;
  }, [allReviews]);

  // Lấy doanh thu tháng gần nhất có dữ liệu
  const currentMonthRevenue = useMemo(() => {
    if (!monthlyRevenueData || !Array.isArray(monthlyRevenueData)) {
      return 0;
    }

    // Nếu không có dữ liệu, trả về 0
    if (monthlyRevenueData.length === 0) {
      return 0;
    }

    // Sắp xếp dữ liệu theo period (tháng) giảm dần để lấy tháng gần nhất
    const sortedData = [...monthlyRevenueData].sort((a, b) => {
      return b.period.localeCompare(a.period);
    });

    // Lấy doanh thu của tháng gần nhất
    const latestMonthData = sortedData[0];

    return latestMonthData.revenue || 0;
  }, [monthlyRevenueData]);

  // Lấy thống kê sản phẩm
  const { data: productStats, isLoading: productStatsLoading } =
    useProductStatistics();

  // Lấy thống kê đơn hàng
  const { data: orderStats, isLoading: orderStatsLoading } =
    useOrderStatistics();

  // Lấy top 5 sản phẩm bán chạy nhất
  const { data: bestSellingProducts, isLoading: isLoadingBestSelling } =
    useTopBestSellingProducts({ limit: 5 });

  // Lấy top 5 sản phẩm tồn kho cao nhất
  const { data: topStockProducts, isLoading: isLoadingTopStock } =
    useTopStockProducts({ limit: 5 });

  // Lấy top 5 sản phẩm tồn kho thấp nhất
  const { data: lowStockProducts, isLoading: isLoadingLowStock } =
    useLowStockItems({ limit: 5 });

  // Lấy top 5 khuyến mãi mang lại doanh thu cao nhất
  const { data: topPromotions, isLoading: isLoadingPromotions } =
    useTopPromotionsByRevenue({ limit: 5 });

  // Lấy danh sách khách hàng
  const { users, isLoadingUsers } = useUser();

  // Fetch recommendation data
  const { data: topRecommendedProducts, isLoading: topRecommendedLoading } =
    useTopRecommendedProducts({
      limit: 5,
      days: recommendationDays === 0 ? undefined : recommendationDays,
    });
  const { data: recommendationAnalytics, isLoading: analyticsLoading } =
    useRecommendationAnalytics({
      days: recommendationDays === 0 ? undefined : recommendationDays,
    });

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tổng đơn hàng và đơn hàng pending
  const totalOrders = orderStats?.totalOrders || 0;
  const pendingOrders = orderStats?.ordersByStatus?.PENDING || 0;

  const loading = !productStats || !orderStats || !users;

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
            value={productStats?.totalActiveProducts || 0}
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
            value={averageRating}
            color="yellow"
            format="rating"
          />
        </div>

        {/* Recommendation Statistics - NEW SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecommendationAnalytics />
          <TopRecommendedProducts />
        </div>

        {/* Top Promotions (Full Width) */}
        <div className="grid grid-cols-1 gap-6 mt-8">
          {/* Top khuyến mãi doanh thu cao */}
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 flex flex-col min-h-[320px]">
            <h3 className="text-base font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <IconDiscount size={18} className="text-purple-500" />
              {t("admin.dashboard.top_promotions_by_revenue")}
            </h3>
            {isLoadingPromotions ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse h-20 w-full bg-gray-100 rounded" />
              </div>
            ) : topPromotions?.length ? (
              <ul className="divide-y divide-gray-100">
                {topPromotions.slice(0, 5).map((item, idx) => (
                  <li
                    key={item.promotionId}
                    className="flex justify-between items-center py-3"
                  >
                    <span className="truncate max-w-[200px] text-gray-700 flex items-center gap-1">
                      <span className="font-bold text-purple-600">
                        {idx + 1}.
                      </span>
                      {item.promotionName}
                    </span>
                    <span className="font-semibold text-purple-600 text-sm">
                      {t("admin.dashboard.revenue", {
                        amount: formatCurrency(item.totalRevenue),
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400 py-8">
                {t("admin.dashboard.no_data")}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Thống kê sản phẩm & tồn kho*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {/* Top 5 bán chạy */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 flex flex-col min-h-[340px] h-full flex-1">
          <h3 className="text-base font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <IconShoppingCart size={20} className="text-green-500" />
            {t("admin.dashboard.top_best_selling_products")}
          </h3>
          {isLoadingBestSelling ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse h-20 w-full bg-gray-100 rounded" />
            </div>
          ) : bestSellingProducts?.length ? (
            <ul className="divide-y divide-gray-100">
              {bestSellingProducts.slice(0, 5).map((item, idx) => (
                <li
                  key={item.productId}
                  className="flex justify-between items-center py-3"
                >
                  <span className="flex items-center gap-2 max-w-[220px] truncate">
                    <span className="font-bold text-green-600">{idx + 1}.</span>
                    <span className="truncate">{item.productName}</span>
                  </span>
                  <span className="font-semibold text-green-600 text-sm">
                    {t("admin.dashboard.quantity_sold", {
                      count: item.totalQuantitySold,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-gray-400">
                {t("admin.dashboard.no_data")}
              </p>
            </div>
          )}
        </div>
        {/* Top tồn kho cao */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 flex flex-col min-h-[340px] h-full flex-1">
          <h3 className="text-base font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <IconPackage size={20} className="text-blue-500" />
            {t("admin.dashboard.top_stock_products")}
          </h3>
          {isLoadingTopStock ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse h-20 w-full bg-gray-100 rounded" />
            </div>
          ) : topStockProducts?.length ? (
            <ul className="divide-y divide-gray-100">
              {topStockProducts.slice(0, 5).map((item, idx) => (
                <li
                  key={item.productId}
                  className="flex justify-between items-center py-3"
                >
                  <span className="flex items-center gap-2 max-w-[220px] truncate">
                    <span className="font-bold text-blue-600">{idx + 1}.</span>
                    <span className="truncate">{item.productName}</span>
                  </span>
                  <span className="font-semibold text-blue-600 text-sm">
                    {t("admin.dashboard.available_quantity", {
                      count: item.totalAvailableQuantity,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-gray-400">
                {t("admin.dashboard.no_data")}
              </p>
            </div>
          )}
        </div>
        {/* Top tồn kho thấp */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 flex flex-col min-h-[340px] h-full flex-1">
          <h3 className="text-base font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <IconPackage size={20} className="text-red-500" />
            {t("admin.dashboard.low_stock_products")}
          </h3>
          {isLoadingLowStock ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse h-20 w-full bg-gray-100 rounded" />
            </div>
          ) : lowStockProducts?.length ? (
            <ul className="divide-y divide-gray-100">
              {lowStockProducts.slice(0, 5).map((item, idx) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center py-3"
                >
                  <span className="flex items-center gap-2 max-w-[220px] truncate">
                    <span className="font-bold text-red-500">{idx + 1}.</span>
                    <span className="truncate">
                      {item.productName} ({item.sizeName})
                    </span>
                  </span>
                  <span className="font-semibold text-red-600 text-sm">
                    {t("admin.dashboard.available_quantity", {
                      count: item.availableQuantity,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-gray-400">
                {t("admin.dashboard.no_data")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
