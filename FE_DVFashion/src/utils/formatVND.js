export const formatVND = (value) => {
  if (value == null || value === "") return "0đ";
  const n = Number(value) || 0;
  // dùng comma làm ngăn cách hàng nghìn theo yêu cầu: 22,700đ
  return `${n.toLocaleString("en-US")}đ`;
};
