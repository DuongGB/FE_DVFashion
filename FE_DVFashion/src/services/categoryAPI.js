import api from "./api";

export const categoryAPI = {
  // Fetch all categories
  getAllCategories: (lang = "VI") => {
    return api.get(`/categories/all?lang=${lang}`);
  },

  // Create a new category
  createCategory: (category, lang = "VI") => {
    return api.post(`/categories?lang=${lang}`, category, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update an existing category
  updateCategory: (categoryId, category, lang = "VI") => {
    return api.put(`/categories/${categoryId}?lang=${lang}`, category, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete a category
  deleteCategory: (categoryId) => {
    return api.patch(`/categories/${categoryId}/deactivate`);
  },

  // Get category by ID
  getCategoryById: (categoryId, lang) => {
    return api.get(`/categories/${categoryId}?lang=${lang}`);
  },
};
