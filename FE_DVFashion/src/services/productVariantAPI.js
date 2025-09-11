import api from "./api";

// ProductVariant
export const productVariantAPI = {
  // Thêm variant cho product
  addProductVariant: (productId, variant, images) => {
    const formData = new FormData();
    formData.append(
      "variant",
      new Blob([JSON.stringify(variant)], { type: "application/json" })
    );
    if (images && images.length > 0) {
      images.forEach((img) => formData.append("images", img));
    }
    return api.post(`/products/${productId}/variants`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Cập nhật variant
  updateProductVariant: (productId, variantId, variant) =>
    api.put(`/products/${productId}/variants/${variantId}`, variant, {
      headers: { "Content-Type": "application/json" },
    }),

  // Lấy danh sách variant theo product
  getVariantsByProductId: (productId) =>
    api.get(`/products/${productId}/variants`),

  // Lấy chi tiết variant
  getVariantById: (productId, variantId) =>
    api.get(`/products/${productId}/variants/${variantId}`),
};
