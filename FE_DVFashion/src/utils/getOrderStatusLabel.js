export const getOrderStatusLabel = (status, t) => {
  const statusMap = {
    PENDING: t("order.status.pending"),
    CONFIRMED: t("order.status.confirmed"),
    PROCESSING: t("order.status.processing"),
    SHIPPED: t("order.status.shipped"),
    DELIVERED: t("order.status.delivered"),
    CANCELED: t("order.status.canceled"),
    RETURNED: t("order.status.returned"),
  };
  return statusMap[status] || status;
};
