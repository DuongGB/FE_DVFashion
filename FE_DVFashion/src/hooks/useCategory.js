import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryAPI } from "../services/categoryAPI";

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
    retry: 1,
    // Tăng cache time vì categories ít thay đổi
    staleTime: 30 * 60 * 1000, // 30 phút thay vì 5 phút
    gcTime: 60 * 60 * 1000, // 1 giờ thay vì 10 phút
    refetchOnMount: false, //Không refetch khi mount
    refetchOnWindowFocus: false,
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: ({ categoryData, lang = "VI" }) => {
      return categoryAPI.createCategory(categoryData, lang);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", "all"],
        exact: false, // invalidate tất cả variations của categories/all
      });
    },
    onError: (error) => {
      console.error("Create category error:", error);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, categoryData, lang = "VI" }) => {
      return categoryAPI.updateCategory(categoryId, categoryData, lang);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", "all"],
        exact: false,
      });
    },
    onError: (error) => {
      console.error("Update category error:", error);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => {
      return categoryAPI.deleteCategory(categoryId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["categories", "all"],
        exact: false,
      });
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
