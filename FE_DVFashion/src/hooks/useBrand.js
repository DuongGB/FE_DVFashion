import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandAPI } from "../services/brandAPI";

export const useBrand = (lang = "VI") => {
  const queryClient = useQueryClient();

  // Fetch all brands
  const {
    data: brands,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["brands", "all", lang],
    queryFn: async () => {
      try {
        const res = await brandAPI.getAllBrands(lang);
        console.log("Brands response:", res.data);
        // Process brands to ensure proper image URLs
        const processedBrands = (res.data.data || res.data || []).map(
          (brand) => ({
            ...brand,
            image: brand.image
              ? brand.image.startsWith("http")
                ? brand.image
                : `${import.meta.env.VITE_API_BASE_URL}${brand.image}`
              : null,
          })
        );
        return processedBrands;
      } catch (error) {
        console.error("Error fetching brands:", error);
        if (error.response?.status === 401) {
          throw new Error("Bạn cần đăng nhập để xem danh sách thương hiệu");
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

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: ({ brandData, lang = "VI" }) => {
      console.log("Creating brand with data:", brandData);
      return brandAPI.createBrand(brandData, lang);
    },
    onSuccess: (data) => {
      console.log("Brand created successfully:", data);
      queryClient.invalidateQueries(["brands", "all"]);
      queryClient.invalidateQueries(["brands", "public"]);
    },
    onError: (error) => {
      console.error("Error creating brand:", error);
    },
  });

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: ({ brandId, brandData, lang = "VI" }) => {
      console.log(`Updating brand ${brandId} with data:`, brandData);
      return brandAPI.updateBrand(brandId, brandData, lang);
    },
    onSuccess: (data) => {
      console.log("Brand updated successfully:", data);
      queryClient.invalidateQueries(["brands", "all"]);
      queryClient.invalidateQueries(["brands", "public"]);
    },
    onError: (error) => {
      console.error("Error updating brand:", error);
    },
  });
  // Delete brand mutation
  const deleteBrandMutation = useMutation({
    mutationFn: (brandId) => {
      console.log("Deleting brand with ID:", brandId);
      return brandAPI.deleteBrand(brandId);
    },
    onSuccess: (data) => {
      console.log("Brand deleted successfully:", data);
      queryClient.invalidateQueries(["brands", "all"]);
      queryClient.invalidateQueries(["brands", "public"]);
    },
    onError: (error) => {
      console.error("Error deleting brand:", error);
    },
  });
  return {
    // Fetched data
    brands,
    isLoading,
    error,

    createBrand: createBrandMutation.mutate,
    isCreating: createBrandMutation.isPending,
    CreateError: createBrandMutation.error,

    updateBrand: updateBrandMutation.mutate,
    isUpdating: updateBrandMutation.isPending,
    updateError: updateBrandMutation.error,

    deleteBrand: deleteBrandMutation.mutate,
    isDeleting: deleteBrandMutation.isPending,
    deleteError: deleteBrandMutation.error,
  };
};
