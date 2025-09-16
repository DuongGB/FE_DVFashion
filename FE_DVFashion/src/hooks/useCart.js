import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartAPI } from "../services/cartAPI";

export const useCart = () => {
  const queryClient = useQueryClient();

  // Lấy giỏ hàng
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      try {
        const res = await cartAPI.getCart();
        console.log("Cart response:", res.data);
        return res.data.data || res.data || { items: [] };
      } catch (error) {
        console.error("Error fetching cart:", error);
        return { items: [] };
      }
    },
    retry: (failureCount, error) => {
      if (error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Thêm vào giỏ hàng
  const addToCartMutation = useMutation({
    mutationFn: (data) => cartAPI.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  // Cập nhật số lượng
  const updateQuantityMutation = useMutation({
    mutationFn: ({ cartItemId, newQuantity }) =>
      cartAPI.updateCartItemQuantity(cartItemId, { newQuantity }),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItemMutation = useMutation({
    mutationFn: (cartItemId) => cartAPI.removeCartItem(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  // Xóa toàn bộ giỏ hàng
  const clearCartMutation = useMutation({
    mutationFn: () => cartAPI.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  return {
    cart,
    isLoading,
    error,
    addToCart: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutateAsync,
    isUpdating: updateQuantityMutation.isPending,
    removeItem: removeItemMutation.mutateAsync,
    isRemoving: removeItemMutation.isPending,
    clearCart: clearCartMutation.mutateAsync,
    isClearing: clearCartMutation.isPending,
  };
};
