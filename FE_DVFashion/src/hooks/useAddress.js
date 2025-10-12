import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressAPI } from "../services/addressAPI";
import { toast } from "react-toastify";

export const useAddress = () => {
  const queryClient = useQueryClient();

  // Get all addresses
  const {
    data: addresses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressAPI.getAllAddress,
    select: (response) => response.data || [],
  });

  // Get default address
  const defaultAddress = addresses?.find((addr) => addr.isDefault);

  // Create a new address
  const createAddressMutation = useMutation({
    mutationFn: addressAPI.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address created successfully");
    },
    onError: () => {
      toast.error("Failed to create address");
    },
  });

  // Update an existing address
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, addressData }) =>
      addressAPI.updateAddress(id, addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address updated successfully");
    },
    onError: () => {
      toast.error("Failed to update address");
    },
  });

  // Delete an address
  const deleteAddressMutation = useMutation({
    mutationFn: addressAPI.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete address");
    },
  });

  return {
    addresses,
    defaultAddress,
    isLoading,
    error,
    createAddress: createAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    createAddressLoading: createAddressMutation.isPending,
    updateAddressLoading: updateAddressMutation.isPending,
    deleteAddressLoading: deleteAddressMutation.isPending,
  };
};
