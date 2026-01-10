/**
 * Neon PostgreSQL Configuration
 *
 * This module configures the Neon PostgreSQL client for database operations.
 * Neon is a serverless PostgreSQL database with automatic branching and scaling.
 *
 * Environment Variables Required:
 * - VITE_NEON_DATABASE_URL: Neon connection string (postgresql://...)
 * - VITE_NEON_POOLER_URL: Neon pooler connection string (optional, for better connection pooling)
 *
 * Neon Console: https://console.neon.tech/
 * Documentation: https://neon.tech/docs
 *
 * @example
 * import { neonClient, query } from '@/config/neon';
 *
 * // Execute a query
 * const result = await query(
 *   'SELECT * FROM clerk_users WHERE id = $1',
 *   [userId]
 * );
 */

import { neon } from '@neondatabase/serverless';

// =====================================================
// NEON CONNECTION STRING
// =====================================================

const neonUrl = import.meta.env.VITE_NEON_DATABASE_URL;

if (!neonUrl) {
  if (import.meta.env.DEV) {
    console.error(
      '❌ Neon: VITE_NEON_DATABASE_URL is not set. ' +
      'Database operations will not work. Get your connection string from https://console.neon.tech/'
    );
  } else {
    console.error('❌ Neon: Missing database connection string in production');
  }
}

/**
 * Neon SQL Client
 *
 * Uses the Neon serverless driver for optimal performance in serverless
 * environments (Vercel, AWS Lambda, etc.).
 *
 * The serverless driver uses HTTP instead of WebSockets, making it
 * suitable for edge functions and serverless platforms.
 */
export const neonClient = neonUrl ? neon(neonUrl) : null;

/**
 * Check if Neon is properly configured
 *
 * @returns {boolean} True if Neon connection string is present
 */
export function isNeonConfigured() {
  return !!neonUrl;
}

/**
 * Execute a SQL query
 *
 * @param {string} sql - SQL query with optional placeholders ($1, $2, etc.)
 * @param {Array} params - Parameter values for placeholders
 * @returns {Promise<Array>} Query results
 *
 * @example
 * // Simple query
 * const users = await query('SELECT * FROM clerk_users');
 *
 * // Query with parameters
 * const user = await query(
 *   'SELECT * FROM clerk_users WHERE id = $1',
 *   [userId]
 * );
 *
 * // Insert
 * await query(
 *   'INSERT INTO posts (user_id, content) VALUES ($1, $2)',
 *   [userId, content]
 * );
 */
export async function query(sql, params = []) {
  if (!neonClient) {
    throw new Error('Neon client is not configured. Check VITE_NEON_DATABASE_URL environment variable.');
  }

  try {
    const result = await neonClient(sql, params);
    return result;
  } catch (error) {
    console.error('Neon query error:', error);
    throw error;
  }
}

/**
 * Execute a transaction (multiple queries as a single unit)
 *
 * @param {Function} callback - Function that receives query function and performs operations
 * @returns {Promise<any>} Result of the callback function
 *
 * @example
 * const result = await transaction(async (tx) => {
 *   await tx('INSERT INTO posts (user_id, content) VALUES ($1, $2)', [userId, content]);
 *   await tx('UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = $1', [userId]);
 *   return { success: true };
 * });
 */
export async function transaction(callback) {
  if (!neonClient) {
    throw new Error('Neon client is not configured.');
  }

  try {
    // Neon serverless driver doesn't support transactions directly
    // For transactions, you'll need to use a regular PostgreSQL client
    // or use the @neondatabase/serverless package's transaction features
    console.warn('Transactions require a regular PostgreSQL client. Using neon() directly.');
    return callback(query);
  } catch (error) {
    console.error('Neon transaction error:', error);
    throw error;
  }
}

/**
 * Common queries with predefined SQL
 */
export const queries = {
  // User queries
  getUserById: 'SELECT * FROM clerk_users WHERE id = $1',
  getUserByEmail: 'SELECT * FROM clerk_users WHERE email = $1',
  getUserByUsername: 'SELECT * FROM clerk_users WHERE username = $1',

  // Profile queries
  getProfileByUserId: 'SELECT * FROM profiles WHERE user_id = $1',
  getActiveProfile: `
    SELECT p.*, cu.active_role, cu.account_types
    FROM profiles p
    JOIN clerk_users cu ON p.user_id = cu.id
    WHERE p.user_id = $1
  `,

  // Social feed queries
  getPosts: `
    SELECT p.*, cu.username, cu.email, sp.display_name, sp.photo_url
    FROM posts p
    JOIN clerk_users cu ON p.user_id = cu.id
    LEFT JOIN profiles sp ON sp.user_id = cu.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT $1
  `,
  getPostsByUser: `
    SELECT * FROM posts
    WHERE user_id = $1 AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT $2
  `,
  getPostById: 'SELECT * FROM posts WHERE id = $1',

  // Comments
  getCommentsByPostId: `
    SELECT c.*, cu.username, sp.display_name, sp.photo_url
    FROM comments c
    JOIN clerk_users cu ON c.user_id = cu.id
    LEFT JOIN profiles sp ON sp.user_id = cu.id
    WHERE c.post_id = $1 AND c.deleted_at IS NULL
    ORDER BY c.created_at ASC
  `,

  // Notifications
  getNotificationsByUserId: `
    SELECT * FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `,
  getUnreadNotificationsCount: `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = $1 AND read = false
  `,

  // Bookings
  getBookingsByUser: `
    SELECT * FROM bookings
    WHERE (sender_id = $1 OR target_id = $1)
    ORDER BY created_at DESC
    LIMIT $2
  `,
  getBookingById: 'SELECT * FROM bookings WHERE id = $1',

  // Marketplace
  getMarketItems: `
    SELECT mi.*, cu.username, sp.display_name
    FROM market_items mi
    JOIN clerk_users cu ON mi.seller_id = cu.id
    LEFT JOIN profiles sp ON sp.user_id = cu.id
    WHERE mi.status = 'active'
    ORDER BY mi.created_at DESC
    LIMIT $1
  `,
};

/**
 * Helper to execute predefined queries
 *
 * @param {string} queryName - Name of the query from `queries` object
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Array>} Query results
 *
 * @example
 * const user = await executeQuery('getUserById', [userId]);
 * const posts = await executeQuery('getPosts', [50]);
 */
export async function executeQuery(queryName, params = []) {
  const sql = queries[queryName];

  if (!sql) {
    throw new Error(`Query "${queryName}" not found.`);
  }

  return query(sql, params);
}

/**
 * Development Notice
 *
 * During development, if you see warnings about missing environment variables:
 * 1. Go to https://console.neon.tech/
 * 2. Create a new project or select an existing one
 * 3. Copy the connection string (Connection Details > Connection string)
 * 4. Add it to your .env.local file:
 *
 *    VITE_NEON_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/database?sslmode=require
 *
 * For production, ensure the environment variable is set in your hosting platform
 * (Vercel, Netlify, etc.).
 */
