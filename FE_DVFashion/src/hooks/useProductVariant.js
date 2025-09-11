import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productVariantAPI } from "../services/productVariantAPI";

// Hook cho ProductVariant
export const useProductVariant = (productId) => {
  const queryClient = useQueryClient();

  // Lấy danh sách variant
  const { data: variants, isLoading: isLoadingVariants } = useQuery({
    queryKey: ["variants", productId],
    queryFn: () =>
      productVariantAPI
        .getVariantsByProductId(productId)
        .then((res) => res.data.data),
    enabled: !!productId,
  });

  // Thêm variant (với sizes và images)
  const addVariantMutation = useMutation({
    mutationFn: ({ variant, images }) =>
      productVariantAPI.addProductVariant(productId, variant, images),
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      queryClient.invalidateQueries(["products", "all"]);
    },
  });

  // Cập nhật variant (chỉ basic fields)
  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, variant }) =>
      productVariantAPI.updateProductVariant(productId, variantId, variant),
    onSuccess: () => {
      queryClient.invalidateQueries(["variants", productId]);
      queryClient.invalidateQueries(["products", "all"]);
    },
  });

  return {
    variants,
    isLoadingVariants,
    addVariant: addVariantMutation.mutateAsync,
    isAddingVariant: addVariantMutation.isPending,
    updateVariant: updateVariantMutation.mutateAsync,
    isUpdatingVariant: updateVariantMutation.isPending,
  };
};
