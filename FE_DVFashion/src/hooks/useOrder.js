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
} from "../services/orderAPI";

export const useCreateOrder = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      const orderResponse = data.data;
      toast.success(t("order.create_success"));

      // If PayPal, redirect to approval URL
      if (orderResponse.paypalApprovalUrl) {
        // Store order number to use after redirect
        localStorage.setItem("pendingOrderNumber", orderResponse.orderNumber);
        window.location.href = orderResponse.paypalApprovalUrl;
      } else {
        // For COD or other methods, navigate to order success page
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        navigate(`/order-success/${orderResponse.orderNumber}`);
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      error.response?.data?.message || t("order.create_fail");
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
      const orderNumber = localStorage.getItem("pendingOrderNumber");
      localStorage.removeItem("pendingOrderNumber");
      navigate(orderNumber ? `/order-fail/${orderNumber}` : "/cart");
    },
    onError: (error) => {
      error.response?.data?.message || t("order.payment_cancel_error");
      localStorage.removeItem("pendingOrderNumber");
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

export const useMyOrdersPaging = (pageable) => {
  return useQuery({
    queryKey: ["myOrders", pageable],
    queryFn: () => getMyOrdersPaging(pageable),
    keepPreviousData: true,
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
