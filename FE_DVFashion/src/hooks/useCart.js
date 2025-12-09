import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartAPI } from "../services/cartAPI";
import { useAuth } from "./useAuth";

export const useCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

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
        return res.data.data || res.data || { items: [] };
      } catch (error) {
        console.error("Error fetching cart:", error);
        return { items: [] };
      }
    },
    enabled: isAuthenticated,
    retry: 0, // Giảm từ 2 xuống 0 - cart là data động
    staleTime: 30 * 1000, //  30 giây - cart thay đổi thường xuyên
    gcTime: 5 * 60 * 1000, //  5 phút
  });

  // Mutations với optimistic updates
  const addToCartMutation = useMutation({
    mutationFn: (data) => cartAPI.addToCart(data),
    onSuccess: async (newItem) => {
      // Optimistic update giỏ hàng
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // Lưu trạng thái giỏ hàng trước đó
      const previousCart = queryClient.getQueryData(["cart"]);

      // Cập nhật giỏ hàng trong cache
      queryClient.setQueryData(["cart"], (old) => ({
        ...old,
        items: [...(old?.items || []), newItem],
      }));
      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      queryClient.setQueryData(["cart"], context.previousCart);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Cập nhật số lượng
  const updateQuantityMutation = useMutation({
    mutationFn: ({ cartItemId, newQuantity }) =>
      cartAPI.updateCartItemQuantity(cartItemId, { newQuantity }),
    onMutate: async ({ cartItemId, newQuantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old) => ({
        ...old,
        items: old?.items?.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      }));

      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["cart"], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItemMutation = useMutation({
    mutationFn: (cartItemId) => cartAPI.removeCartItem(cartItemId),
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old) => ({
        ...old,
        items: old?.items?.filter((item) => item.cartItemId !== cartItemId),
      }));

      return { previousCart };
    },
    onError: (err, cartItemId, context) => {
      queryClient.setQueryData(["cart"], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Xóa toàn bộ giỏ hàng
  const clearCartMutation = useMutation({
    mutationFn: () => cartAPI.clearCart(),
    onSuccess: () => {
      //Set data trực tiếp thay vì invalidate
      queryClient.setQueryData(["cart"], { items: [] });
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
