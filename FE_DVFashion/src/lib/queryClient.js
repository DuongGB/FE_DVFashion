import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed requests once before failing (default is 3)
      refetchOnWindowFocus: false, // Do not refetch on window focus (default is true)
      staleTime: 10 * 60 * 1000, // Tăng lên 10 phút - data được coi là "fresh" trong 10 phút
      // Trong khoảng thời gian này, React Query sẽ dùng cache thay vì gọi API lại
      cacheTime: 30 * 60 * 1000, // Tăng lên 30 phút - giữ data trong cache 30 phút khi không có component nào sử dụng
      // Nếu user quay lại sidebar trong vòng 30 phút, data vẫn còn trong cache
    },
  },
});
