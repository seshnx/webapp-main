/**
 * Real-time Posts Hook using Convex
 *
 * Replaces Socket.IO for real-time post updates
 * Works seamlessly with Vercel deployment
 */

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { isConvexAvailable } from '../config/convex';
import type { Post } from '../types';

interface UseRealtimePostsOptions {
  enabled?: boolean;
  userId?: string | null;
  followingIds?: string[];
  feedMode?: 'for_you' | 'following' | 'discover';
  onNewPost?: (post: Post) => void;
}

interface UseRealtimePostsResult {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
}

/**
 * Hook for real-time post updates using Convex
 *
 * @example
 * function SocialFeed() {
 *   const { posts, isLoading } = useRealtimePosts({
 *     userId: user.id,
 *     feedMode: 'for_you',
 *     followingIds: ['user1', 'user2']
 *   });
 *
 *   return <div>{posts.map(post => <PostCard key={post.id} {...post} />)}</div>;
 * }
 */
export function useRealtimePosts(
  options: UseRealtimePostsOptions = {}
): UseRealtimePostsResult {
  const {
    enabled = true,
    userId,
    followingIds = [],
    feedMode = 'for_you',
    onNewPost,
  } = options;

  const convexAvailable = isConvexAvailable();
  const isConnected = convexAvailable && enabled;

  // Determine query parameters based on feed mode
  const postsQuery = useMemo(() => {
    if (!enabled || !convexAvailable) {
      return 'skip';
    }

    if (feedMode === 'following' && followingIds.length > 0) {
      return { userIds: followingIds, limit: 50 };
    }

    return { limit: 50 };
  }, [enabled, convexAvailable, feedMode, followingIds]);

  // Query posts from Convex (real-time!)
  const convexPosts = useQuery(
    feedMode === 'following' && followingIds.length > 0
      ? api.posts.listByIds
      : api.posts.list,
    postsQuery === 'skip' ? 'skip' : postsQuery
  );

  // Convert Convex posts to app Post format
  const posts = useMemo(() => {
    if (!convexPosts || convexPosts === 'skip') {
      return [];
    }

    return convexPosts.map((convexPost: any) => ({
      id: convexPost.postId,
      userId: convexPost.userId,
      displayName: convexPost.displayName || 'Unknown User',
      authorPhoto: convexPost.authorPhoto,
      username: convexPost.username,
      text: convexPost.content,
      attachments: convexPost.media,
      timestamp: new Date(convexPost.createdAt).toISOString(),
      commentCount: convexPost.commentCount || 0,
      reactionCount: convexPost.reactionCount || 0,
      saveCount: convexPost.saveCount || 0,
      role: convexPost.role,
    }));
  }, [convexPosts]);

  // Call onNewPost callback when posts are received
  useEffect(() => {
    if (onNewPost && posts.length > 0) {
      // Notify about new posts (this could be optimized to only notify about actually new posts)
      onNewPost(posts[0]);
    }
  }, [posts, onNewPost]);

  return {
    posts,
    isLoading: convexPosts === undefined,
    error: null,
    isConnected,
  };
}

/**
 * Hook to sync a new post from MongoDB to Convex
 * Call this after creating a post in MongoDB
 */
export function useSyncPost() {
  const syncPostMutation = useMutation(api.posts.syncPost);

  const syncPost = async (
    post: {
      postId: string;
      userId: string;
      displayName?: string;
      authorPhoto?: string;
      username?: string;
      content?: string;
      media?: any[];
      createdAt: number;
      commentCount?: number;
      reactionCount?: number;
      saveCount?: number;
      role?: string;
    }
  ) => {
    try {
      await syncPostMutation(post);
      return { success: true };
    } catch (error) {
      console.error('Failed to sync post to Convex:', error);
      return { success: false, error };
    }
  };

  return syncPost;
}

/**
 * Hook to update post reaction count in real-time
 */
export function useUpdatePostReactionCount() {
  const updateMutation = useMutation(api.posts.updateReactionCount);

  const updateCount = async (postId: string, reactionCount: number) => {
    try {
      await updateMutation({ postId, reactionCount });
      return { success: true };
    } catch (error) {
      console.error('Failed to update reaction count:', error);
      return { success: false, error };
    }
  };

  return updateCount;
}

/**
 * Hook to update post comment count in real-time
 */
export function useUpdatePostCommentCount() {
  const updateMutation = useMutation(api.posts.updateCommentCount);

  const updateCount = async (postId: string, commentCount: number) => {
    try {
      await updateMutation({ postId, commentCount });
      return { success: true };
    } catch (error) {
      console.error('Failed to update comment count:', error);
      return { success: false, error };
    }
  };

  return updateCount;
}
