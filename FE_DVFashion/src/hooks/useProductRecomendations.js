import { useQuery } from "@tanstack/react-query";
import { getProductRecommendations } from "../services/recomendationAPI";

export const useProductRecommendations = (productId, limit) => {
  return useQuery({
    queryKey: ["recommendations", productId, limit],
    queryFn: () => getProductRecommendations(productId, limit),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
};
