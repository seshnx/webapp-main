/**
 * MongoDB Social Queries
 *
 * All social media operations migrated from Neon to MongoDB.
 * This includes posts, comments, reactions, follows, saved posts, and social notifications.
 *
 * MongoDB is now the single source of truth for all social features.
 * Convex syncs from MongoDB for real-time updates.
 */

import { getMongoDb, isMongoDbAvailable } from './mongodb.js';
import type {
  MongoPost,
  MongoComment,
  MongoReaction,
  MongoFollow,
  MongoSavedPost,
  MongoSocialNotification,
  MongoUserBlock,
  MongoContentReport,
  CreatePostParams,
  CreateCommentParams,
  ReactionToggleResult,
} from '../types/mongoSocial.js';

/**
 * Generate UUID for new documents
 */
function generateId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// PROFILES (MongoDB - Flexible/Social Data)
// ============================================================================

/**
 * Get user profile from MongoDB
 * Contains: displayName, username, bio, headline, skills, specialties, genres,
 *          instruments, software, location, portfolioUrls, stats, settings, avatarUrl, bannerUrl
 */
export async function getProfile(userId: string): Promise<any> {
  if (!isMongoDbAvailable()) {
    console.warn('MongoDB not available');
    return null;
  }

  try {
    const db = getMongoDb();
    if (!db) return null;

    const profile = await db.collection('profiles').findOne({ _id: userId });
    return profile;
  } catch (error) {
    console.error('Error getting profile from MongoDB:', error);
    return null;
  }
}

/**
 * Create or update user profile in MongoDB
 */
export async function upsertProfile(userId: string, updates: any): Promise<any> {
  if (!isMongoDbAvailable()) {
    console.warn('MongoDB not available');
    return null;
  }

  try {
    const db = getMongoDb();
    if (!db) return null;

    const result = await db.collection('profiles').updateOne(
      { _id: userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // Return the updated profile
    return await getProfile(userId);
  } catch (error) {
    console.error('Error upserting profile in MongoDB:', error);
    return null;
  }
}

/**
 * Update user's last active timestamp
 */
export async function updateLastActive(userId: string): Promise<void> {
  if (!isMongoDbAvailable()) {
    console.warn('MongoDB not available');
    return;
  }

  try {
    const db = getMongoDb();
    if (!db) return;

    await db.collection('profiles').updateOne(
      { _id: userId },
      { $set: { lastActiveAt: new Date() } }
    );
  } catch (error) {
    console.error('Error updating last active:', error);
  }
}


// ============================================================================
// POSTS
// ============================================================================

/**
 * Get posts with optional filtering
 */
export async function getPosts(
  filter: {
    author_id?: string;
    category?: string;
    visibility?: 'public' | 'followers' | 'private';
    hashtag?: string;
    parent_id?: string | null;
    limit?: number;
    skip?: number;
  } = {}
): Promise<MongoPost[]> {
  if (!isMongoDbAvailable()) return [];

  const { limit = 20, skip = 0, ...queryFilter } = filter;
  const db = getMongoDb();

  if (!db) return [];

  const query: any = { deleted_at: null };

  if (queryFilter.author_id) query.author_id = queryFilter.author_id;
  if (queryFilter.category) query.category = queryFilter.category;
  if (queryFilter.visibility) query.visibility = queryFilter.visibility;
  if (queryFilter.hashtag) query.hashtags = queryFilter.hashtag;
  if (queryFilter.parent_id !== undefined) query.parent_id = queryFilter.parent_id;

  return await db
    .collection<MongoPost>('posts')
    .find(query)
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip)
    .toArray();
}

/**
 * Get a single post by ID
 */
export async function getPostById(postId: string): Promise<MongoPost | null> {
  if (!isMongoDbAvailable()) return null;

  const db = getMongoDb();
  if (!db) return null;

  return await db.collection<MongoPost>('posts').findOne({
    id: postId,
    deleted_at: null,
  });
}

/**
 * Create a new post
 */
export async function createPost(params: CreatePostParams): Promise<MongoPost> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  // Extract hashtags and mentions from content
  const hashtags = (params.content.match(/#\w+/g) || []).map(tag => tag.slice(1));
  const mentions = (params.content.match(/@\w+/g) || []).map((mention) => mention.slice(1));

  const post: MongoPost = {
    id: generateId(),
    author_id: params.author_id,
    content: params.content,
    media_urls: params.media_urls || [],
    hashtags,
    mentions,
    category: params.category,
    visibility: params.visibility || 'public',
    parent_id: params.parent_id || null,
    repost_of: params.repost_of || null,
    engagement: {
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0,
      saves_count: 0,
    },
    metadata: {
      equipment: params.equipment,
      software: params.software,
      custom_fields: params.custom_fields,
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  await db.collection<MongoPost>('posts').insertOne(post);
  return post;
}

/**
 * Update an existing post
 */
export async function updatePost(
  postId: string,
  updates: Partial<Pick<MongoPost, 'content' | 'media_urls' | 'category' | 'visibility'>>
): Promise<MongoPost | null> {
  if (!isMongoDbAvailable()) return null;

  const db = getMongoDb();
  if (!db) return null;

  // Re-extract hashtags and mentions if content is updated
  const updateData: any = { ...updates, updated_at: new Date() };
  if (updates.content) {
    updateData.hashtags = (updates.content.match(/#\w+/g) || []).map(tag => tag.slice(1));
    updateData.mentions = (updates.content.match(/@\w+/g) || []).map(mention => mention.slice(1));
  }

  const result = await db
    .collection<MongoPost>('posts')
    .findOneAndUpdate(
      { id: postId, deleted_at: null },
      { $set: updateData },
      { returnDocument: 'after' }
    );

  return result;
}

/**
 * Soft delete a post
 */
export async function deletePost(postId: string): Promise<boolean> {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  const result = await db
    .collection<MongoPost>('posts')
    .updateOne({ id: postId }, { $set: { deleted_at: new Date() } });

  return result.modifiedCount > 0;
}

/**
 * Increment post engagement counters
 */
export async function incrementEngagement(
  postId: string,
  type: 'likes_count' | 'comments_count' | 'reposts_count' | 'saves_count',
  amount: number = 1
): Promise<void> {
  if (!isMongoDbAvailable()) return;

  const db = getMongoDb();
  if (!db) return;

  await db
    .collection<MongoPost>('posts')
    .updateOne({ id: postId }, { $inc: { [`engagement.${type}`]: amount } });
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Get comments for a post
 */
export async function getComments(postId: string): Promise<MongoComment[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  return await db
    .collection<MongoComment>('comments')
    .find({ post_id: postId, deleted_at: null })
    .sort({ created_at: 1 })
    .toArray();
}

/**
 * Get nested replies for a comment
 */
export async function getCommentReplies(parentId: string): Promise<MongoComment[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  return await db
    .collection<MongoComment>('comments')
    .find({ parent_id: parentId, deleted_at: null })
    .sort({ created_at: 1 })
    .toArray();
}

/**
 * Create a new comment
 */
export async function createComment(params: CreateCommentParams): Promise<MongoComment> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  const comment: MongoComment = {
    id: generateId(),
    post_id: params.post_id,
    author_id: params.author_id,
    content: params.content,
    parent_id: params.parent_id || null,
    reactions: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  await db.collection<MongoComment>('comments').insertOne(comment);

  // Increment post comment count
  await incrementEngagement(params.post_id, 'comments_count');

  return comment;
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<MongoComment | null> {
  if (!isMongoDbAvailable()) return null;

  const db = getMongoDb();
  if (!db) return null;

  const result = await db
    .collection<MongoComment>('comments')
    .findOneAndUpdate(
      { id: commentId, deleted_at: null },
      { $set: { content, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

  return result;
}

/**
 * Soft delete a comment
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  const result = await db
    .collection<MongoComment>('comments')
    .updateOne({ id: commentId }, { $set: { deleted_at: new Date() } });

  return result.modifiedCount > 0;
}

// ============================================================================
// REACTIONS
// ============================================================================

/**
 * Get reactions for a target (post or comment)
 */
export async function getReactions(
  targetId: string,
  targetType: 'post' | 'comment'
): Promise<MongoReaction[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  return await db
    .collection<MongoReaction>('reactions')
    .find({ target_id: targetId, target_type: targetType })
    .toArray();
}

/**
 * Get reaction summary grouped by emoji
 */
export async function getReactionSummary(
  targetId: string,
  targetType: 'post' | 'comment'
): Promise<Record<string, { count: number; users: string[] }>> {
  const reactions = await getReactions(targetId, targetType);
  const summary: Record<string, { count: number; users: string[] }> = {};

  for (const reaction of reactions) {
    if (!summary[reaction.emoji]) {
      summary[reaction.emoji] = { count: 0, users: [] };
    }
    summary[reaction.emoji].count++;
    summary[reaction.emoji].users.push(reaction.user_id);
  }

  return summary;
}

/**
 * Get a user's reaction on a target
 */
export async function getUserReaction(
  targetId: string,
  targetType: 'post' | 'comment',
  userId: string
): Promise<MongoReaction | null> {
  if (!isMongoDbAvailable()) return null;

  const db = getMongoDb();
  if (!db) return null;

  return await db
    .collection<MongoReaction>('reactions')
    .findOne({ target_id: targetId, target_type: targetType, user_id: userId });
}

/**
 * Toggle a reaction (add if not exists, remove if exists)
 */
export async function toggleReaction(
  targetId: string,
  targetType: 'post' | 'comment',
  emoji: string,
  userId: string
): Promise<ReactionToggleResult> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  const existing = await getUserReaction(targetId, targetType, userId);

  if (existing) {
    // Remove existing reaction
    await db
      .collection<MongoReaction>('reactions')
      .deleteOne({ _id: existing._id });

    // Decrement like count if it's a post
    if (targetType === 'post') {
      await incrementEngagement(targetId, 'likes_count', -1);
    }

    return { action: 'removed', emoji: existing.emoji };
  } else {
    // Add new reaction
    const reaction: MongoReaction = {
      target_id: targetId,
      target_type: targetType,
      emoji,
      user_id: userId,
      created_at: new Date(),
    };

    await db.collection<MongoReaction>('reactions').insertOne(reaction);

    // Increment like count if it's a post
    if (targetType === 'post') {
      await incrementEngagement(targetId, 'likes_count');
    }

    return { action: 'added', emoji };
  }
}

/**
 * Remove all reactions for a target
 */
export async function clearTargetReactions(
  targetId: string,
  targetType: 'post' | 'comment'
): Promise<number> {
  if (!isMongoDbAvailable()) return 0;

  const db = getMongoDb();
  if (!db) return 0;

  const result = await db
    .collection<MongoReaction>('reactions')
    .deleteMany({ target_id: targetId, target_type: targetType });

  return result.deletedCount;
}

// ============================================================================
// FOLLOWS
// ============================================================================

/**
 * Get list of user IDs that a user is following
 */
export async function getFollowing(userId: string): Promise<string[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  const follows = await db
    .collection<MongoFollow>('follows')
    .find({ follower_id: userId })
    .toArray();

  return follows.map(f => f.following_id);
}

/**
 * Get list of user IDs that follow a user
 */
export async function getFollowers(userId: string): Promise<string[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  const follows = await db
    .collection<MongoFollow>('follows')
    .find({ following_id: userId })
    .toArray();

  return follows.map(f => f.follower_id);
}

/**
 * Get following count
 */
export async function getFollowingCount(userId: string): Promise<number> {
  if (!isMongoDbAvailable()) return 0;

  const db = getMongoDb();
  if (!db) return 0;

  return await db.collection<MongoFollow>('follows').countDocuments({ follower_id: userId });
}

/**
 * Get followers count
 */
export async function getFollowersCount(userId: string): Promise<number> {
  if (!isMongoDbAvailable()) return 0;

  const db = getMongoDb();
  if (!db) return 0;

  return await db.collection<MongoFollow>('follows').countDocuments({ following_id: userId });
}

/**
 * Check if user A follows user B
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  const follow = await db
    .collection<MongoFollow>('follows')
    .findOne({ follower_id: followerId, following_id: followingId });

  return follow !== null;
}

/**
 * Follow a user
 */
export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  await db.collection<MongoFollow>('follows').insertOne({
    follower_id: followerId,
    following_id: followingId,
    created_at: new Date(),
  });
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  await db
    .collection<MongoFollow>('follows')
    .deleteOne({ follower_id: followerId, following_id: followingId });
}

// ============================================================================
// SAVED POSTS
// ============================================================================

/**
 * Get saved posts for a user
 */
export async function getSavedPosts(userId: string, limit: number = 50): Promise<MongoSavedPost[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  return await db
    .collection<MongoSavedPost>('saved_posts')
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Check if a post is saved by a user
 */
export async function isPostSaved(userId: string, postId: string): Promise<boolean> {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  const saved = await db
    .collection<MongoSavedPost>('saved_posts')
    .findOne({ user_id: userId, post_id: postId });

  return saved !== null;
}

/**
 * Save a post
 */
export async function savePost(userId: string, postId: string): Promise<void> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  await db.collection<MongoSavedPost>('saved_posts').insertOne({
    user_id: userId,
    post_id: postId,
    created_at: new Date(),
  });

  // Increment save count
  await incrementEngagement(postId, 'saves_count');
}

/**
 * Unsave a post
 */
export async function unsavePost(userId: string, postId: string): Promise<void> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  await db
    .collection<MongoSavedPost>('saved_posts')
    .deleteOne({ user_id: userId, post_id: postId });

  // Decrement save count
  await incrementEngagement(postId, 'saves_count', -1);
}

// ============================================================================
// SOCIAL NOTIFICATIONS
// ============================================================================

/**
 * Get social notifications for a user
 */
export async function getSocialNotifications(
  userId: string,
  limit: number = 20
): Promise<MongoSocialNotification[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  return await db
    .collection<MongoSocialNotification>('social_notifications')
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!isMongoDbAvailable()) return 0;

  const db = getMongoDb();
  if (!db) return 0;

  return await db
    .collection<MongoSocialNotification>('social_notifications')
    .countDocuments({ user_id: userId, read: false });
}

/**
 * Create a social notification
 */
export async function createSocialNotification(
  notification: Omit<MongoSocialNotification, '_id' | 'id' | 'read' | 'created_at'>
): Promise<void> {
  if (!isMongoDbAvailable()) return;

  const db = getMongoDb();
  if (!db) return;

  await db.collection<MongoSocialNotification>('social_notifications').insertOne({
    ...notification,
    read: false,
    created_at: new Date(),
  });
}

/**
 * Mark notifications as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  if (!isMongoDbAvailable()) return;

  const db = getMongoDb();
  if (!db) return;

  await db
    .collection<MongoSocialNotification>('social_notifications')
    .updateOne(
      { id: notificationId },
      { $set: { read: true, read_at: new Date() } }
    );
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!isMongoDbAvailable()) return;

  const db = getMongoDb();
  if (!db) return;

  await db
    .collection<MongoSocialNotification>('social_notifications')
    .updateMany(
      { user_id: userId, read: false },
      { $set: { read: true, read_at: new Date() } }
    );
}

// ============================================================================
// USER BLOCKS
// ============================================================================

/**
 * Block a user
 */
export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  await db.collection<MongoUserBlock>('user_blocks').insertOne({
    blocker_id: blockerId,
    blocked_id: blockedId,
    created_at: new Date(),
  });
}

/**
 * Unblock a user
 */
export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  await db
    .collection<MongoUserBlock>('user_blocks')
    .deleteOne({ blocker_id: blockerId, blocked_id: blockedId });
}

/**
 * Check if user A has blocked user B
 */
export async function hasBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  const block = await db
    .collection<MongoUserBlock>('user_blocks')
    .findOne({ blocker_id: blockerId, blocked_id: blockedId });

  return block !== null;
}

/**
 * Get list of blocked user IDs
 */
export async function getBlockedUsers(userId: string): Promise<string[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  const blocks = await db
    .collection<MongoUserBlock>('user_blocks')
    .find({ blocker_id: userId })
    .toArray();

  return blocks.map(b => b.blocked_id);
}

// ============================================================================
// CONTENT REPORTS
// ============================================================================

/**
 * Create a content report
 */
export async function createContentReport(report: Omit<MongoContentReport, '_id' | 'id' | 'status' | 'created_at'>): Promise<void> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  await db.collection<MongoContentReport>('content_reports').insertOne({
    ...report,
    status: 'pending',
    created_at: new Date(),
  });
}

/**
 * Get reports for a target
 */
export async function getContentReports(
  targetId: string,
  targetType: 'post' | 'comment' | 'user'
): Promise<MongoContentReport[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  return await db
    .collection<MongoContentReport>('content_reports')
    .find({ target_id: targetId, target_type: targetType })
    .sort({ created_at: -1 })
    .toArray();
}

// ============================================================================
// LEGACY ALIASES (for backward compatibility)
// ============================================================================

/**
 * Alias for isPostSaved for backward compatibility
 */
export async function checkIsSaved(userId: string, postId: string): Promise<boolean> {
  return await isPostSaved(userId, postId);
}

/**
 * Alias for incrementEngagement (saves) for backward compatibility
 */
export async function updatePostSaveCount(postId: string, increment: number): Promise<void> {
  await incrementEngagement(postId, 'saves_count', increment);
}

/**
 * Alias for incrementEngagement (comments) for backward compatibility
 */
export async function updatePostCommentCount(postId: string, increment: number): Promise<void> {
  await incrementEngagement(postId, 'comments_count', increment);
}

/**
 * Alias for incrementEngagement (likes) for backward compatibility
 */
export async function updatePostLikeCount(postId: string, increment: number): Promise<void> {
  await incrementEngagement(postId, 'likes_count', increment);
}

// ============================================================================
// REPOSTS
// ============================================================================

/**
 * Check if a user has reposted a post
 */
export async function hasUserReposted(userId: string, postId: string): Promise<boolean> {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  const repost = await db.collection<MongoPost>('posts').findOne({
    author_id: userId,
    repost_of: postId,
    deleted_at: null,
  });

  return repost !== null;
}

/**
 * Repost a post
 */
export async function repostPost(
  originalPostId: string,
  userId: string,
  comment?: string
): Promise<MongoPost> {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  // Get the original post
  const originalPost = await getPostById(originalPostId);
  if (!originalPost) {
    throw new Error('Original post not found');
  }

  // Check if user already reposted
  const existingRepost = await hasUserReposted(userId, originalPostId);
  if (existingRepost) {
    throw new Error('User has already reposted this post');
  }

  // Create repost
  const repost: MongoPost = {
    id: generateId(),
    author_id: userId,
    content: comment || '',
    media_urls: originalPost.media_urls || [],
    hashtags: originalPost.hashtags || [],
    mentions: originalPost.mentions || [],
    category: originalPost.category,
    visibility: originalPost.visibility,
    parent_id: null,
    repost_of: originalPostId,
    engagement: {
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0,
      saves_count: 0,
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  await db.collection<MongoPost>('posts').insertOne(repost);

  // Increment repost count on original post
  await incrementEngagement(originalPostId, 'reposts_count');

  return repost;
}

/**
 * Unrepost a post (delete the repost)
 */
export async function unrepostPost(repostId: string): Promise<boolean> {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  const repost = await getPostById(repostId);
  if (!repost || !repost.repost_of) {
    return false;
  }

  const result = await db.collection<MongoPost>('posts').updateOne(
    { id: repostId },
    { $set: { deleted_at: new Date() } }
  );

  if (result.modifiedCount > 0) {
    // Decrement repost count on original post
    await incrementEngagement(repost.repost_of, 'reposts_count', -1);
    return true;
  }

  return false;
}

// ============================================================================
// PROFILE SEARCH
// ============================================================================

/**
 * Search profiles by skills, location, or text
 */
export async function searchProfiles(query: {
  skills?: string[];
  location?: { coordinates: [number, number]; maxDistance?: number };
  searchText?: string;
  limit?: number;
}): Promise<any[]> {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  const { skills, location, searchText, limit = 20 } = query;
  const filter: any = {};

  // Skills filter
  if (skills && skills.length > 0) {
    filter.skills = { $in: skills };
  }

  // Location filter (geospatial)
  if (location) {
    filter['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: location.coordinates,
        },
        $maxDistance: location.maxDistance || 50000, // 50km default
      }
    };
  }

  // Text search
  if (searchText) {
    filter.$text = { $search: searchText };
  }

  return await db
    .collection('profiles')
    .find(filter)
    .sort({ 'stats.followersCount': -1 })
    .limit(limit)
    .toArray();
}

/**
 * Get multiple profiles by IDs (batch operation)
 */
export async function getProfilesByIds(userIds: string[]): Promise<any[]> {
  if (!isMongoDbAvailable() || userIds.length === 0) return [];

  try {
    const db = getMongoDb();
    if (!db) return [];

    const profiles = await db
      .collection('profiles')
      .find({ _id: { $in: userIds } })
      .toArray();

    return profiles;
  } catch (error) {
    console.error('Error getting profiles by IDs:', error);
    return [];
  }
}
