import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sizeAPI } from "../services/sizeAPI";

export const UseSize = (variantId) => {
  const queryClient = useQueryClient();

  // Lấy danh sách size
  const { data: sizes, isLoading: isLoadingSizes } = useQuery({
    queryKey: ["sizes", variantId],
    queryFn: () =>
      sizeAPI.getSizesByVariantId(variantId).then((res) => res.data.data),
    enabled: !!variantId,
  });

  // Thêm size mới
  const addSizeMutation = useMutation({
    mutationFn: (sizeData) => sizeAPI.addSize(variantId, sizeData),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries(["sizes", variantId]),
        queryClient.invalidateQueries(["variants"]),
        queryClient.invalidateQueries(["products", "all"]),
        queryClient.invalidateQueries(["products", "all", "VI"]),
        queryClient.invalidateQueries(["products", "all", "EN"]),
      ]);

      // ✅ FORCE REFETCH PRODUCTS
      queryClient.refetchQueries(["products", "all"]);
    },
  });

  // Cập nhật size (sizeName hoặc stockQuantity)
  const updateSizeMutation = useMutation({
    mutationFn: ({ sizeId, sizeData }) =>
      sizeAPI.updateSize(variantId, sizeId, sizeData),
    onSuccess: () => {
      // ✅ INVALIDATE ALL RELATED CACHES
      Promise.all([
        queryClient.invalidateQueries(["sizes", variantId]),
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
    sizes,
    isLoadingSizes,
    addSize: addSizeMutation.mutateAsync,
    isAddingSize: addSizeMutation.isPending,
    updateSize: updateSizeMutation.mutateAsync,
    isUpdatingSize: updateSizeMutation.isPending,
  };
};
