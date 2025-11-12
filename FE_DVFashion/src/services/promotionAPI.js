import api from "./api";

export const promotionAPI = {
  // paging for admin promotions
  fetchPromotionsPaging: ({
    lang = "VI",
    page = 0,
    size = 12,
    sorts = [],
  } = {}) => {
    const sortParams = sorts
      .filter(Boolean)
      .map((s) => `sort=${encodeURIComponent(s)}`)
      .join("&");
    const url = `/promotions?lang=${lang}&page=${page}&size=${size}${
      sortParams ? `&${sortParams}` : ""
    }`;
    return api.get(url);
  },

  // paging active promotions (public)
  fetchActivePromotionsPaging: ({ lang = "VI", page = 0, size = 12 } = {}) => {
    return api.get(
      `/promotions/active/paging?lang=${lang}&page=${page}&size=${size}`
    );
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
    return api.post(`/promotions?lang=${lang}`, formData);
  },

  // Update an existing promotion
  updatePromotion: (promotionId, promotion, lang = "VI") => {
    const formData = new FormData();
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

  // Remove product from promotion
  removeProductFromPromotion: (promotionId, productId, lang = "VI") => {
    return api.delete(
      `/promotions/${promotionId}/products/${productId}?lang=${lang}`
    );
  },

  // Delete promotion
  deletePromotion: (promotionId, lang = "VI") => {
    return api.delete(`/promotions/${promotionId}?lang=${lang}`);
  },
};
