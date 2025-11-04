import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressAPI } from "../services/addressAPI";
import { toast } from "react-toastify";

export const useAddress = () => {
  const queryClient = useQueryClient();

  // Get all addresses
  const { data, isLoading, error } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressAPI.getAllAddress,
    select: (res) => {
      // Normalize various possible shapes to an array
      if (!res) return [];
      if (Array.isArray(res)) return res;
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res?.data?.data)) return res.data.data;
      return [];
    },
  });

  const addresses = data || [];

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

  // Expose helpers to fetch provinces/districts/wards via backend
  const fetchProvinces = async () => {
    return addressAPI.getProvinces();
  };

  const fetchDistricts = async (provinceId) => {
    return addressAPI.getDistrictsByProvince(provinceId);
  };

  const fetchWards = async (districtId) => {
    return addressAPI.getWardsByDistrict(districtId);
  };

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
    fetchProvinces,
    fetchDistricts,
    fetchWards,
  };
};
