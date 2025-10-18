export const getPaymentMethodLabel = (method, t) => {
  const methodMap = {
    CASH_ON_DELIVERY: t("order.payment_method.cod"),
    PAYPAL: t("order.payment_method.paypal"),
  };
  return methodMap[method] || method;
};
