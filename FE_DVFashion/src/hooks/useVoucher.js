import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import voucherAPI from "../services/voucherAPI";

export const useVoucher = (opts = { page: 0, size: 12 }) => {
  const queryClient = useQueryClient();
  const { page = 0, size = 12 } = opts;

  // Paged vouchers for admin
  const {
    data: pagedVouchers,
    isLoading: isLoadingPagedVouchers,
    isError: isErrorPagedVouchers,
  } = useQuery({
    queryKey: ["vouchers", "admin", page, size],
    queryFn: () => voucherAPI.getVouchersForAdmin(page, size),
    keepPreviousData: true,
  });

  // All vouchers for admin (non-paged cache)
  const { data: allVouchersAdmin, isLoading: isLoadingAllVouchers } = useQuery({
    queryKey: ["vouchers", "admin"],
    queryFn: () => voucherAPI.getVouchersForAdminAll(),
    enabled: false,
  });

  const createVoucherMutation = useMutation({
    mutationFn: ({ payload, lang = "VI" }) =>
      voucherAPI.createVoucher(payload, lang),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vouchers", "admin"],
        exact: false, // vẫn sẽ refetch tất cả ["vouchers", "admin", ...]
      });
    },
  });

  const updateVoucherMutation = useMutation({
    mutationFn: ({ id, payload, lang = "VI" }) =>
      voucherAPI.updateVoucher(id, payload, lang),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["vouchers", "admin"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["voucher", id] });
    },
  });

  // Delete
  const deleteVoucherMutation = useMutation({
    mutationFn: ({ id, lang = "VI" }) => voucherAPI.deleteVoucher(id, lang),
    onSuccess: () => {
      queryClient.invalidateQueries(["vouchers", "admin"]);
    },
  });

  // Remove product from voucher
  const removeProductMutation = useMutation({
    mutationFn: ({ voucherId, productId, lang = "VI" }) =>
      voucherAPI.removeProductFromVoucher(voucherId, productId, lang),
    onSuccess: () => {
      queryClient.invalidateQueries(["vouchers"]);
    },
  });

  return {
    pagedVouchers,
    isLoadingPagedVouchers,
    isErrorPagedVouchers,
    allVouchersAdmin,
    isLoadingAllVouchers,
    // mutations
    createVoucher: createVoucherMutation.mutateAsync,
    isCreating: createVoucherMutation.isLoading,
    updateVoucher: updateVoucherMutation.mutateAsync,
    isUpdating: updateVoucherMutation.isLoading,
    deleteVoucher: deleteVoucherMutation.mutateAsync,
    isDeleting: deleteVoucherMutation.isLoading,
    removeProductFromVoucher: removeProductMutation.mutateAsync,
    isRemovingProduct: removeProductMutation.isLoading,
    // utilities
    refetchPaged: () =>
      queryClient.refetchQueries(["vouchers", "admin", page, size]),
    refetchAllAdmin: () => queryClient.refetchQueries(["vouchers", "admin"]),
  };
};

export const useCustomerVoucher = (opts = { page: 0, size: 12 }) => {
  const { page = 0, size = 12 } = opts;

  // Paged vouchers for customer
  const {
    data: availableVouchers,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["vouchers", "customer", page, size],
    queryFn: () => voucherAPI.getAvailableVouchersForCustomer(page, size),
    keepPreviousData: true,
  });

  // All vouchers for customer (non-paged)
  const { data: allAvailableVouchers, isLoading: isLoadingAll } = useQuery({
    queryKey: ["vouchers", "customer"],
    queryFn: () => voucherAPI.getAvailableVouchersForCustomerAll(),
    enabled: false,
  });

  return {
    availableVouchers,
    isLoading,
    isError,
    allAvailableVouchers,
    isLoadingAll,
    refetch,
  };
};

export default useVoucher;
