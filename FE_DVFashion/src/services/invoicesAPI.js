import api from "./api";

// Lấy blob PDF xem trước hóa đơn
export async function getInvoicePdfPreview(orderNumber) {
  const response = await api.get(`/invoices/${orderNumber}/preview`, {
    responseType: "blob",
  });
  return response.data;
}

// Lấy dữ liệu hóa đơn (JSON)
export async function getInvoice(orderNumber) {
  const response = await api.get(`/invoices/${orderNumber}`);
  return response.data.data;
}
