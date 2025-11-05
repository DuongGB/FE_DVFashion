import api from "./api";

export const addressAPI = {
  // Get all address for current user
  getAllAddress: async () => {
    const response = await api.get("/addresses");
    return response.data;
  },

  // Get address by ID
  getAddressById: async (id) => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // Create a new address
  createAddress: async (addressData) => {
    const response = await api.post("/addresses", addressData);
    return response.data;
  },

  // Update an existing address
  updateAddress: async (id, addressData) => {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  // Delete an address
  deleteAddress: async (id) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  // Get provinces from backend (GHN via backend)
  getProvinces: async () => {
    const response = await api.get("/addresses/provinces");
    return response.data;
  },

  // Get districts by province id
  getDistrictsByProvince: async (provinceId) => {
    const response = await api.get(
      `/addresses/provinces/${provinceId}/districts`
    );
    return response.data;
  },

  // Get wards by district id
  getWardsByDistrict: async (districtId) => {
    const response = await api.get(`/addresses/provinces/${districtId}/wards`);
    return response.data;
  },
};
