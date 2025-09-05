import api from "./api";

export const promotionAPI = {
  // Fetch all promotions
  fetchPromotions: (lang = "VI") => {
    return api.get(`/promotions/all?lang=${lang}`);
  },

  // Create a new promotion
  createPromotion: (promotion, lang = "VI") => {
    return api.post(`/promotions?lang=${lang}`, promotion, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Update an existing promotion
  updatePromotion: (promotionId, promotion, lang = "VI") => {
    console.log("API UPDATE - Data keys:", Object.keys(promotion));
    console.log("API UPDATE - Data JSON:", JSON.stringify(promotion, null, 2));
    return api.put(`/promotions/${promotionId}?lang=${lang}`, promotion, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Get promotion by ID
  getPromotionById: (promotionId, lang) => {
    return api.get(`/promotions/${promotionId}?lang=${lang}`);
  },
};
