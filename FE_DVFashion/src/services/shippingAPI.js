import api from "./api";

export const shippingAPI = {
  calculate: async (createOrderRequest) => {
    const response = await api.post("/shipping/calculate", createOrderRequest);
    return response.data;
  },
};
