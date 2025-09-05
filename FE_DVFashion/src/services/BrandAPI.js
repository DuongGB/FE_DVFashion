import api from "./api";

export const brandAPI = {
  // Fetch all brands
  getAllBrands: (lang = "VI") => {
    return api.get(`/brands/all?lang=${lang}`);
  },

  // Create a new brand
  createBrand: (brand, lang = "VI") => {
    return api.post(`/brands?lang=${lang}`, brand, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update an existing brand
  updateBrand: (brandId, brand, lang = "VI") => {
    return api.put(`/brands/${brandId}?lang=${lang}`, brand, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete a brand
  deleteBrand: (brandId) => {
    return api.patch(`/brands/${brandId}/deactivate`);
  },

  // Get brand by ID
  getBrandById: (brandId, lang) => {
    return api.get(`/brands/${brandId}?lang=${lang}`);
  },
};
