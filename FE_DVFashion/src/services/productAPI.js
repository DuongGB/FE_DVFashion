import api from "./api";

export const productAPI = {
  // Fetch all products with pagination and filters
  getAllProducts: (params = {}) => {
    const {
      page = 0,
      size = 10,
      sort = null,
      search = null,
      categoryId = null,
      promotionId = null,
      status = null,
      onSale = null,
      minPrice = null,
      maxPrice = null,
      startDate = null,
      endDate = null,
      lang = "VI",
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page);
    queryParams.append("size", size);
    queryParams.append("language", lang);

    if (sort) {
      if (Array.isArray(sort)) {
        sort.forEach((s) => queryParams.append("sort", s));
      } else {
        queryParams.append("sort", sort);
      }
    }

    if (search) queryParams.append("search", search);
    if (categoryId) queryParams.append("categoryId", categoryId);
    if (promotionId) queryParams.append("promotionId", promotionId);
    if (status) queryParams.append("status", status);
    if (onSale !== null) queryParams.append("onSale", onSale);
    if (minPrice) queryParams.append("minPrice", minPrice);
    if (maxPrice) queryParams.append("maxPrice", maxPrice);
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    return api.get(`/products/all?${queryParams.toString()}`);
  },

  // Create a new product
  createProduct: (product, variantImages, lang = "VI") => {
    const formData = new FormData();
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );
    if (variantImages && variantImages.length > 0) {
      variantImages.forEach((image) => {
        formData.append(`variantImages`, image);
      });
    }
    return api.post(`/products?lang=${lang}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update an existing product
  updateProduct: (productId, product, lang = "VI") => {
    return api.put(`/products/${productId}?lang=${lang}`, product, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Get product by ID
  getProductById: (productId, lang) => {
    return api.get(`/products/${productId}?lang=${lang}`);
  },

  getProductsByCategoryId: (categoryId, lang = "VI") => {
    return api.get(`/products/category/${categoryId}?lang=${lang}`);
  },

  getProductsByCategoryIdPaging: (
    categoryId,
    page = 0,
    size = 12,
    lang = "VI"
  ) => {
    return api.get(
      `/products/category/${categoryId}/paging?page=${page}&size=${size}&lang=${lang}`
    );
  },
};
