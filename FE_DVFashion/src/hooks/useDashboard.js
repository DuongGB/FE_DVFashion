import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useProduct } from "./useProduct";
import { useAllOrdersPaging } from "./useOrder";
import { useAdminReviews } from "./useReview";
import { useUser } from "./useUser";

export const useDashboardStats = () => {
  const { user } = useAuth();
  const { products } = useProduct();
  const { users } = useUser();
  const { data: ordersData } = useAllOrdersPaging({ page: 0, size: 10000 });
  const { data: reviewsData } = useAdminReviews({ page: 0, size: 10000 });

  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const orders = ordersData?.data?.values || [];
      const reviews = reviewsData?.data?.reviews || [];
      const allUsers = users || [];

      const totalCustomers = allUsers.filter((u) => {
        return u.role === "CUSTOMER" && u.role !== "ADMIN";
      }).length;

      // 2. Tổng sản phẩm
      const totalProducts = products?.length || 0;

      // 3. Tổng đơn hàng
      const totalOrders = orders.length;

      // 4. Tổng doanh thu (chỉ tính đơn hàng đã thanh toán thành công)
      const totalRevenue = orders
        .filter((o) => o.payment?.paymentStatus === "COMPLETED")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // 5. Đơn hàng chờ xử lý (PENDING hoặc CONFIRMED)
      const pendingOrders = orders.filter(
        (o) => o.status === "PENDING" || o.status === "CONFIRMED"
      ).length;

      // 6. Doanh thu tháng này (optional - để tính % thay đổi)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = orders
        .filter(
          (o) =>
            new Date(o.orderDate) >= firstDayOfMonth &&
            o.payment?.paymentStatus === "COMPLETED"
        )
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // 7. Khách hàng hoạt động (đặt hàng trong 30 ngày qua)
      const activeCustomers = new Set(
        orders
          .filter(
            (o) =>
              new Date(o.orderDate) >=
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          )
          .map((o) => o.customerId)
      ).size;

      // 8. Đánh giá trung bình
      const approvedReviews = reviews.filter(
        (r) =>
          r.moderationStatus === "APPROVED" ||
          r.moderationStatus === "AUTO_APPROVED"
      );
      const averageRating =
        approvedReviews.length > 0
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
            approvedReviews.length
          : 0;

      console.log("⭐ Average Rating:", averageRating);

      const result = {
        // Số liệu chính
        totalUsers: totalCustomers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,

        // Số liệu phụ
        monthlyRevenue,
        activeCustomers,
        averageRating,
        dailyViews: 0,
      };

      return result;
    },
    enabled: !!user && !!products && !!users && !!ordersData && !!reviewsData,
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });
};

export const useRevenueChartData = () => {
  const { data: ordersData } = useAllOrdersPaging({ page: 0, size: 10000 });

  return useQuery({
    queryKey: ["dashboard", "revenue-chart"],
    queryFn: async () => {
      const orders = ordersData?.data?.values || [];
      const completedOrders = orders.filter(
        (o) => o.payment?.paymentStatus === "COMPLETED"
      );

      // Lấy dữ liệu 6 tháng gần nhất
      const now = new Date();
      const monthsData = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const monthOrders = completedOrders.filter((o) => {
          const orderDate = new Date(o.orderDate);
          return orderDate >= date && orderDate < nextDate;
        });

        const revenue = monthOrders.reduce(
          (sum, o) => sum + (o.totalAmount || 0),
          0
        );
        const count = monthOrders.length;

        monthsData.push({
          month: date.toLocaleDateString("vi-VN", { month: "long" }),
          revenue,
          orders: count,
        });
      }

      return monthsData;
    },
    enabled: !!ordersData,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopProducts = () => {
  const { data: ordersData } = useAllOrdersPaging({ page: 0, size: 10000 });

  return useQuery({
    queryKey: ["dashboard", "top-products"],
    queryFn: async () => {
      const orders = ordersData?.data?.values || [];
      const completedOrders = orders.filter(
        (o) => o.payment?.paymentStatus === "COMPLETED"
      );

      // Tập hợp doanh số sản phẩm
      const productSales = {};

      completedOrders.forEach((order) => {
        order.items?.forEach((item) => {
          const key = item.productVariantId;
          if (!productSales[key]) {
            productSales[key] = {
              productVariantId: item.productVariantId,
              name: item.productName,
              color: item.color,
              sizeName: item.sizeName,
              sales: 0,
              revenue: 0,
            };
          }
          productSales[key].sales += item.quantity;
          productSales[key].revenue += item.totalPrice;
        });
      });

      // Sắp xếp theo doanh thu và lấy top 5
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return topProducts;
    },
    enabled: !!ordersData,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecentActivities = () => {
  const { data: ordersData } = useAllOrdersPaging({
    page: 0,
    size: 20,
    sort: "orderDate,desc",
  });
  const { data: reviewsData } = useAdminReviews({
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });

  return useQuery({
    queryKey: ["dashboard", "recent-activities"],
    queryFn: async () => {
      const orders = ordersData?.data?.values || [];
      const reviews = reviewsData?.data?.reviews || [];

      const activities = [];

      // Thêm đơn hàng gần đây
      orders.slice(0, 5).forEach((order) => {
        let action = "Đơn hàng mới";
        switch (order.status) {
          case "PENDING":
            action = "Đơn hàng chờ xử lý";
            break;
          case "CONFIRMED":
            action = "Đơn hàng đã xác nhận";
            break;
          case "SHIPPED":
            action = "Đơn hàng đang giao";
            break;
          case "DELIVERED":
            action = "Đơn hàng đã giao";
            break;
          case "CANCELED":
            action = "Đơn hàng đã hủy";
            break;
          case "RETURNED":
            action = "Đơn hàng đã trả";
            break;
          default:
            action = "Đơn hàng mới";
        }

        activities.push({
          type: "order",
          action,
          detail: `#${order.orderNumber} - ${order.customerName}`,
          time: order.orderDate,
          status: order.status,
        });
      });

      // Thêm đánh giá gần đây (nếu có)
      reviews.slice(0, 3).forEach((review) => {
        activities.push({
          type: "review",
          action: "Đánh giá mới",
          detail: `${review.rating} sao - ${review.productName || "Sản phẩm"}`,
          time: review.createdAt,
          status: review.moderationStatus,
        });
      });

      // Sắp xếp theo thời gian và lấy top 8
      const sortedActivities = activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8)
        .map((activity) => ({
          ...activity,
          timeAgo: getTimeAgo(activity.time),
        }));

      return sortedActivities;
    },
    enabled: !!ordersData && !!reviewsData,
    staleTime: 1000 * 60, // Cache 1 phút
  });
};

// Helper function
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} tuần trước`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;

  const years = Math.floor(days / 365);
  return `${years} năm trước`;
}
