import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { promotionAPI } from "../services/promotionAPI";

export const usePromotion = (lang = "VI") => {
  const queryClient = useQueryClient();

  // Fetch all promotions
  const {
    data: promotions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["promotions", "all", lang],
    queryFn: async () => {
      const res = await promotionAPI.fetchPromotions(lang);
      // backend returns ApiResponse wrapper -> try to normalize
      const payload = res.data?.data ?? res.data ?? [];
      return payload;
    },
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Create promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: ({ promotionData, lang }) =>
      promotionAPI.createPromotion(promotionData, lang),
    onSuccess: () => {
      // invalidate all promotions queries
      queryClient.invalidateQueries(["promotions"]);
    },
    onError: (error) => {
      console.error("Create promotion error:", error);
      throw error;
    },
  });

  // Update promotion mutation
  const updatePromotionMutation = useMutation({
    mutationFn: ({ promotionId, promotionData, lang }) =>
      promotionAPI.updatePromotion(promotionId, promotionData, lang),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["promotions"]);
      queryClient.invalidateQueries(["promotion", variables.promotionId]);
    },
    onError: (error) => {
      console.error("Update promotion error:", error);
      throw error;
    },
  });

  // Remove product from promotion mutation
  const removeProductMutation = useMutation({
    mutationFn: ({ promotionId, productId, lang }) =>
      promotionAPI.removeProductFromPromotion(promotionId, productId, lang),
    onSuccess: (_, variables) => {
      // refresh list and single promotion cache
      queryClient.invalidateQueries(["promotions"]);
      queryClient.invalidateQueries(["promotion", variables.promotionId]);
    },
    onError: (error) => {
      console.error("Remove product from promotion error:", error);
      throw error;
    },
  });

  // Get promotion by ID mutation
  const usePromotionById = (promotionId, enabled = false) => {
    return useQuery({
      queryKey: ["promotion", promotionId, lang],
      queryFn: () => promotionAPI.getPromotionById(promotionId, lang),
      enabled: enabled && !!promotionId,
      select: (data) => data.data,
    });
  };

  // Delete promotion mutation
  const deletePromotionMutation = useMutation({
    mutationFn: ({ promotionId, lang = "VI" }) =>
      promotionAPI.deletePromotion(promotionId, lang),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["promotions"]);
      queryClient.invalidateQueries(["promotion", variables.promotionId]);
    },
    onError: (error) => {
      console.error("Delete promotion error:", error);
      throw error;
    },
  });

  return {
    // Fetched data
    promotions,
    isLoading,
    error,

    createPromotion: createPromotionMutation.mutateAsync,
    isCreating: createPromotionMutation.isPending,
    CreateError: createPromotionMutation.error,

    updatePromotion: updatePromotionMutation.mutateAsync,
    isUpdating: updatePromotionMutation.isPending,
    UpdateError: updatePromotionMutation.error,

    removeProduct: removeProductMutation.mutateAsync,
    isRemoving: removeProductMutation.isPending,
    RemoveProductError: removeProductMutation.error,

    deletePromotion: deletePromotionMutation.mutateAsync,
    isDeleting: deletePromotionMutation.isPending,
    deleteError: deletePromotionMutation.error,

    getPromotionById: usePromotionById.mutateAsync,
    isLoadingPromotionById: usePromotionById.isPending,
    PromotionByIdError: usePromotionById.error,
  };
};
