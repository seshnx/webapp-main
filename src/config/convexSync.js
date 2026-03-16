/**
 * Convex Sync Helper
 *
 * Utility functions for syncing data from MongoDB/Neon to Convex
 * Used by API endpoints to trigger real-time updates
 */

import { convex } from './convex.js';

/**
 * Sync a new post to Convex for real-time updates
 */
export async function syncPostToConvex(post) {
  try {
    if (!convex) {
      console.warn('Convex not available - skipping post sync');
      return;
    }

    await convex.mutation('posts.syncPost', {
      postId: post.id,
      userId: post.author_id || post.user_id,
      displayName: post.display_name || post.username,
      authorPhoto: post.author_photo || post.profile_photo_url,
      username: post.username,
      content: post.content,
      media: post.media_urls || post.media,
      createdAt: new Date(post.created_at).getTime(),
      updatedAt: post.updated_at ? new Date(post.updated_at).getTime() : undefined,
      commentCount: post.comment_count || 0,
      reactionCount: post.reaction_count || 0,
      saveCount: post.save_count || 0,
      role: post.posted_as_role || post.role,
    });

    console.log('✅ Post synced to Convex:', post.id);
  } catch (error) {
    console.error('Failed to sync post to Convex:', error);
  }
}

/**
 * Sync a new comment to Convex for real-time updates
 */
export async function syncCommentToConvex(comment) {
  try {
    if (!convex) {
      console.warn('Convex not available - skipping comment sync');
      return;
    }

    await convex.mutation('comments.syncComment', {
      commentId: comment.id,
      postId: comment.post_id,
      userId: comment.author_id || comment.user_id,
      content: comment.content,
      displayName: comment.display_name || comment.username,
      authorPhoto: comment.author_photo || comment.profile_photo_url,
      parentId: comment.parent_id,
      reactionCount: comment.reaction_count || 0,
      createdAt: new Date(comment.created_at).getTime(),
      updatedAt: comment.updated_at ? new Date(comment.updated_at).getTime() : undefined,
    });

    console.log('✅ Comment synced to Convex:', comment.id);
  } catch (error) {
    console.error('Failed to sync comment to Convex:', error);
  }
}

/**
 * Sync a reaction to Convex for real-time updates
 */
export async function syncReactionToConvex(reaction) {
  try {
    if (!convex) {
      console.warn('Convex not available - skipping reaction sync');
      return;
    }

    await convex.mutation('reactions.syncReaction', {
      targetId: reaction.target_id,
      targetType: reaction.target_type, // 'post' or 'comment'
      userId: reaction.user_id,
      emoji: reaction.emoji,
      timestamp: new Date(reaction.created_at).getTime(),
    });

    console.log('✅ Reaction synced to Convex:', reaction.target_id);
  } catch (error) {
    console.error('Failed to sync reaction to Convex:', error);
  }
}

/**
 * Remove a reaction from Convex
 */
export async function removeReactionFromConvex(targetId, targetType, userId) {
  try {
    if (!convex) {
      console.warn('Convex not available - skipping reaction removal');
      return;
    }

    await convex.mutation('reactions.removeReaction', {
      targetId,
      targetType,
      userId,
    });

    console.log('✅ Reaction removed from Convex:', targetId);
  } catch (error) {
    console.error('Failed to remove reaction from Convex:', error);
  }
}

/**
 * Sync a follow relationship to Convex for real-time updates
 */
export async function syncFollowToConvex(followerId, followingId, createdAt) {
  try {
    if (!convex) {
      console.warn('Convex not available - skipping follow sync');
      return;
    }

    await convex.mutation('follows.syncFollow', {
      followerId,
      followingId,
      createdAt: createdAt ? new Date(createdAt).getTime() : Date.now(),
    });

    console.log('✅ Follow synced to Convex:', followerId, '->', followingId);
  } catch (error) {
    console.error('Failed to sync follow to Convex:', error);
  }
}

/**
 * Remove a follow relationship from Convex
 */
export async function removeFollowFromConvex(followerId, followingId) {
  try {
    if (!convex) {
      console.warn('Convex not available - skipping follow removal');
      return;
    }

    await convex.mutation('follows.removeFollow', {
      followerId,
      followingId,
    });

    console.log('✅ Follow removed from Convex:', followerId, '->', followingId);
  } catch (error) {
    console.error('Failed to remove follow from Convex:', error);
  }
}

/**
 * Update post comment count in Convex
 */
export async function updatePostCommentCountConvex(postId, count) {
  try {
    if (!convex) {
      return;
    }

    await convex.mutation('posts.updateCommentCount', {
      postId,
      commentCount: count,
    });
  } catch (error) {
    console.error('Failed to update comment count in Convex:', error);
  }
}

/**
 * Update post reaction count in Convex
 */
export async function updatePostReactionCountConvex(postId, count) {
  try {
    if (!convex) {
      return;
    }

    await convex.mutation('posts.updateReactionCount', {
      postId,
      reactionCount: count,
    });
  } catch (error) {
    console.error('Failed to update reaction count in Convex:', error);
  }
}
