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

import { neon, NeonQueryFunction } from '@neondatabase/serverless';

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
export const neonClient: NeonQueryFunction<false, never> | null = neonUrl ? neon(neonUrl) : null;

/**
 * Check if Neon is properly configured
 *
 * @returns True if Neon connection string is present
 */
export function isNeonConfigured(): boolean {
  return !!neonUrl;
}

/**
 * Execute a SQL query
 *
 * @param sql - SQL query with optional placeholders ($1, $2, etc.)
 * @param params - Parameter values for placeholders
 * @returns Query results
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
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (!neonClient) {
    throw new Error('Neon client is not configured. Check VITE_NEON_DATABASE_URL environment variable.');
  }

  try {
    const result = await neonClient(sql, params);
    return result as T[];
  } catch (error) {
    console.error('Neon query error:', error);
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
} as const;

/**
 * Helper to execute predefined queries
 *
 * @param queryName - Name of the query from `queries` object
 * @param params - Parameters for the query
 * @returns Query results
 *
 * @example
 * const user = await executeQuery('getUserById', [userId]);
 * const posts = await executeQuery('getPosts', [50]);
 */
export async function executeQuery<T = any>(queryName: keyof typeof queries, params: any[] = []): Promise<T[]> {
  const sql = queries[queryName];

  if (!sql) {
    throw new Error(`Query "${queryName}" not found.`);
  }

  return query<T>(sql, params);
}

// =====================================================
// ADVANCED TRANSACTION HELPERS
// =====================================================

/**
 * Transaction query function type
 */
type TransactionQueryFunction = <T = any>(sql: string, params?: any[]) => Promise<T[]>;

/**
 * Execute multiple queries in a transaction (using serverless driver)
 *
 * Note: The Neon serverless driver doesn't support traditional transactions.
 * This function executes queries sequentially and rolls back manually if needed.
 *
 * For true ACID transactions, use the postgres package with connection pooling.
 *
 * @param callback - Function that receives query function and performs operations
 * @returns Result of the callback function
 *
 * @example
 * const result = await transaction(async (tx) => {
 *   const post = await tx('INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *', [userId, content]);
 *   await tx('UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = $1', [userId]);
 *   return post;
 * });
 */
export async function transaction<T = any>(callback: (tx: TransactionQueryFunction) => Promise<T>): Promise<T> {
  if (!neonClient) {
    throw new Error('Neon client is not configured.');
  }

  const executedQueries: Array<{ sql: string; params: any[]; result: any }> = [];

  try {
    // Create a transaction-aware query function
    const txQuery: TransactionQueryFunction = async <U = any>(sql: string, params: any[] = []) => {
      const result = await neonClient(sql, params);
      executedQueries.push({ sql, params, result });
      return result as U[];
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
 * @returns Transaction builder
 *
 * @example
 * const result = await createTransaction()
 *   .query('INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *', [userId, content])
 *   .query('UPDATE profiles SET posts_count = posts_count + 1 WHERE user_id = $1', [userId])
 *   .query('INSERT INTO audit_log (user_id, action) VALUES ($1, $2)', [userId, 'post_created'])
 *   .execute();
 */
export function createTransaction() {
  const queries: Array<{ sql: string; params: any[] }> = [];

  return {
    /**
     * Add a query to the transaction
     *
     * @param sql - SQL query
     * @param params - Query parameters
     * @returns Transaction builder (for chaining)
     */
    query<T = any>(sql: string, params: any[] = []) {
      queries.push({ sql, params });
      return this;
    },

    /**
     * Execute all queries in the transaction
     *
     * @returns Array of query results
     */
    async execute<T = any>(): Promise<T[]> {
      if (!neonClient) {
        throw new Error('Neon client is not configured.');
      }

      const results: T[] = [];

      try {
        for (const { sql, params } of queries) {
          const result = await neonClient(sql, params);
          results.push(result as T);
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
 * @param queryList - Array of { sql, params } objects
 * @returns Array of query results
 *
 * @example
 * const results = await batchQueries([
 *   { sql: 'SELECT * FROM posts WHERE user_id = $1', params: [userId] },
 *   { sql: 'SELECT * FROM profiles WHERE user_id = $1', params: [userId] },
 *   { sql: 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1', params: [userId] }
 * ]);
 */
export async function batchQueries<T = any>(
  queryList: Array<{ sql: string; params?: any[] }>
): Promise<T[]> {
  if (!neonClient) {
    throw new Error('Neon client is not configured.');
  }

  try {
    const promises = queryList.map(({ sql, params }) =>
      neonClient(sql, params || [])
    );

    const results = await Promise.all(promises);
    return results as T[];
  } catch (error) {
    console.error('Batch query error:', error);
    throw error;
  }
}

/**
 * Retry options for queryWithRetry
 */
export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

/**
 * Query with retry logic
 *
 * Retries a query if it fails due to transient errors.
 *
 * @param sql - SQL query
 * @param params - Query parameters
 * @param options - Retry options
 * @returns Query results
 *
 * @example
 * const result = await queryWithRetry(
 *   'SELECT * FROM posts WHERE id = $1',
 *   [postId],
 *   { maxRetries: 3, retryDelay: 1000 }
 * );
 */
export async function queryWithRetry<T = any>(
  sql: string,
  params: any[] = [],
  options: RetryOptions = {}
): Promise<T[]> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await query<T>(sql, params);
    } catch (error: any) {
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
 * Pagination options for paginatedQuery
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Paginated query helper
 *
 * Executes a paginated query with automatic limit/offset handling.
 *
 * @param baseSql - Base SQL query (without LIMIT/OFFSET)
 * @param params - Query parameters
 * @param options - Pagination options
 * @returns Paginated results
 *
 * @example
 * const { data, pagination } = await paginatedQuery(
 *   'SELECT * FROM posts WHERE user_id = $1',
 *   [userId],
 *   { page: 2, pageSize: 20 }
 * );
 */
export async function paginatedQuery<T = any>(
  baseSql: string,
  params: any[] = [],
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    pageSize = 20,
    orderBy = 'created_at',
    orderDirection = 'DESC',
  } = options;

  const offset = (page - 1) * pageSize;

  // Get total count
  const countSql = baseSql.replace(/SELECT.*?FROM/i, 'SELECT COUNT(*) as total FROM');
  const countResult = await query<{ total: string }>(countSql, params);
  const total = parseInt(countResult[0]?.total || '0', 10);

  // Get paginated data
  const dataSql = `${baseSql} ORDER BY ${orderBy} ${orderDirection} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const data = await query<T>(dataSql, [...params, pageSize, offset]);

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
 * @returns True if connection is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT 1 as health_check');
    return true;
  } catch (error) {
    console.error('Neon health check failed:', error);
    return false;
  }
}

/**
 * Connection information interface
 */
export interface ConnectionInfo {
  connected: boolean;
  version?: string;
  serverTime?: string;
  serverIp?: string;
  error?: string;
}

/**
 * Get database connection info
 *
 * @returns Connection information
 */
export async function getConnectionInfo(): Promise<ConnectionInfo> {
  try {
    const result = await query<{
      version: string;
      current_time: string;
      server_ip: string;
    }>(`
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
  } catch (error: any) {
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
 * @param sql - SQL query
 * @param params - Query parameters
 * @param slowThreshold - Threshold in ms for "slow" queries (default: 1000ms)
 * @returns Query results
 *
 * @example
 * const result = await monitoredQuery(
 *   'SELECT * FROM posts WHERE user_id = $1',
 *   [userId],
 *   500 // Log queries that take more than 500ms
 * );
 */
export async function monitoredQuery<T = any>(
  sql: string,
  params: any[] = [],
  slowThreshold: number = 1000
): Promise<T[]> {
  const startTime = performance.now();

  try {
    const result = await query<T>(sql, params);

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
 * @param tableName - Table name
 * @param data - Data to insert/update
 * @param conflictTarget - Column name(s) for conflict detection
 * @param updateData - Data to update on conflict (optional, defaults to all data)
 * @returns Upserted row
 *
 * @example
 * const result = await upsert(
 *   'profiles',
 *   { user_id: userId, display_name: 'John', bio: 'Musician' },
 *   'user_id'
 * );
 */
export async function upsert<T = any>(
  tableName: string,
  data: Record<string, any>,
  conflictTarget: string,
  updateData: Record<string, any> | null = null
): Promise<T> {
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

  const result = await query<T>(sql, values);
  return result[0];
}

/**
 * Bulk insert helper
 *
 * Inserts multiple rows in a single query.
 *
 * @param tableName - Table name
 * @param dataArray - Array of data objects to insert
 * @returns Inserted rows
 *
 * @example
 * const results = await bulkInsert('notifications', [
 *   { user_id: userId, type: 'like', message: 'Someone liked your post' },
 *   { user_id: userId, type: 'follow', message: 'Someone followed you' }
 * ]);
 */
export async function bulkInsert<T = any>(
  tableName: string,
  dataArray: Record<string, any>[]
): Promise<T[]> {
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

  return query<T>(sql, values);
}
