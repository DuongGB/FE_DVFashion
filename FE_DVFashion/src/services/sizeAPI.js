import api from "./api";

export const sizeAPI = {
  // Thêm size cho variant
  addSize: (variantId, sizeData) =>
    api.post(`/product-variants/${variantId}/sizes`, sizeData, {
      headers: { "Content-Type": "application/json" },
    }),

  // Cập nhật size
  updateSize: (variantId, sizeId, sizeData) =>
    api.put(`/product-variants/${variantId}/sizes/${sizeId}`, sizeData, {
      headers: { "Content-Type": "application/json" },
    }),

  // Lấy danh sách size theo variant
  getSizesByVariantId: (variantId) =>
    api.get(`/product-variants/${variantId}/sizes`),

  // Lấy chi tiết size
  getSizeById: (variantId, sizeId) =>
    api.get(`/product-variants/${variantId}/sizes/${sizeId}`),
};
