import api from "./api";

export const productVariantImageAPI = {
  // Thêm ảnh cho variant
  addImageToVariant: (variantId, imageInfo, imageFile) => {
    const formData = new FormData();
    formData.append(
      "imageInfo",
      new Blob([JSON.stringify(imageInfo)], { type: "application/json" })
    );
    formData.append("imageFile", imageFile);
    return api.post(`/product-variants/${variantId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Cập nhật ảnh variant
  updateVariantImage: (variantId, imageId, imageInfo, imageFile) => {
    const formData = new FormData();
    if (imageInfo) {
      formData.append(
        "imageInfo",
        new Blob([JSON.stringify(imageInfo)], { type: "application/json" })
      );
    }
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    return api.put(
      `/product-variants/${variantId}/images/${imageId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  // Lấy danh sách ảnh của variant
  getImagesByVariantId: (variantId) =>
    api.get(`/product-variants/${variantId}/images`),

  // Lấy chi tiết ảnh
  getImageById: (variantId, imageId) =>
    api.get(`/product-variants/${variantId}/images/${imageId}`),
};
