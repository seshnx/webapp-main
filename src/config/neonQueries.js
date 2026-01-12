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

// =====================================================
// ERROR HANDLING
// =====================================================

/**
 * Handle and log database errors
 *
 * @param {Error} error - Database error
 * @param {string} queryName - Name of the query that failed
 * @throws {Error} Re-throws the error with additional context
 */
function handleDatabaseError(error, queryName) {
  console.error(`Database error in ${queryName}:`, error);
  throw new Error(`Query ${queryName} failed: ${error.message}`);
}

/**
 * Execute a SQL query with error handling
 *
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @param {string} queryName - Name for error tracking
 * @returns {Promise<Array>} Query results
 */
async function executeQuery(sql, params = [], queryName = 'Unnamed Query') {
  if (!neonClient) {
    throw new Error('Neon client is not configured');
  }

  try {
    const result = await neonClient(sql, params);
    return result;
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
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} User object or null
 *
 * @example
 * const user = await getUser('user_12345');
 */
export async function getUser(userId) {
  const result = await executeQuery(
    'SELECT * FROM clerk_users WHERE id = $1',
    [userId],
    'getUser'
  );
  return result[0] || null;
}

/**
 * Get user by email
 *
 * @param {string} email - User email
 * @returns {Promise<object|null>} User object or null
 */
export async function getUserByEmail(email) {
  const result = await executeQuery(
    'SELECT * FROM clerk_users WHERE email = $1',
    [email],
    'getUserByEmail'
  );
  return result[0] || null;
}

/**
 * Get user by username
 *
 * @param {string} username - Username
 * @returns {Promise<object|null>} User object or null
 */
export async function getUserByUsername(username) {
  const result = await executeQuery(
    'SELECT * FROM clerk_users WHERE username = $1',
    [username],
    'getUserByUsername'
  );
  return result[0] || null;
}

/**
 * Get profile by user ID
 *
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Profile object or null
 */
export async function getProfile(userId) {
  const result = await executeQuery(
    'SELECT * FROM profiles WHERE user_id = $1',
    [userId],
    'getProfile'
  );
  return result[0] || null;
}

/**
 * Get multiple profiles by user IDs
 *
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Array>} Array of profiles
 */
export async function getProfilesByIds(userIds) {
  if (!userIds || userIds.length === 0) return [];

  const sql = 'SELECT * FROM profiles WHERE user_id = ANY($1)';
  const result = await executeQuery(sql, [userIds], 'getProfilesByIds');
  return result;
}

/**
 * Get user with profile
 *
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} User with profile or null
 */
export async function getUserWithProfile(userId) {
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
 * @param {object} userData - User data from Clerk
 * @returns {Promise<object>} Created user
 */
export async function createClerkUser(userData) {
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

  const sql = `
    INSERT INTO clerk_users (
      id, email, phone, first_name, last_name, username,
      profile_photo_url, account_types, active_role, bio, zip_code
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      username = EXCLUDED.username,
      profile_photo_url = EXCLUDED.profile_photo_url,
      updated_at = NOW()
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [id, email, phone, first_name, last_name, username, profile_photo_url, account_types, active_role, bio, zip_code],
    'createClerkUser'
  );

  return result[0];
}

/**
 * Update profile
 *
 * @param {string} userId - User ID
 * @param {object} updates - Profile updates
 * @returns {Promise<object>} Updated profile data
 */
export async function updateProfile(userId, updates) {
  // Fields that go in clerk_users table
  const clerkUserFields = ['first_name', 'last_name', 'username', 'profile_photo_url', 'bio', 'zip_code', 'account_types', 'active_role'];

  // Fields that go in profiles table
  const profileFields = ['display_name', 'location', 'website', 'social_links', 'photo_url', 'cover_photo_url',
                        'talent_info', 'engineer_info', 'producer_info', 'studio_info', 'education_info', 'label_info',
                        'profile_visibility', 'messaging_permission'];

  const clerkUpdates = {};
  const profileUpdates = {};

  for (const [key, value] of Object.entries(updates)) {
    if (clerkUserFields.includes(key)) {
      clerkUpdates[key] = value;
    } else if (profileFields.includes(key)) {
      profileUpdates[key] = value;
    }
  }

  // Update clerk_users if needed
  if (Object.keys(clerkUpdates).length > 0) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(clerkUpdates)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    values.push(userId);
    const sql = `
      UPDATE clerk_users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    await executeQuery(sql, values, 'updateClerkUser');
  }

  // Update profiles if needed
  if (Object.keys(profileUpdates).length > 0) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(profileUpdates)) {
      if (typeof value === 'object' && value !== null) {
        fields.push(`${key} = $${paramIndex}::jsonb`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }

    values.push(userId);
    const sql = `
      UPDATE profiles
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await executeQuery(sql, values, 'updateProfile');
    return result[0];
  }

  // If only clerk_users was updated, fetch the updated profile
  return await getProfile(userId);
}

/**
 * Upsert sub-profile
 *
 * @param {string} userId - User ID
 * @param {string} role - Role (Talent, Studio, Label, etc.)
 * @param {object} data - Sub-profile data
 * @returns {Promise<object>} Upserted sub-profile
 */
export async function upsertSubProfile(userId, role, data) {
  // Convert data object to JSONB-compatible fields
  const fields = ['user_id', 'role', 'data', 'updated_at'];
  const values = [userId, role, JSON.stringify(data), new Date().toISOString()];

  const sql = `
    INSERT INTO sub_profiles (user_id, role, data, updated_at)
    VALUES ($1, $2, $3::jsonb, $4::timestamp)
    ON CONFLICT (user_id, role)
    DO UPDATE SET
      data = $3::jsonb,
      updated_at = $4::timestamp
    RETURNING *
  `;

  const result = await executeQuery(sql, values, 'upsertSubProfile');
  return result[0];
}

/**
 * Get sub-profile
 *
 * @param {string} userId - User ID
 * @param {string} role - Role
 * @returns {Promise<object|null>} Sub-profile or null
 */
export async function getSubProfile(userId, role) {
  const result = await executeQuery(
    'SELECT * FROM sub_profiles WHERE user_id = $1 AND role = $2',
    [userId, role],
    'getSubProfile'
  );
  return result[0] || null;
}

/**
 * Get all sub-profiles for user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of sub-profiles
 */
export async function getSubProfiles(userId) {
  const result = await executeQuery(
    'SELECT * FROM sub_profiles WHERE user_id = $1 ORDER BY role',
    [userId],
    'getSubProfiles'
  );
  return result;
}

/**
 * Search users
 *
 * @param {object} options - Search options
 * @param {string} options.query - Search query
 * @param {number} options.limit - Result limit
 * @param {number} options.offset - Result offset
 * @returns {Promise<Array>} Array of users
 */
export async function searchUsers({ query, limit = 20, offset = 0 } = {}) {
  const sql = `
    SELECT
      cu.id,
      cu.username,
      cu.email,
      cu.account_types,
      cu.active_role,
      p.display_name,
      p.photo_url,
      p.bio
    FROM clerk_users cu
    LEFT JOIN profiles p ON p.user_id = cu.id
    WHERE (
      cu.username ILIKE $1 OR
      cu.email ILIKE $1 OR
      p.display_name ILIKE $1
    )
    AND cu.deleted_at IS NULL
    ORDER BY cu.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  return executeQuery(sql, [`%${query}%`, limit, offset], 'searchUsers');
}

// =====================================================
// SOCIAL FEED QUERIES
// =====================================================

/**
 * Get posts
 *
 * @param {object} options - Query options
 * @param {number} options.limit - Number of posts to return
 * @param {string} options.userId - Filter by user ID
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
export async function getPosts({ limit = 50, userId = null, offset = 0 } = {}) {
  let sql = '';
  let params = [];

  if (userId) {
    sql = `
      SELECT
        p.*,
        cu.username,
        cu.email,
        prof.display_name,
        prof.photo_url
      FROM posts p
      JOIN clerk_users cu ON p.user_id = cu.id
      LEFT JOIN profiles prof ON prof.user_id = cu.id
      WHERE p.user_id = $1
        AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    params = [userId, limit, offset];
  } else {
    sql = `
      SELECT
        p.*,
        cu.username,
        cu.email,
        prof.display_name,
        prof.photo_url
      FROM posts p
      JOIN clerk_users cu ON p.user_id = cu.id
      LEFT JOIN profiles prof ON prof.user_id = cu.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    params = [limit, offset];
  }

  return executeQuery(sql, params, 'getPosts');
}

/**
 * Get post by ID
 *
 * @param {string} postId - Post ID
 * @returns {Promise<object|null>} Post object or null
 */
export async function getPost(postId) {
  const sql = `
    SELECT
      p.*,
      cu.username,
      prof.display_name,
      prof.photo_url
    FROM posts p
    JOIN clerk_users cu ON p.user_id = cu.id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE p.id = $1
  `;

  const result = await executeQuery(sql, [postId], 'getPost');
  return result[0] || null;
}

/**
 * Create post
 *
 * @param {object} postData - Post data
 * @returns {Promise<object>} Created post
 */
export async function createPost(postData) {
  const {
    user_id,
    content,
    media_urls = [],
    mentions = [],
    hashtags = [],
    metadata = {},
  } = postData;

  const sql = `
    INSERT INTO posts (
      user_id, content, media_urls, mentions, hashtags, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [
      user_id,
      content,
      JSON.stringify(media_urls),
      JSON.stringify(mentions),
      JSON.stringify(hashtags),
      JSON.stringify(metadata),
    ],
    'createPost'
  );

  return result[0];
}

/**
 * Update post
 *
 * @param {string} postId - Post ID
 * @param {object} updates - Post updates
 * @returns {Promise<object>} Updated post
 */
export async function updatePost(postId, updates) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === 'object') {
      fields.push(`${key} = $${paramIndex}::jsonb`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
    }
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No updates provided');
  }

  values.push(postId);
  const sql = `
    UPDATE posts
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await executeQuery(sql, values, 'updatePost');
  return result[0];
}

/**
 * Delete post (soft delete)
 *
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deletePost(postId) {
  const result = await executeQuery(
    'UPDATE posts SET deleted_at = NOW() WHERE id = $1 RETURNING id',
    [postId],
    'deletePost'
  );
  return result.length > 0;
}

/**
 * Get comments for post
 *
 * @param {string} postId - Post ID
 * @returns {Promise<Array>} Array of comments
 */
export async function getComments(postId) {
  const sql = `
    SELECT
      c.*,
      cu.username,
      prof.display_name,
      prof.photo_url
    FROM comments c
    JOIN clerk_users cu ON c.user_id = cu.id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE c.post_id = $1 AND c.deleted_at IS NULL
    ORDER BY c.created_at ASC
  `;

  return executeQuery(sql, [postId], 'getComments');
}

/**
 * Create comment
 *
 * @param {object} commentData - Comment data
 * @returns {Promise<object>} Created comment
 */
export async function createComment(commentData) {
  const {
    post_id,
    user_id,
    content,
    parent_id = null,
    mentions = [],
  } = commentData;

  const sql = `
    INSERT INTO comments (
      post_id, user_id, content, parent_id, mentions
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [
      post_id,
      user_id,
      content,
      parent_id,
      JSON.stringify(mentions),
    ],
    'createComment'
  );

  return result[0];
}

/**
 * Delete comment
 *
 * @param {string} commentId - Comment ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteComment(commentId) {
  const sql = `
    UPDATE comments
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING id
  `;

  const result = await executeQuery(sql, [commentId], 'deleteComment');
  return result.length > 0;
}

/**
 * Update post comment count
 *
 * @param {string} postId - Post ID
 * @param {number} increment - Amount to increment (can be negative)
 * @returns {Promise<object>} Updated post
 */
export async function updatePostCommentCount(postId, increment) {
  const sql = `
    UPDATE posts
    SET comment_count = GREATEST(comment_count + $1, 0),
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await executeQuery(sql, [increment, postId], 'updatePostCommentCount');
  return result[0];
}

/**
 * Update post save count
 *
 * @param {string} postId - Post ID
 * @param {number} increment - Amount to increment (can be negative)
 * @returns {Promise<object>} Updated post
 */
export async function updatePostSaveCount(postId, increment) {
  const sql = `
    UPDATE posts
    SET save_count = GREATEST(save_count + $1, 0),
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await executeQuery(sql, [increment, postId], 'updatePostSaveCount');
  return result[0];
}

/**
 * Check if post is saved by user
 *
 * @param {string} userId - User ID
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} True if post is saved
 */
export async function checkIsSaved(userId, postId) {
  const sql = `
    SELECT id FROM saved_posts
    WHERE user_id = $1 AND post_id = $2
    LIMIT 1
  `;

  const result = await executeQuery(sql, [userId, postId], 'checkIsSaved');
  return result.length > 0;
}

/**
 * Save a post
 *
 * @param {string} userId - User ID
 * @param {string} postId - Post ID
 * @param {object} saveData - Save data (author_id, author_name, preview, has_media)
 * @returns {Promise<object>} Created save record
 */
export async function savePost(userId, postId, saveData) {
  const {
    author_id,
    author_name,
    preview,
    has_media = false
  } = saveData;

  const sql = `
    INSERT INTO saved_posts (
      user_id, post_id, author_id, author_name, preview, has_media, saved_at
    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [userId, postId, author_id, author_name, preview, has_media],
    'savePost'
  );

  return result[0];
}

/**
 * Unsave a post
 *
 * @param {string} userId - User ID
 * @param {string} postId - Post ID
 * @returns {Promise<boolean>} True if unsaved
 */
export async function unsavePost(userId, postId) {
  const sql = `
    DELETE FROM saved_posts
    WHERE user_id = $1 AND post_id = $2
    RETURNING id
  `;

  const result = await executeQuery(sql, [userId, postId], 'unsavePost');
  return result.length > 0;
}

// =====================================================
// FOLLOW QUERIES
// =====================================================

/**
 * Get users that the current user follows
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of following IDs
 */
export async function getFollowing(userId) {
  const sql = `
    SELECT following_id
    FROM follows
    WHERE follower_id = $1
  `;

  const result = await executeQuery(sql, [userId], 'getFollowing');
  return result.map(f => f.following_id);
}

/**
 * Get users that follow the current user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of follower IDs
 */
export async function getFollowers(userId) {
  const sql = `
    SELECT follower_id
    FROM follows
    WHERE following_id = $1
  `;

  const result = await executeQuery(sql, [userId], 'getFollowers');
  return result.map(f => f.follower_id);
}

/**
 * Follow a user
 *
 * @param {string} followerId - User ID of the follower
 * @param {string} followingId - User ID to follow
 * @returns {Promise<object>} Created follow record
 */
export async function followUser(followerId, followingId) {
  const sql = `
    INSERT INTO follows (follower_id, following_id, created_at)
    VALUES ($1, $2, NOW())
    RETURNING *
  `;

  const result = await executeQuery(sql, [followerId, followingId], 'followUser');
  return result[0];
}

/**
 * Unfollow a user
 *
 * @param {string} followerId - User ID of the follower
 * @param {string} followingId - User ID to unfollow
 * @returns {Promise<boolean>} True if unfollowed
 */
export async function unfollowUser(followerId, followingId) {
  const sql = `
    DELETE FROM follows
    WHERE follower_id = $1 AND following_id = $2
    RETURNING id
  `;

  const result = await executeQuery(sql, [followerId, followingId], 'unfollowUser');
  return result.length > 0;
}

/**
 * Get following count for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of users following
 */
export async function getFollowingCount(userId) {
  const sql = `
    SELECT COUNT(*) as count
    FROM follows
    WHERE follower_id = $1
  `;

  const result = await executeQuery(sql, [userId], 'getFollowingCount');
  return result[0]?.count || 0;
}

/**
 * Get followers count for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of followers
 */
export async function getFollowersCount(userId) {
  const sql = `
    SELECT COUNT(*) as count
    FROM follows
    WHERE following_id = $1
  `;

  const result = await executeQuery(sql, [userId], 'getFollowersCount');
  return result[0]?.count || 0;
}

// =====================================================
// BOOKING QUERIES
// =====================================================

/**
 * Get bookings for user
 *
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of bookings
 */
export async function getBookings(userId, options = {}) {
  const { status = null, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT b.*
    FROM bookings b
    WHERE (b.sender_id = $1 OR b.target_id = $1)
  `;

  const params = [userId];
  let paramIndex = 2;

  if (status) {
    sql += ` AND b.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  sql += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return executeQuery(sql, params, 'getBookings');
}

/**
 * Get booking by ID
 *
 * @param {string} bookingId - Booking ID
 * @returns {Promise<object|null>} Booking object or null
 */
export async function getBooking(bookingId) {
  const result = await executeQuery(
    'SELECT * FROM bookings WHERE id = $1',
    [bookingId],
    'getBooking'
  );
  return result[0] || null;
}

/**
 * Create booking
 *
 * @param {object} bookingData - Booking data
 * @returns {Promise<object>} Created booking
 */
export async function createBooking(bookingData) {
  const sql = `
    INSERT INTO bookings (
      sender_id, sender_name, target_id, target_name, type, service_type,
      date, start_time, end_time, duration_hours, location, description,
      message, budget_cap, agreed_price, logistics, attachments, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [
      bookingData.sender_id,
      bookingData.sender_name,
      bookingData.target_id,
      bookingData.target_name,
      bookingData.type,
      bookingData.service_type || null,
      bookingData.date || null,
      bookingData.start_time || null,
      bookingData.end_time || null,
      bookingData.duration_hours || null,
      bookingData.location ? JSON.stringify(bookingData.location) : null,
      bookingData.description || null,
      bookingData.message || null,
      bookingData.budget_cap || null,
      bookingData.agreed_price || null,
      bookingData.logistics || null,
      bookingData.attachments ? JSON.stringify(bookingData.attachments) : '[]',
      bookingData.metadata ? JSON.stringify(bookingData.metadata) : '{}',
    ],
    'createBooking'
  );

  return result[0];
}

/**
 * Update booking status
 *
 * @param {string} bookingId - Booking ID
 * @param {string} status - New status
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} Updated booking
 */
export async function updateBookingStatus(bookingId, status, metadata = {}) {
  const sql = `
    UPDATE bookings
    SET
      status = $1,
      metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [status, JSON.stringify(metadata), bookingId],
    'updateBookingStatus'
  );

  return result[0];
}

// =====================================================
// MARKETPLACE QUERIES
// =====================================================

/**
 * Get marketplace items
 *
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of items
 */
export async function getMarketplaceItems(options = {}) {
  const {
    category = null,
    status = 'active',
    limit = 50,
    offset = 0,
  } = options;

  let sql = `
    SELECT
      mi.*,
      cu.username,
      prof.display_name,
      prof.photo_url
    FROM market_items mi
    JOIN clerk_users cu ON mi.seller_id = cu.id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE mi.status = $1
  `;

  const params = [status];
  let paramIndex = 2;

  if (category) {
    sql += ` AND mi.category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  sql += ` ORDER BY mi.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return executeQuery(sql, params, 'getMarketplaceItems');
}

/**
 * Get marketplace item by ID
 *
 * @param {string} itemId - Item ID
 * @returns {Promise<object|null>} Item object or null
 */
export async function getMarketplaceItem(itemId) {
  const sql = `
    SELECT
      mi.*,
      cu.username,
      prof.display_name,
      prof.photo_url
    FROM market_items mi
    JOIN clerk_users cu ON mi.seller_id = cu.id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE mi.id = $1
  `;

  const result = await executeQuery(sql, [itemId], 'getMarketplaceItem');
  return result[0] || null;
}

/**
 * Create marketplace item
 *
 * @param {object} itemData - Item data
 * @returns {Promise<object>} Created item
 */
export async function createMarketplaceItem(itemData) {
  const sql = `
    INSERT INTO market_items (
      seller_id, title, description, category, subcategory, price,
      condition, images, location, shipping_available, local_pickup_available,
      metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [
      itemData.seller_id,
      itemData.title,
      itemData.description || null,
      itemData.category,
      itemData.subcategory || null,
      itemData.price,
      itemData.condition || null,
      itemData.images ? JSON.stringify(itemData.images) : '[]',
      itemData.location ? JSON.stringify(itemData.location) : null,
      itemData.shipping_available !== false,
      itemData.local_pickup_available !== false,
      itemData.metadata ? JSON.stringify(itemData.metadata) : '{}',
    ],
    'createMarketplaceItem'
  );

  return result[0];
}

/**
 * Search marketplace items
 *
 * @param {object} options - Search options
 * @returns {Promise<Array>} Array of items
 */
export async function searchMarketplaceItems(options = {}) {
  const { query, category, minPrice, maxPrice, limit = 20, offset = 0 } = options;

  let sql = `
    SELECT mi.*
    FROM market_items mi
    WHERE mi.status = 'active'
  `;

  const params = [];
  let paramIndex = 1;

  if (query) {
    sql += ` AND (mi.title ILIKE $${paramIndex} OR mi.description ILIKE $${paramIndex})`;
    params.push(`%${query}%`);
    paramIndex++;
  }

  if (category) {
    sql += ` AND mi.category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (minPrice) {
    sql += ` AND mi.price >= $${paramIndex}`;
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice) {
    sql += ` AND mi.price <= $${paramIndex}`;
    params.push(maxPrice);
    paramIndex++;
  }

  sql += ` ORDER BY mi.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return executeQuery(sql, params, 'searchMarketplaceItems');
}

// =====================================================
// WALLET AND TRANSACTION QUERIES
// =====================================================

/**
 * Get wallet balance
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Wallet balance
 */
export async function getWalletBalance(userId) {
  const result = await executeQuery(
    'SELECT balance FROM wallets WHERE user_id = $1',
    [userId],
    'getWalletBalance'
  );
  return result[0]?.balance || 0;
}

/**
 * Create or update wallet
 *
 * @param {string} userId - User ID
 * @param {number} balance - Wallet balance
 * @returns {Promise<object>} Wallet object
 */
export async function upsertWallet(userId, balance = 0) {
  const sql = `
    INSERT INTO wallets (user_id, balance)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE SET
      balance = GREATEST(0, wallets.balance + $2),
      updated_at = NOW()
    RETURNING *
  `;

  const result = await executeQuery(sql, [userId, balance], 'upsertWallet');
  return result[0];
}

/**
 * Create transaction
 *
 * @param {object} transactionData - Transaction data
 * @returns {Promise<object>} Created transaction
 */
export async function createTransaction(transactionData) {
  const sql = `
    INSERT INTO transactions (
      user_id, wallet_id, type, amount, status, description,
      reference_type, reference_id, payment_method, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [
      transactionData.user_id,
      transactionData.wallet_id || null,
      transactionData.type,
      transactionData.amount,
      transactionData.status || 'pending',
      transactionData.description || null,
      transactionData.reference_type || null,
      transactionData.reference_id || null,
      transactionData.payment_method || null,
      transactionData.metadata ? JSON.stringify(transactionData.metadata) : '{}',
    ],
    'createTransaction'
  );

  return result[0];
}

/**
 * Get transactions for user
 *
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of transactions
 */
export async function getTransactions(userId, options = {}) {
  const { type = null, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT * FROM transactions
    WHERE user_id = $1
  `;

  const params = [userId];
  let paramIndex = 2;

  if (type) {
    sql += ` AND type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return executeQuery(sql, params, 'getTransactions');
}

// =====================================================
// NOTIFICATION QUERIES
// =====================================================

/**
 * Get notifications for user
 *
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of notifications
 */
export async function getNotifications(userId, options = {}) {
  const { unreadOnly = false, limit = 50, offset = 0 } = options;

  let sql = 'SELECT * FROM notifications WHERE user_id = $1';
  const params = [userId];
  let paramIndex = 2;

  if (unreadOnly) {
    sql += ' AND read = false';
  }

  sql += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
  params.push(limit, offset);

  return executeQuery(sql, params, 'getNotifications');
}

/**
 * Get unread notification count
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadNotificationCount(userId) {
  const result = await executeQuery(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
    [userId],
    'getUnreadNotificationCount'
  );
  return parseInt(result[0]?.count || '0', 10);
}

/**
 * Create notification
 *
 * @param {object} notificationData - Notification data
 * @returns {Promise<object>} Created notification
 */
export async function createNotification(notificationData) {
  const sql = `
    INSERT INTO notifications (
      user_id, type, title, message, reference_type, reference_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [
      notificationData.user_id,
      notificationData.type,
      notificationData.title || '',
      notificationData.message || '',
      notificationData.reference_type || null,
      notificationData.reference_id || null,
      notificationData.metadata ? JSON.stringify(notificationData.metadata) : '{}',
    ],
    'createNotification'
  );

  return result[0];
}

/**
 * Mark notification as read
 *
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} True if marked as read
 */
export async function markNotificationAsRead(notificationId) {
  const result = await executeQuery(
    'UPDATE notifications SET read = true, read_at = NOW() WHERE id = $1 RETURNING id',
    [notificationId],
    'markNotificationAsRead'
  );
  return result.length > 0;
}

/**
 * Mark all notifications as read for user
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
export async function markAllNotificationsAsRead(userId) {
  const result = await executeQuery(
    'UPDATE notifications SET read = true, read_at = NOW() WHERE user_id = $1 AND read = false RETURNING id',
    [userId],
    'markAllNotificationsAsRead'
  );
  return result.length;
}

/**
 * Delete notification (soft delete)
 *
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteNotification(notificationId) {
  const result = await executeQuery(
    'UPDATE notifications SET deleted = true WHERE id = $1 RETURNING id',
    [notificationId],
    'deleteNotification'
  );
  return result.length > 0;
}

/**
 * Clear all notifications for user (soft delete)
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications cleared
 */
export async function clearAllNotifications(userId) {
  const result = await executeQuery(
    'UPDATE notifications SET deleted = true WHERE user_id = $1 AND deleted = false RETURNING id',
    [userId],
    'clearAllNotifications'
  );
  return result.length;
}

// =====================================================
// LABEL & BUSINESS QUERIES
// =====================================================

/**
 * Get label roster
 *
 * @param {string} labelId - Label user ID
 * @returns {Promise<Array>} Array of roster entries
 */
export async function getLabelRoster(labelId) {
  const sql = `
    SELECT
      lr.*,
      cu.username as artist_username,
      prof.display_name as artist_display_name,
      prof.photo_url as artist_photo_url,
      COALESCE(ds.lifetime_streams, 0) as streams,
      COALESCE(ds.lifetime_earnings, 0) as earnings
    FROM label_roster lr
    JOIN clerk_users cu ON cu.id = lr.artist_id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    LEFT JOIN distribution_stats ds ON ds.user_id = lr.artist_id
    WHERE lr.label_id = $1
    ORDER BY lr.signed_date DESC
  `;

  return executeQuery(sql, [labelId], 'getLabelRoster');
}

/**
 * Get releases for label
 *
 * @param {string} labelId - Label user ID
 * @returns {Promise<Array>} Array of releases
 */
export async function getLabelReleases(labelId) {
  const sql = `
    SELECT
      r.*,
      cu.username as artist_username,
      prof.display_name as artist_display_name,
      prof.photo_url as artist_photo_url
    FROM releases r
    JOIN clerk_users cu ON cu.id = r.artist_id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE r.label_id = $1
    ORDER BY r.release_date DESC
  `;

  return executeQuery(sql, [labelId], 'getLabelReleases');
}

/**
 * Get label dashboard metrics
 *
 * @param {string} labelId - Label user ID
 * @returns {Promise<object>} Dashboard metrics
 */
export async function getLabelDashboardMetrics(labelId) {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM label_roster WHERE label_id = $1 AND status = 'active') as total_artists,
      (SELECT COUNT(*) FROM releases WHERE label_id = $1 AND status = 'distributed') as total_releases,
      (SELECT COALESCE(SUM(lifetime_earnings), 0) FROM distribution_stats WHERE user_id IN (
        SELECT artist_id FROM label_roster WHERE label_id = $1
      )) as total_revenue,
      (SELECT COALESCE(SUM(lifetime_streams), 0) FROM distribution_stats WHERE user_id IN (
        SELECT artist_id FROM label_roster WHERE label_id = $1
      )) as total_streams
  `;

  const result = await executeQuery(sql, [labelId], 'getLabelDashboardMetrics');
  return result[0] || {
    total_artists: 0,
    total_releases: 0,
    total_revenue: '0',
    total_streams: '0',
  };
}

/**
 * Get distribution stats for user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of distribution stats
 */
export async function getDistributionStats(userId) {
  const sql = `
    SELECT
      platform,
      SUM(lifetime_streams) as total_streams,
      SUM(lifetime_earnings) as total_earnings,
      SUM(monthly_streams) as monthly_streams,
      SUM(monthly_listeners) as monthly_listeners
    FROM distribution_stats
    WHERE user_id = $1
    GROUP BY platform
    ORDER BY total_earnings DESC
  `;

  return executeQuery(sql, [userId], 'getDistributionStats');
}

/**
 * Add artist to label roster
 *
 * @param {string} labelId - Label user ID
 * @param {object} artistData - Artist data
 * @returns {Promise<object>} Created roster entry
 */
export async function addArtistToRoster(labelId, artistData) {
  const {
    artist_id,
    name,
    email,
    photo_url,
    role,
    contract_type,
    signed_date,
    contract_end_date,
    status = 'active',
    notes,
    metadata = {}
  } = artistData;

  const sql = `
    INSERT INTO label_roster (
      label_id, artist_id, name, email, photo_url,
      role, contract_type, signed_date, contract_end_date,
      status, notes, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
    ON CONFLICT (label_id, artist_id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      photo_url = EXCLUDED.photo_url,
      role = EXCLUDED.role,
      contract_type = EXCLUDED.contract_type,
      signed_date = EXCLUDED.signed_date,
      contract_end_date = EXCLUDED.contract_end_date,
      status = EXCLUDED.status,
      notes = EXCLUDED.notes,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [labelId, artist_id, name, email, photo_url, role, contract_type, signed_date, contract_end_date, status, notes, JSON.stringify(metadata)],
    'addArtistToRoster'
  );

  return result[0];
}

/**
 * Update roster entry
 *
 * @param {string} rosterId - Roster entry ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated roster entry
 */
export async function updateRosterEntry(rosterId, updates) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'metadata') {
      fields.push(`${key} = $${paramIndex}::jsonb`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
    }
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No updates provided');
  }

  values.push(rosterId);
  const sql = `
    UPDATE label_roster
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await executeQuery(sql, values, 'updateRosterEntry');
  return result[0];
}

/**
 * Create release
 *
 * @param {object} releaseData - Release data
 * @returns {Promise<object>} Created release
 */
export async function createRelease(releaseData) {
  const {
    artist_id,
    label_id,
    title,
    type,
    genre,
    release_date,
    cover_art_url,
    isrc,
    upc,
    platforms = {},
    tracks = [],
    status = 'draft',
    distributor,
    catalog_number
  } = releaseData;

  const sql = `
    INSERT INTO releases (
      artist_id, label_id, title, type, genre, release_date,
      cover_art_url, isrc, upc, platforms, tracks, status,
      distributor, catalog_number
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13, $14)
    RETURNING *
  `;

  const result = await executeQuery(
    sql,
    [artist_id, label_id, title, type, genre, release_date, cover_art_url, isrc, upc, JSON.stringify(platforms), JSON.stringify(tracks), status, distributor, catalog_number],
    'createRelease'
  );

  return result[0];
}

/**
 * Update release
 *
 * @param {string} releaseId - Release ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated release
 */
export async function updateRelease(releaseId, updates) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (['platforms', 'tracks', 'metadata'].includes(key)) {
      fields.push(`${key} = $${paramIndex}::jsonb`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
    }
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No updates provided');
  }

  values.push(releaseId);
  const sql = `
    UPDATE releases
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await executeQuery(sql, values, 'updateRelease');
  return result[0];
}

/**
 * Get artist roster count
 *
 * @param {string} labelId - Label user ID
 * @returns {Promise<number>} Count of active artists
 */
export async function getArtistCount(labelId) {
  const result = await executeQuery(
    'SELECT COUNT(*) as count FROM label_roster WHERE label_id = $1 AND status = $2',
    [labelId, 'active'],
    'getArtistCount'
  );
  return parseInt(result[0]?.count || 0);
}

/**
 * Get upcoming releases
 *
 * @param {string} labelId - Label user ID
 * @param {number} limit - Number of releases to return
 * @returns {Promise<Array>} Array of upcoming releases
 */
export async function getUpcomingReleases(labelId, limit = 10) {
  const sql = `
    SELECT
      r.*,
      cu.username as artist_username,
      prof.display_name as artist_display_name,
      prof.photo_url as artist_photo_url
    FROM releases r
    JOIN clerk_users cu ON cu.id = r.artist_id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE r.label_id = $1
      AND r.release_date >= CURRENT_DATE
      AND r.status IN ('draft', 'submitted')
    ORDER BY r.release_date ASC
    LIMIT $2
  `;

  return executeQuery(sql, [labelId, limit], 'getUpcomingReleases');
}

/**
 * Search artists by name or email
 *
 * @param {string} query - Search query
 * @param {number} limit - Result limit
 * @returns {Promise<Array>} Array of artists
 */
export async function searchArtists(query, limit = 20) {
  const sql = `
    SELECT
      cu.id,
      cu.email,
      cu.username,
      cu.first_name,
      cu.last_name,
      cu.profile_photo_url,
      cu.account_types,
      p.display_name,
      p.photo_url as profile_photo
    FROM clerk_users cu
    LEFT JOIN profiles p ON p.user_id = cu.id
    WHERE (
      cu.username ILIKE $1 OR
      cu.email ILIKE $1 OR
      p.display_name ILIKE $1 OR
      (cu.first_name || ' ' || cu.last_name) ILIKE $1
    )
    AND cu.deleted_at IS NULL
    AND cu.account_types @> ARRAY['Talent']::text[]
    ORDER BY cu.created_at DESC
    LIMIT $2
  `;

  return executeQuery(sql, [`%${query}%`, limit], 'searchArtists');
}

// =====================================================
// EDUCATION QUERIES
// =====================================================

/**
 * Get student data
 *
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Student data or null
 */
export async function getStudent(userId) {
  const sql = `
    SELECT
      s.*,
      sc.name as school_name,
      sc.logo_url as school_logo
    FROM students s
    LEFT JOIN schools sc ON sc.id = s.school_id
    WHERE s.user_id = $1
  `;

  const result = await executeQuery(sql, [userId], 'getStudent');
  return result[0] || null;
}

/**
 * Get staff data
 *
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Staff data or null
 */
export async function getStaff(userId) {
  const sql = `
    SELECT
      ss.*,
      sc.name as school_name,
      sc.logo_url as school_logo,
      sr.name as role_name
    FROM school_staff ss
    LEFT JOIN schools sc ON sc.id = ss.school_id
    LEFT JOIN school_roles sr ON sr.id = ss.role_id
    WHERE ss.user_id = $1
  `;

  const result = await executeQuery(sql, [userId], 'getStaff');
  return result[0] || null;
}

/**
 * Get courses for school
 *
 * @param {string} schoolId - School ID
 * @returns {Promise<Array>} Array of courses
 */
export async function getCourses(schoolId) {
  const sql = `
    SELECT
      c.*,
      cu.username as instructor_username,
      prof.display_name as instructor_display_name,
      prof.photo_url as instructor_photo_url
    FROM courses c
    LEFT JOIN clerk_users cu ON cu.id = c.instructor_id
    LEFT JOIN profiles prof ON prof.user_id = cu.id
    WHERE c.school_id = $1
    ORDER BY c.created_at DESC
  `;

  return executeQuery(sql, [schoolId], 'getCourses');
}

/**
 * Get enrollments for student
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of enrollments
 */
export async function getEnrollments(userId) {
  const sql = `
    SELECT
      e.*,
      c.code as course_code,
      c.title as course_title,
      c.credits,
      sc.name as school_name
    FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    LEFT JOIN schools sc ON sc.id = c.school_id
    JOIN students s ON s.id = e.student_id
    WHERE s.user_id = $1
    ORDER BY e.created_at DESC
  `;

  return executeQuery(sql, [userId], 'getEnrollments');
}

// =====================================================
// EXPORT QUERY OBJECT (for backward compatibility)
// =====================================================

/**
 * Query collection organized by feature
 * Can be used with executeQuery() for predefined queries
 */
export const queries = {
  users: {
    getById: 'SELECT * FROM clerk_users WHERE id = $1',
    getByEmail: 'SELECT * FROM clerk_users WHERE email = $1',
    getByUsername: 'SELECT * FROM clerk_users WHERE username = $1',
    withProfile: `SELECT cu.*, p.* FROM clerk_users cu LEFT JOIN profiles p ON p.user_id = cu.id WHERE cu.id = $1`,
  },
  posts: {
    getById: 'SELECT * FROM posts WHERE id = $1',
    getByUser: 'SELECT * FROM posts WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2',
    getRecent: 'SELECT * FROM posts WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1',
    withUser: `SELECT p.*, cu.username, prof.display_name, prof.photo_url FROM posts p JOIN clerk_users cu ON p.user_id = cu.id LEFT JOIN profiles prof ON prof.user_id = cu.id WHERE p.id = $1`,
  },
  bookings: {
    getById: 'SELECT * FROM bookings WHERE id = $1',
    getByUser: 'SELECT * FROM bookings WHERE (sender_id = $1 OR target_id = $1) ORDER BY created_at DESC LIMIT $2',
    getByStatus: 'SELECT * FROM bookings WHERE (sender_id = $1 OR target_id = $1) AND status = $2 ORDER BY created_at DESC LIMIT $3',
  },
  marketplace: {
    getActiveItems: 'SELECT * FROM market_items WHERE status = "active" ORDER BY created_at DESC LIMIT $1',
    getByCategory: 'SELECT * FROM market_items WHERE category = $1 AND status = "active" ORDER BY created_at DESC LIMIT $2',
    getBySeller: 'SELECT * FROM market_items WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2',
  },
  labels: {
    getRoster: `SELECT lr.*, cu.username, prof.display_name FROM label_roster lr JOIN clerk_users cu ON cu.id = lr.artist_id LEFT JOIN profiles prof ON prof.user_id = cu.id WHERE lr.label_id = $1`,
    getReleases: `SELECT r.*, cu.username as artist_username FROM releases r JOIN clerk_users cu ON cu.id = r.artist_id WHERE r.label_id = $1 ORDER BY r.release_date DESC`,
  },
  education: {
    getStudent: `SELECT s.*, sc.name as school_name FROM students s LEFT JOIN schools sc ON sc.id = s.school_id WHERE s.user_id = $1`,
    getStaff: `SELECT ss.*, sc.name as school_name FROM school_staff ss LEFT JOIN schools sc ON sc.id = ss.school_id WHERE ss.user_id = $1`,
    getCourses: `SELECT c.* FROM courses c WHERE c.school_id = $1 ORDER BY c.created_at DESC`,
  },
};

export default {
  // User queries
  getUser,
  getUserByEmail,
  getUserByUsername,
  getProfile,
  getUserWithProfile,
  createClerkUser,
  updateProfile,
  upsertSubProfile,
  getSubProfile,
  getSubProfiles,
  searchUsers,

  // Social feed queries
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  deleteComment,
  updatePostCommentCount,

  // Booking queries
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,

  // Marketplace queries
  getMarketplaceItems,
  getMarketplaceItem,
  createMarketplaceItem,
  searchMarketplaceItems,

  // Wallet queries
  getWalletBalance,
  upsertWallet,
  createTransaction,
  getTransactions,

  // Notification queries
  getNotifications,
  getUnreadNotificationCount,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,

  // Label queries
  getLabelRoster,
  getLabelReleases,
  getLabelDashboardMetrics,
  getDistributionStats,
  addArtistToRoster,
  updateRosterEntry,
  createRelease,
  updateRelease,
  getArtistCount,
  getUpcomingReleases,
  searchArtists,

  // Education queries
  getStudent,
  getStaff,
  getCourses,
  getEnrollments,

  // Query collection
  queries,
};
