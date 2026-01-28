import { useState, useEffect, useCallback } from 'react';
import {
  getGearListings,
  getGearListingById,
  createGearListing,
  updateGearListingStatus,
  getGearOrders,
  createGearOrder,
  updateGearOrderStatus,
  getGearOffers,
  createGearOffer,
  respondToGearOffer,
  getSafeExchangeTransactions,
  getSafeExchangeTransactionById,
  createSafeExchangeTransaction,
  updateSafeExchangeTransaction,
  addTransactionPhoto,
  getMarketplaceItems,
  getMarketplaceItemById,
  createMarketplaceItemSeshFx,
  getUserLibrary,
  addToUserLibrary,
  checkItemOwnership,
  getDistributionReleases,
  getDistributionReleaseById,
  createDistributionRelease,
  updateDistributionRelease,
  deleteDistributionRelease
} from '../config/neonQueries';

// Polling interval for real-time updates (milliseconds)
const POLL_INTERVAL = 30000;

// Helper hook for polling
function usePolling(fetchFn, deps, enabled = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled]);

  useEffect(() => {
    fetchData();
    if (!enabled) return;

    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData, enabled, ...deps]);

  return { data, loading, refresh: fetchData };
}

// =====================================================
// GEAR EXCHANGE HOOKS
// =====================================================

/**
 * Hook for fetching gear listings with polling
 *
 * @param {object} options - Query options
 * @returns {object} { data, loading, refresh }
 *
 * @example
 * const { data: listings, loading, refresh } = useGearListings({ limit: 20, status: 'active' });
 */
export function useGearListings({ limit = 50, status } = {}) {
  return usePolling(() => getGearListings({ limit, status }), [limit, status]);
}

/**
 * Hook for fetching a single gear listing
 *
 * @param {string} listingId - Listing ID
 * @returns {object} { listing, loading }
 *
 * @example
 * const { listing, loading } = useGearListing('listing-123');
 */
export function useGearListing(listingId) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      setLoading(true);
      try {
        const data = await getGearListingById(listingId);
        setListing(data);
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
 *
 * @param {string} userId - User ID
 * @param {string} status - Optional status filter
 * @returns {object} { data, loading, refresh }
 *
 * @example
 * const { data: orders, loading } = useGearOrders(userId, 'pending');
 */
export function useGearOrders(userId, status) {
  return usePolling(() => getGearOrders({ userId, status }), [userId, status], !!userId);
}

/**
 * Hook for fetching gear offers with polling
 *
 * @param {object} options - Query options
 * @returns {object} { data, loading, refresh }
 *
 * @example
 * const { data: offers, loading } = useGearOffers({ listingId: 'listing-123' });
 */
export function useGearOffers({ listingId, userId }) {
  return usePolling(() => getGearOffers({ listingId, userId }), [listingId, userId], !!(listingId || userId));
}

// =====================================================
// SAFE EXCHANGE HOOKS
// =====================================================

/**
 * Hook for fetching safe exchange transactions with polling
 *
 * @param {string} userId - User ID
 * @param {string} status - Optional status filter
 * @returns {object} { data, loading, refresh }
 *
 * @example
 * const { data: transactions, loading } = useSafeExchangeTransactions(userId);
 */
export function useSafeExchangeTransactions(userId, status) {
  return usePolling(() => getSafeExchangeTransactions({ userId, status }), [userId, status], !!userId);
}

/**
 * Hook for fetching a single safe exchange transaction
 *
 * @param {string} transactionId - Transaction ID
 * @returns {object} { transaction, loading }
 *
 * @example
 * const { transaction, loading } = useSafeExchangeTransaction('txn-123');
 */
export function useSafeExchangeTransaction(transactionId) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;

    const fetchTransaction = async () => {
      setLoading(true);
      try {
        const data = await getSafeExchangeTransactionById(transactionId);
        setTransaction(data);
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
 *
 * @param {object} options - Query options
 * @returns {object} { data, loading, refresh }
 *
 * @example
 * const { data: items, loading } = useMarketplaceItems({ type: 'Presets' });
 */
export function useMarketplaceItems({ type } = {}) {
  return usePolling(() => getMarketplaceItems({ type }), [type]);
}

/**
 * Hook for fetching a single marketplace item
 *
 * @param {string} itemId - Item ID
 * @returns {object} { item, loading }
 *
 * @example
 * const { item, loading } = useMarketplaceItem('item-123');
 */
export function useMarketplaceItem(itemId) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      setLoading(true);
      try {
        const data = await getMarketplaceItemById(itemId);
        setItem(data);
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
 *
 * @param {string} userId - User ID
 * @returns {object} { data, loading, refresh }
 *
 * @example
 * const { data: library, loading } = useUserLibrary(userId);
 */
export function useUserLibrary(userId) {
  return usePolling(() => getUserLibrary(userId), [userId], !!userId);
}

/**
 * Hook for checking item ownership
 *
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @returns {boolean} isOwned
 *
 * @example
 * const isOwned = useItemOwnership(userId, itemId);
 */
export function useItemOwnership(userId, itemId) {
  const [isOwned, setIsOwned] = useState(false);

  useEffect(() => {
    if (!userId || !itemId) return;

    const checkOwnership = async () => {
      try {
        const owned = await checkItemOwnership(userId, itemId);
        setIsOwned(owned);
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
 *
 * @param {string} userId - User ID
 * @returns {object} { data, loading, refresh }
 *
 * @example
 * const { data: releases, loading } = useDistributionReleases(userId);
 */
export function useDistributionReleases(userId) {
  return usePolling(() => getDistributionReleases(userId), [userId], !!userId);
}

/**
 * Hook for fetching a single distribution release
 *
 * @param {string} releaseId - Release ID
 * @returns {object} { release, loading }
 *
 * @example
 * const { release, loading } = useDistributionRelease('release-123');
 */
export function useDistributionRelease(releaseId) {
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!releaseId) return;

    const fetchRelease = async () => {
      setLoading(true);
      try {
        const data = await getDistributionReleaseById(releaseId);
        setRelease(data);
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
 *
 * @returns {object} Mutation functions
 *
 * @example
 * const { createListing, updateListingStatus, createOrder } = useMarketplaceMutations();
 * await createListing({ seller_id: userId, title: 'My Gear', price: 100, ... });
 */
export function useMarketplaceMutations() {
  return {
    // Gear mutations
    createListing: createGearListing,
    updateListingStatus: updateGearListingStatus,
    createOrder: createGearOrder,
    updateOrderStatus: updateGearOrderStatus,
    createOffer: createGearOffer,
    respondToOffer: respondToGearOffer,

    // Safe exchange mutations
    createTransaction: createSafeExchangeTransaction,
    updateTransaction: updateSafeExchangeTransaction,
    addPhoto: addTransactionPhoto,

    // SeshFx mutations
    createMarketplaceItem: createMarketplaceItemSeshFx,
    purchaseItem: addToUserLibrary,

    // Distribution mutations
    createRelease: createDistributionRelease,
    updateRelease: updateDistributionRelease,
    deleteRelease: deleteDistributionRelease,
  };
}
