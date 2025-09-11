import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productVariantImageAPI } from "../services/productVariantImageAPI";

export const UseProductVariantImage = (variantId) => {
  const queryClient = useQueryClient();

  // Lấy danh sách ảnh
  const { data: images, isLoading: isLoadingImages } = useQuery({
    queryKey: ["variantImages", variantId],
    queryFn: () =>
      productVariantImageAPI
        .getImagesByVariantId(variantId)
        .then((res) => res.data.data),
    enabled: !!variantId,
  });

  // Thêm ảnh mới
  const addImageMutation = useMutation({
    mutationFn: ({ imageInfo, imageFile }) =>
      productVariantImageAPI.addImageToVariant(variantId, imageInfo, imageFile),
    onSuccess: () => {
      // ✅ INVALIDATE ALL RELATED CACHES
      Promise.all([
        queryClient.invalidateQueries(["variantImages", variantId]),
        queryClient.invalidateQueries(["variants"]),
        queryClient.invalidateQueries(["products", "all"]),
        queryClient.invalidateQueries(["products", "all", "VI"]),
        queryClient.invalidateQueries(["products", "all", "EN"]),
      ]);

      // ✅ FORCE REFETCH PRODUCTS
      queryClient.refetchQueries(["products", "all"]);
    },
  });

  // Cập nhật ảnh (chỉ isPrimary, không thay đổi file)
  const updateImageMutation = useMutation({
    mutationFn: ({ imageId, imageInfo, imageFile = null }) =>
      productVariantImageAPI.updateVariantImage(
        variantId,
        imageId,
        imageInfo,
        imageFile
      ),
    onSuccess: () => {
      // ✅ INVALIDATE ALL RELATED CACHES
      Promise.all([
        queryClient.invalidateQueries(["variantImages", variantId]),
        queryClient.invalidateQueries(["variants"]),
        queryClient.invalidateQueries(["products", "all"]),
        queryClient.invalidateQueries(["products", "all", "VI"]),
        queryClient.invalidateQueries(["products", "all", "EN"]),
      ]);

      // ✅ FORCE REFETCH PRODUCTS
      queryClient.refetchQueries(["products", "all"]);
    },
  });

  return {
    images,
    isLoadingImages,
    addImage: addImageMutation.mutateAsync,
    isAddingImage: addImageMutation.isPending,
    updateImage: updateImageMutation.mutateAsync,
    isUpdatingImage: updateImageMutation.isPending,
  };
};
