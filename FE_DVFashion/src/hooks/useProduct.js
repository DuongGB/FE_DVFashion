import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productAPI } from "../services/productAPI";

export const useProduct = (params = {}) => {
  const queryClient = useQueryClient();

  const {
    page = 0,
    size = 10,
    sort = null,
    search = null,
    categoryId = null,
    promotionId = null,
    status = null,
    onSale = null,
    minPrice = null,
    maxPrice = null,
    startDate = null,
    endDate = null,
    lang = "VI",
  } = params;

  const {
    data: productResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", "all", params],
    queryFn: async () => {
      try {
        const res = await productAPI.getAllProducts(params);
        console.log("Products response:", res.data);

        // Backend trả về ApiResponse<PageResponse<ProductResponse>>
        const pageData = res.data?.data ?? res.data ?? {};

        // PageResponse structure: { values: [...], pageIndex, pageSize, totalElements, totalPages, filterInfo }
        const products = (pageData.values ?? pageData.content ?? []).map(
          (p) => ({
            ...p,
            currentPrice: p.currentPrice ?? p.salePrice ?? p.price ?? null,
          })
        );

        return {
          products,
          totalElements: pageData.totalElements ?? 0,
          totalPages: pageData.totalPages ?? 0,
          pageIndex: pageData.pageIndex ?? 0,
          pageSize: pageData.pageSize ?? size,
          filterInfo: pageData.filterInfo ?? null,
        };
      } catch (error) {
        console.error("Error fetching products:", error);
        return {
          products: [],
          totalElements: 0,
          totalPages: 0,
          pageIndex: 0,
          pageSize: size,
          filterInfo: null,
        };
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
    products: productResponse?.products ?? [],
    totalElements: productResponse?.totalElements ?? 0,
    totalPages: productResponse?.totalPages ?? 0,
    pageIndex: productResponse?.pageIndex ?? 0,
    pageSize: productResponse?.pageSize ?? size,
    filterInfo: productResponse?.filterInfo ?? null,

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

      // support both backend shapes
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

export const useProductById = (productId, lang = "VI") => {
  return useQuery({
    queryKey: ["product", productId, lang],
    queryFn: async () => {
      if (!productId) return null;
      const res = await productAPI.getProductById(productId, lang);
      const p = res.data?.data ?? res.data ?? null;
      if (!p) return null;
      return {
        ...p,
        currentPrice: p.currentPrice ?? p.salePrice ?? p.price ?? null,
      };
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
};
