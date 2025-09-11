import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productAPI } from "../services/productAPI";

export const useProduct = (lang = "VI") => {
  const queryClient = useQueryClient();

  // Fetch all products
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
        return res.data.data || res.data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        if (error.response?.status === 401) {
          throw new Error("Bạn cần đăng nhập để xem danh sách sản phẩm");
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
