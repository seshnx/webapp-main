/**
 * Marketplace Hook - Convex Only
 *
 * All marketplace operations now use Convex for real-time updates.
 * No more polling - everything is real-time!
 */

import { useMemo, useCallback } from 'react';
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

  return useMemo(() => ({
    data: items?.filter(item => !options.status || item.status === options.status) || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [items, options.status]);
}

/**
 * Hook for fetching a single marketplace item
 * Now uses Convex real-time subscriptions!
 */
export function useGearListing(listingId: string | null) {
  const item = useMarketItem(listingId || undefined);

  return useMemo(() => ({
    listing: item || null,
    loading: item === undefined,
  }), [item]);
}

/**
 * Hook for fetching marketplace items by seller
 * Now uses Convex real-time subscriptions!
 */
export function useSellerItems(sellerId: string | null, status?: string) {
  const items = useMarketItemsBySeller(sellerId || undefined, status);

  return useMemo(() => ({
    data: items || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [items]);
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

  return useMemo(() => ({
    data: items || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [items]);
}

/**
 * Hook for featured marketplace items
 * Now uses Convex real-time subscriptions!
 */
export function useFeaturedMarketItems(limit = 10) {
  const items = useFeaturedItems(limit);

  return useMemo(() => ({
    data: items || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [items]);
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

  return useMemo(() => ({
    data: items?.filter(item => !options.type || item.itemType === options.type) || [],
    loading: items === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [items, options.type]);
}

/**
 * Hook for fetching a single marketplace item
 * Now uses Convex real-time subscriptions!
 */
export function useMarketplaceItem(itemId: string | null) {
  const item = useMarketItem(itemId || undefined);

  return useMemo(() => ({
    item: item || null,
    loading: item === undefined,
  }), [item]);
}

// =====================================================
// MARKETPLACE ITEM MUTATIONS
// =====================================================

/**
 * Hook for marketplace item mutations
 */
export function useMarketplaceItemMutations() {
  const { create, update, remove, incrementView } = useMarketItemMutations();

  const createItem = useCallback(async (itemData: any) => {
    try {
      const result = await create(itemData);
      return result;
    } catch (error) {
      console.error('Failed to create item:', error);
      throw error;
    }
  }, [create]);

  const updateItem = useCallback(async (itemId: string, updates: any) => {
    try {
      await update({
        itemId: itemId as any,
        ...updates,
      });
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  }, [update]);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      await remove({
        itemId: itemId as any,
      });
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  }, [remove]);

  const incrementViewCount = useCallback(async (itemId: string) => {
    try {
      await incrementView({
        itemId: itemId as any,
      });
    } catch (error) {
      console.error('Failed to increment view count:', error);
      throw error;
    }
  }, [incrementView]);

  return useMemo(() => ({
    createItem,
    updateItem,
    deleteItem,
    incrementViewCount,
  }), [createItem, updateItem, deleteItem, incrementViewCount]);
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

  return useMemo(() => ({
    data: transactions || [],
    loading: transactions === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [transactions]);
}

/**
 * Hook for fetching gear offers (transactions by item)
 * Now uses Convex real-time subscriptions!
 */
export function useGearOffers(options: { listingId?: string | null; userId?: string | null } = {}) {
  const transactions = useTransaction(options.listingId || undefined);

  return useMemo(() => ({
    data: transactions ? [transactions] : [],
    loading: transactions === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [transactions]);
}

/**
 * Hook for fetching safe exchange transactions
 * Now uses Convex real-time subscriptions!
 */
export function useSafeExchangeTransactions(userId: string | null, status?: string | null) {
  const transactions = useTransactionsByBuyer(userId || undefined, status || undefined);

  return useMemo(() => ({
    data: transactions || [],
    loading: transactions === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [transactions]);
}

/**
 * Hook for fetching a single safe exchange transaction
 * Now uses Convex real-time subscriptions!
 */
export function useSafeExchangeTransaction(transactionId: string | null) {
  const transaction = useTransaction(transactionId || undefined);

  return useMemo(() => ({
    transaction: transaction || null,
    loading: transaction === undefined,
  }), [transaction]);
}

/**
 * Hook for fetching user library (purchased items)
 * Now uses Convex real-time subscriptions!
 */
export function useUserLibrary(userId: string | null) {
  const transactions = useTransactionsByBuyer(userId || undefined, 'completed');

  return useMemo(() => ({
    data: transactions || [],
    loading: transactions === undefined,
    refresh: () => {}, // No-op - Convex auto-updates!
  }), [transactions]);
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

  const createTransactionAction = useCallback(async (transactionData: any) => {
    try {
      const result = await create(transactionData);
      return result;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }, [create]);

  const createOfferAction = useCallback(async (offerData: any) => {
    try {
      const result = await create(offerData);
      return result;
    } catch (error) {
      console.error('Failed to create offer:', error);
      throw error;
    }
  }, [create]);

  const acceptOfferAction = useCallback(async (transactionId: string, counterOffer?: number, message?: string) => {
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
  }, [acceptOffer]);

  const rejectOfferAction = useCallback(async (transactionId: string, reason?: string) => {
    try {
      await rejectOffer({
        transactionId: transactionId as any,
      });
    } catch (error) {
      console.error('Failed to reject offer:', error);
      throw error;
    }
  }, [rejectOffer]);

  const completeTransactionAction = useCallback(async (transactionId: string) => {
    try {
      await complete({
        transactionId: transactionId as any,
      });
    } catch (error) {
      console.error('Failed to complete transaction:', error);
      throw error;
    }
  }, [complete]);

  const cancelTransactionAction = useCallback(async (transactionId: string) => {
    try {
      await cancel({
        transactionId: transactionId as any,
      });
    } catch (error) {
      console.error('Failed to cancel transaction:', error);
      throw error;
    }
  }, [cancel]);

  const addTrackingNumberAction = useCallback(async (transactionId: string, trackingNumber: string) => {
    try {
      await addTracking({
        transactionId: transactionId as any,
        trackingNumber,
      });
    } catch (error) {
      console.error('Failed to add tracking number:', error);
    }
  }, [addTracking]);

  return useMemo(() => ({
    createTransaction: createTransactionAction,
    createOffer: createOfferAction,
    acceptOffer: acceptOfferAction,
    rejectOffer: rejectOfferAction,
    completeTransaction: completeTransactionAction,
    cancelTransaction: cancelTransactionAction,
    addTrackingNumber: addTrackingNumberAction,
    updateTransaction,
    addPhoto,
  }), [
    createTransactionAction,
    createOfferAction,
    acceptOfferAction,
    rejectOfferAction,
    completeTransactionAction,
    cancelTransactionAction,
    addTrackingNumberAction,
    updateTransaction,
    addPhoto,
  ]);
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
  return useMemo(() => ({
    data: [],
    loading: false,
    refresh: () => {},
  }), []);
}

/**
 * Hook for fetching a single distribution release
 * TODO: Not yet implemented in Convex
 */
export function useDistributionRelease(releaseId: string | null) {
  return useMemo(() => ({
    release: null,
    loading: false,
  }), []);
}

/**
 * Hook for distribution mutations
 * TODO: Not yet implemented in Convex
 */
export function useDistributionMutations() {
  const createRelease = useCallback(async (data: any) => {
    console.warn('Distribution releases not yet implemented in Convex');
    throw new Error('Not yet implemented');
  }, []);

  const updateRelease = useCallback(async (releaseId: string, data: any) => {
    console.warn('Distribution releases not yet implemented in Convex');
    throw new Error('Not yet implemented');
  }, []);

  const deleteRelease = useCallback(async (releaseId: string) => {
    console.warn('Distribution releases not yet implemented in Convex');
    throw new Error('Not yet implemented');
  }, []);

  return useMemo(() => ({
    createRelease,
    updateRelease,
    deleteRelease,
  }), [createRelease, updateRelease, deleteRelease]);
}
