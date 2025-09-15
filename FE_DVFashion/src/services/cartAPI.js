import api from "./api";

// Thao tác với giỏ hàng
export const cartAPI = {
  // Lấy giỏ hàng hiện tại
  getCart: (lang) => {
    return api.get(`/cart?lang=${lang}`);
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: (data, lang = "VI") => {
    return api.post(`/cart/add?lang=${lang}`, data, {
      headers: { "Content-Type": "application/json" },
    });
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItemQuantity: (cartItemId, data, lang) => {
    return api.put(`/cart/items/${cartItemId}?lang=${lang}`, data, {
      headers: { "Content-Type": "application/json" },
    });
  },

  // Xóa một sản phẩm khỏi giỏ hàng
  removeCartItem: (cartItemId, lang) => {
    return api.delete(`/cart/items/${cartItemId}/?lang=${lang}`);
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: (lang) => {
    return api.delete(`/cart/clear?lang=${lang}`);
  },
};
