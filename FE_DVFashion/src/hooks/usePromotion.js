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
      try {
        const res = await promotionAPI.fetchPromotions(lang);
        console.log("Promotions response:", res.data);
        return res.data.data || res.data || [];
      } catch (error) {
        console.error("Error fetching promotions:", error);
        if (error.response?.status === 401) {
          throw new Error("Bạn cần đăng nhập để xem danh sách khuyến mãi");
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error.response?.status === 401) {
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
      queryClient.invalidateQueries(["promotions"]);
    },
    onError: (error) => {
      console.error("Create promotion error:", error);
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

    getPromotionById: usePromotionById.mutateAsync,
    isLoadingPromotionById: usePromotionById.isPending,
    PromotionByIdError: usePromotionById.error,
  };
};
