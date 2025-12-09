import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressAPI } from "../services/addressAPI";
import { toast } from "react-toastify";
import { useAuth } from "./useAuth";

export const useAddress = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Get all addresses
  const { data, isLoading, error } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressAPI.getAllAddress,
    enabled: isAuthenticated,
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

export const useProvinces = () => {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const provinces = await addressAPI.getProvinces();
      // Chuẩn hóa dữ liệu
      return (provinces || []).map((p) => ({
        code: p.provinceId,
        name: p.provinceName,
      }));
    },
    staleTime: 24 * 60 * 60 * 1000, //24 giờ - provinces rất ít thay đổi
    gcTime: 7 * 24 * 60 * 60 * 1000, //7 ngày
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useDistricts = (provinceId) => {
  return useQuery({
    queryKey: ["districts", provinceId],
    queryFn: async () => {
      if (!provinceId) return [];
      const res = await addressAPI.getDistrictsByProvince(provinceId);
      const districts = res?.data?.data || res?.data || res || [];
      return districts.map((d) => ({
        code: d.districtId || d.code,
        name: d.districtName || d.name,
      }));
    },
    enabled: !!provinceId,
    staleTime: 24 * 60 * 60 * 1000, //  24 giờ
    gcTime: 7 * 24 * 60 * 60 * 1000, //  7 ngày
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useWards = (districtId) => {
  return useQuery({
    queryKey: ["wards", districtId],
    queryFn: async () => {
      if (!districtId) return [];
      const res = await addressAPI.getWardsByDistrict(districtId);
      const wards = res?.data?.data || res?.data || res || [];
      return wards.map((w) => ({
        code: w.wardCode || w.code,
        name: w.wardName || w.name,
      }));
    },
    enabled: !!districtId,
    staleTime: 24 * 60 * 60 * 1000, //  24 giờ
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
