/**
 * Real-time Posts Hook using Convex
 *
 * Replaces Socket.IO for real-time post updates
 * Works seamlessly with Vercel deployment
 */

import { useEffect, useMemo, useRef, useCallback } from 'react';
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
    if (!convexPosts || !Array.isArray(convexPosts)) {
      return [];
    }

    return convexPosts.map((convexPost: any): Post => ({
      id: convexPost._id,
      userId: convexPost.authorId,
      displayName: convexPost.displayName || convexPost.authorName || '[Deleted User]',
      photoURL: convexPost.authorPhoto,
      text: convexPost.content || '',
      imageUrl: convexPost.mediaUrls?.[0] || convexPost.mediaAttachments?.[0]?.url,
      timestamp: convexPost.createdAt || Date.now(),
      commentCount: convexPost.engagement?.commentsCount || 0,
      reactions: {},
    }));
  }, [convexPosts]);

  // Use a ref for onNewPost to prevent infinite re-renders if the callback is unstable
  const onNewPostRef = useRef(onNewPost);
  useEffect(() => {
    onNewPostRef.current = onNewPost;
  }, [onNewPost]);

  // Track the last seen post ID to only notify about actually new posts
  const lastPostIdRef = useRef<string | null>(null);

  // Call onNewPost callback when new posts are received
  useEffect(() => {
    if (onNewPostRef.current && posts.length > 0) {
      const newestPost = posts[0];
      if (newestPost.id !== lastPostIdRef.current) {
        lastPostIdRef.current = newestPost.id;
        onNewPostRef.current(newestPost);
      }
    }
  }, [posts]);

  return useMemo(() => ({
    posts,
    isLoading: convexPosts === undefined,
    error: null,
    isConnected,
  }), [posts, convexPosts, isConnected]);
}

