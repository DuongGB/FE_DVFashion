import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { promotionAPI } from "../services/promotionAPI";

const normalizeLang = (l = "VI") =>
  l?.toUpperCase().startsWith("VI") ? "VI" : "EN";

export const usePromotion = (langInput = "VI") => {
  const lang = normalizeLang(langInput);
  const queryClient = useQueryClient();

  // Paging hook for admin promotions
  const usePromotionsPaging = ({
    page = 0,
    size = 12,
    sorts = [],
    enabled = true,
  } = {}) => {
    return useQuery({
      queryKey: ["promotions", "paging", lang, page, size, sorts],
      queryFn: async () => {
        const res = await promotionAPI.fetchPromotionsPaging({
          lang,
          page,
          size,
          sorts,
        });
        const data = res.data?.data ?? res.data ?? null;
        if (!data) {
          return {
            page,
            size,
            totalElements: 0,
            totalPages: 0,
            sorts: [],
            values: [],
            filters: null,
            last: true,
          };
        }
        return {
          page: data.page ?? page,
          size: data.size ?? size,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
          sorts: Array.isArray(data.sorts) ? data.sorts : [],
          values: Array.isArray(data.values) ? data.values : [],
          filters: data.filters ?? null,
          last: data.last ?? true,
        };
      },
      enabled,
      keepPreviousData: true,
      staleTime: 1000 * 30,
    });
  };

  // Active promotions paging
  const useActivePromotionsPaging = ({
    page = 0,
    size = 12,
    enabled = true,
  } = {}) => {
    return useQuery({
      queryKey: ["promotions", "active", "paging", lang, page, size],
      queryFn: async () => {
        const res = await promotionAPI.fetchActivePromotionsPaging({
          lang,
          page,
          size,
        });
        const data = res.data?.data ?? res.data ?? null;
        if (!data) {
          return {
            page,
            size,
            totalElements: 0,
            totalPages: 0,
            sorts: [],
            values: [],
            filters: null,
            last: true,
          };
        }
        return {
          page: data.page ?? page,
          size: data.size ?? size,
          totalElements: data.totalElements ?? 0,
          totalPages: data.totalPages ?? 0,
          sorts: Array.isArray(data.sorts) ? data.sorts : [],
          values: Array.isArray(data.values) ? data.values : [],
          filters: data.filters ?? null,
          last: data.last ?? true,
        };
      },
      enabled,
      keepPreviousData: true,
      staleTime: 1000 * 30,
    });
  };

  // Legacy simple list (now derived from paging fetchPromotions)
  const {
    data: promotionsPage,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["promotions", "legacy", lang],
    queryFn: async () => {
      const pageData = await promotionAPI.fetchPromotions(lang);
      return pageData;
    },
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  const promotions = promotionsPage?.values ?? [];

  // Single promotion
  const usePromotionById = (promotionId, enabled = true) => {
    const langNorm = lang;
    return useQuery({
      queryKey: ["promotion", promotionId, langNorm],
      queryFn: async () => {
        const res = await promotionAPI.getPromotionById(promotionId, langNorm);
        const data = res.data?.data ?? res.data ?? null;
        return data
          ? {
              ...data,
              promotionProducts: Array.isArray(data.promotionProducts)
                ? data.promotionProducts
                : [],
            }
          : null;
      },
      enabled: enabled && !!promotionId,
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      },
    });
  };

  const createPromotionMutation = useMutation({
    mutationFn: ({ promotionData, lang }) =>
      promotionAPI.createPromotion(promotionData, normalizeLang(lang ?? lang)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: ({ promotionId, promotionData, lang }) =>
      promotionAPI.updatePromotion(
        promotionId,
        promotionData,
        normalizeLang(lang ?? lang)
      ),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({
        queryKey: ["promotion", vars.promotionId],
      });
    },
  });

  const removeProductMutation = useMutation({
    mutationFn: ({ promotionId, productId, lang }) =>
      promotionAPI.removeProductFromPromotion(
        promotionId,
        productId,
        normalizeLang(lang ?? lang)
      ),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({
        queryKey: ["promotion", vars.promotionId],
      });
    },
  });

  const deletePromotionMutation = useMutation({
    mutationFn: ({ promotionId, lang = "VI" }) =>
      promotionAPI.deletePromotion(promotionId, normalizeLang(lang)),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({
        queryKey: ["promotion", vars.promotionId],
      });
    },
  });

  return {
    // Legacy list
    promotions,
    promotionsPage,
    isLoading,
    isFetching,
    error,

    // Paging hooks
    usePromotionsPaging,
    useActivePromotionsPaging,

    // CRUD
    createPromotion: createPromotionMutation.mutateAsync,
    isCreating: createPromotionMutation.isPending,

    updatePromotion: updatePromotionMutation.mutateAsync,
    isUpdating: updatePromotionMutation.isPending,

    removeProduct: removeProductMutation.mutateAsync,
    isRemoving: removeProductMutation.isPending,

    deletePromotion: deletePromotionMutation.mutateAsync,
    isDeleting: deletePromotionMutation.isPending,

    // Single item hook
    usePromotionById,
  };
};
