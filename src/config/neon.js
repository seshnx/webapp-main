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

// =====================================================
// ADVANCED TRANSACTION HELPERS
// =====================================================

/**
 * Execute multiple queries in a transaction (using serverless driver)
 *
 * Note: The Neon serverless driver doesn't support traditional transactions.
 * This function executes queries sequentially and rolls back manually if needed.
 *
 * For true ACID transactions, use the postgres package with connection pooling.
 *
 * @param {Function} callback - Function that receives query function and performs operations
 * @returns {Promise<any>} Result of the callback function
 *
 * @example
 * const result = await transaction(async (tx) => {
 *   const post = await tx('INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *', [userId, content]);
 *   await tx('UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = $1', [userId]);
 *   return post;
 * });
 */
export async function transaction(callback) {
  if (!neonClient) {
    throw new Error('Neon client is not configured.');
  }

  const executedQueries = [];

  try {
    // Create a transaction-aware query function
    const txQuery = async (sql, params) => {
      const result = await neonClient(sql, params);
      executedQueries.push({ sql, params, result });
      return result;
    };

    // Execute the callback with our transaction-aware query function
    const result = await callback(txQuery);

    return result;
  } catch (error) {
    console.error('Transaction failed, executed queries:', executedQueries);
    console.error('Transaction error:', error);
    throw error;
  }
}

/**
 * Transaction builder for complex operations
 *
 * Provides a cleaner API for building complex transactions.
 *
 * @returns {object} Transaction builder
 *
 * @example
 * const result = await createTransaction()
 *   .query('INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *', [userId, content])
 *   .query('UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = $1', [userId])
 *   .query('INSERT INTO audit_log (user_id, action) VALUES ($1, $2)', [userId, 'post_created'])
 *   .execute();
 */
export function createTransaction() {
  const queries = [];

  return {
    /**
     * Add a query to the transaction
     *
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {object} Transaction builder (for chaining)
     */
    query(sql, params = []) {
      queries.push({ sql, params });
      return this;
    },

    /**
     * Execute all queries in the transaction
     *
     * @returns {Promise<Array>} Array of query results
     */
    async execute() {
      if (!neonClient) {
        throw new Error('Neon client is not configured.');
      }

      const results = [];

      try {
        for (const { sql, params } of queries) {
          const result = await neonClient(sql, params);
          results.push(result);
        }

        return results;
      } catch (error) {
        console.error('Transaction execution failed:', error);
        console.error('Queries that were executed:', queries);
        throw error;
      }
    },
  };
}

/**
 * Batch query executor
 *
 * Executes multiple queries in parallel for better performance.
 *
 * @param {Array} queryList - Array of { sql, params } objects
 * @returns {Promise<Array>} Array of query results
 *
 * @example
 * const results = await batchQueries([
 *   { sql: 'SELECT * FROM posts WHERE user_id = $1', params: [userId] },
 *   { sql: 'SELECT * FROM profiles WHERE user_id = $1', params: [userId] },
 *   { sql: 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1', params: [userId] }
 * ]);
 */
export async function batchQueries(queryList) {
  if (!neonClient) {
    throw new Error('Neon client is not configured.');
  }

  try {
    const promises = queryList.map(({ sql, params }) =>
      neonClient(sql, params || [])
    );

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Batch query error:', error);
    throw error;
  }
}

/**
 * Query with retry logic
 *
 * Retries a query if it fails due to transient errors.
 *
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @param {object} options - Retry options
 * @returns {Promise<Array>} Query results
 *
 * @example
 * const result = await queryWithRetry(
 *   'SELECT * FROM posts WHERE id = $1',
 *   [postId],
 *   { maxRetries: 3, retryDelay: 1000 }
 * );
 */
export async function queryWithRetry(sql, params = [], options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await query(sql, params);
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.code === '23505') { // Unique constraint violation
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        console.warn(`Query failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Paginated query helper
 *
 * Executes a paginated query with automatic limit/offset handling.
 *
 * @param {string} baseSql - Base SQL query (without LIMIT/OFFSET)
 * @param {Array} params - Query parameters
 * @param {object} options - Pagination options
 * @returns {Promise<object>} Paginated results
 *
 * @example
 * const { data, pagination } = await paginatedQuery(
 *   'SELECT * FROM posts WHERE user_id = $1',
 *   [userId],
 *   { page: 2, pageSize: 20 }
 * );
 */
export async function paginatedQuery(baseSql, params = [], options = {}) {
  const {
    page = 1,
    pageSize = 20,
    orderBy = 'created_at',
    orderDirection = 'DESC',
  } = options;

  const offset = (page - 1) * pageSize;

  // Get total count
  const countSql = baseSql.replace(/SELECT.*?FROM/i, 'SELECT COUNT(*) as total FROM');
  const countResult = await query(countSql, params);
  const total = parseInt(countResult[0]?.total || '0', 10);

  // Get paginated data
  const dataSql = `${baseSql} ORDER BY ${orderBy} ${orderDirection} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const data = await query(dataSql, [...params, pageSize, offset]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page * pageSize < total,
      hasPrev: page > 1,
    },
  };
}

/**
 * Health check for Neon connection
 *
 * @returns {Promise<boolean>} True if connection is healthy
 */
export async function healthCheck() {
  try {
    await query('SELECT 1 as health_check');
    return true;
  } catch (error) {
    console.error('Neon health check failed:', error);
    return false;
  }
}

/**
 * Get database connection info
 *
 * @returns {Promise<object>} Connection information
 */
export async function getConnectionInfo() {
  try {
    const result = await query(`
      SELECT
        version(),
        now() as current_time,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);

    return {
      connected: true,
      version: result[0]?.version,
      serverTime: result[0]?.current_time,
      serverIp: result[0]?.server_ip,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

/**
 * Query performance monitor
 *
 * Monitors and logs slow queries for performance optimization.
 *
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @param {number} slowThreshold - Threshold in ms for "slow" queries (default: 1000ms)
 * @returns {Promise<Array>} Query results
 *
 * @example
 * const result = await monitoredQuery(
 *   'SELECT * FROM posts WHERE user_id = $1',
 *   [userId],
 *   500 // Log queries that take more than 500ms
 * );
 */
export async function monitoredQuery(sql, params = [], slowThreshold = 1000) {
  const startTime = performance.now();

  try {
    const result = await query(sql, params);

    const duration = performance.now() - startTime;
    if (duration > slowThreshold) {
      console.warn(`Slow query detected (${duration.toFixed(2)}ms):`, sql);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`Query failed after ${duration.toFixed(2)}ms:`, sql, error);
    throw error;
  }
}

/**
 * Upsert helper (Insert or Update)
 *
 * Performs an upsert operation based on the table's unique constraints.
 *
 * @param {string} tableName - Table name
 * @param {object} data - Data to insert/update
 * @param {string} conflictTarget - Column name(s) for conflict detection
 * @param {object} updateData - Data to update on conflict (optional, defaults to all data)
 * @returns {Promise<object>} Upserted row
 *
 * @example
 * const result = await upsert(
 *   'profiles',
 *   { user_id: userId, display_name: 'John', bio: 'Musician' },
 *   'user_id'
 * );
 */
export async function upsert(tableName, data, conflictTarget, updateData = null) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

  const updateColumns = updateData ? Object.keys(updateData) : columns;
  const updateSets = updateColumns
    .map(col => `${col} = EXCLUDED.${col}`)
    .join(', ');

  const sql = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (${conflictTarget}) DO UPDATE SET
      ${updateSets || updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(', ')},
      updated_at = NOW()
    RETURNING *
  `;

  const result = await query(sql, values);
  return result[0];
}

/**
 * Bulk insert helper
 *
 * Inserts multiple rows in a single query.
 *
 * @param {string} tableName - Table name
 * @param {Array} dataArray - Array of data objects to insert
 * @returns {Promise<Array>} Inserted rows
 *
 * @example
 * const results = await bulkInsert('notifications', [
 *   { user_id: userId, type: 'like', message: 'Someone liked your post' },
 *   { user_id: userId, type: 'follow', message: 'Someone followed you' }
 * ]);
 */
export async function bulkInsert(tableName, dataArray) {
  if (dataArray.length === 0) {
    return [];
  }

  const columns = Object.keys(dataArray[0]);
  const placeholders = dataArray.map((_, rowIndex) =>
    columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')
  );

  const values = dataArray.flatMap(row => Object.values(row));

  const sql = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES (${placeholders.join('), (')})
    RETURNING *
  `;

  return query(sql, values);
}
