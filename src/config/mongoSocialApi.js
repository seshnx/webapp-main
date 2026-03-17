/**
 * MongoDB Social Functions (JavaScript version for API routes)
 *
 * This is the JavaScript version of mongoSocial.ts for use in .mjs API routes.
 * Client-side code should use mongoSocial.ts (TypeScript version).
 */

import { ObjectId } from 'mongodb';
import { getMongoDb, isMongoDbAvailable, MONGO_COLLECTIONS } from './mongodbApi.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for social entities
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert MongoDB ObjectId to string
 */
function stringifyId(doc) {
  if (!doc) return null;
  if (doc._id) {
    doc.id = doc._id.toString();
    delete doc._id;
  }
  return doc;
}

// ============================================================================
// POSTS
// ============================================================================

/**
 * Get posts with optional filtering
 */
export async function getPosts(options = {}) {
  if (!isMongoDbAvailable()) return [];

  const {
    authorId,
    category,
    limit = 20,
    skip = 0
  } = options;

  const db = getMongoDb();
  if (!db) return [];

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);
    const query = {};

    if (authorId) {
      query.author_id = authorId;
    }

    if (category) {
      query.category = category;
    }

    const posts = await collection
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    return posts.map(stringifyId);
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
}

/**
 * Get a single post by ID
 */
export async function getPostById(postId) {
  if (!isMongoDbAvailable()) return null;

  const db = getMongoDb();
  if (!db) return null;

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);
    const post = await collection.findOne({ id: postId });
    return stringifyId(post);
  } catch (error) {
    console.error('Error getting post by ID:', error);
    return null;
  }
}

/**
 * Create a new post
 */
export async function createPost(data) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);

    const newPost = {
      id: generateId(),
      author_id: data.author_id,
      content: data.content || '',
      media_urls: data.media_urls || [],
      category: data.category || 'general',
      parent_id: data.parent_id || null,
      repost_of: data.repost_of || null,
      created_at: new Date(),
      updated_at: new Date(),
      reaction_count: 0,
      comment_count: 0,
      repost_count: 0,
      save_count: 0,
      display_name: data.display_name || '',
      author_photo: data.author_photo || '',
      posted_as_role: data.posted_as_role || 'Talent',
    };

    await collection.insertOne(newPost);
    return stringifyId(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

/**
 * Update a post
 */
export async function updatePost(postId, updates) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);

    const updateData = {
      ...updates,
      updated_at: new Date()
    };

    const result = await collection.findOneAndUpdate(
      { id: postId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return stringifyId(result.value);
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId, authorId) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);

    // Verify ownership before soft-deleting
    const post = await collection.findOne({ id: postId });
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.author_id !== authorId) {
      throw new Error('You can only delete your own posts');
    }

    // Soft delete by marking as deleted (better for data integrity)
    const result = await collection.updateOne(
      { id: postId, author_id: authorId },
      { $set: { deleted_at: new Date().toISOString() } }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Failed to delete post');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

/**
 * Check if user has reposted a post
 */
export async function hasUserReposted(userId, postId) {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);
    const repost = await collection.findOne({
      author_id: userId,
      repost_of: postId
    });
    return !!repost;
  } catch (error) {
    console.error('Error checking repost:', error);
    return false;
  }
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Get comments for a post
 */
export async function getComments(postId, options = {}) {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_COMMENTS);
    const query = { post_id: postId };

    const comments = await collection
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    return comments.map(stringifyId);
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

/**
 * Create a new comment
 */
export async function createComment(data) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_COMMENTS);

    const newComment = {
      id: generateId(),
      post_id: data.post_id,
      author_id: data.author_id,
      content: data.content,
      parent_id: data.parent_id || null,
      created_at: new Date(),
      updated_at: new Date(),
      likes: 0,
      display_name: data.display_name || '',
      author_photo: data.author_photo || '',
    };

    await collection.insertOne(newComment);

    // Update post comment count
    const postsCollection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);
    await postsCollection.findOneAndUpdate(
      { id: data.post_id },
      { $inc: { comment_count: 1 } }
    );

    return stringifyId(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

/**
 * Update a comment
 */
export async function updateComment(commentId, content) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_COMMENTS);

    const result = await collection.findOneAndUpdate(
      { id: commentId },
      {
        $set: {
          content,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return stringifyId(result.value);
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_COMMENTS);
    await collection.deleteOne({ id: commentId });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// ============================================================================
// REACTIONS
// ============================================================================

/**
 * Get reactions for a target
 */
export async function getReactions(targetId, targetType) {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_REACTIONS);
    const reactions = await collection.find({
      target_id: targetId,
      target_type: targetType
    }).toArray();

    return reactions.map(stringifyId);
  } catch (error) {
    console.error('Error getting reactions:', error);
    return [];
  }
}

/**
 * Get user's reaction for a target
 */
export async function getUserReaction(targetId, targetType, userId) {
  if (!isMongoDbAvailable()) return null;

  const db = getMongoDb();
  if (!db) return null;

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_REACTIONS);
    const reaction = await collection.findOne({
      target_id: targetId,
      target_type: targetType,
      user_id: userId
    });
    return stringifyId(reaction);
  } catch (error) {
    console.error('Error getting user reaction:', error);
    return null;
  }
}

/**
 * Toggle a reaction (add if doesn't exist, remove if does)
 */
export async function toggleReaction(targetId, targetType, emoji, userId) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_REACTIONS);

    // Check if reaction already exists
    const existing = await collection.findOne({
      target_id: targetId,
      target_type: targetType,
      user_id: userId
    });

    if (existing) {
      // Remove existing reaction
      await collection.deleteOne({
        target_id: targetId,
        target_type: targetType,
        user_id: userId
      });

      // Decrement reaction count on target
      const targetCollection = targetType === 'post'
        ? MONGO_COLLECTIONS.SOCIAL_POSTS
        : MONGO_COLLECTIONS.SOCIAL_COMMENTS;

      await db.collection(targetCollection).findOneAndUpdate(
        { id: targetId },
        { $inc: { reaction_count: -1 } }
      );

      return { action: 'removed', reaction: existing };
    } else {
      // Add new reaction
      const newReaction = {
        id: generateId(),
        target_id: targetId,
        target_type: targetType,
        emoji,
        user_id: userId,
        created_at: new Date()
      };

      await collection.insertOne(newReaction);

      // Increment reaction count on target
      const targetCollection = targetType === 'post'
        ? MONGO_COLLECTIONS.SOCIAL_POSTS
        : MONGO_COLLECTIONS.SOCIAL_COMMENTS;

      await db.collection(targetCollection).findOneAndUpdate(
        { id: targetId },
        { $inc: { reaction_count: 1 } }
      );

      return { action: 'added', reaction: newReaction };
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    throw error;
  }
}

// ============================================================================
// FOLLOWS
// ============================================================================

/**
 * Follow a user
 */
export async function followUser(followerId, followingId) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_FOLLOWS);

    const follow = {
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date()
    };

    await collection.insertOne(follow);
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId, followingId) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_FOLLOWS);
    await collection.deleteOne({
      follower_id: followerId,
      following_id: followingId
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

/**
 * Get followers for a user
 */
export async function getFollowers(userId) {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_FOLLOWS);
    const followers = await collection.find({
      following_id: userId
    }).toArray();

    return followers.map(stringifyId);
  } catch (error) {
    console.error('Error getting followers:', error);
    return [];
  }
}

/**
 * Get users that a user is following
 */
export async function getFollowing(userId) {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_FOLLOWS);
    const following = await collection.find({
      follower_id: userId
    }).toArray();

    return following.map(stringifyId);
  } catch (error) {
    console.error('Error getting following:', error);
    return [];
  }
}

/**
 * Get followers count for a user
 */
export async function getFollowersCount(userId) {
  if (!isMongoDbAvailable()) return 0;

  const db = getMongoDb();
  if (!db) return 0;

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_FOLLOWS);
    const count = await collection.countDocuments({
      following_id: userId
    });
    return count;
  } catch (error) {
    console.error('Error getting followers count:', error);
    return 0;
  }
}

/**
 * Get following count for a user
 */
export async function getFollowingCount(userId) {
  if (!isMongoDbAvailable()) return 0;

  const db = getMongoDb();
  if (!db) return 0;

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_FOLLOWS);
    const count = await collection.countDocuments({
      follower_id: userId
    });
    return count;
  } catch (error) {
    console.error('Error getting following count:', error);
    return 0;
  }
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(followerId, followingId) {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_FOLLOWS);
    const follow = await collection.findOne({
      follower_id: followerId,
      following_id: followingId
    });
    return !!follow;
  } catch (error) {
    console.error('Error checking if following:', error);
    return false;
  }
}

// ============================================================================
// SAVED POSTS
// ============================================================================

/**
 * Save a post
 */
export async function savePost(userId, postId) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_SAVED);

    const saved = {
      user_id: userId,
      post_id: postId,
      created_at: new Date()
    };

    await collection.insertOne(saved);

    // Increment save count on post
    const postsCollection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);
    await postsCollection.findOneAndUpdate(
      { id: postId },
      { $inc: { save_count: 1 } }
    );
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
}

/**
 * Unsave a post
 */
export async function unsavePost(userId, postId) {
  if (!isMongoDbAvailable()) throw new Error('MongoDB not available');

  const db = getMongoDb();
  if (!db) throw new Error('MongoDB not available');

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_SAVED);
    await collection.deleteOne({
      user_id: userId,
      post_id: postId
    });

    // Decrement save count on post
    const postsCollection = db.collection(MONGO_COLLECTIONS.SOCIAL_POSTS);
    await postsCollection.findOneAndUpdate(
      { id: postId },
      { $inc: { save_count: -1 } }
    );
  } catch (error) {
    console.error('Error unsaving post:', error);
    throw error;
  }
}

/**
 * Get saved posts for a user
 */
export async function getSavedPosts(userId, limit = 50) {
  if (!isMongoDbAvailable()) return [];

  const db = getMongoDb();
  if (!db) return [];

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_SAVED);
    const saved = await collection.find({
      user_id: userId
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    return saved.map(stringifyId);
  } catch (error) {
    console.error('Error getting saved posts:', error);
    return [];
  }
}

/**
 * Check if a post is saved by a user
 */
export async function isPostSaved(userId, postId) {
  if (!isMongoDbAvailable()) return false;

  const db = getMongoDb();
  if (!db) return false;

  try {
    const collection = db.collection(MONGO_COLLECTIONS.SOCIAL_SAVED);
    const saved = await collection.findOne({
      user_id: userId,
      post_id: postId
    });
    return !!saved;
  } catch (error) {
    console.error('Error checking if post is saved:', error);
    return false;
  }
}