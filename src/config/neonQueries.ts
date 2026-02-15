/**
 * Neon Centralized Query Library
 *
 * This module provides a comprehensive set of query functions for all database operations.
 * It replaces Supabase queries with Neon queries throughout the application.
 *
 * Features:
 * - Centralized query definitions
 * - Type-safe parameter handling
 * - Common query patterns
 * - Business-specific query helpers
 *
 * @example
 * import { getUser, createPost, getBookings } from '@/config/neonQueries';
 *
 * const user = await getUser(userId);
 * const posts = await getPosts({ limit: 50, userId });
 * const bookings = await getBookings(userId);
 */

import { neonClient } from './neon';
import type { AccountType } from '../types';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

/**
 * Clerk user record from database
 */
export interface ClerkUser {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_photo_url?: string;
  account_types?: AccountType[];
  active_role?: AccountType;
  bio?: string;
  zip_code?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: any;
}

/**
 * Profile record from database
 */
export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  photo_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: Record<string, string>;
  talent_info?: Record<string, any>;
  engineer_info?: Record<string, any>;
  producer_info?: Record<string, any>;
  studio_info?: Record<string, any>;
  education_info?: Record<string, any>;
  label_info?: Record<string, any>;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  reputation_score?: number;
  [key: string]: any;
}

/**
 * Post record from database
 */
export interface Post {
  id: string;
  user_id: string;
  text?: string;
  media_urls?: string[];
  likes_count?: number;
  comments_count?: number;
  saves_count?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
  deleted_at?: string | Date | null;
  [key: string]: any;
}

/**
 * Booking record from database
 */
export interface Booking {
  id: string;
  sender_id?: string;
  target_id?: string;
  studio_owner_id?: string;
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  service_type?: string;
  date?: string | Date;
  time?: string;
  duration?: number;
  offer_amount?: number;
  message?: string;
  created_at?: string | Date;
  [key: string]: any;
}

/**
 * Notification record from database
 */
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  read?: boolean;
  reference_type?: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at?: string | Date;
  [key: string]: any;
}

/**
 * Query options for pagination
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  userId?: string;
}

// =====================================================
// ERROR HANDLING
// =====================================================

/**
 * Handle and log database errors
 *
 * @param error - Database error
 * @param queryName - Name of the query that failed
 * @throws Re-throws the error with additional context
 */
function handleDatabaseError(error: unknown, queryName: string): never {
  console.error(`Database error in ${queryName}:`, error);
  throw new Error(`Query ${queryName} failed: ${error instanceof Error ? error.message : String(error)}`);
}

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
    handleDatabaseError(error, queryName);
  }
}

// =====================================================
// USER AND PROFILE QUERIES
// =====================================================

/**
 * Get user by ID
 *
 * @param userId - User ID
 * @returns User object or null
 *
 * @example
 * const user = await getUser('user_12345');
 */
export async function getUser(userId: string): Promise<ClerkUser | null> {
  const result = await executeQuery<ClerkUser>(
    'SELECT * FROM clerk_users WHERE id = $1',
    [userId],
    'getUser'
  );
  return result[0] || null;
}

/**
 * Get user by email
 *
 * @param email - User email
 * @returns User object or null
 */
export async function getUserByEmail(email: string): Promise<ClerkUser | null> {
  const result = await executeQuery<ClerkUser>(
    'SELECT * FROM clerk_users WHERE email = $1',
    [email],
    'getUserByEmail'
  );
  return result[0] || null;
}

/**
 * Get user by username
 *
 * @param username - Username
 * @returns User object or null
 */
export async function getUserByUsername(username: string): Promise<ClerkUser | null> {
  const result = await executeQuery<ClerkUser>(
    'SELECT * FROM clerk_users WHERE username = $1',
    [username],
    'getUserByUsername'
  );
  return result[0] || null;
}

/**
 * Get profile by user ID
 *
 * Queries by user_id (Clerk user ID). If no profile exists, creates a default one.
 *
 * @param userId - Clerk User ID
 * @returns Profile object or null
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  // Query by user_id (Clerk user ID - TEXT column)
  let result = await executeQuery<Profile>(
    'SELECT * FROM profiles WHERE user_id = $1',
    [userId],
    'getProfile'
  );

  // If not found, try to create a default profile
  if (!result || result.length === 0) {
    console.log(`[getProfile] No profile found for user ${userId}, attempting to create default profile`);
    try {
      // First, check if user exists in clerk_users table
      const clerkUser = await executeQuery<{ first_name?: string; last_name?: string; username?: string }>(
        'SELECT first_name, last_name, username FROM clerk_users WHERE id = $1',
        [userId],
        'getProfile-fetchUser'
      );

      const user = clerkUser?.[0];

      // If user doesn't exist in clerk_users, we can't create a profile
      if (!user) {
        console.warn(`[getProfile] User ${userId} not found in clerk_users table, cannot create profile`);
        return null;
      }

      // User exists, create the profile
      const displayName = user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : user?.username || user?.first_name || 'New User';

      const insertResult = await executeQuery<Profile>(
        `INSERT INTO profiles (user_id, display_name) VALUES ($1, $2) RETURNING *`,
        [userId, displayName],
        'getProfile-create'
      );
      console.log(`[getProfile] Successfully created profile for user ${userId}`);
      return insertResult[0] || null;
    } catch (error: any) {
      console.error('[getProfile] Failed to create default profile:', error);
      // If it's a foreign key constraint error, the user doesn't exist in clerk_users
      if (error?.message?.includes('foreign key constraint')) {
        console.warn(`[getProfile] Cannot create profile: user ${userId} does not exist in clerk_users table`);
      }
      return null;
    }
  }

  return result[0] || null;
}

/**
 * Get multiple profiles by user IDs
 *
 * @param userIds - Array of user IDs
 * @returns Array of profiles
 */
export async function getProfilesByIds(userIds: string[]): Promise<Profile[]> {
  if (!userIds || userIds.length === 0) return [];

  const sql = 'SELECT * FROM profiles WHERE user_id = ANY($1)';
  const result = await executeQuery<Profile>(sql, [userIds], 'getProfilesByIds');
  return result;
}

/**
 * Search profiles/talent with filters
 *
 * @param options - Search options
 * @returns Array of matching profiles
 */
export interface SearchProfilesOptions {
  searchQuery?: string;
  accountTypes?: string[];
  minRate?: number;
  maxRate?: number;
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verifiedOnly?: boolean;
  availableNow?: boolean;
  hasPortfolio?: boolean;
  vocalRange?: string;
  vocalStyle?: string;
  djStyle?: string;
  productionStyle?: string;
  engineeringSpecialty?: string;
  genres?: string[];
  location?: {
    lat: number;
    lng: number;
    radius: number; // in miles
  };
  sortBy?: 'relevance' | 'rating' | 'rate_low' | 'rate_high' | 'recent';
  limit?: number;
  excludeUserId?: string;
}

export async function searchProfiles(options: SearchProfilesOptions = {}): Promise<any[]> {
  const {
    searchQuery,
    accountTypes,
    minRate,
    maxRate,
    experience,
    verifiedOnly,
    availableNow,
    hasPortfolio,
    vocalRange,
    vocalStyle,
    djStyle,
    productionStyle,
    engineeringSpecialty,
    genres,
    location,
    sortBy = 'relevance',
    limit = 100,
    excludeUserId,
  } = options;

  // Build the query
  let sql = `
    SELECT
      cu.id,
      cu.email,
      cu.first_name,
      cu.last_name,
      cu.username,
      cu.profile_photo_url,
      cu.account_types,
      cu.active_role,
      cu.bio,
      cu.created_at,
      cu.updated_at,
      p.id as profile_id,
      p.display_name,
      p.photo_url as profile_photo,
      p.location as profile_location,
      p.talent_info,
      p.engineer_info,
      p.producer_info,
      p.followers_count,
      p.posts_count,
      p.reputation_score as rating,
      COALESCE(p.reputation_score, 0) as review_count
    FROM clerk_users cu
    LEFT JOIN profiles p ON p.user_id = cu.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  // Exclude current user
  if (excludeUserId) {
    sql += ` AND cu.id != $${paramIndex++}`;
    params.push(excludeUserId);
  }

  // Filter by account types
  if (accountTypes && accountTypes.length > 0 && !accountTypes.includes('All')) {
    // Use array overlap operator to check if account_types contains any of the specified types
    sql += ` AND cu.account_types && $${paramIndex++}`;
    params.push(accountTypes);
  }

  // Filter by verification status
  if (verifiedOnly) {
    sql += ` AND p.verified = true`;
  }

  // Filter by minimum reputation (has portfolio proxy)
  if (hasPortfolio) {
    sql += ` AND (p.reputation_score > 0 OR p.talent_info->>'portfolio' IS NOT NULL)`;
  }

  // Filter by experience level (from talent_info)
  if (experience) {
    const experienceRanges = {
      beginner: [0, 2],
      intermediate: [2, 5],
      advanced: [5, 10],
      expert: [10, 100]
    };
    const [minExp, maxExp] = experienceRanges[experience];
    sql += ` AND CAST(COALESCE(p.talent_info->>'yearsExperience', '0') AS INTEGER) >= $${paramIndex++}`;
    sql += ` AND CAST(COALESCE(p.talent_info->>'yearsExperience', '0') AS INTEGER) < $${paramIndex++}`;
    params.push(minExp, maxExp);
  }

  // Filter by rate range
  if (minRate !== undefined || maxRate !== undefined) {
    const rate = minRate !== undefined ? minRate : 0;
    sql += ` AND CAST(COALESCE(p.talent_info->>'rate', '0') AS INTEGER) >= $${paramIndex++}`;
    params.push(rate);
  }
  if (maxRate !== undefined) {
    sql += ` AND CAST(COALESCE(p.talent_info->>'rate', '999999') AS INTEGER) <= $${paramIndex++}`;
    params.push(maxRate);
  }

  // Filter by vocal range
  if (vocalRange) {
    sql += ` AND p.talent_info->>'vocalRange' = $${paramIndex++}`;
    params.push(vocalRange);
  }

  // Filter by genres (JSON array contains)
  if (genres && genres.length > 0) {
    sql += ` AND p.talent_info->>'genres' IS NOT NULL`;
  }

  // Text search (search in name, username, bio)
  if (searchQuery) {
    sql += ` AND (
      cu.first_name ILIKE $${paramIndex++} OR
      cu.last_name ILIKE $${paramIndex++} OR
      cu.username ILIKE $${paramIndex++} OR
      cu.bio ILIKE $${paramIndex++} OR
      p.display_name ILIKE $${paramIndex++}
    )`;
    const searchTerm = `%${searchQuery}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  // Order by
  switch (sortBy) {
    case 'rating':
      sql += ` ORDER BY p.reputation_score DESC NULLS LAST`;
      break;
    case 'rate_low':
      sql += ` ORDER BY CAST(COALESCE(p.talent_info->>'rate', '999999') AS INTEGER) ASC`;
      break;
    case 'rate_high':
      sql += ` ORDER BY CAST(COALESCE(p.talent_info->>'rate', '0') AS INTEGER) DESC`;
      break;
    case 'recent':
      sql += ` ORDER BY cu.updated_at DESC`;
      break;
    default: // relevance
      sql += ` ORDER BY p.reputation_score DESC NULLS LAST, cu.updated_at DESC`;
  }

  // Limit
  sql += ` LIMIT $${paramIndex++}`;
  params.push(limit);

  const results = await executeQuery(sql, params, 'searchProfiles');

  // Post-process filters that can't be done in SQL
  let filtered = results;

  // Filter by vocal style (array contains)
  if (vocalStyle) {
    filtered = filtered.filter((p: any) =>
      p.talent_info?.vocalStyles?.includes(vocalStyle) ||
      p.talent_info?.genres?.includes(vocalStyle)
    );
  }

  // Filter by DJ style
  if (djStyle) {
    filtered = filtered.filter((p: any) =>
      p.talent_info?.djStyles?.includes(djStyle) ||
      p.talent_info?.genres?.includes(djStyle)
    );
  }

  // Filter by production style
  if (productionStyle) {
    filtered = filtered.filter((p: any) =>
      p.talent_info?.productionStyles?.includes(productionStyle) ||
      p.talent_info?.genres?.includes(productionStyle)
    );
  }

  // Filter by engineering specialty
  if (engineeringSpecialty) {
    filtered = filtered.filter((p: any) =>
      p.talent_info?.skills?.includes(engineeringSpecialty) ||
      p.engineer_info?.specialties?.includes(engineeringSpecialty)
    );
  }

  // Filter by genres
  if (genres && genres.length > 0) {
    filtered = filtered.filter((p: any) =>
      genres.some(g => p.talent_info?.genres?.includes(g))
    );
  }

  // Filter by availability (last active within 1 hour)
  if (availableNow) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    filtered = filtered.filter((p: any) => {
      const lastActive = new Date(p.updated_at);
      return lastActive > oneHourAgo;
    });
  }

  // Filter by location radius (if coordinates provided)
  if (location && location.lat && location.lng) {
    filtered = filtered.filter((p: any) => {
      const profileLocation = p.talent_info?.location || p.profile_location;
      if (!profileLocation || !profileLocation.lat || !profileLocation.lng) {
        return false;
      }

      // Calculate distance using Haversine formula
      const R = 3959; // Earth's radius in miles
      const dLat = (profileLocation.lat - location.lat) * Math.PI / 180;
      const dLon = (profileLocation.lng - location.lng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(location.lat * Math.PI / 180) * Math.cos(profileLocation.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= location.radius;
    });
  }

  return filtered;
}

/**
 * Get user with profile
 *
 * @param userId - User ID
 * @returns User with profile or null
 */
export async function getUserWithProfile(userId: string): Promise<any | null> {
  const result = await executeQuery(
    `SELECT
      cu.id,
      cu.email,
      cu.phone,
      cu.first_name,
      cu.last_name,
      cu.username,
      cu.profile_photo_url,
      cu.account_types,
      cu.active_role,
      cu.bio as clerk_bio,
      cu.zip_code,
      cu.created_at,
      cu.updated_at,
      p.id as profile_id,
      p.display_name,
      p.photo_url as profile_photo_url,
      p.bio as profile_bio,
      p.location,
      p.website,
      p.social_links,
      p.talent_info,
      p.engineer_info,
      p.producer_info,
      p.studio_info,
      p.education_info,
      p.label_info,
      p.followers_count,
      p.following_count,
      p.posts_count,
      p.reputation_score
    FROM clerk_users cu
    LEFT JOIN profiles p ON p.user_id = cu.id
    WHERE cu.id = $1`,
    [userId],
    'getUserWithProfile'
  );
  return result[0] || null;
}

/**
 * Create clerk user
 *
 * @param userData - User data from Clerk
 * @returns Created user
 */
export async function createClerkUser(userData: Partial<ClerkUser>): Promise<ClerkUser> {
  const {
    id,
    email,
    phone = null,
    first_name = null,
    last_name = null,
    username = null,
    profile_photo_url = null,
    account_types = ['Fan'],
    active_role = 'Fan',
    bio = null,
    zip_code = null,
  } = userData;

  // Convert JavaScript array to PostgreSQL array format
  // ['Fan', 'Artist'] -> '{Fan,Artist}'
  const accountTypesArray = Array.isArray(account_types)
    ? `{${account_types.join(',')}}`
    : account_types || '{Fan}';

  const result = await executeQuery<ClerkUser>(
    `INSERT INTO clerk_users (
      id, email, phone, first_name, last_name, username, profile_photo_url,
      account_types, active_role, bio, zip_code
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      username = EXCLUDED.username,
      profile_photo_url = EXCLUDED.profile_photo_url,
      account_types = EXCLUDED.account_types,
      active_role = EXCLUDED.active_role,
      bio = EXCLUDED.bio,
      zip_code = EXCLUDED.zip_code,
      updated_at = NOW()
    RETURNING *`,
    [
      id, email, phone, first_name, last_name, username, profile_photo_url,
      accountTypesArray, active_role, bio, zip_code
    ],
    'createClerkUser'
  );
  return result[0];
}

/**
 * Ensure user exists in database
 *
 * @param userId - User ID
 * @param userData - Optional user data
 * @returns User record
 */
export async function ensureUserInDatabase(
  userId: string,
  userData: Partial<ClerkUser> | null = null
): Promise<ClerkUser> {
  // Check if user exists
  const existingUser = await getUser(userId);

  if (existingUser) {
    return existingUser;
  }

  // Create new user with provided or minimal data
  return await createClerkUser({
    id: userId,
    ...userData,
  });
}

/**
 * Update profile
 *
 * @param userId - User ID
 * @param updates - Fields to update
 * @returns Updated profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Handle clerk_users fields separately - they go in clerk_users table, not profiles
  const {
    active_role,
    account_types,
    preferred_role,
    zip_code,
    first_name,
    last_name,
    email,
    use_legal_name_only,
    use_user_name_only,
    effective_display_name,
    ...profileUpdates
  } = updates as any;

  if (active_role !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET active_role = $1 WHERE id = $2',
      [active_role, userId],
      'updateProfile-active_role'
    );
  }

  if (account_types !== undefined) {
    // Convert JavaScript array to PostgreSQL array format
    const accountTypesArray = Array.isArray(account_types)
      ? `{${account_types.join(',')}}`
      : account_types;
    await executeQuery(
      'UPDATE clerk_users SET account_types = $1 WHERE id = $2',
      [accountTypesArray, userId],
      'updateProfile-account_types'
    );
  }

  if (preferred_role !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET preferred_role = $1 WHERE id = $2',
      [preferred_role, userId],
      'updateProfile-preferred_role'
    );
  }

  if (zip_code !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET zip_code = $1 WHERE id = $2',
      [zip_code, userId],
      'updateProfile-zip_code'
    );
  }

  if (first_name !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET first_name = $1 WHERE id = $2',
      [first_name, userId],
      'updateProfile-first_name'
    );
  }

  if (last_name !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET last_name = $1 WHERE id = $2',
      [last_name, userId],
      'updateProfile-last_name'
    );
  }

  if (email !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET email = $1 WHERE id = $2',
      [email, userId],
      'updateProfile-email'
    );
  }

  if (use_legal_name_only !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET use_legal_name_only = $1 WHERE id = $2',
      [use_legal_name_only, userId],
      'updateProfile-use_legal_name_only'
    );
  }

  if (use_user_name_only !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET use_user_name_only = $1 WHERE id = $2',
      [use_user_name_only, userId],
      'updateProfile-use_user_name_only'
    );
  }

  if (effective_display_name !== undefined) {
    await executeQuery(
      'UPDATE clerk_users SET effective_display_name = $1 WHERE id = $2',
      [effective_display_name, userId],
      'updateProfile-effective_display_name'
    );
  }

  // Fields that don't exist in either table - ignore them
  const ignoredFields = [
    'username', 'profile_photo_url', 'zip', 'hourlyRate'
  ];

  for (const [key, value] of Object.entries(profileUpdates)) {
    if (!ignoredFields.includes(key)) {
      // Handle search_terms array conversion
      if (key === 'search_terms' && Array.isArray(value)) {
        fields.push(`${key} = $${paramIndex}`);
        // Properly escape PostgreSQL array elements
        // Elements with spaces, quotes, commas, or braces need to be wrapped in quotes
        // and internal quotes need to be doubled
        const escapedArray = value.map((item: string) => {
          // If element contains special characters, wrap in quotes and escape internal quotes
          if (item && /[\s{}",]/.test(item)) {
            return `"${item.replace(/"/g, '""')}"`;
          }
          return item || '';
        });
        values.push(`{${escapedArray.join(',')}}`);
        paramIndex++;
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
  }

  if (fields.length === 0) {
    // If only active_role was updated, fetch and return the current profile
    const result = await executeQuery<Profile>(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId],
      'updateProfile-fetch'
    );
    return result[0] || {} as Profile;
  }

  values.push(userId); // For WHERE clause

  const result = await executeQuery<Profile>(
    `UPDATE profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${paramIndex} RETURNING *`,
    values,
    'updateProfile'
  );

  return result[0];
}

// =====================================================
// POST QUERIES
// =====================================================

/**
 * Get posts with optional filters
 *
 * @param options - Query options
 * @returns Array of posts
 */
export async function getPosts(options: QueryOptions = {}): Promise<Post[]> {
  const { limit = 50, userId = null, offset = 0 } = options;

  let sql = 'SELECT * FROM posts WHERE deleted_at IS NULL';
  const params: any[] = [];
  let paramIndex = 1;

  if (userId) {
    sql += ` AND user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }

  sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return await executeQuery<Post>(sql, params, 'getPosts');
}

/**
 * Get post by ID
 *
 * @param postId - Post ID
 * @returns Post or null
 */
export async function getPost(postId: string): Promise<Post | null> {
  const result = await executeQuery<Post>(
    'SELECT * FROM posts WHERE id = $1',
    [postId],
    'getPost'
  );
  return result[0] || null;
}

/**
 * Create post
 *
 * @param postData - Post data
 * @returns Created post
 */
export async function createPost(postData: Partial<Post>): Promise<Post> {
  const {
    user_id,
    text,
    media_urls = [],
  } = postData;

  const result = await executeQuery<Post>(
    `INSERT INTO posts (user_id, text, media_urls) VALUES ($1, $2, $3) RETURNING *`,
    [user_id, text, JSON.stringify(media_urls)],
    'createPost'
  );

  return result[0];
}

/**
 * Update post
 *
 * @param postId - Post ID
 * @param updates - Fields to update
 * @returns Updated post
 */
export async function updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'media_urls' && Array.isArray(value)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
    }
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(postId);

  const result = await executeQuery<Post>(
    `UPDATE posts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
    values,
    'updatePost'
  );

  return result[0];
}

/**
 * Delete post (soft delete)
 *
 * @param postId - Post ID
 * @returns Deleted post
 */
export async function deletePost(postId: string): Promise<Post> {
  const result = await executeQuery<Post>(
    'UPDATE posts SET deleted_at = NOW() WHERE id = $1 RETURNING *',
    [postId],
    'deletePost'
  );
  return result[0];
}

// =====================================================
// BOOKING QUERIES
// =====================================================

/**
 * Get bookings for a user
 *
 * @param userId - User ID
 * @param options - Query options
 * @returns Array of bookings
 */
export async function getBookings(
  userId: string,
  options: QueryOptions = {}
): Promise<Booking[]> {
  const { limit = 50, offset = 0 } = options;

  const result = await executeQuery<Booking>(
    `SELECT * FROM bookings
     WHERE (sender_id::text = $1 OR target_id::text = $1 OR studio_owner_id = $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
    'getBookings'
  );

  return result;
}

/**
 * Get booking by ID
 *
 * @param bookingId - Booking ID
 * @returns Booking or null
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  const result = await executeQuery<Booking>(
    'SELECT * FROM bookings WHERE id = $1',
    [bookingId],
    'getBooking'
  );
  return result[0] || null;
}

/**
 * Create booking
 *
 * @param bookingData - Booking data
 * @returns Created booking
 */
export async function createBooking(bookingData: Partial<Booking>): Promise<Booking> {
  const {
    sender_id,
    target_id,
    studio_owner_id,
    status = 'Pending',
    service_type,
    date,
    time,
    duration,
    offer_amount,
    message,
  } = bookingData;

  const result = await executeQuery<Booking>(
    `INSERT INTO bookings (
      sender_id, target_id, studio_owner_id, status, service_type,
      date, time, duration, offer_amount, message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      sender_id, target_id, studio_owner_id, status, service_type,
      date, time, duration, offer_amount, message
    ],
    'createBooking'
  );

  return result[0];
}

/**
 * Update booking status
 *
 * @param bookingId - Booking ID
 * @param status - New status
 * @param metadata - Optional metadata
 * @returns Updated booking
 */
export async function updateBookingStatus(
  bookingId: string,
  status: string,
  metadata: Record<string, any> = {}
): Promise<Booking> {
  const result = await executeQuery<Booking>(
    `UPDATE bookings SET status = $1, metadata = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
    [status, JSON.stringify(metadata), bookingId],
    'updateBookingStatus'
  );

  return result[0];
}

/**
 * Blocked Date interface
 */
export interface BlockedDate {
  id: string;
  studio_id: string;
  date: Date | string;
  reason?: string;
  recurring_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  created_at?: Date | string;
}

/**
 * Get blocked dates for a studio
 *
 * @param studioId - Studio user ID
 * @returns Array of blocked dates
 */
export async function getBlockedDates(studioId: string): Promise<BlockedDate[]> {
  // Check if blocked_dates table exists, return empty array if not
  try {
    const result = await executeQuery<BlockedDate>(
      `SELECT * FROM blocked_dates
       WHERE studio_id = $1
       ORDER BY date ASC`,
      [studioId],
      'getBlockedDates'
    );
    return result;
  } catch (error: any) {
    if (error.message.includes('does not exist')) {
      return [];
    }
    throw error;
  }
}

/**
 * Create a blocked date
 *
 * @param studioId - Studio user ID
 * @param date - Date to block
 * @param reason - Reason for blocking
 * @param recurringType - Recurring type
 * @returns Created blocked date
 */
export async function createBlockedDate(
  studioId: string,
  date: Date | string,
  reason?: string,
  recurringType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
): Promise<BlockedDate> {
  const result = await executeQuery<BlockedDate>(
    `INSERT INTO blocked_dates (studio_id, date, reason, recurring_type)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (studio_id, date) DO UPDATE SET
       reason = $3,
       recurring_type = $4
     RETURNING *`,
    [studioId, date, reason || null, recurringType || 'none'],
    'createBlockedDate'
  );
  return result[0];
}

/**
 * Delete a blocked date
 *
 * @param blockedDateId - ID of blocked date to delete
 * @returns void
 */
export async function deleteBlockedDate(blockedDateId: string): Promise<void> {
  await executeQuery(
    'DELETE FROM blocked_dates WHERE id = $1',
    [blockedDateId],
    'deleteBlockedDate'
  );
}

// =====================================================
// NOTIFICATION QUERIES
// =====================================================

/**
 * Get notifications for a user
 *
 * @param userId - User ID
 * @param options - Query options
 * @returns Array of notifications
 */
export async function getNotifications(
  userId: string,
  options: QueryOptions = {}
): Promise<Notification[]> {
  const { limit = 50, offset = 0 } = options;

  const result = await executeQuery<Notification>(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
    'getNotifications'
  );

  return result;
}

/**
 * Get unread notification count
 *
 * @param userId - User ID
 * @returns Count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const result = await executeQuery<{ count: string }>(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
    [userId],
    'getUnreadNotificationCount'
  );

  return parseInt(result[0]?.count || '0', 10);
}

/**
 * Create notification
 *
 * @param notificationData - Notification data
 * @returns Created notification
 */
export async function createNotification(notificationData: Partial<Notification>): Promise<Notification> {
  const {
    user_id,
    type,
    title,
    message = null,
    read = false,
    reference_type = null,
    reference_id = null,
    metadata = {},
  } = notificationData;

  const result = await executeQuery<Notification>(
    `INSERT INTO notifications (
      user_id, type, title, message, read, reference_type, reference_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      user_id, type, title, message, read, reference_type, reference_id,
      JSON.stringify(metadata)
    ],
    'createNotification'
  );

  return result[0];
}

/**
 * Mark notification as read
 *
 * @param notificationId - Notification ID
 * @returns Updated notification
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  const result = await executeQuery<Notification>(
    'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
    [notificationId],
    'markNotificationAsRead'
  );

  return result[0];
}

/**
 * Mark all notifications as read for a user
 *
 * @param userId - User ID
 * @returns void
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await executeQuery(
    'UPDATE notifications SET read = true WHERE user_id = $1',
    [userId],
    'markAllNotificationsAsRead'
  );
}

/**
 * Delete notification
 *
 * @param notificationId - Notification ID
 * @returns Deleted notification
 */
export async function deleteNotification(notificationId: string): Promise<Notification> {
  const result = await executeQuery<Notification>(
    'DELETE FROM notifications WHERE id = $1 RETURNING *',
    [notificationId],
    'deleteNotification'
  );

  return result[0];
}

/**
 * Clear all notifications for a user
 *
 * @param userId - User ID
 * @returns void
 */
export async function clearAllNotifications(userId: string): Promise<void> {
  await executeQuery(
    'DELETE FROM notifications WHERE user_id = $1',
    [userId],
    'clearAllNotifications'
  );
}

// =====================================================
// FOLLOW SYSTEM QUERIES
// =====================================================

/**
 * Get list of user IDs that the current user is following
 *
 * @param userId - Current user ID
 * @returns Array of user IDs being followed
 */
export async function getFollowing(userId: string): Promise<string[]> {
  const result = await executeQuery<{ following_id: string }>(
    'SELECT following_id FROM follows WHERE follower_id = $1',
    [userId],
    'getFollowing'
  );

  return result.map(r => r.following_id);
}

/**
 * Get list of user IDs that follow the current user
 *
 * @param userId - Current user ID
 * @returns Array of user IDs who are followers
 */
export async function getFollowers(userId: string): Promise<string[]> {
  const result = await executeQuery<{ follower_id: string }>(
    'SELECT follower_id FROM follows WHERE following_id = $1',
    [userId],
    'getFollowers'
  );

  return result.map(r => r.follower_id);
}

/**
 * Get count of users that the current user is following
 *
 * @param userId - Current user ID
 * @returns Count of following
 */
export async function getFollowingCount(userId: string): Promise<number> {
  const result = await executeQuery<{ count: string }>(
    'SELECT COUNT(*) as count FROM follows WHERE follower_id = $1',
    [userId],
    'getFollowingCount'
  );

  return parseInt(result[0]?.count || '0', 10);
}

/**
 * Get count of users that follow the current user
 *
 * @param userId - Current user ID
 * @returns Count of followers
 */
export async function getFollowersCount(userId: string): Promise<number> {
  const result = await executeQuery<{ count: string }>(
    'SELECT COUNT(*) as count FROM follows WHERE following_id = $1',
    [userId],
    'getFollowersCount'
  );

  return parseInt(result[0]?.count || '0', 10);
}

/**
 * Follow a user
 *
 * @param followerId - User who is following
 * @param followingId - User being followed
 * @returns void
 */
export async function followUser(followerId: string, followingId: string): Promise<void> {
  await executeQuery(
    `INSERT INTO follows (follower_id, following_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (follower_id, following_id) DO NOTHING`,
    [followerId, followingId],
    'followUser'
  );
}

/**
 * Unfollow a user
 *
 * @param followerId - User who was following
 * @param followingId - User being unfollowed
 * @returns void
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  await executeQuery(
    'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, followingId],
    'unfollowUser'
  );
}

/**
 * Check if a user is following another user
 *
 * @param followerId - Potential follower
 * @param followingId - Potential being followed
 * @returns True if following relationship exists
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const result = await executeQuery<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2) as exists',
    [followerId, followingId],
    'isFollowing'
  );

  return result[0]?.exists || false;
}

/**
 * Get sub-profile data for a specific role
 *
 * @param userId - User ID
 * @param role - Account type/role
 * @returns Sub-profile data or null
 */
export async function getSubProfile(userId: string, role: string): Promise<Record<string, any> | null> {
  const result = await executeQuery(
    `SELECT
      talent_info,
      engineer_info,
      producer_info,
      studio_info,
      education_info,
      label_info
     FROM profiles
     WHERE user_id = $1`,
    [userId],
    'getSubProfile'
  );

  if (result.length === 0) return null;

  const profile = result[0];

  // Return the appropriate sub-profile based on role
  switch (role) {
    case 'Talent':
      return profile.talent_info;
    case 'Engineer':
      return profile.engineer_info;
    case 'Producer':
      return profile.producer_info;
    case 'Studio':
      return profile.studio_info;
    case 'EDUStaff':
    case 'EDUAdmin':
    case 'Student':
    case 'Intern':
      return profile.education_info;
    case 'Label':
      return profile.label_info;
    default:
      return null;
  }
}

/**
 * Upsert sub-profile data for a specific role
 *
 * @param userId - User ID
 * @param role - Account type/role
 * @param data - Profile data to upsert
 * @returns Upserted sub-profile data
 */
export async function upsertSubProfile(
  userId: string,
  role: string,
  data: Record<string, any>
): Promise<Record<string, any>> {
  // Map role to the appropriate column
  const columnMap: Record<string, string> = {
    'Talent': 'talent_info',
    'Engineer': 'engineer_info',
    'Producer': 'producer_info',
    'Studio': 'studio_info',
    'EDUStaff': 'education_info',
    'EDUAdmin': 'education_info',
    'Student': 'education_info',
    'Intern': 'education_info',
    'Label': 'label_info',
    'Agent': 'label_info',
    'Technician': 'technician_info',
  };

  const column = columnMap[role];
  if (!column) {
    throw new Error(`Invalid role for sub-profile: ${role}`);
  }

  const result = await executeQuery(
    `UPDATE profiles
     SET ${column} = $2::jsonb,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING ${column}`,
    [userId, JSON.stringify(data)],
    'upsertSubProfile'
  );

  if (result.length === 0) {
    // If no profile exists, create one
    const insertResult = await executeQuery(
      `INSERT INTO profiles (user_id, ${column})
       VALUES ($1, $2::jsonb)
       RETURNING ${column}`,
      [userId, JSON.stringify(data)],
      'upsertSubProfile-insert'
    );
    return insertResult[0][column];
  }

  return result[0][column];
}

/**
 * Get all sub-profiles for a user
 *
 * @param userId - User ID
 * @returns Array of sub-profiles with account_type field
 */
export async function getSubProfiles(userId: string): Promise<Array<{ account_type: string; [key: string]: any }>> {
  const result = await executeQuery(
    `SELECT
       sp.account_type,
       sp.profile_data,
       sp.is_active
     FROM sub_profiles sp
     WHERE sp.user_id = $1 AND sp.is_active = true`,
    [userId],
    'getSubProfiles'
  );

  if (result.length === 0) return [];

  // Map sub_profiles to expected format
  return result.map((sp: any) => ({
    ...sp.profile_data,
    account_type: sp.account_type
  }));
}

// =====================================================
// SAVED POSTS QUERIES
// =====================================================

/**
 * Get saved posts for a user
 *
 * @param userId - User ID
 * @param limit - Maximum number of posts to return
 * @returns Array of saved posts
 */
export async function getSavedPosts(userId: string, limit: number = 50): Promise<any[]> {
  const result = await executeQuery(
    `SELECT * FROM saved_posts
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit],
    'getSavedPosts'
  );

  return result.map(p => ({
    id: p.id,
    postId: p.post_id,
    userId: p.user_id,
    author_id: p.author_id,
    author_name: p.author_name,
    preview: p.preview,
    has_media: p.has_media,
    savedAt: p.created_at
  }));
}

/**
 * Save a post for a user
 *
 * @param userId - User ID
 * @param postId - Post ID to save
 * @param postData - Post metadata
 * @returns void
 */
export async function savePost(
  userId: string,
  postId: string,
  postData: {
    author_id?: string;
    author_name?: string;
    preview?: string;
    has_media?: boolean;
  }
): Promise<void> {
  await executeQuery(
    `INSERT INTO saved_posts (user_id, post_id, author_id, author_name, preview, has_media, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id, post_id) DO NOTHING`,
    [
      userId,
      postId,
      postData.author_id || null,
      postData.author_name || null,
      postData.preview || null,
      postData.has_media || false
    ],
    'savePost'
  );
}

/**
 * Unsave a post for a user
 *
 * @param userId - User ID
 * @param postId - Post ID to unsave
 * @returns void
 */
export async function unsavePost(userId: string, postId: string): Promise<void> {
  await executeQuery(
    'DELETE FROM saved_posts WHERE user_id = $1 AND post_id = $2',
    [userId, postId],
    'unsavePost'
  );
}

/**
 * Check if a post is saved by a user
 *
 * @param userId - User ID
 * @param postId - Post ID to check
 * @returns True if post is saved
 */
export async function checkIsSaved(userId: string, postId: string): Promise<boolean> {
  const result = await executeQuery<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM saved_posts WHERE user_id = $1 AND post_id = $2) as exists',
    [userId, postId],
    'checkIsSaved'
  );

  return result[0]?.exists || false;
}

/**
 * Update post save count manually
 *
 * @param postId - Post ID to update
 * @param increment - Amount to increment (positive or negative)
 * @returns void
 */
export async function updatePostSaveCount(postId: string, increment: number): Promise<void> {
  await executeQuery(
    'UPDATE posts SET save_count = GREATEST(0, save_count + $1) WHERE id = $2',
    [increment, postId],
    'updatePostSaveCount'
  );
}

// =====================================================
// COMMENT SYSTEM QUERIES
// =====================================================

/**
 * Comment data interface
 */
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  [key: string]: any;
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string): Promise<Comment[]> {
  const result = await executeQuery<Comment>(
    `SELECT
      c.id,
      c.post_id,
      c.user_id,
      c.content,
      c.display_name,
      c.author_photo,
      c.media,
      c.parent_comment_id,
      c.reaction_count,
      c.created_at,
      c.updated_at
     FROM comments c
     WHERE c.post_id = $1
       AND c.deleted_at IS NULL
     ORDER BY c.created_at ASC`,
    [postId],
    'getComments'
  );

  return result || [];
}

/**
 * Create a new comment
 */
export async function createComment(commentData: {
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
}): Promise<Comment> {
  const { post_id, user_id, content, parent_comment_id } = commentData;

  // Get user display info
  const user = await getUser(user_id);

  // Prepare display name and photo
  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email || 'User';
  const authorPhoto = user?.profile_photo_url || null;

  const result = await executeQuery<Comment>(
    `INSERT INTO comments (
      post_id,
      user_id,
      content,
      parent_comment_id,
      display_name,
      author_photo
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      post_id,
      user_id,
      content,
      parent_comment_id || null,
      displayName,
      authorPhoto
    ],
    'createComment'
  );

  const newComment = result[0];

  // Sync to Convex for real-time updates (non-blocking)
  import('../utils/convexSync').then(({ syncCommentToConvex }) => {
    syncCommentToConvex({
      commentId: newComment.id,
      postId: post_id,
      userId: user_id,
      content,
      displayName,
      authorPhoto,
      parentId: parent_comment_id || undefined,
      createdAt: new Date(newComment.created_at || Date.now()).getTime(),
    }).catch(err => console.warn('Failed to sync comment to Convex:', err));
  }).catch(() => {
    // Module not available or error importing
  });

  // Create notification for post author (if not own post)
  try {
    const post = await getPost(post_id);
    if (post && post.user_id !== user_id) {
      await createNotification({
        user_id: post.user_id,
        type: 'comment',
        title: 'New comment',
        message: `${displayName} commented on your post`,
        reference_type: 'post',
        reference_id: post_id,
        actor_id: user_id,
        actor_name: displayName,
        actor_photo: authorPhoto
      });
    }
  } catch (notificationError) {
    // Don't fail comment if notification fails
    console.warn('Failed to create comment notification:', notificationError);
  }

  return newComment;
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(commentId: string): Promise<void> {
  await executeQuery(
    'UPDATE comments SET deleted_at = NOW() WHERE id = $1',
    [commentId],
    'deleteComment'
  );

  // Remove from Convex (non-blocking)
  import('../utils/convexSync').then(({ removeCommentFromConvex }) => {
    removeCommentFromConvex(commentId).catch(err =>
      console.warn('Failed to remove comment from Convex:', err)
    );
  }).catch(() => {});
}

/**
 * Update post comment count
 * Note: Database triggers handle this automatically when comments are created/deleted
 * This function is kept for manual updates if needed
 */
export async function updatePostCommentCount(postId: string, delta: number): Promise<void> {
  await executeQuery(
    'UPDATE posts SET comment_count = GREATEST(0, comment_count + $1) WHERE id = $2',
    [delta, postId],
    'updatePostCommentCount'
  );
}

// =====================================================
// REACTION MANAGEMENT QUERIES
// =====================================================

/**
 * Reaction record from database
 */
export interface Reaction {
  id: string;
  user_id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  emoji: string;
  created_at?: string;
}

/**
 * Reaction count summary for display
 */
export interface ReactionSummary {
  emoji: string;
  count: number;
  users: string[]; // Array of user IDs who reacted with this emoji
}

/**
 * Get all reactions for a post with counts grouped by emoji
 */
export async function getPostReactions(postId: string): Promise<ReactionSummary[]> {
  const result = await executeQuery<ReactionSummary>(
    `SELECT
      r.emoji,
      COUNT(*) as count,
      ARRAY_AGG(r.user_id) as users
    FROM reactions r
    WHERE r.target_type = 'post' AND r.target_id = $1
    GROUP BY r.emoji
    ORDER BY count DESC`,
    [postId],
    'getPostReactions'
  );
  return result || [];
}

/**
 * Get a specific user's reaction on a target
 */
export async function getUserReaction(
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string
): Promise<Reaction | null> {
  const result = await executeQuery<Reaction>(
    `SELECT * FROM reactions
    WHERE user_id = $1 AND target_type = $2 AND target_id = $3
    LIMIT 1`,
    [userId, targetType, targetId],
    'getUserReaction'
  );
  return result && result.length > 0 ? result[0] : null;
}

/**
 * Get reaction count for a post
 */
export async function getPostReactionCount(postId: string): Promise<number> {
  const result = await executeQuery<{ count: string }>(
    `SELECT COUNT(*) as count FROM reactions
    WHERE target_type = 'post' AND target_id = $1`,
    [postId],
    'getPostReactionCount'
  );
  return result && result.length > 0 ? parseInt(result[0].count) : 0;
}

/**
 * Get reaction count for a comment
 */
export async function getCommentReactionCount(commentId: string): Promise<number> {
  const result = await executeQuery<{ count: string }>(
    `SELECT COUNT(*) as count FROM reactions
    WHERE target_type = 'comment' AND target_id = $1`,
    [commentId],
    'getCommentReactionCount'
  );
  return result && result.length > 0 ? parseInt(result[0].count) : 0;
}

/**
 * Add a reaction to a post or comment
 * If user already reacted with same emoji, does nothing (UNIQUE constraint)
 * If user reacted with different emoji, removes old reaction and adds new one
 */
export async function addReaction(
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  emoji: string
): Promise<Reaction> {
  // First, check if user has any existing reaction on this target
  const existingReaction = await getUserReaction(userId, targetType, targetId);

  if (existingReaction && existingReaction.emoji === emoji) {
    // Same reaction, just return existing
    return existingReaction;
  }

  // If different reaction exists, remove it first
  if (existingReaction && existingReaction.emoji !== emoji) {
    await removeReaction(userId, targetType, targetId);
  }

  // Add new reaction
  const result = await executeQuery<Reaction>(
    `INSERT INTO reactions (user_id, target_type, target_id, emoji)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, target_type, target_id, emoji) DO NOTHING
    RETURNING *`,
    [userId, targetType, targetId, emoji],
    'addReaction'
  );

  const newReaction = result[0];

  // Update the reaction count on the target table
  if (targetType === 'post') {
    await executeQuery(
      `UPDATE posts
      SET reaction_count = GREATEST(0, COALESCE(reaction_count, 0) + 1),
          updated_at = NOW()
      WHERE id = $1`,
      [targetId],
      'addReaction_updatePostCount'
    );
  } else if (targetType === 'comment') {
    await executeQuery(
      `UPDATE comments
      SET reaction_count = GREATEST(0, COALESCE(reaction_count, 0) + 1)
      WHERE id = $1`,
      [targetId],
      'addReaction_updateCommentCount'
    );
  }

  // Sync to Convex for real-time updates (non-blocking)
  import('../utils/convexSync').then(({ syncReactionToConvex }) => {
    syncReactionToConvex({
      targetId,
      targetType,
      userId,
      emoji,
      timestamp: Date.now(),
    }).catch(err => console.warn('Failed to sync reaction to Convex:', err));
  }).catch(() => {});

  // Create notification for post author (only for post reactions, not comment reactions)
  if (targetType === 'post') {
    const post = await getPost(targetId);
    const reactingUser = await getUser(userId);

    if (post && post.user_id !== userId) {
      const displayName = reactingUser?.first_name && reactingUser?.last_name
        ? `${reactingUser.first_name} ${reactingUser.last_name}`
        : reactingUser?.username || reactingUser?.email || 'Someone';

      await createNotification({
        user_id: post.user_id,
        type: 'reaction',
        title: 'New reaction',
        message: `${displayName} reacted ${emoji} to your post`,
        reference_type: 'post',
        reference_id: targetId,
        actor_id: userId,
        actor_name: displayName,
        actor_photo: reactingUser?.profile_photo_url || null
      });
    }
  }

  return newReaction;
}

/**
 * Remove a user's reaction from a post or comment
 */
export async function removeReaction(
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  emoji?: string
): Promise<void> {
  // If emoji specified, remove only that reaction
  // Otherwise, remove all reactions from this user on this target
  let query = 'DELETE FROM reactions WHERE user_id = $1 AND target_type = $2 AND target_id = $3';
  const params: (string | number)[] = [userId, targetType, targetId];

  if (emoji) {
    query += ' AND emoji = $4';
    params.push(emoji);
  }

  await executeQuery(query, params, 'removeReaction');

  // Remove from Convex (non-blocking)
  import('../utils/convexSync').then(({ removeReactionFromConvex }) => {
    removeReactionFromConvex(targetId, targetType, userId).catch(err =>
      console.warn('Failed to remove reaction from Convex:', err)
    );
  }).catch(() => {});

  // Update the reaction count on the target table
  if (targetType === 'post') {
    await executeQuery(
      `UPDATE posts SET reaction_count = GREATEST(0,
        (SELECT COUNT(*) FROM reactions WHERE target_type = 'post' AND target_id = posts.id)
      ), updated_at = NOW()
      WHERE id = $1`,
      [targetId],
      'removeReaction_updatePostCount'
    );
  } else if (targetType === 'comment') {
    await executeQuery(
      `UPDATE comments SET reaction_count = GREATEST(0,
        (SELECT COUNT(*) FROM reactions WHERE target_type = 'comment' AND target_id = comments.id)
      ) WHERE id = $1`,
      [targetId],
      'removeReaction_updateCommentCount'
    );
  }
}

/**
 * Toggle a reaction (add if not exists, remove if exists)
 */
export async function toggleReaction(
  userId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  emoji: string
): Promise<{ added: boolean; reaction: Reaction | null }> {
  const existingReaction = await getUserReaction(userId, targetType, targetId);

  if (existingReaction && existingReaction.emoji === emoji) {
    // Remove reaction
    await removeReaction(userId, targetType, targetId, emoji);
    return { added: false, reaction: null };
  } else {
    // Add new reaction (will replace if different emoji)
    const newReaction = await addReaction(userId, targetType, targetId, emoji);
    return { added: true, reaction: newReaction };
  }
}

// =====================================================
// REPOST MANAGEMENT QUERIES
// =====================================================

/**
 * Repost record with original post data
 */
export interface Repost {
  id: string;
  user_id: string;
  parent_post_id: string;
  content?: string;
  display_name?: string;
  author_photo?: string;
  created_at?: string;
  original_post?: Post; // The original post being reposted
}

/**
 * Create a repost of an existing post
 */
export async function repostPost(
  originalPostId: string,
  userId: string,
  comment?: string
): Promise<Post> {
  // Get the original post
  const originalPost = await getPost(originalPostId);
  if (!originalPost) {
    throw new Error('Original post not found');
  }

  // Check if user already reposted this post
  const hasReposted = await executeQuery<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM posts
      WHERE user_id = $1 AND parent_post_id = $2 AND deleted_at IS NULL
    ) as exists`,
    [userId, originalPostId],
    'hasReposted'
  );

  if (hasReposted && hasReposted[0]?.exists) {
    throw new Error('You have already reposted this post');
  }

  // Get user info
  const user = await getUser(userId);
  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || user?.email || 'User';
  const authorPhoto = user?.profile_photo_url || null;

  // Create the repost
  const result = await executeQuery<Post>(
    `INSERT INTO posts (
      user_id, parent_post_id, content, display_name, author_photo,
      hashtags, mentions, visibility
    )
    SELECT $1, $2, $3, $4, $5, hashtags, mentions, 'public'
    FROM posts WHERE id = $2
    RETURNING *`,
    [userId, originalPostId, comment || null, displayName, authorPhoto],
    'repostPost'
  );

  const newPost = result[0];

  // Create notification for original post author
  if (originalPost.user_id !== userId) {
    await createNotification({
      user_id: originalPost.user_id,
      type: 'repost',
      title: 'New repost',
      message: `${displayName} reposted your post`,
      reference_type: 'post',
      reference_id: originalPostId,
      actor_id: userId,
      actor_name: displayName,
      actor_photo: authorPhoto
    });
  }

  return newPost;
}

/**
 * Get all reposts of a specific post
 */
export async function getReposts(
  postId: string,
  limit: number = 50
): Promise<Repost[]> {
  const result = await executeQuery<Repost>(
    `SELECT
      p.id,
      p.user_id,
      p.parent_post_id,
      p.content,
      p.display_name,
      p.author_photo,
      p.created_at
    FROM posts p
    WHERE p.parent_post_id = $1 AND p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT $2`,
    [postId, limit],
    'getReposts'
  );
  return result || [];
}

/**
 * Check if a user has reposted a specific post
 */
export async function hasUserReposted(
  userId: string,
  postId: string
): Promise<boolean> {
  const result = await executeQuery<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM posts
      WHERE user_id = $1 AND parent_post_id = $2 AND deleted_at IS NULL
    ) as exists`,
    [userId, postId],
    'hasUserReposted'
  );
  return result && result.length > 0 ? result[0].exists : false;
}

/**
 * Get repost count for a post
 */
export async function getRepostCount(postId: string): Promise<number> {
  const result = await executeQuery<{ count: string }>(
    `SELECT COUNT(*) as count FROM posts
    WHERE parent_post_id = $1 AND deleted_at IS NULL`,
    [postId],
    'getRepostCount'
  );
  return result && result.length > 0 ? parseInt(result[0].count) : 0;
}

/**
 * Undo a repost (delete the repost post)
 */
export async function undoRepost(
  userId: string,
  originalPostId: string
): Promise<void> {
  await executeQuery(
    `UPDATE posts SET deleted_at = NOW()
    WHERE user_id = $1 AND parent_post_id = $2 AND deleted_at IS NULL`,
    [userId, originalPostId],
    'undoRepost'
  );
}

/**
 * Get posts that include reposts in the feed
 * (returns both original posts and reposts with their original content)
 */
export async function getPostsWithReposts(params: {
  userId?: string;
  limit?: number;
  offset?: number;
  includeReposts?: boolean;
}): Promise<Post[]> {
  const { userId, limit = 50, offset = 0, includeReposts = true } = params;

  if (!includeReposts) {
    // Just get regular posts
    return getPosts({ userId, limit, offset });
  }

  // Get posts and reposts
  const result = await executeQuery<Post>(
    `SELECT DISTINCT
      p.id,
      p.user_id,
      p.content,
      p.display_name,
      p.author_photo,
      p.media,
      p.hashtags,
      p.mentions,
      p.location,
      p.visibility,
      p.comment_count,
      p.reaction_count,
      p.save_count,
      p.view_count,
      p.repost_count,
      p.is_pinned,
      p.parent_post_id,
      p.created_at,
      p.updated_at,
      -- For reposts, include original post's media
      COALESCE(
        p.media,
        (SELECT op.media FROM posts op WHERE op.id = p.parent_post_id LIMIT 1),
        '[]'::jsonb
      ) as media_with_original
    FROM posts p
    WHERE p.deleted_at IS NULL
    AND (p.user_id = $1 OR p.parent_post_id IS NULL)
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
    'getPostsWithReposts'
  );
  return result || [];
}

// =====================================================
// SEARCH QUERIES
// =====================================================

/**
 * Search posts by content, hashtags, and mentions
 * Uses PostgreSQL full-text search
 */
export async function searchPosts(params: {
  query?: string;
  hashtags?: string[];
  mentions?: string[];
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<Post[]> {
  const { query, hashtags, mentions, userId, limit = 50, offset = 0 } = params;

  let whereClauses: string[] = ['p.deleted_at IS NULL'];
  let queryParams: any[] = [];

  // Text search using full-text search
  if (query && query.trim()) {
    whereClauses.push(`
      to_tsvector('english', COALESCE(p.content, '')) @@ plainto_tsquery('english', $${queryParams.length + 1})
    `);
    queryParams.push(query.trim());
  }

  // Hashtag filter
  if (hashtags && hashtags.length > 0) {
    whereClauses.push(`p.hashtags && $${queryParams.length + 1}`);
    queryParams.push(hashtags);
  }

  // Mention filter
  if (mentions && mentions.length > 0) {
    whereClauses.push(`p.mentions && $${queryParams.length + 1}`);
    queryParams.push(mentions);
  }

  // User filter (only show public posts from other users, all posts from current user)
  if (userId) {
    whereClauses.push(`(p.user_id = $${queryParams.length + 1} OR p.visibility = 'public')`);
    queryParams.push(userId);
  } else {
    whereClauses.push(`p.visibility = 'public'`);
  }

  const whereClause = whereClauses.join(' AND ');

  const result = await executeQuery<Post>(
    `SELECT
      p.id,
      p.user_id,
      p.content,
      p.display_name,
      p.author_photo,
      p.media,
      p.hashtags,
      p.mentions,
      p.location,
      p.visibility,
      p.comment_count,
      p.reaction_count,
      p.save_count,
      p.view_count,
      p.repost_count,
      p.is_pinned,
      p.parent_post_id,
      p.created_at,
      p.updated_at,
      ts_rank(to_tsvector('english', COALESCE(p.content, '')), plainto_tsquery('english', $1)) as search_rank
    FROM posts p
    WHERE ${whereClause}
    ORDER BY
      search_rank DESC,
      p.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
    [...queryParams, limit, offset],
    'searchPosts'
  );

  return result || [];
}

/**
 * Search users by name, username, or email
 */
export async function searchUsers(params: {
  query?: string;
  accountTypes?: AccountType[];
  limit?: number;
  offset?: number;
}): Promise<ClerkUser[]> {
  const { query, accountTypes, limit = 50, offset = 0 } = params;

  let whereClauses: string[] = [];
  let queryParams: any[] = [];

  // Text search using full-text search
  if (query && query.trim()) {
    whereClauses.push(`
      to_tsvector('english',
        COALESCE(first_name, '') || ' ' ||
        COALESCE(last_name, '') || ' ' ||
        COALESCE(username, '') || ' ' ||
        COALESCE(email, '')
      ) @@ plainto_tsquery('english', $1)
    `);
    queryParams.push(query.trim());
  }

  // Account type filter
  if (accountTypes && accountTypes.length > 0) {
    whereClauses.push(`account_types && $${queryParams.length + 1}`);
    queryParams.push(accountTypes);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const result = await executeQuery<ClerkUser>(
    `SELECT
      id,
      email,
      first_name,
      last_name,
      username,
      profile_photo_url,
      account_types,
      active_role,
      bio,
      created_at,
      ts_rank(
        to_tsvector('english',
          COALESCE(first_name, '') || ' ' ||
          COALESCE(last_name, '') || ' ' ||
          COALESCE(username, '') || ' ' ||
          COALESCE(email, '')
        ),
        plainto_tsquery('english', $1)
      ) as search_rank
    FROM clerk_users
    ${whereClause}
    ORDER BY search_rank DESC, created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
    [...queryParams, limit, offset],
    'searchUsers'
  );

  return result || [];
}

/**
 * Get trending hashtags (most used in recent posts)
 */
export async function getTrendingHashtags(
  limit: number = 20,
  daysAgo: number = 7
): Promise<{ hashtag: string; count: number }[]> {
  const result = await executeQuery<{ hashtag: string; count: number }>(
    `SELECT
      unnest(hashtags) as hashtag,
      COUNT(*) as count
    FROM posts
    WHERE hashtags != '{}'
      AND created_at >= NOW() - ($1 || ' days')::INTERVAL
      AND deleted_at IS NULL
    GROUP BY hashtag
    ORDER BY count DESC
    LIMIT $2`,
    [daysAgo, limit],
    'getTrendingHashtags'
  );

  return result || [];
}

/**
 * Get posts by specific hashtag
 */
export async function getPostsByHashtag(
  hashtag: string,
  limit: number = 50,
  offset: number = 0,
  userId?: string
): Promise<Post[]> {
  let whereClause = 'p.deleted_at IS NULL AND $1 = ANY(p.hashtags)';
  let queryParams: any[] = [hashtag];

  if (userId) {
    whereClause += ` AND (p.user_id = $2 OR p.visibility = 'public')`;
    queryParams.push(userId);
  } else {
    whereClause += ` AND p.visibility = 'public'`;
  }

  const result = await executeQuery<Post>(
    `SELECT
      p.id,
      p.user_id,
      p.content,
      p.display_name,
      p.author_photo,
      p.media,
      p.hashtags,
      p.mentions,
      p.location,
      p.visibility,
      p.comment_count,
      p.reaction_count,
      p.save_count,
      p.view_count,
      p.repost_count,
      p.is_pinned,
      p.parent_post_id,
      p.created_at,
      p.updated_at
    FROM posts p
    WHERE ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
    [...queryParams, limit, offset],
    'getPostsByHashtag'
  );

  return result || [];
}

/**
 * Get suggested users to follow (based on account types and recent activity)
 */
export async function getSuggestedUsers(
  userId: string,
  accountTypes?: AccountType[],
  limit: number = 10
): Promise<ClerkUser[]> {
  let whereClause = `cu.id != $1`;
  let queryParams: any[] = [userId];

  if (accountTypes && accountTypes.length > 0) {
    whereClause += ` AND cu.account_types && $${queryParams.length + 1}`;
    queryParams.push(accountTypes);
  }

  const result = await executeQuery<ClerkUser>(
    `SELECT DISTINCT
      cu.id,
      cu.email,
      cu.first_name,
      cu.last_name,
      cu.username,
      cu.profile_photo_url,
      cu.account_types,
      cu.active_role,
      cu.bio,
      COUNT(p.id) as post_count
    FROM clerk_users cu
    LEFT JOIN posts p ON p.user_id = cu.id
      AND p.created_at >= NOW() - INTERVAL '30 days'
      AND p.deleted_at IS NULL
    WHERE ${whereClause}
    GROUP BY cu.id
    ORDER BY post_count DESC, cu.created_at DESC
    LIMIT $${queryParams.length + 1}`,
    [...queryParams, limit],
    'getSuggestedUsers'
  );

  return result || [];
}

// =====================================================
// CONTENT MODERATION QUERIES
// =====================================================

/**
 * Content report interface
 */
export interface ContentReport {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'user';
  target_id: string;
  reason: 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'explicit_content' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Report a post, comment, or user
 */
export async function reportContent(params: {
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: 'spam' | 'harassment' | 'hate_speech' | 'misinformation' | 'explicit_content' | 'other';
  description?: string;
}): Promise<ContentReport> {
  const { reporterId, targetType, targetId, reason, description } = params;

  const result = await executeQuery<ContentReport>(
    `INSERT INTO content_reports (
      reporter_id, target_type, target_id, reason, description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [reporterId, targetType, targetId, reason, description || null],
    'reportContent'
  );

  const report = result[0];

  // Create notification for moderators (users with admin/moderator roles)
  // This is a simplified approach - in production you'd have a proper moderator role system
  await executeQuery(
    `INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id)
    SELECT cu.id, 'system', 'New content report', $1
    FROM clerk_users cu
    WHERE cu.account_types @> ARRAY['GAdmin'::TEXT]
       OR cu.account_types @> ARRAY['EDUAdmin'::TEXT]
    LIMIT 10`,
    [`New ${reason} report submitted for ${targetType}`],
    'notifyModerators'
  );

  return report;
}

/**
 * Get pending reports for moderation queue
 */
export async function getPendingReports(limit: number = 50): Promise<ContentReport[]> {
  const result = await executeQuery<ContentReport>(
    `SELECT
      cr.*,
      reporter.first_name as reporter_first_name,
      reporter.last_name as reporter_last_name,
      reporter.username as reporter_username,
      reviewer.first_name as reviewer_first_name,
      reviewer.last_name as reviewer_last_name
    FROM content_reports cr
    LEFT JOIN clerk_users reporter ON reporter.id = cr.reporter_id
    LEFT JOIN clerk_users reviewer ON reviewer.id = cr.reviewed_by
    WHERE cr.status = 'pending'
    ORDER BY cr.created_at ASC
    LIMIT $1`,
    [limit],
    'getPendingReports'
  );
  return result || [];
}

/**
 * Get reports by user (reports I've submitted)
 */
export async function getUserReports(userId: string, limit: number = 50): Promise<ContentReport[]> {
  const result = await executeQuery<ContentReport>(
    `SELECT * FROM content_reports
    WHERE reporter_id = $1
    ORDER BY created_at DESC
    LIMIT $2`,
    [userId, limit],
    'getUserReports'
  );
  return result || [];
}

/**
 * Get reports for a specific target
 */
export async function getTargetReports(
  targetType: 'post' | 'comment' | 'user',
  targetId: string
): Promise<ContentReport[]> {
  const result = await executeQuery<ContentReport>(
    `SELECT * FROM content_reports
    WHERE target_type = $1 AND target_id = $2
    ORDER BY created_at DESC`,
    [targetType, targetId],
    'getTargetReports'
  );
  return result || [];
}

/**
 * Update report status (for moderators)
 */
export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'resolved' | 'dismissed',
  reviewedBy: string,
  resolutionNotes?: string
): Promise<ContentReport> {
  const result = await executeQuery<ContentReport>(
    `UPDATE content_reports
    SET status = $1, reviewed_by = $2, reviewed_at = NOW(), resolution_notes = $3, updated_at = NOW()
    WHERE id = $4
    RETURNING *`,
    [status, reviewedBy, resolutionNotes || null, reportId],
    'updateReportStatus'
  );
  return result && result.length > 0 ? result[0] : null as any;
}

/**
 * Check if user has reported a target
 */
export async function hasUserReported(
  userId: string,
  targetType: 'post' | 'comment' | 'user',
  targetId: string
): Promise<boolean> {
  const result = await executeQuery<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM content_reports
      WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3
    ) as exists`,
    [userId, targetType, targetId],
    'hasUserReported'
  );
  return result && result.length > 0 ? result[0].exists : false;
}

/**
 * Get moderation stats for admin dashboard
 */
export async function getModerationStats(): Promise<{
  pending: number;
  reviewed: number;
  resolved: number;
  dismissed: number;
  total: number;
}> {
  const result = await executeQuery<{
    pending: string;
    reviewed: string;
    resolved: string;
    dismissed: string;
    total: string;
  }>(
    `SELECT
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
      COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
      COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed,
      COUNT(*) as total
    FROM content_reports`,
    [],
    'getModerationStats'
  );

  const stats = result[0];
  return {
    pending: parseInt(stats.pending),
    reviewed: parseInt(stats.reviewed),
    resolved: parseInt(stats.resolved),
    dismissed: parseInt(stats.dismissed),
    total: parseInt(stats.total)
  };
}

// =====================================================
// TECH SERVICES QUERIES
// =====================================================

/**
 * Service request interface
 */
export interface ServiceRequest {
  id: string;
  requester_id: string;
  tech_id?: string;
  title: string;
  description: string;
  service_category: string;
  equipment_name: string;
  equipment_brand?: string;
  equipment_model?: string;
  issue_description: string;
  logistics: string;
  preferred_date?: string;
  budget_cap?: number;
  status: string;
  priority: string;
  estimated_cost?: number;
  actual_cost?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  requester_photo?: string;
  [key: string]: any;
}

/**
 * Technician profile interface
 */
export interface TechnicianProfile {
  user_id: string;
  display_name?: string;
  bio?: string;
  specialties: string[];
  certifications?: string[];
  years_experience?: number;
  hourly_rate?: number;
  location?: {
    city?: string;
    state?: string;
    zip?: string;
    lat?: number;
    lng?: number;
  };
  service_radius?: number;
  availability_status: 'Available' | 'Busy' | 'Unavailable';
  rating_average?: number;
  review_count?: number;
  completed_jobs?: number;
  profile_photo?: string;
  is_verified_tech?: boolean;
  first_name?: string;
  last_name?: string;
  email?: string;
  distance?: number;
  avg_response_hours?: number;
  [key: string]: any;
}

/**
 * Tech metrics data for Business Center overview
 */
export interface TechMetricsData {
  open_requests?: number;
  active_jobs?: number;
  completed_jobs?: number;
  total_earnings?: number;
  pending_earnings?: number;
  average_rating?: number | string;
}

/**
 * Get tech metrics for Business Center overview
 *
 * @param userId - Technician user ID
 * @returns Metrics object with request counts, earnings, rating
 *
 * @example
 * const metrics = await getTechMetrics('user_12345');
 * console.log(metrics.open_requests); // 5
 * console.log(metrics.total_earnings); // 2500.00
 */
export async function getTechMetrics(userId: string): Promise<TechMetricsData> {
  const result = await executeQuery<TechMetricsData>(
    `SELECT
      COUNT(DISTINCT CASE WHEN status = 'Open' THEN id END) as open_requests,
      COUNT(DISTINCT CASE WHEN status IN ('Assigned', 'In Progress') THEN id END) as active_jobs,
      COUNT(DISTINCT CASE WHEN status = 'Completed' THEN id END) as completed_jobs,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN actual_cost ELSE 0 END), 0) as total_earnings,
      COALESCE(SUM(CASE WHEN status IN ('Assigned', 'In Progress') THEN estimated_cost ELSE 0 END), 0) as pending_earnings,
      COALESCE((SELECT AVG(r.rating)::numeric(3,2) FROM reviews r WHERE r.target_id::text = $1), 0) as average_rating
     FROM service_requests sr
     WHERE sr.tech_id::text = $1`,
    [userId],
    'getTechMetrics'
  );
  return result[0] || {};
}

/**
 * Get label metrics for Business Overview
 *
 * @param userId - Label user ID
 * @returns Array with label metrics
 */
export async function getLabelMetrics(userId: string): Promise<any[]> {
  return await executeQuery(
    `SELECT
      COUNT(DISTINCT lr.artist_id) as total_artists,
      COUNT(DISTINCT CASE WHEN r.status = 'distributed' THEN r.id END) as active_releases,
      COALESCE(SUM(ds.lifetime_earnings), 0) as total_revenue,
      COALESCE(SUM(ds.lifetime_streams), 0) as total_streams
     FROM label_roster lr
     LEFT JOIN releases r ON r.artist_id = lr.artist_id
     LEFT JOIN distribution_stats ds ON ds.release_id = r.id
     WHERE lr.label_id::text = $1`,
    [userId],
    'getLabelMetrics'
  );
}

/**
 * Get studio metrics for Business Overview
 *
 * @param userId - Studio user ID
 * @returns Array with studio metrics
 */
export async function getStudioMetrics(userId: string): Promise<any[]> {
  return await executeQuery(
    `SELECT
      COUNT(DISTINCT sr.id) as total_rooms,
      COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
      COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings
     FROM studio_rooms sr
     LEFT JOIN bookings b ON b.studio_owner_id = $1 AND (b.venue_id = sr.id OR b.venue_id IS NULL)
     WHERE sr.studio_id = $1`,
    [userId],
    'getStudioMetrics'
  );
}

/**
 * Get distribution metrics for Business Overview
 *
 * @param userId - User ID
 * @returns Array with distribution metrics
 */
export async function getDistributionMetrics(userId: string): Promise<any[]> {
  return await executeQuery(
    `SELECT
      COUNT(DISTINCT r.id) as total_releases,
      COUNT(DISTINCT CASE WHEN r.status = 'distributed' THEN r.id END) as live_releases,
      COUNT(DISTINCT CASE WHEN r.status = 'draft' THEN r.id END) as draft_releases
     FROM releases r
     WHERE r.artist_id::text = $1 OR r.label_id::text = $1`,
    [userId],
    'getDistributionMetrics'
  );
}

/**
 * Get service requests for a technician
 *
 * @param userId - Technician user ID
 * @param options - Query options (status, limit, offset)
 * @returns Array of service requests
 */
export async function getTechServiceRequests(
  userId: string,
  options: { status?: string; limit?: number; offset?: number } = {}
): Promise<ServiceRequest[]> {
  const { status, limit = 50, offset = 0 } = options;

  let sql = `SELECT sr.*,
    cu.first_name || ' ' || cu.last_name as requester_name,
    cu.profile_photo_url as requester_photo
    FROM service_requests sr
    JOIN clerk_users cu ON cu.id = sr.requester_id::text
    WHERE sr.tech_id::text = $1`;
  const params: any[] = [userId];
  let paramIndex = 2;

  if (status) {
    sql += ` AND sr.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY sr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return await executeQuery<ServiceRequest>(sql, params, 'getTechServiceRequests');
}

/**
 * Get all open service requests for job board
 *
 * @param options - Query options (category, limit, offset)
 * @returns Array of open service requests
 */
export async function getOpenServiceRequests(
  options: { category?: string; limit?: number; offset?: number } = {}
): Promise<ServiceRequest[]> {
  const { category, limit = 50, offset = 0 } = options;

  let sql = `SELECT sr.*,
    cu.first_name || ' ' || cu.last_name as requester_name,
    cu.profile_photo_url as requester_photo,
    pp.location->>'city' as city,
    pp.location->>'state' as state
    FROM service_requests sr
    JOIN clerk_users cu ON cu.id = sr.requester_id::text
    LEFT JOIN tech_public_profiles pp ON pp.user_id = sr.requester_id::text
    WHERE sr.status = 'Open'`;
  const params: any[] = [];
  let paramIndex = 1;

  if (category) {
    sql += ` AND sr.service_category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  sql += ` ORDER BY sr.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return await executeQuery<ServiceRequest>(sql, params, 'getOpenServiceRequests');
}

/**
 * Create a new service request
 *
 * @param requestData - Service request data
 * @returns Created service request
 */
export async function createServiceRequest(
  requestData: Partial<ServiceRequest>
): Promise<ServiceRequest> {
  const {
    requester_id,
    title,
    description,
    service_category,
    equipment_name,
    equipment_brand,
    equipment_model,
    issue_description,
    logistics = 'Drop-off',
    preferred_date,
    budget_cap,
    priority = 'Normal',
  } = requestData;

  if (!requester_id || !title || !service_category || !equipment_name) {
    throw new Error('Missing required fields for service request');
  }

  const result = await executeQuery<ServiceRequest>(
    `INSERT INTO service_requests (
      requester_id, title, description, service_category, equipment_name,
      equipment_brand, equipment_model, issue_description, logistics,
      preferred_date, budget_cap, priority, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Open')
    RETURNING *`,
    [
      requester_id, title, description, service_category, equipment_name,
      equipment_brand, equipment_model, issue_description, logistics,
      preferred_date, budget_cap, priority
    ],
    'createServiceRequest'
  );

  return result[0];
}

/**
 * Update service request status
 *
 * @param requestId - Service request ID
 * @param status - New status
 * @param techId - Assigned technician ID (optional)
 * @returns Updated service request
 */
export async function updateServiceRequestStatus(
  requestId: string,
  status: string,
  techId?: string
): Promise<ServiceRequest> {
  const result = await executeQuery<ServiceRequest>(
    `UPDATE service_requests
     SET status = $1, tech_id = COALESCE($2, tech_id), updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [status, techId || null, requestId],
    'updateServiceRequestStatus'
  );

  if (result.length === 0) {
    throw new Error(`Service request ${requestId} not found`);
  }

  return result[0];
}

/**
 * Search technicians by filters
 *
 * @param filters - Search filters (specialty, location, availability, rating, rate, response time)
 * @returns Array of technician profiles
 */
export async function searchTechnicians(
  filters: {
    specialty?: string;
    location?: { lat: number; lng: number; radius: number };
    availability?: string;
    minRating?: number;
    maxRate?: number;
    maxResponseTime?: number;
    limit?: number;
    offset?: number;
  } = {}
): Promise<TechnicianProfile[]> {
  const {
    specialty,
    location,
    availability,
    minRating,
    maxRate,
    maxResponseTime,
    limit = 50,
    offset = 0
  } = filters;

  // Build base query with CTE for response times
  const withClause = `WITH tech_response_times AS (
    SELECT tech_id, AVG(EXTRACT(EPOCH FROM (assigned_at - created_at)) / 3600) as avg_hours
    FROM service_requests
    WHERE assigned_at IS NOT NULL
    GROUP BY tech_id
  )`;

  let sql = `${withClause}
    SELECT DISTINCT
      pp.user_id,
      pp.display_name,
      pp.bio,
      pp.specialties,
      pp.certifications,
      pp.years_experience,
      pp.hourly_rate,
      pp.location,
      pp.service_radius,
      pp.availability_status,
      pp.rating_average,
      pp.review_count,
      pp.completed_jobs,
      pp.profile_photo,
      pp.is_verified_tech,
      cu.first_name,
      cu.last_name,
      cu.email,
      COALESCE(pp.rating_average, 0) as rating,
      trt.avg_hours
    FROM tech_public_profiles pp
    JOIN clerk_users cu ON cu.id = pp.user_id
    LEFT JOIN tech_response_times trt ON trt.tech_id = pp.user_id
    WHERE 'Technician' = ANY(cu.account_types)`;

  const params: any[] = [];
  let paramIndex = 1;

  if (specialty) {
    sql += ` AND $${paramIndex} = ANY(pp.specialties)`;
    params.push(specialty);
    paramIndex++;
  }

  if (availability && availability !== 'any') {
    sql += ` AND pp.availability_status = $${paramIndex}`;
    params.push(availability);
    paramIndex++;
  }

  if (minRating) {
    sql += ` AND COALESCE(pp.rating_average, 0) >= $${paramIndex}`;
    params.push(minRating);
    paramIndex++;
  }

  if (maxRate) {
    sql += ` AND (pp.hourly_rate IS NULL OR pp.hourly_rate <= $${paramIndex})`;
    params.push(maxRate);
    paramIndex++;
  }

  if (maxResponseTime) {
    sql += ` AND (trt.avg_hours IS NULL OR trt.avg_hours <= $${paramIndex})`;
    params.push(maxResponseTime);
    paramIndex++;
  }

  // Note: PostGIS distance calculation would be more accurate for production
  // This is a simplified bounding box approach
  if (location && location.lat && location.lng && location.radius) {
    // Approximate miles to degrees (roughly 69 miles per degree at equator)
    const latDelta = location.radius / 69;
    const lngDelta = location.radius / (69 * Math.cos(location.lat * Math.PI / 180));

    sql += ` AND
      (pp.location->>'lat')::float BETWEEN $${paramIndex} AND $${paramIndex + 1}
      AND (pp.location->>'lng')::float BETWEEN $${paramIndex + 2} AND $${paramIndex + 3}`;
    params.push(
      location.lat - latDelta,
      location.lat + latDelta,
      location.lng - lngDelta,
      location.lng + lngDelta
    );
    paramIndex += 4;
  }

  sql += ` ORDER BY pp.completed_jobs DESC, pp.rating_average DESC
           LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const results = await executeQuery<any>(sql, params, 'searchTechnicians');

  // Calculate distance for results with location
  return results.map(r => ({
    ...r,
    avg_response_hours: r.avg_hours || null,
    distance: location && r.location?.lat && r.location?.lng
      ? calculateDistance(location.lat, location.lng, r.location.lat, r.location.lng)
      : undefined
  }));
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in miles
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get technician profile by user ID
 *
 * @param userId - User ID
 * @returns Technician profile or null
 */
export async function getTechnicianProfile(userId: string): Promise<TechnicianProfile | null> {
  const result = await executeQuery<TechnicianProfile>(
    `SELECT
      pp.user_id,
      pp.display_name,
      pp.bio,
      pp.specialties,
      pp.certifications,
      pp.years_experience,
      pp.hourly_rate,
      pp.location,
      pp.service_radius,
      pp.availability_status,
      pp.rating_average,
      pp.review_count,
      pp.completed_jobs,
      pp.profile_photo,
      pp.is_verified_tech,
      cu.first_name,
      cu.last_name,
      cu.email
     FROM tech_public_profiles pp
     JOIN clerk_users cu ON cu.id = pp.user_id::text
     WHERE pp.user_id = $1`,
    [userId],
    'getTechnicianProfile'
  );

  return result[0] || null;
}

/**
 * Update technician profile
 *
 * @param userId - User ID
 * @param updates - Fields to update
 * @returns Updated technician profile
 */
export async function updateTechnicianProfile(
  userId: string,
  updates: Partial<TechnicianProfile>
): Promise<TechnicianProfile> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'specialties' && Array.isArray(value)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value); // Pass array directly, not JSON string
    } else if (key === 'location' && typeof value === 'object') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(JSON.stringify(value));
    } else if (key === 'certifications' && Array.isArray(value)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value); // Pass array directly, not JSON string
    } else if (key !== 'user_id' && key !== 'first_name' && key !== 'last_name' && key !== 'email') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
    }
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(userId);

  const result = await executeQuery<TechnicianProfile>(
    `UPDATE tech_public_profiles SET ${fields.join(', ')}, updated_at = NOW()
     WHERE user_id = $${paramIndex} RETURNING *`,
    values,
    'updateTechnicianProfile'
  );

  if (result.length === 0) {
    throw new Error(`Technician profile for user ${userId} not found`);
  }

  return result[0];
}

/**
 * Get tech earnings history
 *
 * @param userId - Technician user ID
 * @param options - Query options (limit, offset)
 * @returns Array of completed service requests with earnings
 */
export async function getTechEarnings(
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<ServiceRequest[]> {
  const { limit = 50, offset = 0 } = options;

  const result = await executeQuery<ServiceRequest>(
    `SELECT sr.*,
      cu.first_name || ' ' || cu.last_name as requester_name,
      cu.profile_photo_url as requester_photo
     FROM service_requests sr
     JOIN clerk_users cu ON cu.id = sr.requester_id::text
     WHERE sr.tech_id::text = $1 AND sr.status = 'Completed'
     ORDER BY sr.completed_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
    'getTechEarnings'
  );

  return result;
}

/**
 * Calculate technician average response time
 *
 * @param userId - Technician user ID
 * @returns Average response time in hours
 */
export async function getTechAverageResponseTime(userId: string): Promise<number> {
  const result = await executeQuery<{ avg_hours: string }>(
    `SELECT AVG(EXTRACT(EPOCH FROM (assigned_at - created_at)) / 3600) as avg_hours
     FROM service_requests
     WHERE tech_id::text = $1 AND assigned_at IS NOT NULL`,
    [userId],
    'getTechAverageResponseTime'
  );

  return parseFloat(result[0]?.avg_hours || '0');
}

// =====================================================
// MARKETPLACE & WALLET QUERIES
// =====================================================

/**
 * Get marketplace items with optional filters
 *
 * @param options - Query options (type, limit, offset)
 * @returns Array of marketplace items
 */
export async function getMarketplaceItems(
  options: { type?: string; limit?: number; offset?: number } = {}
): Promise<any[]> {
  const { type, limit = 50, offset = 0 } = options;

  let sql = `SELECT mi.*, cu.username, cu.profile_photo_url
     FROM marketplace_items mi
     JOIN clerk_users cu ON cu.id = mi.seller_id::TEXT`;
  const params: any[] = [];
  let paramIndex = 1;

  if (type) {
    sql += ` AND mi.item_type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  sql += ` ORDER BY mi.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return await executeQuery(sql, params, 'getMarketplaceItems');
}

/**
 * Get wallet balance for a user
 *
 * @param userId - User ID
 * @returns Token balance
 */
export async function getWalletBalance(userId: string): Promise<number> {
  const result = await executeQuery<{ balance: string }>(
    `SELECT COALESCE(balance, 0) as balance
     FROM wallets
     WHERE user_id = $1`,
    [userId],
    'getWalletBalance'
  );

  return parseFloat(result[0]?.balance || '0');
}

// =====================================================
// EQUIPMENT SUBMISSIONS
// =====================================================

/**
 * Get pending equipment submissions
 *
 * @param limit - Maximum number of submissions to return
 * @returns Array of pending submissions
 */
export async function getPendingSubmissions(limit: number = 20): Promise<any[]> {
  return await executeQuery(
    `SELECT id, brand, model, category, sub_category, specs, submitted_by, submitter_name, votes, timestamp
     FROM equipment_submissions
     WHERE status = 'pending'
     ORDER BY timestamp DESC
     LIMIT $1`,
    [limit],
    'getPendingSubmissions'
  );
}

/**
 * Update submission votes
 *
 * @param submissionId - Submission ID
 * @param votes - Updated votes object
 * @returns void
 */
export async function updateSubmissionVotes(
  submissionId: string,
  votes: { yes: string[]; fake: string[]; duplicate: string[] }
): Promise<void> {
  await executeQuery(
    `UPDATE equipment_submissions
     SET votes = $2::jsonb
     WHERE id = $1`,
    [submissionId, JSON.stringify(votes)],
    'updateSubmissionVotes'
  );
}

/**
 * Approve equipment submission and add to database
 *
 * @param submissionId - Submission ID to approve
 * @param reviewerId - User ID of reviewer
 * @returns void
 */
export async function approveEquipmentSubmission(
  submissionId: string,
  reviewerId: string
): Promise<void> {
  // First, get the submission details
  const submission = await executeQuery(
    `SELECT brand, model, category, sub_category, specs, submitted_by
     FROM equipment_submissions
     WHERE id = $1`,
    [submissionId],
    'approveEquipmentSubmission-get'
  );

  if (submission.length === 0) {
    throw new Error('Submission not found');
  }

  const sub = submission[0];

  // Insert into equipment_database
  await executeQuery(
    `INSERT INTO equipment_database (name, brand, model, category, subcategory, specifications, added_by, verified_by)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, ARRAY[$7])`,
    [
      `${sub.brand} ${sub.model}`,
      sub.brand,
      sub.model,
      sub.category,
      sub.sub_category,
      sub.specs,
      sub.submitted_by
    ],
    'approveEquipmentSubmission-insert'
  );

  // Update submission status
  await executeQuery(
    `UPDATE equipment_submissions
     SET status = 'approved'
     WHERE id = $1`,
    [submissionId],
    'approveEquipmentSubmission-update'
  );
}

/**
 * Reject equipment submission
 *
 * @param submissionId - Submission ID to reject
 * @returns void
 */
export async function rejectEquipmentSubmission(submissionId: string): Promise<void> {
  await executeQuery(
    `UPDATE equipment_submissions
     SET status = 'rejected'
     WHERE id = $1`,
    [submissionId],
    'rejectEquipmentSubmission'
  );
}

/**
 * Create equipment submission
 *
 * @param data - Submission data
 * @returns Created submission
 */
export async function createEquipmentSubmission(data: {
  brand: string;
  model: string;
  category: string;
  subCategory?: string;
  specs?: string;
  submittedBy: string;
  submitterName?: string;
}): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO equipment_submissions (brand, model, category, sub_category, specs, submitted_by, submitter_name, status, votes, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', '{"yes": [], "fake": [], "duplicate": []}'::jsonb, NOW())
     RETURNING *`,
    [
      data.brand,
      data.model,
      data.category,
      data.subCategory || null,
      data.specs || '{}',
      data.submittedBy,
      data.submitterName || null
    ],
    'createEquipmentSubmission'
  );

  return result[0];
}

/**
 * Upsert wallet balance (add tokens)
 *
 * @param userId - User ID
 * @param amount - Amount to add (can be negative)
 * @returns void
 */
export async function upsertWallet(userId: string, amount: number): Promise<void> {
  await executeQuery(
    `INSERT INTO wallets (user_id, balance, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE
     SET balance = wallets.balance + $2,
         updated_at = NOW()`,
    [userId, amount],
    'upsertWallet'
  );
}

// =====================================================
// EXTERNAL ARTISTS (Label Management)
// =====================================================

/**
 * Get external artists for a label
 *
 * @param labelId - Label user ID
 * @returns Array of external artists
 */
export async function getExternalArtists(labelId: string): Promise<any[]> {
  return await executeQuery(
    `SELECT id, name, email, stage_name, primary_role, genre, contract_type,
            status, signed_date, notes, created_at, updated_at
     FROM external_artists
     WHERE label_id = $1
     ORDER BY created_at DESC`,
    [labelId],
    'getExternalArtists'
  );
}

/**
 * Create external artist
 *
 * @param labelId - Label user ID
 * @param data - Artist data
 * @returns Created artist
 */
export async function createExternalArtist(
  labelId: string,
  data: {
    name: string;
    email?: string | null;
    stage_name?: string | null;
    genre?: string[];
    primary_role?: string | null;
    contract_type?: string | null;
    signed_date?: string;
    notes?: string | null;
  }
): Promise<any> {
  const result = await executeQuery(
    `INSERT INTO external_artists (
       label_id, name, email, stage_name, primary_role,
       genre, contract_type, signed_date, notes, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'invited')
     RETURNING *`,
    [
      labelId,
      data.name,
      data.email || null,
      data.stage_name || null,
      data.primary_role || null,
      data.genre || [],
      data.contract_type || null,
      data.signed_date || null,
      data.notes || null
    ],
    'createExternalArtist'
  );

  return result[0];
}

// =====================================================
// DISTRIBUTION ANALYTICS QUERIES
// =====================================================

/**
 * Store performance data interface
 */
export interface StorePerformance {
  platform: string;
  percentage: number;
  streams: number;
  revenue: number;
}

/**
 * Territory performance data interface
 */
export interface TerritoryPerformance {
  territory: string;
  country_code: string;
  streams: number;
  revenue: number;
  percentage: number;
}

/**
 * Get store performance percentages for dashboard
 *
 * @param userId - User ID
 * @returns Array of store performance data with percentages
 */
export async function getStorePerformance(userId: string): Promise<StorePerformance[]> {
  const result = await executeQuery<StorePerformance>(
    `SELECT * FROM get_store_performance_percentages($1)`,
    [userId],
    'getStorePerformance'
  );

  return result || [];
}

/**
 * Get top territories for dashboard
 *
 * @param userId - User ID
 * @param limit - Maximum number of territories to return (default 10)
 * @returns Array of territory performance data
 */
export async function getTopTerritories(
  userId: string,
  limit: number = 10
): Promise<TerritoryPerformance[]> {
  const result = await executeQuery<TerritoryPerformance>(
    `SELECT * FROM get_top_territories($1, $2)`,
    [userId, limit],
    'getTopTerritories'
  );

  return result || [];
}

/**
 * Get user distribution summary (KPIs)
 *
 * @param userId - User ID
 * @returns Distribution summary with lifetime stats
 */
export async function getDistributionSummary(userId: string): Promise<{
  lifetime_streams: number;
  lifetime_earnings: number;
  monthly_streams: number;
  monthly_listeners: number;
} | null> {
  const result = await executeQuery(
    `SELECT * FROM distribution_user_summary WHERE user_id = $1`,
    [userId],
    'getDistributionSummary'
  );

  return result[0] || null;
}

/**
 * Get pending booking count
 *
 * @param userId - User ID
 * @returns Count of pending bookings
 */
export async function getBookingCount(userId: string): Promise<number> {
  const result = await executeQuery<{ count: number }>(
    `SELECT get_pending_bookings_count($1) as count`,
    [userId],
    'getBookingCount'
  );

  return result[0]?.count || 0;
}

/**
 * Get distribution stats summary (legacy - for AnalyticsDashboard compatibility)
 *
 * @param userId - User ID
 * @returns Distribution stats with lifetime_earnings, lifetime_streams, monthly_listeners
 */
export async function getDistributionStats(userId: string): Promise<{
  lifetime_streams: number;
  lifetime_earnings: number;
  monthly_listeners: number;
} | null> {
  // First try the user summary view
  const summary = await getDistributionSummary(userId);
  if (summary) {
    return {
      lifetime_streams: summary.lifetime_streams || 0,
      lifetime_earnings: summary.lifetime_earnings || 0,
      monthly_listeners: Math.round(summary.monthly_listeners || 0)
    };
  }

  // Fallback to direct distribution_stats table
  const result = await executeQuery(
    `SELECT
      COALESCE(SUM(lifetime_streams), 0) as lifetime_streams,
      COALESCE(SUM(lifetime_earnings), 0) as lifetime_earnings,
      COALESCE(AVG(monthly_listeners), 0) as monthly_listeners
     FROM distribution_stats
     WHERE user_id = $1`,
    [userId],
    'getDistributionStats'
  );

  return result[0] || {
    lifetime_streams: 0,
    lifetime_earnings: 0,
    monthly_listeners: 0
  };
}

// =====================================================
// METRICS HISTORY & TREND QUERIES
// =====================================================

/**
 * Trend data interface
 */
export interface TrendData {
  current_value: number;
  previous_value: number;
  change_amount: number;
  change_percent: number;
  trend_direction: 'up' | 'down' | 'stable';
}

/**
 * Record current metrics for a user (call this periodically)
 *
 * @param userId - User ID
 * @returns void
 */
export async function recordUserMetrics(userId: string): Promise<void> {
  await executeQuery(
    `SELECT record_user_metrics($1)`,
    [userId],
    'recordUserMetrics'
  );
}

/**
 * Get token balance trend
 *
 * @param userId - User ID
 * @param days - Number of days to compare (default 30)
 * @returns Trend data for token balance
 */
export async function getTokenBalanceTrend(
  userId: string,
  days: number = 30
): Promise<TrendData | null> {
  const result = await executeQuery<TrendData>(
    `SELECT * FROM get_token_balance_trend($1, $2)`,
    [userId, days],
    'getTokenBalanceTrend'
  );

  return result[0] || null;
}

/**
 * Get profile views trend
 *
 * @param userId - User ID
 * @param days - Number of days to compare (default 30)
 * @returns Trend data for profile views
 */
export async function getProfileViewsTrend(
  userId: string,
  days: number = 30
): Promise<TrendData | null> {
  const result = await executeQuery<TrendData>(
    `SELECT * FROM get_profile_views_trend($1, $2)`,
    [userId, days],
    'getProfileViewsTrend'
  );

  return result[0] || null;
}

/**
 * Get revenue trend
 *
 * @param userId - User ID
 * @param days - Number of days to compare (default 30)
 * @returns Trend data for revenue
 */
export async function getRevenueTrend(
  userId: string,
  days: number = 30
): Promise<TrendData | null> {
  const result = await executeQuery<TrendData>(
    `SELECT * FROM get_revenue_trend($1, $2)`,
    [userId, days],
    'getRevenueTrend'
  );

  return result[0] || null;
}

/**
 * Get formatted trend percentage for UI display
 *
 * @param userId - User ID
 * @param metric - Metric type ('token_balance', 'profile_views', 'revenue')
 * @param days - Number of days to compare (default 30)
 * @returns Formatted percentage string (e.g., "+12.5%", "-8.3%")
 */
export async function getTrendPercentage(
  userId: string,
  metric: 'token_balance' | 'profile_views' | 'revenue',
  days: number = 30
): Promise<string> {
  const result = await executeQuery<{ get_trend_percentage: number }>(
    `SELECT get_trend_percentage($1, $2, $3) as get_trend_percentage`,
    [userId, metric, days],
    'getTrendPercentage'
  );

  const percentage = result[0]?.get_trend_percentage || 0;
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage}%`;
}

/**
 * Get trend direction
 *
 * @param userId - User ID
 * @param metric - Metric type
 * @param days - Number of days to compare (default 30)
 * @returns Trend direction ('up', 'down', 'stable')
 */
export async function getTrendDirection(
  userId: string,
  metric: 'token_balance' | 'profile_views' | 'revenue',
  days: number = 30
): Promise<'up' | 'down' | 'stable'> {
  const result = await executeQuery<{ get_trend_direction: string }>(
    `SELECT get_trend_direction($1, $2, $3) as get_trend_direction`,
    [userId, metric, days],
    'getTrendDirection'
  );

  return (result[0]?.get_trend_direction || 'stable') as 'up' | 'down' | 'stable';
}

/**
 * Check if there's enough historical data for trend calculation
 *
 * @param userId - User ID
 * @returns true if at least 2 historical records exist
 */
export async function hasHistoricalData(userId: string): Promise<boolean> {
  const result = await executeQuery<{ count: string }>(
    `SELECT COUNT(*) as count FROM metrics_history WHERE user_id = $1`,
    [userId],
    'hasHistoricalData'
  );

  return parseInt(result[0]?.count || '0', 10) >= 2;
}
