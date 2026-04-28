import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 *
 * Provides centralized caching and state management for API calls
 * Replaces manual polling and caching logic throughout the app
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Time in milliseconds that inactive queries will remain in cache
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)

      // Number of times to retry failed queries
      retry: 1,

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (can be disabled per query)
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Mutation retry delay
      retryDelay: 1000,
    },
  },
});
