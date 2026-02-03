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
 * @param userId - User ID
 * @returns Profile object or null
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const result = await executeQuery<Profile>(
    'SELECT * FROM profiles WHERE user_id = $1',
    [userId],
    'getProfile'
  );
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
      JSON.stringify(account_types), active_role, bio, zip_code
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

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
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
     WHERE (sender_id = $1 OR target_id = $1 OR studio_owner_id = $1)
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
       user_id,
       talent_info,
       engineer_info,
       producer_info,
       studio_info,
       education_info,
       label_info,
       technician_info
     FROM profiles
     WHERE user_id = $1`,
    [userId],
    'getSubProfiles'
  );

  if (result.length === 0) return [];

  const profile = result[0];
  const subProfiles: Array<{ account_type: string; [key: string]: any }> = [];

  // Map each info column to an account_type
  if (profile.talent_info && (profile.talent_info as any).display_name) {
    subProfiles.push({ ...profile.talent_info, account_type: 'Talent' });
  }
  if (profile.engineer_info && (profile.engineer_info as any).display_name) {
    subProfiles.push({ ...profile.engineer_info, account_type: 'Engineer' });
  }
  if (profile.producer_info && (profile.producer_info as any).display_name) {
    subProfiles.push({ ...profile.producer_info, account_type: 'Producer' });
  }
  if (profile.studio_info && (profile.studio_info as any).display_name) {
    subProfiles.push({ ...profile.studio_info, account_type: 'Studio' });
  }
  if (profile.education_info && (profile.education_info as any).display_name) {
    const eduInfo = profile.education_info as any;
    // Check which EDU role and add appropriate account_type
    if (eduInfo.role === 'EDUAdmin') {
      subProfiles.push({ ...eduInfo, account_type: 'EDUAdmin' });
    } else if (eduInfo.role === 'EDUStaff') {
      subProfiles.push({ ...eduInfo, account_type: 'EDUStaff' });
    } else if (eduInfo.role === 'Student') {
      subProfiles.push({ ...eduInfo, account_type: 'Student' });
    } else if (eduInfo.role === 'Intern') {
      subProfiles.push({ ...eduInfo, account_type: 'Intern' });
    } else {
      subProfiles.push({ ...eduInfo, account_type: 'Student' }); // Default
    }
  }
  if (profile.label_info && (profile.label_info as any).display_name) {
    subProfiles.push({ ...profile.label_info, account_type: 'Label' });
  }
  if (profile.technician_info && (profile.technician_info as any).display_name) {
    subProfiles.push({ ...profile.technician_info, account_type: 'Technician' });
  }

  return subProfiles;
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
     ORDER BY saved_at DESC
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
    savedAt: p.saved_at
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
    `INSERT INTO saved_posts (user_id, post_id, author_id, author_name, preview, has_media, saved_at)
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
 * TODO: Implement when comments table is added to Neon schema
 */
export async function getComments(postId: string): Promise<Comment[]> {
  // Stub implementation - returns empty array until table is created
  console.warn('getComments: comments table not yet implemented in Neon');
  return [];
}

/**
 * Create a new comment
 * TODO: Implement when comments table is added to Neon schema
 */
export async function createComment(commentData: Partial<Comment>): Promise<Comment> {
  // Stub implementation
  console.warn('createComment: comments table not yet implemented in Neon');
  return {} as Comment;
}

/**
 * Delete a comment
 * TODO: Implement when comments table is added to Neon schema
 */
export async function deleteComment(commentId: string): Promise<void> {
  // Stub implementation
  console.warn('deleteComment: comments table not yet implemented in Neon');
}

/**
 * Update post comment count
 * TODO: Implement when comment_count column is added to posts table
 */
export async function updatePostCommentCount(postId: string, delta: number): Promise<void> {
  // Stub implementation
  console.warn('updatePostCommentCount: comment_count column not yet implemented in Neon');
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
  average_rating?: number;
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
      COALESCE(AVG(pr.rating), 0) as average_rating
     FROM service_requests sr
     LEFT JOIN public_profiles pr ON pr.user_id = $1
     WHERE sr.tech_id = $1`,
    [userId],
    'getTechMetrics'
  );
  return result[0] || {};
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
    JOIN clerk_users cu ON cu.id = sr.requester_id
    WHERE sr.tech_id = $1`;
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
    JOIN clerk_users cu ON cu.id = sr.requester_id
    LEFT JOIN public_profiles pp ON pp.user_id = sr.requester_id
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

  let sql = `SELECT DISTINCT
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
    COALESCE(pp.rating_average, 0) as rating
    FROM public_profiles pp
    JOIN clerk_users cu ON cu.id = pp.user_id
    WHERE cu.account_types @> '["Technician"]'::jsonb`;
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

  // Add calculated average response time for each tech
  sql = `WITH tech_response_times AS (
    SELECT tech_id, AVG(EXTRACT(EPOCH FROM (assigned_at - created_at)) / 3600) as avg_hours
    FROM service_requests
    WHERE assigned_at IS NOT NULL
    GROUP BY tech_id
  )
  ` + sql;

  sql += ` LEFT JOIN tech_response_times trt ON trt.tech_id = pp.user_id`;

  if (maxResponseTime) {
    sql += ` AND (trt.avg_hours IS NULL OR trt.avg_hours <= $${paramIndex})`;
    params.push(maxResponseTime);
    paramIndex++;
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
     FROM public_profiles pp
     JOIN clerk_users cu ON cu.id = pp.user_id
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
      values.push(JSON.stringify(value));
    } else if (key === 'location' && typeof value === 'object') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(JSON.stringify(value));
    } else if (key === 'certifications' && Array.isArray(value)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(JSON.stringify(value));
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
    `UPDATE public_profiles SET ${fields.join(', ')}, updated_at = NOW()
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
     JOIN clerk_users cu ON cu.id = sr.requester_id
     WHERE sr.tech_id = $1 AND sr.status = 'Completed'
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
     WHERE tech_id = $1 AND assigned_at IS NOT NULL`,
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
     JOIN clerk_users cu ON cu.id = mi.seller_id
     WHERE mi.deleted_at IS NULL`;
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
