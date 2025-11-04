import api from "./api";

export const promotionAPI = {
  // Fetch all promotions
  fetchPromotions: (lang = "VI") => {
    return api.get(`/promotions/all?lang=${lang}`);
  },

  // Create a new promotion (multipart/form-data: part 'promotion' + optional 'bannerFile')
  createPromotion: (promotion, lang = "VI") => {
    const formData = new FormData();
    formData.append(
      "promotion",
      new Blob([JSON.stringify(promotion)], { type: "application/json" })
    );
    if (promotion.bannerFile) {
      formData.append("bannerFile", promotion.bannerFile);
    }
    // Let axios set Content-Type multipart boundary automatically
    return api.post(`/promotions?lang=${lang}`, formData);
  },

  // Update an existing promotion (multipart/form-data: part 'promotion' + optional 'bannerFile')
  updatePromotion: (promotionId, promotion, lang = "VI") => {
    const formData = new FormData();
    // send JSON part as application/json blob so Spring @RequestPart("promotion") can parse it
    formData.append(
      "promotion",
      new Blob([JSON.stringify(promotion)], { type: "application/json" })
    );
    if (promotion.bannerFile) {
      formData.append("bannerFile", promotion.bannerFile);
    }
    return api.put(`/promotions/${promotionId}?lang=${lang}`, formData);
  },

  // Get promotion by ID
  getPromotionById: (promotionId, lang) => {
    return api.get(`/promotions/${promotionId}?lang=${lang}`);
  },

  // Remove product from promotion (backend endpoint)
  removeProductFromPromotion: (promotionId, productId, lang = "VI") => {
    return api.delete(
      `/promotions/${promotionId}/products/${productId}?lang=${lang}`
    );
  },

  // Xóa khuyến mãi
  deletePromotion: (promotionId, lang = "VI") => {
    return api.delete(`/promotions/${promotionId}?lang=${lang}`);
  },
};
