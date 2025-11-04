import api from "./api";

const normalize = (res) => {
  // Nếu backend trả ApiResponse { data: ... } trả về data, còn không trả về res.data
  return res?.data?.data ?? res?.data ?? null;
};

const voucherAPI = {
  // Paged for admin
  getVouchersForAdmin: async (page = 0, size = 12) => {
    const params = { page, size };
    const res = await api.get(`/vouchers/admin`, { params });
    return normalize(res);
  },

  // Paged for customer (available)
  getAvailableVouchersForCustomer: async (page = 0, size = 12) => {
    const params = { page, size };
    const res = await api.get(`/vouchers/customer`, { params });
    return normalize(res);
  },

  // Get all for admin (non-paged)
  getVouchersForAdminAll: async (lang = "VI") => {
    const res = await api.get(`/vouchers/admin/all`, { params: { lang } });
    return normalize(res);
  },

  // Get all available for customer (non-paged)
  getAvailableVouchersForCustomerAll: async (lang = "VI") => {
    const res = await api.get(`/vouchers/customer/all`, { params: { lang } });
    return normalize(res);
  },

  getVoucherById: async (id, lang = "VI") => {
    const res = await api.get(`/vouchers/${id}`, { params: { lang } });
    return normalize(res);
  },

  createVoucher: async (payload, lang = "VI") => {
    const res = await api.post(`/vouchers`, payload, { params: { lang } });
    return normalize(res);
  },

  updateVoucher: async (id, payload, lang = "VI") => {
    const res = await api.put(`/vouchers/${id}`, payload, { params: { lang } });
    return normalize(res);
  },

  deleteVoucher: async (id, lang = "VI") => {
    const res = await api.delete(`/vouchers/${id}`, { params: { lang } });
    return normalize(res);
  },

  removeProductFromVoucher: async (voucherId, productId, lang = "VI") => {
    const res = await api.delete(
      `/vouchers/${voucherId}/products/${productId}`,
      {
        params: { lang },
      }
    );
    return normalize(res);
  },
};

export default voucherAPI;
