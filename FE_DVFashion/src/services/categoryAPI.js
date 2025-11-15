import api from "./api";

export const categoryAPI = {
  // Fetch all categories (có phân trang, trả về PageResponse)
  getAllCategories: ({
    lang = "VI",
    page = 0,
    size = 100,
    sort = null,
    search = null,
    active = null,
    hasProducts = null,
  } = {}) => {
    const params = new URLSearchParams();
    params.set("lang", lang);
    params.set("page", page);
    params.set("size", size);
    if (sort) params.set("sort", Array.isArray(sort) ? sort.join(",") : sort);
    if (search) params.set("search", search);
    if (active !== null) params.set("active", active);
    if (hasProducts !== null) params.set("hasProducts", hasProducts);

    return api.get(`/categories/all?${params.toString()}`);
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
