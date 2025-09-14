import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryAPI } from "../services/inventoryAPI";

export const useInventory = () => {
  const queryClient = useQueryClient();

  // Lấy danh sách inventory
  const {
    data: inventories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["inventories"],
    queryFn: () =>
      inventoryAPI.getInventoryReport().then((res) => res.data.data),
  });

  // Nhập kho
  const importStockMutation = useMutation({
    mutationFn: (importData) => inventoryAPI.importStock(importData),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventories"]);
    },
  });

  // Điều chỉnh kho
  const adjustStockMutation = useMutation({
    mutationFn: (adjustData) => inventoryAPI.adjustStock(adjustData),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventories"]);
    },
  });

  // Xuất kho
  const exportStockMutation = useMutation({
    mutationFn: (exportData) => inventoryAPI.exportStock(exportData),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventories"]);
    },
  });

  return {
    inventories,
    isLoading,
    error,
    importStock: importStockMutation.mutateAsync,
    isImporting: importStockMutation.isPending,
    adjustStock: adjustStockMutation.mutateAsync,
    isAdjusting: adjustStockMutation.isPending,
    exportStock: exportStockMutation.mutateAsync,
    isExporting: exportStockMutation.isPending,
  };
};
