import api from "./api";

/**
 * Creates a new order.
 * @param {object} orderData - The data for the new order.
 * @param {Array<object>} orderData.orderItems - List of items in the order[{ cartItemId: number }].
 * @param {object} orderData.shippingInfo - The shipping information.
 * @param {string} [orderData.notes] - Optional notes for the order.
 * @param {string} orderData.paymentMethod - Payment method ('CASH_ON_DELIVERY', 'PAYPAL').
 * @param {number} [orderData.promotionId] - Optional promotion ID.
 * @param {number} orderData.shippingFee - The shipping fee.
 * @returns {Promise<object>} Dữ liệu phản hồi từ API.
 */
export const createOrder = async (orderData) => {
  if (orderData.paymentMethod === "PAYPAL") {
    const successUrl = `${window.location.origin}/payment/paypal/success`;
    const cancelUrl = `${window.location.origin}/cart`;
    orderData = { ...orderData, successUrl, cancelUrl };
  }
  const response = await api.post("/orders", orderData);
  return response.data;
};

/**
 * Updates an order by the customer who owns it.
 * @param {string} orderNumber - The order number.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object>} The updated order response.
 */
export const updateOrderByUser = async (orderNumber, updateData) => {
  const response = await api.put(`/orders/${orderNumber}/user`, updateData);
  return response.data;
};

/**
 * Updates an order by an admin or staff.
 * @param {string} orderNumber - The order number.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object>} The updated order response.
 */
export const adminUpdateOrder = async (orderNumber, updateData) => {
  const response = await api.put(`/orders/${orderNumber}`, updateData);
  return response.data;
};

/**
 * Retrieves an order by its order number.
 * @param {string} orderNumber - The order number.
 * @returns {Promise<object>} The order details.
 */
export const getOrderByOrderNumber = async (orderNumber) => {
  const response = await api.get(`/orders/${orderNumber}`);
  return response.data;
};

/**
 * Retrieves all orders for the currently logged-in customer.
 * @returns {Promise<Array<object>>} A list of orders.
 */
export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

/**
 * Retrieves all orders for a specific customer by their ID (for admin/staff).
 * @param {number} customerId - The customer's ID.
 * @returns {Promise<Array<object>>} A list of orders for the customer.
 */
export const getOrdersByCustomerId = async (customerId) => {
  const response = await api.get(`/orders/customer/${customerId}`);
  return response.data;
};

/**
 * Retrieves paginated orders for the currently logged-in customer.
 * @param {object} params - Pagination parameters (page, size, sort).
 * @returns {Promise<object>} A paginated response of orders.
 */
export const getMyOrdersPaging = async (params) => {
  const response = await api.get("/orders/my-orders/paging", { params });
  return response.data;
};

/**
 * Retrieves paginated orders for a specific customer by ID (for admin/staff).
 * @param {number} customerId - The customer's ID.
 * @param {object} params - Pagination parameters (page, size, sort).
 * @returns {Promise<object>} A paginated response of orders.
 */
export const getOrdersByCustomerIdPaging = async (customerId, params) => {
  const response = await api.get(`/orders/customer/${customerId}/paging`, {
    params,
  });
  return response.data;
};

/**
 * Confirms a PayPal payment.
 * This endpoint should be called on the redirect page from PayPal.
 * @param {string} token - The payment token from PayPal query params.
 * @param {string} orderNumber - The order number associated with the payment.
 * @returns {Promise<object>} The confirmed order details.
 */
export const confirmPayPalPayment = async (token, orderNumber) => {
  // Note: The backend implementation for this was not in the controller.
  // Assuming an endpoint like '/orders/paypal/confirm' exists. Please adjust if needed.
  const response = await api.get("/payments/paypal/success", {
    params: { token, orderNumber },
  });
  return response.data;
};

/**
 * Cancels a PayPal payment.
 * This endpoint should be called if the user cancels the payment on PayPal's site.
 * @param {string} orderNumber - The order number to cancel.
 * @returns {Promise<object>} The cancellation confirmation.
 */
export const cancelPayPalPayment = async (orderNumber) => {
  // Note: The backend implementation for this was not in the controller.
  // Assuming an endpoint like '/orders/paypal/cancel' exists. Please adjust if needed.
  const response = await api.get("/payments/paypal/cancel", {
    params: { orderNumber },
  });
  return response.data;
};
