import api from "./api";
import { useQuery } from "@tanstack/react-query";

export const productAPI = {
  // Fetch all products
  getAllProducts: (lang = "VI") => {
    return api.get(`/products/all?lang=${lang}`);
  },

  // Create a new product
  createProduct: (product, variantImages, lang = "VI") => {
    const formData = new FormData();
    formData.append(
      "product",
      new Blob([JSON.stringify(product)], { type: "application/json" })
    );
    if (variantImages && variantImages.length > 0) {
      variantImages.forEach((image, index) => {
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
