export const normalizeSenderType = (message) => {
  const raw =
    message?.senderType ||
    message?.senderRole ||
    message?.role ||
    message?.from ||
    "";
  return String(raw).toUpperCase();
};

export const isAdminMessage = (message) => {
  const t = normalizeSenderType(message);
  if (!t) return !!message?.isFromAdmin;
  const result =
    t === "ADMIN" ||
    t === "ROLE_ADMIN" ||
    t === "STAFF" ||
    t === "ROLE_STAFF" ||
    message?.isFromAdmin === true;

  return result;
};

export const isCustomerOrGuestMessage = (message) => {
  const t = normalizeSenderType(message);
  if (!t) return message?.isFromAdmin === false;
  return (
    t === "CUSTOMER" ||
    t === "ROLE_CUSTOMER" ||
    t === "GUEST" ||
    t === "ANONYMOUS" ||
    t === "USER"
  );
};
