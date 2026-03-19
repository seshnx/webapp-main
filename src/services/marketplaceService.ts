/**
 * Marketplace Service - Convex Only
 *
 * All marketplace operations now use Convex for real-time updates.
 * No more Neon/PostgreSQL - everything in one place.
 */

import { api } from '../../convex/_generated';
import { useQuery, useMutation, Id } from 'convex/react';
import * as Sentry from '@sentry/react';

// =====================================================
// TYPES
// =====================================================

export interface MarketItem {
  _id: Id<"marketItems">;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  sellerPhoto?: string;
  title: string;
  description?: string;
  itemType: 'gear' | 'instrument' | 'equipment' | 'service';
  category: string;
  brand?: string;
  model?: string;
  year?: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  price: number;
  negotiable?: boolean;
  location?: string;
  photos?: string[];
  specifications?: any;
  featured?: boolean;
  shippingAvailable?: boolean;
  shippingCost?: number;
  localPickup?: boolean;
  dimensions?: string;
  weight?: string;
  tags?: string[];
  status: 'available' | 'pending' | 'sold' | 'removed';
  viewCount: number;
  favoriteCount: number;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface MarketTransaction {
  _id: Id<"marketTransactions">;
  itemId: Id<"marketItems">;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  offerAmount?: number;
  message?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer';
  shippingRequired?: boolean;
  shippingAddress?: string;
  counterOffer?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// =====================================================
// MARKET ITEM QUERIES
// =====================================================

/**
 * Get all marketplace items
 */
export function useMarketItems(filters?: {
  type?: string;
  category?: string;
  limit?: number;
}) {
  return useQuery(api.marketplace.getMarketItems);
}

/**
 * Get marketplace items by seller
 */
export function useMarketItemsBySeller(
  sellerId: string | undefined,
  status?: string,
  limit = 50
) {
  return useQuery(
    api.marketplace.getMarketItemsBySeller,
    sellerId ? { sellerId, status, limit } : "skip"
  );
}

/**
 * Search marketplace items
 */
export function useSearchMarketItems(filters: {
  searchQuery?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  itemType?: string;
  limit?: number;
}) {
  return useQuery(api.marketplace.searchMarketItems, filters);
}

/**
 * Get featured items
 */
export function useFeaturedItems(limit = 10) {
  return useQuery(api.marketplace.getFeaturedItems, { limit });
}

/**
 * Get single item
 */
export function useMarketItem(itemId: string | undefined) {
  return useQuery(
    api.marketplace.getMarketItemById,
    itemId ? { itemId: itemId as Id<"marketItems"> } : "skip"
  );
}

// =====================================================
// MARKET ITEM MUTATIONS
// =====================================================

/**
 * Hook for market item mutations
 */
export function useMarketItemMutations() {
  const create = useMutation(api.marketplace.createMarketItem);
  const update = useMutation(api.marketplace.updateMarketItem);
  const remove = useMutation(api.marketplace.deleteMarketItem);
  const incrementView = useMutation(api.marketplace.incrementViewCount);

  return {
    create,
    update,
    remove,
    incrementView,
  };
}

// =====================================================
// TRANSACTION QUERIES
// =====================================================

/**
 * Get transactions by buyer
 */
export function useTransactionsByBuyer(
  buyerId: string | undefined,
  status?: string,
  limit = 20
) {
  return useQuery(
    api.marketplace.getTransactionsByBuyer,
    buyerId ? { buyerId, status, limit } : "skip"
  );
}

/**
 * Get transactions by seller
 */
export function useTransactionsBySeller(
  sellerId: string | undefined,
  status?: string,
  limit = 20
) {
  return useQuery(
    api.marketplace.getTransactionsBySeller,
    sellerId ? { sellerId, status, limit } : "skip"
  );
}

/**
 * Get single transaction
 */
export function useTransaction(transactionId: string | undefined) {
  return useQuery(
    api.marketplace.getTransactionById,
    transactionId ? { transactionId: transactionId as Id<"marketTransactions"> } : "skip"
  );
}

/**
 * Get transactions for an item
 */
export function useTransactionsByItem(itemId: string | undefined) {
  return useQuery(
    api.marketplace.getTransactionsByItem,
    itemId ? { itemId: itemId as Id<"marketItems"> } : "skip"
  );
}

// =====================================================
// TRANSACTION MUTATIONS
// =====================================================

/**
 * Hook for transaction mutations
 */
export function useTransactionMutations() {
  const create = useMutation(api.marketplace.createTransaction);
  const acceptOffer = useMutation(api.marketplace.acceptOffer);
  const rejectOffer = useMutation(api.marketplace.rejectOffer);
  const complete = useMutation(api.marketplace.completeTransaction);
  const cancel = useMutation(api.marketplace.cancelTransaction);
  const addTracking = useMutation(api.marketplace.addTrackingNumber);

  return {
    create,
    acceptOffer,
    rejectOffer,
    complete,
    cancel,
    addTracking,
  };
}

// =====================================================
// LEGACY API FUNCTIONS (DEPRECATED)
// =====================================================
// These are kept for backward compatibility but should not be used

export async function fetchGearListings(options: {
  limit?: number;
  status?: string;
  category?: string;
  sellerId?: string;
} = {}) {
  console.warn('fetchGearListings: Use useMarketItemsBySeller or useSearchMarketItems hook instead');
  return [];
}

export async function fetchGearListing(listingId: string) {
  console.warn('fetchGearListing: Use useMarketItem hook instead');
  return null;
}

export async function createListing(listingData: any) {
  console.warn('createListing: Use useMarketItemMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function updateListingStatus(listingId: string, status: string) {
  console.warn('updateListingStatus: Use useMarketItemMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchGearOrders(options: {
  userId?: string;
  status?: string;
  limit?: number;
} = {}) {
  console.warn('fetchGearOrders: Use useTransactionsByBuyer or useTransactionsBySeller hook instead');
  return [];
}

export async function createOrder(orderData: any) {
  console.warn('createOrder: Use useTransactionMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function updateOrderStatus(orderId: string, status: string) {
  console.warn('updateOrderStatus: Use useTransactionMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchGearOffers(options: {
  listingId?: string;
  userId?: string;
  status?: string;
  limit?: number;
} = {}) {
  console.warn('fetchGearOffers: Use useTransactionsByItem hook instead');
  return [];
}

export async function createOffer(offerData: any) {
  console.warn('createOffer: Use useTransactionMutations.create hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function respondToOffer(offerId: string, response: string) {
  console.warn('respondToOffer: Use useTransactionMutations acceptOffer/rejectOffer hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchSafeExchangeTransactions(options: {
  userId?: string;
  status?: string;
  limit?: number;
} = {}) {
  console.warn('fetchSafeExchangeTransactions: Use useTransactionsByBuyer or useTransactionsBySeller hook instead');
  return [];
}

export async function fetchSafeExchangeTransaction(transactionId: string) {
  console.warn('fetchSafeExchangeTransaction: Use useTransaction hook instead');
  return null;
}

export async function createTransaction(transactionData: any) {
  console.warn('createTransaction: Use useTransactionMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function updateTransaction(
  transactionId: string,
  updates: any
) {
  console.warn('updateTransaction: Use useTransactionMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function addPhoto(transactionId: string, photoUrl: string) {
  console.warn('addPhoto: Not implemented in Convex yet');
  throw new Error('Use Convex mutation directly');
}

export async function fetchMarketplaceItems(options: {
  type?: string;
  category?: string;
  limit?: number;
} = {}) {
  console.warn('fetchMarketplaceItems: Use useMarketItems hook instead');
  return [];
}

export async function fetchMarketplaceItem(itemId: string) {
  console.warn('fetchMarketplaceItem: Use useMarketItem hook instead');
  return null;
}

export async function createMarketplaceItem(itemData: any) {
  console.warn('createMarketplaceItem: Use useMarketItemMutations hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function purchaseItem(userId: string, itemId: string) {
  console.warn('purchaseItem: Use useTransactionMutations.create hook instead');
  throw new Error('Use Convex mutation directly');
}

export async function fetchUserLibrary(userId: string, limit = 50) {
  console.warn('fetchUserLibrary: Use useTransactionsByBuyer with status="completed" instead');
  return [];
}

export async function checkOwnership(userId: string, itemId: string) {
  console.warn('checkOwnership: Query transactions directly');
  return false;
}

export async function fetchDistributionReleases(userId: string, limit = 50) {
  console.warn('fetchDistributionReleases: Not implemented yet');
  return [];
}

export async function fetchDistributionRelease(releaseId: string) {
  console.warn('fetchDistributionRelease: Not implemented yet');
  return null;
}

export async function createRelease(releaseData: any) {
  console.warn('createRelease: Not implemented yet');
  throw new Error('Use Convex mutation directly');
}

export async function updateRelease(
  releaseId: string,
  updates: any
) {
  console.warn('updateRelease: Not implemented yet');
  throw new Error('Use Convex mutation directly');
}

export async function deleteRelease(releaseId: string) {
  console.warn('deleteRelease: Not implemented yet');
  throw new Error('Use Convex mutation directly');
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Queries (use these in components)
  useMarketItems,
  useMarketItemsBySeller,
  useSearchMarketItems,
  useFeaturedItems,
  useMarketItem,
  useTransactionsByBuyer,
  useTransactionsBySeller,
  useTransaction,
  useTransactionsByItem,

  // Mutations (use these in components)
  useMarketItemMutations,
  useTransactionMutations,

  // Legacy functions (deprecated)
  fetchGearListings,
  fetchGearListing,
  createListing,
  updateListingStatus,
  fetchGearOrders,
  createOrder,
  updateOrderStatus,
  fetchGearOffers,
  createOffer,
  respondToOffer,
  fetchSafeExchangeTransactions,
  fetchSafeExchangeTransaction,
  createTransaction,
  updateTransaction,
  addPhoto,
  fetchMarketplaceItems,
  fetchMarketplaceItem,
  createMarketplaceItem,
  purchaseItem,
  fetchUserLibrary,
  checkOwnership,
  fetchDistributionReleases,
  fetchDistributionRelease,
  createRelease,
  updateRelease,
  deleteRelease,
};
