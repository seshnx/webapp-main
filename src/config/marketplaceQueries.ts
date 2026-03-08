/**
 * Marketplace Database Queries
 *
 * All marketplace-related database operations for Neon PostgreSQL
 */

import { neonClient } from './neon';

/**
 * Execute a SQL query with error handling
 *
 * @param sql - SQL query
 * @param params - Query parameters
 * @param queryName - Name for error tracking
 * @returns Query results
 */
async function executeQuery<T = any>(
  sql: string,
  params: any[] = [],
  queryName: string = 'Unnamed Query'
): Promise<T[]> {
  if (!neonClient) {
    throw new Error('Neon client is not configured');
  }

  try {
    const result = await neonClient(sql, params);
    return result as T[];
  } catch (error) {
    console.error(`Database error in ${queryName}:`, error);
    throw new Error(`Query ${queryName} failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// =====================================================
// MARKETPLACE QUERIES
// =====================================================

/**
 * Get gear listings with optional filtering
 */
export async function getGearListingsNeon(options: {
  limit?: number;
  status?: string;
  category?: string;
  sellerId?: string;
} = {}): Promise<any[]> {
  const { limit = 50, status, category, sellerId } = options;

  let sql = `SELECT gl.*,
    cu.username as seller_username,
    cu.profile_photo_url as seller_photo
    FROM gear_listings gl
    LEFT JOIN clerk_users cu ON cu.id = gl.seller_id::TEXT
    WHERE 1=1`;

  const params: any[] = [];
  let paramIndex = 1;

  if (status) {
    sql += ` AND gl.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (category) {
    sql += ` AND gl.category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (sellerId) {
    sql += ` AND gl.seller_id = $${paramIndex}`;
    params.push(sellerId);
    paramIndex++;
  }

  sql += ` ORDER BY gl.created_at DESC LIMIT $${paramIndex}`;
  params.push(limit);

  return await executeQuery(sql, params, 'getGearListingsNeon');
}

/**
 * Get a single gear listing by ID
 */
export async function getGearListingByIdNeon(listingId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT gl.*,
      cu.username as seller_username,
      cu.profile_photo_url as seller_photo
      FROM gear_listings gl
      LEFT JOIN clerk_users cu ON cu.id = gl.seller_id::TEXT
      WHERE gl.id = $1`,
    [listingId],
    'getGearListingByIdNeon'
  );

  return result[0] || null;
}

/**
 * Create a new gear listing
 */
export async function createGearListingNeon(listingData: {
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
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO gear_listings (
      seller_id, title, description, brand, model, category, condition,
      price, original_price, images, specifications, location,
      shipping_available, local_pickup_available, safe_exchange_enabled
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
      listingData.seller_id,
      listingData.title,
      listingData.description || null,
      listingData.brand || null,
      listingData.model || null,
      listingData.category || 'Other',
      listingData.condition || 'Good',
      listingData.price,
      listingData.original_price || null,
      JSON.stringify(listingData.images || []),
      JSON.stringify(listingData.specifications || {}),
      listingData.location ? JSON.stringify(listingData.location) : null,
      listingData.shipping_available !== false,
      listingData.local_pickup_available !== false,
      listingData.safe_exchange_enabled !== false,
    ],
    'createGearListingNeon'
  );

  return result[0];
}

/**
 * Update gear listing status
 */
export async function updateGearListingStatusNeon(
  listingId: string,
  status: 'active' | 'pending' | 'sold' | 'removed'
): Promise<void> {
  await executeQuery(
    `UPDATE gear_listings SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, listingId],
    'updateGearListingStatusNeon'
  );
}

/**
 * Get gear orders for a user
 */
export async function getGearOrdersNeon(options: {
  userId?: string;
  status?: string;
  limit?: number;
} = {}): Promise<any[]> {
  const { userId, status, limit = 50 } = options;

  let sql = `SELECT go.*,
    gl.title as listing_title,
    gl.images as listing_images,
    buyer.username as buyer_username,
    seller.username as seller_username
    FROM gear_orders go
    LEFT JOIN gear_listings gl ON gl.id = go.listing_id
    LEFT JOIN clerk_users buyer ON buyer.id = go.buyer_id::TEXT
    LEFT JOIN clerk_users seller ON seller.id = go.seller_id::TEXT
    WHERE 1=1`;

  const params: any[] = [];
  let paramIndex = 1;

  if (userId) {
    sql += ` AND (go.buyer_id = $${paramIndex} OR go.seller_id = $${paramIndex})`;
    params.push(userId);
    paramIndex++;
  }

  if (status) {
    sql += ` AND go.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY go.created_at DESC LIMIT $${paramIndex}`;
  params.push(limit);

  return await executeQuery(sql, params, 'getGearOrdersNeon');
}

/**
 * Create a new gear order
 */
export async function createGearOrderNeon(orderData: {
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  price: number;
  shipping_method?: string;
  shipping_address?: any;
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO gear_orders (
      listing_id, buyer_id, seller_id, price, shipping_method, shipping_address
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      orderData.listing_id,
      orderData.buyer_id,
      orderData.seller_id,
      orderData.price,
      orderData.shipping_method || 'pickup',
      orderData.shipping_address ? JSON.stringify(orderData.shipping_address) : null,
    ],
    'createGearOrderNeon'
  );

  return result[0];
}

/**
 * Update gear order status
 */
export async function updateGearOrderStatusNeon(
  orderId: string,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
): Promise<void> {
  await executeQuery(
    `UPDATE gear_orders SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, orderId],
    'updateGearOrderStatusNeon'
  );
}

/**
 * Get gear offers
 */
export async function getGearOffersNeon(options: {
  listingId?: string;
  userId?: string;
  status?: string;
  limit?: number;
} = {}): Promise<any[]> {
  const { listingId, userId, status, limit = 50 } = options;

  let sql = `SELECT goff.*,
    gl.title as listing_title,
    gl.price as listing_price,
    buyer.username as buyer_username,
    buyer.profile_photo_url as buyer_photo,
    seller.username as seller_username
    FROM gear_offers goff
    LEFT JOIN gear_listings gl ON gl.id = goff.listing_id
    LEFT JOIN clerk_users buyer ON buyer.id = goff.buyer_id::TEXT
    LEFT JOIN clerk_users seller ON seller.id = goff.seller_id::TEXT
    WHERE 1=1`;

  const params: any[] = [];
  let paramIndex = 1;

  if (listingId) {
    sql += ` AND goff.listing_id = $${paramIndex}`;
    params.push(listingId);
    paramIndex++;
  }

  if (userId) {
    sql += ` AND (goff.buyer_id = $${paramIndex} OR goff.seller_id = $${paramIndex})`;
    params.push(userId);
    paramIndex++;
  }

  if (status) {
    sql += ` AND goff.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY goff.created_at DESC LIMIT $${paramIndex}`;
  params.push(limit);

  return await executeQuery(sql, params, 'getGearOffersNeon');
}

/**
 * Create a new gear offer
 */
export async function createGearOfferNeon(offerData: {
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  offer_price: number;
  message?: string;
  expires_at?: string;
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO gear_offers (
      listing_id, buyer_id, seller_id, offer_price, message, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      offerData.listing_id,
      offerData.buyer_id,
      offerData.seller_id,
      offerData.offer_price,
      offerData.message || null,
      offerData.expires_at || null,
    ],
    'createGearOfferNeon'
  );

  return result[0];
}

/**
 * Respond to a gear offer
 */
export async function respondToGearOfferNeon(
  offerId: string,
  response: 'accepted' | 'rejected' | 'expired'
): Promise<void> {
  await executeQuery(
    `UPDATE gear_offers SET status = $1, updated_at = NOW() WHERE id = $2`,
    [response, offerId],
    'respondToGearOfferNeon'
  );
}

/**
 * Get safe exchange transactions
 */
export async function getSafeExchangeTransactionsNeon(options: {
  userId?: string;
  status?: string;
  limit?: number;
} = {}): Promise<any[]> {
  const { userId, status, limit = 50 } = options;

  let sql = `SELECT setx.*,
    go.price as order_price,
    gl.title as listing_title,
    gl.images as listing_images,
    buyer.username as buyer_username,
    seller.username as seller_username
    FROM safe_exchange_transactions setx
    LEFT JOIN gear_orders go ON go.id = setx.order_id
    LEFT JOIN gear_listings gl ON gl.id = go.listing_id
    LEFT JOIN clerk_users buyer ON buyer.id = setx.buyer_id::TEXT
    LEFT JOIN clerk_users seller ON seller.id = setx.seller_id::TEXT
    WHERE 1=1`;

  const params: any[] = [];
  let paramIndex = 1;

  if (userId) {
    sql += ` AND (setx.buyer_id = $${paramIndex} OR setx.seller_id = $${paramIndex})`;
    params.push(userId);
    paramIndex++;
  }

  if (status) {
    sql += ` AND setx.escrow_status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY setx.created_at DESC LIMIT $${paramIndex}`;
  params.push(limit);

  return await executeQuery(sql, params, 'getSafeExchangeTransactionsNeon');
}

/**
 * Get a single safe exchange transaction
 */
export async function getSafeExchangeTransactionByIdNeon(transactionId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT setx.*,
      go.price as order_price,
      gl.title as listing_title,
      gl.images as listing_images,
      buyer.username as buyer_username,
      seller.username as seller_username
      FROM safe_exchange_transactions setx
      LEFT JOIN gear_orders go ON go.id = setx.order_id
      LEFT JOIN gear_listings gl ON gl.id = go.listing_id
      LEFT JOIN clerk_users buyer ON buyer.id = setx.buyer_id::TEXT
      LEFT JOIN clerk_users seller ON seller.id = setx.seller_id::TEXT
      WHERE setx.id = $1`,
    [transactionId],
    'getSafeExchangeTransactionByIdNeon'
  );

  return result[0] || null;
}

/**
 * Create a new safe exchange transaction
 */
export async function createSafeExchangeTransactionNeon(transactionData: {
  order_id?: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO safe_exchange_transactions (
      order_id, buyer_id, seller_id, amount
    ) VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [
      transactionData.order_id || null,
      transactionData.buyer_id,
      transactionData.seller_id,
      transactionData.amount,
    ],
    'createSafeExchangeTransactionNeon'
  );

  return result[0];
}

/**
 * Update safe exchange transaction
 */
export async function updateSafeExchangeTransactionNeon(
  transactionId: string,
  updates: {
    escrow_status?: string;
    buyer_verified?: boolean;
    seller_verified?: boolean;
    shipping_verified?: boolean;
    photo_verification?: any;
  }
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.escrow_status) {
    fields.push(`escrow_status = $${paramIndex}`);
    values.push(updates.escrow_status);
    paramIndex++;
  }

  if (updates.buyer_verified !== undefined) {
    fields.push(`buyer_verified = $${paramIndex}`);
    values.push(updates.buyer_verified);
    paramIndex++;
  }

  if (updates.seller_verified !== undefined) {
    fields.push(`seller_verified = $${paramIndex}`);
    values.push(updates.seller_verified);
    paramIndex++;
  }

  if (updates.shipping_verified !== undefined) {
    fields.push(`shipping_verified = $${paramIndex}`);
    values.push(updates.shipping_verified);
    paramIndex++;
  }

  if (updates.photo_verification) {
    fields.push(`photo_verification = $${paramIndex}`);
    values.push(JSON.stringify(updates.photo_verification));
    paramIndex++;
  }

  if (fields.length === 0) return;

  values.push(transactionId);

  await executeQuery(
    `UPDATE safe_exchange_transactions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
    values,
    'updateSafeExchangeTransactionNeon'
  );
}

/**
 * Get marketplace items (SeshFx store) - by category
 */
export async function getMarketplaceItemsByCategory(options: {
  type?: string;
  category?: string;
  limit?: number;
} = {}): Promise<any[]> {
  const { type, category, limit = 50 } = options;

  let sql = `SELECT mi.*,
    cu.username as seller_username,
    cu.profile_photo_url as seller_photo
    FROM marketplace_items mi
    LEFT JOIN clerk_users cu ON cu.id = mi.seller_id::TEXT
    WHERE mi.status = 'active'`;

  const params: any[] = [];
  let paramIndex = 1;

  if (type) {
    sql += ` AND mi.category = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  if (category) {
    sql += ` AND mi.genre = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  sql += ` ORDER BY mi.created_at DESC LIMIT $${paramIndex}`;
  params.push(limit);

  return await executeQuery(sql, params, 'getMarketplaceItemsByCategory');
}

/**
 * Get a single marketplace item
 */
export async function getMarketplaceItemByIdNeon(itemId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT mi.*,
      cu.username as seller_username,
      cu.profile_photo_url as seller_photo
      FROM marketplace_items mi
      LEFT JOIN clerk_users cu ON cu.id = mi.seller_id::TEXT
      WHERE mi.id = $1`,
    [itemId],
    'getMarketplaceItemByIdNeon'
  );

  return result[0] || null;
}

/**
 * Create a new marketplace item (SeshFx)
 */
export async function createMarketplaceItemNeon(itemData: {
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
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO marketplace_items (
      seller_id, title, description, category, price,
      preview_audio_url, preview_image_url, file_url, file_size,
      tags, genre, bpm, key
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      itemData.seller_id,
      itemData.title,
      itemData.description || null,
      itemData.category || 'Other',
      itemData.price,
      itemData.preview_audio_url || null,
      itemData.preview_image_url || null,
      itemData.file_url || null,
      itemData.file_size || null,
      itemData.tags || [],
      itemData.genre || null,
      itemData.bpm || null,
      itemData.key || null,
    ],
    'createMarketplaceItemNeon'
  );

  return result[0];
}

/**
 * Get user library (purchased items)
 */
export async function getUserLibraryNeon(userId: string, limit = 50): Promise<any[]> {
  return await executeQuery(
    `SELECT ul.*,
      mi.title,
      mi.description,
      mi.category,
      mi.preview_image_url,
      mi.file_url,
      mi.tags,
      mi.genre,
      mi.bpm,
      mi.key,
      seller.username as seller_username
      FROM user_library ul
      LEFT JOIN marketplace_items mi ON mi.id = ul.item_id
      LEFT JOIN clerk_users seller ON seller.id = mi.seller_id::TEXT
      WHERE ul.user_id = $1
      ORDER BY ul.purchased_at DESC
      LIMIT $2`,
    [userId, limit],
    'getUserLibraryNeon'
  );
}

/**
 * Check if user owns an item
 */
export async function checkItemOwnershipNeon(userId: string, itemId: string): Promise<boolean> {
  const result = await executeQuery(
    `SELECT COUNT(*) as count FROM user_library WHERE user_id = $1 AND item_id = $2`,
    [userId, itemId],
    'checkItemOwnershipNeon'
  );

  return (parseInt(result[0]?.count || '0', 10) > 0);
}

/**
 * Purchase a marketplace item
 */
export async function purchaseMarketplaceItemNeon(
  userId: string,
  itemId: string
): Promise<void> {
  await executeQuery(
    `INSERT INTO user_library (user_id, item_id) VALUES ($1, $2)
    ON CONFLICT (user_id, item_id) DO NOTHING`,
    [userId, itemId],
    'purchaseMarketplaceItemNeon'
  );

  // Increment sales count for the item
  await executeQuery(
    `UPDATE marketplace_items
    SET sales_count = sales_count + 1,
        downloads_count = downloads_count + 1,
        updated_at = NOW()
    WHERE id = $1`,
    [itemId],
    'purchaseMarketplaceItemNeon'
  );
}

/**
 * Get distribution releases
 */
export async function getDistributionReleasesNeon(userId: string, limit = 50): Promise<any[]> {
  return await executeQuery(
    `SELECT dr.*,
      cu.username as creator_username
      FROM distribution_releases dr
      LEFT JOIN clerk_users cu ON cu.id = dr.creator_id::TEXT
      WHERE dr.creator_id = $1
      ORDER BY dr.created_at DESC
      LIMIT $2`,
    [userId, limit],
    'getDistributionReleasesNeon'
  );
}

/**
 * Get a single distribution release
 */
export async function getDistributionReleaseByIdNeon(releaseId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT dr.*,
      cu.username as creator_username
      FROM distribution_releases dr
      LEFT JOIN clerk_users cu ON cu.id = dr.creator_id::TEXT
      WHERE dr.id = $1`,
    [releaseId],
    'getDistributionReleaseByIdNeon'
  );

  return result[0] || null;
}

/**
 * Create a new distribution release
 */
export async function createDistributionReleaseNeon(releaseData: {
  creator_id: string;
  title: string;
  artist_name: string;
  genre?: string;
  release_date?: string;
  tracks?: any[];
  artwork_url?: string;
  status?: string;
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO distribution_releases (
      creator_id, title, artist_name, genre, release_date, tracks, artwork_url, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      releaseData.creator_id,
      releaseData.title,
      releaseData.artist_name,
      releaseData.genre || null,
      releaseData.release_date || null,
      releaseData.tracks ? JSON.stringify(releaseData.tracks) : [],
      releaseData.artwork_url || null,
      releaseData.status || 'draft',
    ],
    'createDistributionReleaseNeon'
  );

  return result[0];
}

/**
 * Update a distribution release
 */
export async function updateDistributionReleaseNeon(
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
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title) {
    fields.push(`title = $${paramIndex}`);
    values.push(updates.title);
    paramIndex++;
  }

  if (updates.artist_name) {
    fields.push(`artist_name = $${paramIndex}`);
    values.push(updates.artist_name);
    paramIndex++;
  }

  if (updates.genre) {
    fields.push(`genre = $${paramIndex}`);
    values.push(updates.genre);
    paramIndex++;
  }

  if (updates.release_date) {
    fields.push(`release_date = $${paramIndex}`);
    values.push(updates.release_date);
    paramIndex++;
  }

  if (updates.tracks) {
    fields.push(`tracks = $${paramIndex}`);
    values.push(JSON.stringify(updates.tracks));
    paramIndex++;
  }

  if (updates.artwork_url) {
    fields.push(`artwork_url = $${paramIndex}`);
    values.push(updates.artwork_url);
    paramIndex++;
  }

  if (updates.status) {
    fields.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;
  }

  if (fields.length === 0) return;

  values.push(releaseId);

  await executeQuery(
    `UPDATE distribution_releases SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
    values,
    'updateDistributionReleaseNeon'
  );
}

/**
 * Delete a distribution release
 */
export async function deleteDistributionReleaseNeon(releaseId: string): Promise<void> {
  await executeQuery(
    `DELETE FROM distribution_releases WHERE id = $1`,
    [releaseId],
    'deleteDistributionReleaseNeon'
  );
}
