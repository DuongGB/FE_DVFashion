import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAPI } from "../services/inventoryAPI";

export const useInventory = () => {
  const queryClient = useQueryClient();

  // Lấy danh sách inventory
  const {
    data: inventories,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["inventories"],
    queryFn: () =>
      inventoryAPI.getInventoryReport().then((res) => res.data.data),
    staleTime: 600000,
  });

  // Nhập kho
  const importStockMutation = useMutation({
    mutationFn: (importData) => inventoryAPI.importStock(importData),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventories"]);
      // queryClient.invalidateQueries(["inventoryDetails"]);
    },
  });

  // Điều chỉnh kho
  const adjustStockMutation = useMutation({
    mutationFn: (adjustData) => inventoryAPI.adjustStock(adjustData),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventories"]);
      // queryClient.invalidateQueries(["inventoryDetails"]);
    },
  });

  // Xuất kho
  const exportStockMutation = useMutation({
    mutationFn: (exportData) => inventoryAPI.exportStock(exportData),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventories"]);
      // queryClient.invalidateQueries(["inventoryDetails"]);
    },
  });

  // Hàm để lấy inventory bằng sizeId (không dùng react-query hook trực tiếp)
  const getInventoryBySize = async (sizeId) => {
    // Ưu tiên tìm trong cache inventories
    if (inventories && inventories.length > 0) {
      const found = inventories.find(
        (inv) => String(inv.sizeId) === String(sizeId)
      );
      if (found) return found;
    }
    // Nếu không có trong cache, fallback gọi API
    const res = await inventoryAPI.getInventoryBySize(sizeId);
    return res.data.data;
  };

  // Hàm để lấy chi tiết inventory bằng inventoryId
  const useInventoryDetails = (inventoryId) => {
    return useQuery({
      queryKey: ["inventoryDetails", inventoryId],
      queryFn: () =>
        inventoryAPI
          .getInventoryDetails(inventoryId)
          .then((res) => res.data.data),
      enabled: !!inventoryId, // Chỉ chạy query khi inventoryId có giá trị
    });
  };

  return {
    inventories,
    isLoading,
    error,
    refetch,
    importStock: importStockMutation.mutateAsync,
    isImporting: importStockMutation.isPending,
    adjustStock: adjustStockMutation.mutateAsync,
    isAdjusting: adjustStockMutation.isPending,
    exportStock: exportStockMutation.mutateAsync,
    isExporting: exportStockMutation.isPending,
    getInventoryBySize,
    useInventoryDetails,
  };
};
