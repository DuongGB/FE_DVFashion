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
    queryKey: ["vouchers", "admin", "all"],
    queryFn: () => voucherAPI.getVouchersForAdminAll(),
    enabled: false, // lazy by default, call refetch when needed
  });

  // Create
  const createVoucherMutation = useMutation({
    mutationFn: ({ payload, lang = "VI" }) =>
      voucherAPI.createVoucher(payload, lang),
    onSuccess: () => {
      queryClient.invalidateQueries(["vouchers"]);
    },
  });

  // Update
  const updateVoucherMutation = useMutation({
    mutationFn: ({ id, payload, lang = "VI" }) =>
      voucherAPI.updateVoucher(id, payload, lang),
    onSuccess: () => {
      queryClient.invalidateQueries(["vouchers"]);
    },
  });

  // Delete
  const deleteVoucherMutation = useMutation({
    mutationFn: ({ id, lang = "VI" }) => voucherAPI.deleteVoucher(id, lang),
    onSuccess: () => {
      queryClient.invalidateQueries(["vouchers", "admin"]);
      queryClient.invalidateQueries(["vouchers", "admin", "all"]);
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
    refetchAllAdmin: () =>
      queryClient.refetchQueries(["vouchers", "admin", "all"]),
  };
};

export default useVoucher;
