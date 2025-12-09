import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { queryClient } from "../lib/queryClient";
import {
  adminUpdateOrder,
  cancelPayPalPayment,
  confirmPayPalPayment,
  createOrder,
  getMyOrders,
  getMyOrdersPaging,
  getOrderByOrderNumber,
  getOrdersByCustomerId,
  getOrdersByCustomerIdPaging,
  updateOrderByUser,
  getAllOrdersPaging,
  cancelOrderByCustomer,
  getOrderStatistics,
  getOrdersByStatusPaging,
  batchUpdateOrderStatus,
} from "../services/orderAPI";

export const useCreateOrder = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (payload) => {
      // Kiểm tra lock để tránh duplicate submission
      const lockKey = "creatingOrderInProgress";
      const inProgress = localStorage.getItem(lockKey);
      const now = Date.now();

      if (inProgress && now - Number(inProgress) < 60_000) {
        const err = new Error(
          t("order.create_in_progress") ||
            "Đơn hàng đang được xử lý. Vui lòng đợi."
        );
        err.isDuplicate = true;
        throw err;
      }

      // Set lock với timestamp hiện tại
      localStorage.setItem(lockKey, String(now));

      try {
        return await createOrder(payload);
      } catch (error) {
        // Nếu có lỗi, xóa lock ngay
        localStorage.removeItem(lockKey);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Remove lock sau khi thành công
      localStorage.removeItem("creatingOrderInProgress");

      const orderResponse = data.data;

      // Invalidate cart queries để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // Hiển thị thông báo thành công
      toast.success(t("order.create_success"));

      // Xử lý redirect dựa trên payment method
      if (orderResponse.paypalApprovalUrl) {
        // Lưu orderNumber để confirm sau
        localStorage.setItem("pendingOrderNumber", orderResponse.orderNumber);
        // Redirect đến PayPal
        window.location.href = orderResponse.paypalApprovalUrl;
      } else {
        // COD - redirect đến trang success
        navigate(`/order-success/${orderResponse.orderNumber}`, {
          replace: true, // Thay thế history để không back về cart
        });
      }
    },
    onError: (error) => {
      // Xóa lock khi có lỗi
      localStorage.removeItem("creatingOrderInProgress");

      // Không hiển thị toast nếu là duplicate request
      if (error.isDuplicate) {
        return;
      }

      const errorMessage = error.response?.data?.error?.message;
      const errorCode = error.response?.data?.error?.code;

      // Xử lý các loại lỗi cụ thể
      if (
        errorMessage?.includes("maximum usage limit") ||
        errorMessage?.includes("reached the maximum")
      ) {
        toast.error(
          t("cart.voucher_max_usage_reached") ||
            "Bạn đã sử dụng hết lượt áp dụng voucher này!"
        );
      } else if (
        errorMessage?.includes("out of stock") ||
        errorMessage?.includes("insufficient stock")
      ) {
        toast.error(
          t("cart.product_out_of_stock") ||
            "Một số sản phẩm đã hết hàng. Vui lòng kiểm tra lại giỏ hàng."
        );
        // Refresh cart để cập nhật số lượng
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else if (
        errorMessage?.includes("voucher") ||
        errorMessage?.includes("Voucher")
      ) {
        toast.error(errorMessage);
      } else if (errorCode === "BAD_REQUEST") {
        toast.error(
          errorMessage ||
            t("cart.invalid_order_data") ||
            "Thông tin đơn hàng không hợp lệ"
        );
      } else {
        // Lỗi chung
        toast.error(
          errorMessage ||
            t("order.create_fail") ||
            "Có lỗi xảy ra khi tạo đơn hàng"
        );
      }
    },
    // Thêm retry logic cho network errors
    retry: (failureCount, error) => {
      // Không retry nếu là lỗi validation (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      // Retry tối đa 1 lần cho network errors
      return failureCount < 1;
    },
    retryDelay: 1000, // Đợi 1 giây trước khi retry
  });
};

export const useConfirmPayPal = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ token, orderNumber }) =>
      confirmPayPalPayment(token, orderNumber),
    onSuccess: (data) => {
      toast.success(data.message || t("order.payment_confirm_success"));
      localStorage.removeItem("pendingOrderNumber");
      const orderNumber = data.data.orderNumber;
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate(`/order-success/${orderNumber}`);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("order.payment_confirm_fail")
      );
      const orderNumber = localStorage.getItem("pendingOrderNumber");
      localStorage.removeItem("pendingOrderNumber");
      navigate("/cart");
    },
  });
};

export const useCancelPayPal = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: cancelPayPalPayment,
    onSuccess: (data) => {
      toast.warn(data.message || t("order.payment_cancel_warn"));
      localStorage.removeItem("pendingOrderNumber");
      // Luôn quay về trang giỏ hàng khi hủy thanh toán
      navigate("/cart");
    },
    onError: (error) => {
      localStorage.removeItem("pendingOrderNumber");
      // Quay về trang giỏ hàng khi có lỗi
      navigate("/cart");
    },
  });
};

export const useMyOrders = () => {
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: getMyOrders,
  });
};

export const useMyOrdersPaging = (params, options = {}) => {
  return useQuery({
    queryKey: ["myOrders", params],
    queryFn: () => getMyOrdersPaging(params),
    staleTime: 1000 * 30,
    keepPreviousData: true, // Luôn giữ lại data cũ khi chuyển trang
    ...options,
  });
};

export const useOrderByOrderNumber = (orderNumber) => {
  return useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => getOrderByOrderNumber(orderNumber),
    enabled: !!orderNumber, // Only run query if orderNumber is available
  });
};

export const useUpdateOrderByUser = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ orderNumber, updateData }) =>
      updateOrderByUser(orderNumber, updateData),
    onSuccess: (data) => {
      toast.success(data.message || t("order.update_success"));
      queryClient.invalidateQueries({
        queryKey: ["order", data.data.orderNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t("order.update_fail"));
    },
  });
};

export const useAdminUpdateOrder = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ orderNumber, updateData }) =>
      adminUpdateOrder(orderNumber, updateData),
    onSuccess: (data) => {
      toast.success(t("order.update_success"));
      queryClient.invalidateQueries({
        queryKey: ["order", data.data.orderNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderStatistics"] });
    },
    onError: (error) => {
      toast.error(t("order.update_fail"));
    },
  });
};

export const useOrdersByCustomerId = (customerId) => {
  return useQuery({
    queryKey: ["orders", "customer", customerId],
    queryFn: () => getOrdersByCustomerId(customerId),
    enabled: !!customerId,
  });
};

export const useOrdersByCustomerIdPaging = (customerId, pageable) => {
  return useQuery({
    queryKey: ["orders", "customer", customerId, pageable],
    queryFn: () => getOrdersByCustomerIdPaging(customerId, pageable),
    enabled: !!customerId,
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch all orders with server-side paging for admin/staff.
 * `params` example: { page: 0, size: 10, sort: "orderDate,desc" }
 */
export const useAllOrdersPaging = (params, options = {}) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getAllOrdersPaging(params),
    staleTime: 1000 * 30,
    keepPreviousData: true,
    ...options,
  });
};

export const useCancelOrder = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ orderNumber, cancellationReason }) =>
      cancelOrderByCustomer(orderNumber, { cancellationReason }),
    onSuccess: (data) => {
      toast.success(data.message || t("order.cancel_success"));
      queryClient.invalidateQueries({
        queryKey: ["order", data.data.orderNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t("order.cancel_error"));
    },
  });
};

// Hook để lấy thống kê đơn hàng
export const useOrderStatistics = () => {
  return useQuery({
    queryKey: ["orderStatistics"],
    queryFn: getOrderStatistics,
    select: (res) => res.data,
  });
};

export const useOrdersByStatusPaging = (status, params, options = {}) => {
  return useQuery({
    queryKey: ["orders", status, params],
    queryFn: () => getOrdersByStatusPaging(status, params),
    staleTime: 1000 * 30,
    keepPreviousData: true,
    ...options,
  });
};

// Hook để cập nhật trạng thái đơn hàng hàng loạt
export const useBatchUpdateOrderStatus = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: batchUpdateOrderStatus,
    onSuccess: (data) => {
      // Lấy số lượng thành công/thất bại từ response
      const success = data?.data?.successfulUpdates ?? 0;
      const fail = data?.data?.failedUpdates ?? 0;
      // Ưu tiên message từ API, nếu không có thì dùng translation với số lượng
      const msg = t("order.batch_update_result", { success, fail });
      toast.success(msg);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderStatistics"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || t("order.update_fail"));
    },
  });
};
