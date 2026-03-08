/**
 * Marketplace Service
 *
 * Handles all marketplace operations using Neon PostgreSQL database.
 * Provides a clean API layer for marketplace hooks to use.
 */

import {
  getGearListingsNeon,
  getGearListingByIdNeon,
  createGearListingNeon,
  updateGearListingStatusNeon,
  getGearOrdersNeon,
  createGearOrderNeon,
  updateGearOrderStatusNeon,
  getGearOffersNeon,
  createGearOfferNeon,
  respondToGearOfferNeon,
  getSafeExchangeTransactionsNeon,
  getSafeExchangeTransactionByIdNeon,
  createSafeExchangeTransactionNeon,
  updateSafeExchangeTransactionNeon,
  getMarketplaceItemsByCategory,
  getMarketplaceItemByIdNeon,
  createMarketplaceItemNeon,
  getUserLibraryNeon,
  checkItemOwnershipNeon,
  purchaseMarketplaceItemNeon,
  getDistributionReleasesNeon,
  getDistributionReleaseByIdNeon,
  createDistributionReleaseNeon,
  updateDistributionReleaseNeon,
  deleteDistributionReleaseNeon,
} from '../config/marketplaceQueries';
import * as Sentry from '@sentry/react';

// =====================================================
// GEAR EXCHANGE FUNCTIONS
// =====================================================

/**
 * Get gear listings with optional filtering
 */
export async function fetchGearListings(options: {
  limit?: number;
  status?: string;
  category?: string;
  sellerId?: string;
} = {}) {
  try {
    return await getGearListingsNeon(options);
  } catch (error) {
    console.error('Failed to fetch gear listings:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchGearListings' }
    });
    return [];
  }
}

/**
 * Get a single gear listing
 */
export async function fetchGearListing(listingId: string) {
  try {
    return await getGearListingByIdNeon(listingId);
  } catch (error) {
    console.error('Failed to fetch gear listing:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchGearListing' },
      extra: { listingId }
    });
    return null;
  }
}

/**
 * Create a new gear listing
 */
export async function createListing(listingData: {
  seller_id: string;
  title: string;
  description?: string;
  brand?: string;
  model?: string;
  category?: string;
  condition?: string;
  price: number;
  original_price?: number;
  images?: any[];
  specifications?: any;
  location?: any;
  shipping_available?: boolean;
  local_pickup_available?: boolean;
  safe_exchange_enabled?: boolean;
}) {
  try {
    return await createGearListingNeon(listingData);
  } catch (error) {
    console.error('Failed to create gear listing:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'createListing' }
    });
    throw error;
  }
}

/**
 * Update gear listing status
 */
export async function updateListingStatus(listingId: string, status: string) {
  try {
    await updateGearListingStatusNeon(
      listingId,
      status as 'active' | 'pending' | 'sold' | 'removed'
    );
  } catch (error) {
    console.error('Failed to update listing status:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'updateListingStatus' },
      extra: { listingId, status }
    });
    throw error;
  }
}

/**
 * Get gear orders for a user
 */
export async function fetchGearOrders(options: {
  userId?: string;
  status?: string;
  limit?: number;
} = {}) {
  try {
    return await getGearOrdersNeon(options);
  } catch (error) {
    console.error('Failed to fetch gear orders:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchGearOrders' }
    });
    return [];
  }
}

/**
 * Create a new gear order
 */
export async function createOrder(orderData: {
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price: number;
  shipping_method?: string;
  shipping_address?: any;
}) {
  try {
    return await createGearOrderNeon(orderData);
  } catch (error) {
    console.error('Failed to create gear order:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'createOrder' }
    });
    throw error;
  }
}

/**
 * Update gear order status
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await updateGearOrderStatusNeon(
      orderId,
      status as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
    );
  } catch (error) {
    console.error('Failed to update order status:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'updateOrderStatus' },
      extra: { orderId, status }
    });
    throw error;
  }
}

/**
 * Get gear offers
 */
export async function fetchGearOffers(options: {
  listingId?: string;
  userId?: string;
  status?: string;
  limit?: number;
} = {}) {
  try {
    return await getGearOffersNeon(options);
  } catch (error) {
    console.error('Failed to fetch gear offers:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchGearOffers' }
    });
    return [];
  }
}

/**
 * Create a new gear offer
 */
export async function createOffer(offerData: {
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  offer_price: number;
  message?: string;
  expires_at?: string;
}) {
  try {
    return await createGearOfferNeon(offerData);
  } catch (error) {
    console.error('Failed to create gear offer:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'createOffer' }
    });
    throw error;
  }
}

/**
 * Respond to a gear offer
 */
export async function respondToOffer(offerId: string, response: string) {
  try {
    await respondToGearOfferNeon(
      offerId,
      response as 'accepted' | 'rejected' | 'expired'
    );
  } catch (error) {
    console.error('Failed to respond to offer:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'respondToOffer' },
      extra: { offerId, response }
    });
    throw error;
  }
}

// =====================================================
// SAFE EXCHANGE FUNCTIONS
// =====================================================

/**
 * Get safe exchange transactions
 */
export async function fetchSafeExchangeTransactions(options: {
  userId?: string;
  status?: string;
  limit?: number;
} = {}) {
  try {
    return await getSafeExchangeTransactionsNeon(options);
  } catch (error) {
    console.error('Failed to fetch safe exchange transactions:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchSafeExchangeTransactions' }
    });
    return [];
  }
}

/**
 * Get a single safe exchange transaction
 */
export async function fetchSafeExchangeTransaction(transactionId: string) {
  try {
    return await getSafeExchangeTransactionByIdNeon(transactionId);
  } catch (error) {
    console.error('Failed to fetch safe exchange transaction:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchSafeExchangeTransaction' },
      extra: { transactionId }
    });
    return null;
  }
}

/**
 * Create a new safe exchange transaction
 */
export async function createTransaction(transactionData: {
  order_id?: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
}) {
  try {
    return await createSafeExchangeTransactionNeon(transactionData);
  } catch (error) {
    console.error('Failed to create safe exchange transaction:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'createTransaction' }
    });
    throw error;
  }
}

/**
 * Update safe exchange transaction
 */
export async function updateTransaction(
  transactionId: string,
  updates: {
    escrow_status?: string;
    buyer_verified?: boolean;
    seller_verified?: boolean;
    shipping_verified?: boolean;
    photo_verification?: any;
  }
) {
  try {
    await updateSafeExchangeTransactionNeon(transactionId, updates);
  } catch (error) {
    console.error('Failed to update transaction:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'updateTransaction' },
      extra: { transactionId }
    });
    throw error;
  }
}

/**
 * Add photo verification to transaction
 */
export async function addPhoto(transactionId: string, photoUrl: string) {
  try {
    // First get existing transaction to check current photos
    const existing = await fetchSafeExchangeTransaction(transactionId);

    const photoVerification = existing?.photo_verification || {};
    const photos = photoVerification.photos || [];

    photos.push(photoUrl);

    await updateTransaction(transactionId, {
      photo_verification: {
        ...photoVerification,
        photos,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to add photo:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'addPhoto' },
      extra: { transactionId, photoUrl }
    });
    throw error;
  }
}

// =====================================================
// SESHFX STORE FUNCTIONS
// =====================================================

/**
 * Get marketplace items (SeshFx store)
 */
export async function fetchMarketplaceItems(options: {
  type?: string;
  category?: string;
  limit?: number;
} = {}) {
  try {
    return await getMarketplaceItemsByCategory(options);
  } catch (error) {
    console.error('Failed to fetch marketplace items:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchMarketplaceItems' }
    });
    return [];
  }
}

/**
 * Get a single marketplace item
 */
export async function fetchMarketplaceItem(itemId: string) {
  try {
    return await getMarketplaceItemByIdNeon(itemId);
  } catch (error) {
    console.error('Failed to fetch marketplace item:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchMarketplaceItem' },
      extra: { itemId }
    });
    return null;
  }
}

/**
 * Create a new marketplace item (SeshFx)
 */
export async function createMarketplaceItem(itemData: {
  seller_id: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  preview_audio_url?: string;
  preview_image_url?: string;
  file_url?: string;
  file_size?: number;
  tags?: string[];
  genre?: string;
  bpm?: number;
  key?: string;
}) {
  try {
    return await createMarketplaceItemNeon(itemData);
  } catch (error) {
    console.error('Failed to create marketplace item:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'createMarketplaceItem' }
    });
    throw error;
  }
}

/**
 * Purchase a marketplace item
 */
export async function purchaseItem(userId: string, itemId: string) {
  try {
    await purchaseMarketplaceItemNeon(userId, itemId);
  } catch (error) {
    console.error('Failed to purchase item:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'purchaseItem' },
      extra: { userId, itemId }
    });
    throw error;
  }
}

/**
 * Get user library (purchased items)
 */
export async function fetchUserLibrary(userId: string, limit = 50) {
  try {
    return await getUserLibraryNeon(userId, limit);
  } catch (error) {
    console.error('Failed to fetch user library:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchUserLibrary' },
      extra: { userId }
    });
    return [];
  }
}

/**
 * Check item ownership
 */
export async function checkOwnership(userId: string, itemId: string) {
  try {
    return await checkItemOwnershipNeon(userId, itemId);
  } catch (error) {
    console.error('Failed to check item ownership:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'checkOwnership' },
      extra: { userId, itemId }
    });
    return false;
  }
}

// =====================================================
// DISTRIBUTION FUNCTIONS
// =====================================================

/**
 * Get distribution releases
 */
export async function fetchDistributionReleases(userId: string, limit = 50) {
  try {
    return await getDistributionReleasesNeon(userId, limit);
  } catch (error) {
    console.error('Failed to fetch distribution releases:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchDistributionReleases' },
      extra: { userId }
    });
    return [];
  }
}

/**
 * Get a single distribution release
 */
export async function fetchDistributionRelease(releaseId: string) {
  try {
    return await getDistributionReleaseByIdNeon(releaseId);
  } catch (error) {
    console.error('Failed to fetch distribution release:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'fetchDistributionRelease' },
      extra: { releaseId }
    });
    return null;
  }
}

/**
 * Create a new distribution release
 */
export async function createRelease(releaseData: {
  creator_id: string;
  title: string;
  artist_name: string;
  genre?: string;
  release_date?: string;
  tracks?: any[];
  artwork_url?: string;
  status?: string;
}) {
  try {
    return await createDistributionReleaseNeon(releaseData);
  } catch (error) {
    console.error('Failed to create distribution release:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'createRelease' }
    });
    throw error;
  }
}

/**
 * Update a distribution release
 */
export async function updateRelease(
  releaseId: string,
  updates: {
    title?: string;
    artist_name?: string;
    genre?: string;
    release_date?: string;
    tracks?: any[];
    artwork_url?: string;
    status?: string;
  }
) {
  try {
    await updateDistributionReleaseNeon(releaseId, updates);
  } catch (error) {
    console.error('Failed to update release:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'updateRelease' },
      extra: { releaseId }
    });
    throw error;
  }
}

/**
 * Delete a distribution release
 */
export async function deleteRelease(releaseId: string) {
  try {
    await deleteDistributionReleaseNeon(releaseId);
  } catch (error) {
    console.error('Failed to delete release:', error);
    Sentry.captureException(error, {
      tags: { service: 'marketplace', function: 'deleteRelease' },
      extra: { releaseId }
    });
    throw error;
  }
}
