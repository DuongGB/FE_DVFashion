import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productAPI } from "../services/productAPI";

export const useProduct = (lang = "VI") => {
  const queryClient = useQueryClient();

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", "all", lang],
    queryFn: async () => {
      try {
        const res = await productAPI.getAllProducts(lang);
        console.log("Products response:", res.data);
        // ApiResponse wrapper: res.data.data contains the payload list
        const list = res.data?.data ?? res.data ?? [];
        // Ensure currentPrice exists and normalized for frontend
        return (Array.isArray(list) ? list : []).map((p) => ({
          ...p,
          currentPrice: p.currentPrice ?? p.salePrice ?? p.price ?? null,
        }));
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
    retry: (failureCount, error) => {
      if (error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: ({ productData, variantImages, lang = "VI" }) => {
      console.log("Creating product with data:", productData);
      return productAPI.createProduct(productData, variantImages, lang);
    },
    onSuccess: (data) => {
      console.log("Product created successfully:", data);
      queryClient.invalidateQueries(["products", "all"]);
    },
    onError: (error) => {
      console.error("Error creating product:", error);
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ productId, productData, lang = "VI" }) => {
      console.log(`Updating product ${productId} with data:`, productData);
      return productAPI.updateProduct(productId, productData, lang);
    },
    onSuccess: (data) => {
      console.log("Product updated successfully:", data);
      queryClient.invalidateQueries(["products", "all"]);
    },
    onError: (error) => {
      console.error("Error updating product:", error);
    },
  });

  return {
    // Fetched data
    products,
    isLoading,
    error,

    createProduct: createProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    createError: createProductMutation.error,

    updateProduct: updateProductMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
    updateError: updateProductMutation.error,
  };
};

// hook to fetch products by category (list)
export const useProductsByCategory = (categoryId, lang = "VI") => {
  return useQuery({
    queryKey: ["products", "byCategory", categoryId, lang],
    queryFn: async () => {
      if (!categoryId) return [];
      const res = await productAPI.getProductsByCategoryId(categoryId, lang);
      const list = res.data?.data ?? res.data ?? [];
      return (Array.isArray(list) ? list : []).map((p) => ({
        ...p,
        currentPrice: p.currentPrice ?? p.salePrice ?? p.price ?? null,
      }));
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

//hook to fetch products by category with paging (returns page response)
export const useProductsByCategoryPaging = (
  categoryId,
  page = 0,
  size = 12,
  lang = "VI"
) => {
  return useQuery({
    queryKey: ["products", "byCategoryPaging", categoryId, page, size, lang],
    queryFn: async () => {
      if (!categoryId) return { content: [], totalElements: 0, page: 0, size };
      const res = await productAPI.getProductsByCategoryIdPaging(
        categoryId,
        page,
        size,
        lang
      );

      const data = res.data?.data ?? res.data ?? {};

      // support both backend shapes: { content: [...], totalElements } OR { values: [...], totalElements } OR direct array
      let content = [];
      if (Array.isArray(data.content)) content = data.content;
      else if (Array.isArray(data.values)) content = data.values;
      else if (Array.isArray(data)) content = data;

      // normalize items
      content = content.map((p) => ({
        ...p,
        currentPrice: p.currentPrice ?? p.salePrice ?? p.price ?? null,
      }));

      const totalElements =
        data.totalElements ?? data.total ?? data.total_count ?? content.length;

      return {
        content,
        totalElements,
        page: data.page ?? data.pageIndex ?? page,
        size: data.size ?? data.pageSize ?? size,
      };
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
};
