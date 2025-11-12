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
} from "../services/orderAPI";

export const useCreateOrder = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (payload) => {
      // Kiểm tra xem có đơn hàng nào đang được tạo không (tránh việc bấm nhiều lần)
      const inProgress = localStorage.getItem("creatingOrderInProgress");
      const now = Date.now();
      if (inProgress && now - Number(inProgress) < 60_000) {
        // throw so onError runs and user sees message
        const err = new Error(
          t("order.create_in_progress") ||
            "Order creation already in progress. Please wait."
        );
        throw err;
      }
      // set lock timestamp
      localStorage.setItem("creatingOrderInProgress", String(now));
      return createOrder(payload);
    },
    onSuccess: (data) => {
      // remove lock
      localStorage.removeItem("creatingOrderInProgress");

      const orderResponse = data.data;
      toast.success(t("order.create_success"));

      // Nếu là thanh toán PayPal, chuyển hướng người dùng
      if (orderResponse.paypalApprovalUrl) {
        // Lưu orderNumber để xác nhận sau khi thanh toán
        localStorage.setItem("pendingOrderNumber", orderResponse.orderNumber);
        window.location.href = orderResponse.paypalApprovalUrl;
      } else {
        // Chuyển hướng đến trang thành công
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        navigate(`/order-success/${orderResponse.orderNumber}`);
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      // Xóa lock khi có lỗi
      localStorage.removeItem("creatingOrderInProgress");

      // Xử lý lỗi voucher đã hết lượt sử dụng
      const errorMessage = error.response?.data?.error?.message;
      const errorCode = error.response?.data?.error?.code;

      // Kiểm tra lỗi voucher
      if (
        errorMessage?.includes("maximum usage limit") ||
        errorMessage?.includes("reached the maximum") ||
        errorCode === "BAD_REQUEST"
      ) {
        toast.error(
          t("cart.voucher_max_usage_reached") ||
            "Bạn đã sử dụng hết lượt áp dụng voucher này!"
        );
      } else if (
        errorMessage?.includes("voucher") ||
        errorMessage?.includes("Voucher")
      ) {
        // Các lỗi voucher khác
        toast.error(errorMessage);
      } else {
        // Lỗi chung
        toast.error(errorMessage || t("order.create_fail"));
      }
    },
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
      toast.success(data.message || t("order.update_success"));
      queryClient.invalidateQueries({
        queryKey: ["order", data.data.orderNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t("order.update_fail"));
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
