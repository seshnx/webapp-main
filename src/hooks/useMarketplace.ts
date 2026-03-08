import { useState, useEffect, useCallback, useRef } from 'react';
import * as marketplaceService from '../services/marketplaceService';

// Polling interval for real-time updates (milliseconds)
const POLL_INTERVAL = 30000;

/**
 * Generic polling hook return value
 */
interface PollingResult<T> {
  data: T[];
  loading: boolean;
  refresh: () => void;
}

/**
 * Use polling hook for real-time data
 */
function usePolling<T>(
  fetchFn: () => Promise<T[]>,
  deps: any[],
  enabled: boolean = true
): PollingResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Use a ref to store the latest fetchFn to avoid dependency issues
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const result = await fetchFnRef.current();
      setData(result);
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
    if (!enabled) return;

    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, fetchData, ...deps]);

  return { data, loading, refresh: fetchData };
}

// =====================================================
// GEAR EXCHANGE HOOKS
// =====================================================

/**
 * Hook for fetching gear listings with polling
 */
export function useGearListings(options: { limit?: number; status?: string } = {}): PollingResult<any> {
  return usePolling(
    async () => {
      return await marketplaceService.fetchGearListings(options);
    },
    [options.limit, options.status]
  );
}

/**
 * Hook for fetching a single gear listing
 */
export function useGearListing(listingId: string | null) {
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!listingId) {
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      setLoading(true);
      try {
        const result = await marketplaceService.fetchGearListing(listingId);
        setListing(result);
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  return { listing, loading };
}

/**
 * Hook for fetching gear orders with polling
 */
export function useGearOrders(userId: string | null, status?: string | null): PollingResult<any> {
  return usePolling(
    async () => {
      if (!userId) return [];
      return await marketplaceService.fetchGearOrders({ userId, status: status || undefined });
    },
    [userId, status],
    !!userId
  );
}

/**
 * Hook for fetching gear offers with polling
 */
export function useGearOffers(options: { listingId?: string | null; userId?: string | null } = {}): PollingResult<any> {
  return usePolling(
    async () => {
      if (!options.listingId && !options.userId) return [];
      return await marketplaceService.fetchGearOffers(options);
    },
    [options.listingId, options.userId],
    !!(options.listingId || options.userId)
  );
}

// =====================================================
// SAFE EXCHANGE HOOKS
// =====================================================

/**
 * Hook for fetching safe exchange transactions with polling
 */
export function useSafeExchangeTransactions(userId: string | null, status?: string | null): PollingResult<any> {
  return usePolling(
    async () => {
      if (!userId) return [];
      return await marketplaceService.fetchSafeExchangeTransactions({ userId, status: status || undefined });
    },
    [userId, status],
    !!userId
  );
}

/**
 * Hook for fetching a single safe exchange transaction
 */
export function useSafeExchangeTransaction(transactionId: string | null) {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!transactionId) {
      setLoading(false);
      return;
    }

    const fetchTransaction = async () => {
      setLoading(true);
      try {
        const result = await marketplaceService.fetchSafeExchangeTransaction(transactionId);
        setTransaction(result);
      } catch (error) {
        console.error('Error fetching transaction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  return { transaction, loading };
}

// =====================================================
// MARKETPLACE ITEMS (SeshFx) HOOKS
// =====================================================

/**
 * Hook for fetching marketplace items with polling
 */
export function useMarketplaceItems(options: { type?: string } = {}): PollingResult<any> {
  return usePolling(
    async () => {
      return await marketplaceService.fetchMarketplaceItems(options);
    },
    [options.type]
  );
}

/**
 * Hook for fetching a single marketplace item
 */
export function useMarketplaceItem(itemId: string | null) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!itemId) {
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      try {
        const result = await marketplaceService.fetchMarketplaceItem(itemId);
        setItem(result);
      } catch (error) {
        console.error('Error fetching marketplace item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  return { item, loading };
}

/**
 * Hook for fetching user library with polling
 */
export function useUserLibrary(userId: string | null): PollingResult<any> {
  return usePolling(
    async () => {
      if (!userId) return [];
      return await marketplaceService.fetchUserLibrary(userId);
    },
    [userId],
    !!userId
  );
}

/**
 * Hook for checking item ownership
 */
export function useItemOwnership(userId: string | null, itemId: string | null): boolean {
  const [isOwned, setIsOwned] = useState<boolean>(false);

  useEffect(() => {
    if (!userId || !itemId) {
      setIsOwned(false);
      return;
    }

    const checkOwnership = async () => {
      try {
        const result = await marketplaceService.checkOwnership(userId, itemId);
        setIsOwned(result);
      } catch (error) {
        console.error('Error checking ownership:', error);
      }
    };

    checkOwnership();
  }, [userId, itemId]);

  return isOwned;
}

// =====================================================
// DISTRIBUTION HOOKS
// =====================================================

/**
 * Hook for fetching distribution releases with polling
 */
export function useDistributionReleases(userId: string | null): PollingResult<any> {
  return usePolling(
    async () => {
      if (!userId) return [];
      return await marketplaceService.fetchDistributionReleases(userId);
    },
    [userId],
    !!userId
  );
}

/**
 * Hook for fetching a single distribution release
 */
export function useDistributionRelease(releaseId: string | null) {
  const [release, setRelease] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!releaseId) {
      setLoading(false);
      return;
    }

    const fetchRelease = async () => {
      setLoading(true);
      try {
        const result = await marketplaceService.fetchDistributionRelease(releaseId);
        setRelease(result);
      } catch (error) {
        console.error('Error fetching release:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
  }, [releaseId]);

  return { release, loading };
}

// =====================================================
// MUTATION HOOKS
// =====================================================

/**
 * Hook for marketplace mutation functions
 * Returns all the mutation functions for creating, updating, and deleting marketplace data
 */
export function useMarketplaceMutations() {
  return {
    // Gear mutations
    createListing: async (data: any) => {
      return await marketplaceService.createListing(data);
    },
    updateListingStatus: async (id: string, status: string) => {
      return await marketplaceService.updateListingStatus(id, status);
    },
    createOrder: async (data: any) => {
      return await marketplaceService.createOrder(data);
    },
    updateOrderStatus: async (id: string, status: string) => {
      return await marketplaceService.updateOrderStatus(id, status);
    },
    createOffer: async (data: any) => {
      return await marketplaceService.createOffer(data);
    },
    respondToOffer: async (id: string, response: string) => {
      return await marketplaceService.respondToOffer(id, response);
    },

    // Safe exchange mutations
    createTransaction: async (data: any) => {
      return await marketplaceService.createTransaction(data);
    },
    updateTransaction: async (id: string, data: any) => {
      return await marketplaceService.updateTransaction(id, data);
    },
    addPhoto: async (transactionId: string, photoUrl: string) => {
      return await marketplaceService.addPhoto(transactionId, photoUrl);
    },

    // SeshFx mutations
    createMarketplaceItem: async (data: any) => {
      return await marketplaceService.createMarketplaceItem(data);
    },
    purchaseItem: async (userId: string, itemId: string) => {
      return await marketplaceService.purchaseItem(userId, itemId);
    },

    // Distribution mutations
    createRelease: async (data: any) => {
      return await marketplaceService.createRelease(data);
    },
    updateRelease: async (id: string, data: any) => {
      return await marketplaceService.updateRelease(id, data);
    },
    deleteRelease: async (id: string) => {
      return await marketplaceService.deleteRelease(id);
    },
  };
}
