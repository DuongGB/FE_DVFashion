import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 phút mặc định
      gcTime: 30 * 60 * 1000, // 30 phút
    },
  },
});

// Helper để tạo query options cho data ít thay đổi
export const staticDataQueryOptions = {
  staleTime: 60 * 60 * 1000, // 1 giờ - cho categories, provinces, etc
  gcTime: 24 * 60 * 60 * 1000, // 24 giờ
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

// Helper cho data động
export const dynamicDataQueryOptions = {
  staleTime: 30 * 1000, // 30 giây - cho cart, orders, etc
  gcTime: 5 * 60 * 1000, // 5 phút
};

// Data bán tĩnh (products, promotions)
export const semiStaticDataQueryOptions = {
  staleTime: 10 * 60 * 1000, // 10 phút
  gcTime: 30 * 60 * 1000, // 30 phút
  refetchOnMount: false,
  refetchOnWindowFocus: false,
};

// Data user-specific (recommendations)
export const userDataQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 phút
  gcTime: 15 * 60 * 1000, // 15 phút
  refetchOnMount: false,
  refetchOnWindowFocus: false,
};
