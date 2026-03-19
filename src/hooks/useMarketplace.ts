/**
 * Marketplace Hook - Convex Only
 *
 * All marketplace operations now use Convex for real-time updates.
 * No more polling - everything is real-time!
 */

import {
  useMarketItems,
  useMarketItemsBySeller,
  useSearchMarketItems,
  useFeaturedItems,
  useMarketItem,
  useMarketItemMutations,
  useTransactionsByBuyer,
  useTransactionsBySeller,
  useTransaction,
  useTransactionMutations as useServiceTransactionMutations,
} from '../services/marketplaceService';

// =====================================================
// MARKETPLACE ITEMS HOOKS
// =====================================================

/**
 * Hook for fetching marketplace items
 * Now uses Convex real-time subscriptions!
 */
export function useGearListings(options: { limit?: number; status?: string } = {}) {
  const items = useMarketItems({
    limit: options.limit,
  });

  return {
    data: items?.filter(item => !options.status || item.status === options.status) || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

/**
 * Hook for fetching a single marketplace item
 * Now uses Convex real-time subscriptions!
 */
export function useGearListing(listingId: string | null) {
  const item = useMarketItem(listingId || undefined);

  return {
    listing: item || null,
    loading: item === undefined,
  };
}

/**
 * Hook for fetching marketplace items by seller
 * Now uses Convex real-time subscriptions!
 */
export function useSellerItems(sellerId: string | null, status?: string) {
  const items = useMarketItemsBySeller(sellerId || undefined, status);

  return {
    data: items || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

/**
 * Hook for searching marketplace items
 * Now uses Convex real-time subscriptions!
 */
export function useSearchMarketItemsHook(searchQuery: string, filters: {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  itemType?: string;
  limit?: number;
} = {}) {
  const items = useSearchMarketItems({
    searchQuery,
    ...filters,
  });

  return {
    data: items || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

/**
 * Hook for featured marketplace items
 * Now uses Convex real-time subscriptions!
 */
export function useFeaturedMarketItems(limit = 10) {
  const items = useFeaturedItems(limit);

  return {
    data: items || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

// =====================================================
// MARKETPLACE ITEM (SeshFx) HOOKS
// =====================================================

/**
 * Hook for fetching marketplace items (SeshFx store)
 * Now uses Convex real-time subscriptions!
 */
export function useMarketplaceItems(options: { type?: string } = {}) {
  const items = useMarketItems({
    type: options.type,
  });

  return {
    data: items?.filter(item => !options.type || item.itemType === options.type) || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

/**
 * Hook for fetching a single marketplace item
 * Now uses Convex real-time subscriptions!
 */
export function useMarketplaceItem(itemId: string | null) {
  const item = useMarketItem(itemId || undefined);

  return {
    item: item || null,
    loading: item === undefined,
  };
}

// =====================================================
// MARKETPLACE ITEM MUTATIONS
// =====================================================

/**
 * Hook for marketplace item mutations
 */
export function useMarketplaceItemMutations() {
  const { create, update, remove, incrementView } = useMarketItemMutations();

  return {
    createItem: async (itemData: any) => {
      try {
        const result = await create(itemData);
        return result;
      } catch (error) {
        console.error('Failed to create item:', error);
        throw error;
      }
    },

    updateItem: async (itemId: string, updates: any) => {
      try {
        await update({
          itemId: itemId as any,
          ...updates,
        });
      } catch (error) {
        console.error('Failed to update item:', error);
        throw error;
      }
    },

    deleteItem: async (itemId: string) => {
      try {
        await remove({
          itemId: itemId as any,
        });
      } catch (error) {
        console.error('Failed to delete item:', error);
        throw error;
      }
    },

    incrementViewCount: async (itemId: string) => {
      try {
        await incrementView({
          itemId: itemId as any,
        });
      } catch (error) {
        console.error('Failed to increment view count:', error);
        throw error;
      }
    },
  };
}

// =====================================================
// TRANSACTIONS HOOKS
// =====================================================

/**
 * Hook for fetching gear orders (buyer transactions)
 * Now uses Convex real-time subscriptions!
 */
export function useGearOrders(userId: string | null, status?: string | null) {
  const transactions = useTransactionsByBuyer(userId || undefined, status || undefined);

  return {
    data: transactions || [],
    loading: transactions === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

/**
 * Hook for fetching gear offers (transactions by item)
 * Now uses Convex real-time subscriptions!
 */
export function useGearOffers(options: { listingId?: string | null; userId?: string | null } = {}) {
  const transactions = useTransaction(options.listingId || undefined);

  return {
    data: transactions ? [transactions] : [],
    loading: transactions === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

/**
 * Hook for fetching safe exchange transactions
 * Now uses Convex real-time subscriptions!
 */
export function useSafeExchangeTransactions(userId: string | null, status?: string | null) {
  const transactions = useTransactionsByBuyer(userId || undefined, status || undefined);

  return {
    data: transactions || [],
    loading: transactions === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

/**
 * Hook for fetching a single safe exchange transaction
 * Now uses Convex real-time subscriptions!
 */
export function useSafeExchangeTransaction(transactionId: string | null) {
  const transaction = useTransaction(transactionId || undefined);

  return {
    transaction: transaction || null,
    loading: transaction === undefined,
  };
}

/**
 * Hook for fetching user library (purchased items)
 * Now uses Convex real-time subscriptions!
 */
export function useUserLibrary(userId: string | null) {
  const transactions = useTransactionsByBuyer(userId || undefined, 'completed');

  return {
    data: transactions || [],
    loading: transactions === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  };
}

/**
 * Hook for checking item ownership
 */
export function useItemOwnership(userId: string | null, itemId: string | null) {
  const transactions = useTransactionsByBuyer(userId || undefined, 'completed');

  const isOwned = transactions?.some(t => t.itemId === itemId) || false;

  return isOwned;
}

// =====================================================
// TRANSACTION MUTATIONS
// =====================================================

/**
 * Hook for transaction mutations
 */
export function useTransactionMutations() {
  const { create, acceptOffer, rejectOffer, complete, cancel, addTracking, updateTransaction, addPhoto } = useServiceTransactionMutations();

  return {
    createTransaction: async (transactionData: any) => {
      try {
        const result = await create(transactionData);
        return result;
      } catch (error) {
        console.error('Failed to create transaction:', error);
        throw error;
      }
    },

    createOffer: async (offerData: any) => {
      try {
        const result = await create(offerData);
        return result;
      } catch (error) {
        console.error('Failed to create offer:', error);
        throw error;
      }
    },

    acceptOffer: async (transactionId: string, counterOffer?: number, message?: string) => {
      try {
        await acceptOffer({
          transactionId: transactionId as any,
          counterOffer,
          message,
        });
      } catch (error) {
        console.error('Failed to accept offer:', error);
        throw error;
      }
    },

    rejectOffer: async (transactionId: string, reason?: string) => {
      try {
        await rejectOffer({
          transactionId: transactionId as any,
        });
      } catch (error) {
        console.error('Failed to reject offer:', error);
        throw error;
      }
    },

    completeTransaction: async (transactionId: string) => {
      try {
        await complete({
          transactionId: transactionId as any,
        });
      } catch (error) {
        console.error('Failed to complete transaction:', error);
        throw error;
      }
    },

    cancelTransaction: async (transactionId: string) => {
      try {
        await cancel({
          transactionId: transactionId as any,
        });
      } catch (error) {
        console.error('Failed to cancel transaction:', error);
        throw error;
      }
    },

    addTrackingNumber: async (transactionId: string, trackingNumber: string) => {
      try {
        await addTracking({
          transactionId: transactionId as any,
          trackingNumber,
        });
      } catch (error) {
      }
    },

    updateTransaction,
    addPhoto,
  };
}

/**
 * Hook for marketplace mutations (alias for useTransactionMutations as used in some components)
 */
export function useMarketplaceMutations() {
  return useTransactionMutations();
}


// =====================================================
// DISTRIBUTION HOOKS (Not yet implemented in Convex)
// =====================================================

/**
 * Hook for fetching distribution releases
 * TODO: Not yet implemented in Convex
 */
export function useDistributionReleases(userId: string | null) {
  return {
    data: [],
    loading: false,
    refresh: () => {},
  };
}

/**
 * Hook for fetching a single distribution release
 * TODO: Not yet implemented in Convex
 */
export function useDistributionRelease(releaseId: string | null) {
  return {
    release: null,
    loading: false,
  };
}

/**
 * Hook for distribution mutations
 * TODO: Not yet implemented in Convex
 */
export function useDistributionMutations() {
  return {
    createRelease: async (data: any) => {
      console.warn('Distribution releases not yet implemented in Convex');
      throw new Error('Not yet implemented');
    },
    updateRelease: async (releaseId: string, data: any) => {
      console.warn('Distribution releases not yet implemented in Convex');
      throw new Error('Not yet implemented');
    },
    deleteRelease: async (releaseId: string) => {
      console.warn('Distribution releases not yet implemented in Convex');
      throw new Error('Not yet implemented');
    },
  };
}
