import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed requests once before failing (default is 3)
      refetchOnWindowFocus: false, // Do not refetch on window focus (default is true)
      staleTime: 1 * 60 * 1000, // Within 1 minutes after data is fetched from the API,
      // any call to useQuery with the same queryKey will return data from the cache without sending a new API request.
      cacheTime: 5 * 60 * 1000, // If no component uses the query, the data will be kept in the cache for 5 minutes before being deleted.
    },
  },
});
