import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryAPI } from "../services/categoryAPI";
import { getCookie } from "../utils/cookies";

export const useCategory = ({
  lang = "VI",
  page = 0,
  size = 100,
  sort = null,
  search = null,
  active = null,
  hasProducts = null,
} = {}) => {
  const queryClient = useQueryClient();

  // Fetch all categories
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "categories",
      "all",
      lang,
      page,
      size,
      sort,
      search,
      active,
      hasProducts,
    ],
    queryFn: async () => {
      const res = await categoryAPI.getAllCategories({
        lang,
        page,
        size,
        sort,
        search,
        active,
        hasProducts,
      });
      // Dữ liệu thực nằm ở res.data.data.content
      const content = res.data?.data?.values || [];
      // Xử lý image URL nếu cần
      return content.map((category) => ({
        ...category,
        image: category.image
          ? category.image.startsWith("http")
            ? category.image
            : `${import.meta.env.VITE_API_BASE_URL}${category.image}`
          : null,
      }));
    },
    retry: (failureCount, error) => {
      if (error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: ({ categoryData, lang = "VI" }) => {
      console.log("Creating category with data:", categoryData);
      return categoryAPI.createCategory(categoryData, lang);
    },
    onSuccess: (data) => {
      console.log("Category created successfully:", data);
      queryClient.invalidateQueries(["categories", "all"]);
      queryClient.invalidateQueries(["categories", "public"]);
    },
    onError: (error) => {
      console.error("Create category error:", error);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, categoryData, lang = "VI" }) => {
      console.log("Updating category:", categoryId, categoryData, "lang", lang);
      return categoryAPI.updateCategory(categoryId, categoryData, lang);
    },
    onSuccess: (data) => {
      console.log("Category updated successfully:", data);
      queryClient.invalidateQueries(["categories", "all"]);
      queryClient.invalidateQueries(["categories", "public"]);
    },
    onError: (error) => {
      console.error("Update category error:", error);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => {
      console.log("Deleting category:", categoryId);
      return categoryAPI.deleteCategory(categoryId);
    },
    onSuccess: (data) => {
      console.log("Category deleted successfully:", data);
      queryClient.invalidateQueries(["categories", "all"]);
      queryClient.invalidateQueries(["categories", "public"]);
    },
    onError: (error) => {
      console.error("Delete category error:", error);
    },
  });

  return {
    // Categories data
    categories,
    isLoading,
    error,
    refetch,

    // Create category
    create: createCategoryMutation.mutateAsync,
    isCreating: createCategoryMutation.isPending,
    createError: createCategoryMutation.error,

    // Update category
    update: updateCategoryMutation.mutateAsync,
    isUpdating: updateCategoryMutation.isPending,
    updateError: updateCategoryMutation.error,

    // Delete category
    deleteCategory: deleteCategoryMutation.mutateAsync,
    isDeleting: deleteCategoryMutation.isPending,
    deleteError: deleteCategoryMutation.error,
  };
};
