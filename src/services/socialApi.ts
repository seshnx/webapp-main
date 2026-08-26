/**
 * Social API Service - Convex Only
 *
 * All social features now use Convex for real-time updates.
 * Direct Convex mutations and queries - no API endpoints needed.
 */

import { api } from '../../convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import { useMemo } from 'react';
import type { Id } from '../../convex/_generated/dataModel';

// =====================================================
// POST QUERIES
// =====================================================

/**
 * Get main feed
 */
export function useFeed(category?: string, limit = 20, skip = 0) {
  return useQuery(api.social.getFeed, {
    category: category || "All",
    limit,
    skip,
  });
}

/**
 * Get home feed (following + own posts)
 */
export function useHomeFeed(userId: string | undefined, limit = 20, skip = 0) {
  return useQuery(
    api.social.getHomeFeed,
    userId ? { userId, limit, skip } : "skip"
  );
}

/**
 * Get trending posts
 */
export function useTrendingPosts(limit = 10) {
  return useQuery(api.social.getTrendingPosts, { limit });
}

/**
 * Search posts
 */
export function useSearchPosts(searchQuery: string, limit = 20) {
  return useQuery(
    api.social.searchPosts,
    searchQuery ? { searchQuery, limit } : "skip"
  );
}

/**
 * Get posts by author
 */
export function usePostsByAuthor(clerkId: string | undefined, limit = 20, skip = 0) {
  return useQuery(
    api.social.getPostsByAuthor,
    clerkId ? { clerkId, limit, skip } : "skip"
  );
}

/**
 * Get posts by category
 */
export function usePostsByCategory(category: string, limit = 20, skip = 0) {
  return useQuery(api.social.getPostsByCategory, { category, limit, skip });
}

/**
 * Get single post
 */
export function usePost(postId: string | undefined) {
  return useQuery(
    api.social.getPost,
    postId ? { postId: postId as Id<"posts"> } : "skip"
  );
}

// =====================================================
// POST MUTATIONS
// =====================================================

/**
 * Hook for post mutations
 */
export function usePostMutations() {
  const create = useMutation(api.social.createPost);
  const remove = useMutation(api.social.deletePost);
  const repost = useMutation(api.social.repostPost);
  const update = useMutation(api.social.updatePost);

  return useMemo(() => ({
    create,
    remove,
    repost,
    update,
  }), [create, remove, repost, update]);
}

// =====================================================
// COMMENT QUERIES
// =====================================================

/**
 * Get comments for a post
 */
export function useComments(postId: string | undefined, limit = 50, skip = 0) {
  return useQuery(
    api.social.getComments,
    postId ? { postId: postId as Id<"posts">, limit, skip } : "skip"
  );
}

/**
 * Get replies for a comment
 */
export function useReplies(commentId: string | undefined, limit = 20, skip = 0) {
  return useQuery(
    api.social.getReplies,
    commentId ? { commentId: commentId as Id<"comments">, limit, skip } : "skip"
  );
}

// =====================================================
// COMMENT MUTATIONS
// =====================================================

/**
 * Hook for comment mutations
 */
export function useCommentMutations() {
  const create = useMutation(api.social.createComment);
  const remove = useMutation(api.social.deleteComment);

  return useMemo(() => ({
    create,
    remove,
  }), [create, remove]);
}

// =====================================================
// REACTION QUERIES
// =====================================================

/**
 * Get reactions for a post or comment
 */
export function useReactions(targetId: string | undefined, targetType: 'post' | 'comment') {
  const reactions = useQuery(
    api.social.getReactions,
    targetId ? { targetId, targetType } : "skip"
  );
  return useMemo(() => ({
    reactions: reactions ?? [],
    loading: reactions === undefined,
  }), [reactions]);
}

/**
 * Check if user reacted to a post/comment
 */
export function useUserReaction(
  userId: string | undefined,
  targetId: string | undefined,
  targetType: 'post' | 'comment'
) {
  const reaction = useQuery(
    api.social.hasReacted,
    (userId && targetId) ? { clerkId: userId, targetId, targetType } : "skip"
  );
  return useMemo(() => ({
    reacted: !!reaction,
    emoji: null,
    loading: reaction === undefined,
  }), [reaction]);
}

// =====================================================
// REACTION MUTATIONS
// =====================================================

/**
 * Hook for reaction mutations
 */
export function useReactionMutations() {
  const toggle = useMutation(api.social.toggleReaction);

  return useMemo(() => ({
    toggle,
  }), [toggle]);
}

// =====================================================
// FOLLOW QUERIES
// =====================================================

/**
 * Get followers for a user
 */
export function useFollowers(clerkId: string | undefined) {
  return useQuery(
    api.social.getFollowers,
    clerkId ? { clerkId } : "skip"
  );
}

/**
 * Get users the specified user is following
 */
export function useFollowing(clerkId: string | undefined) {
  return useQuery(
    api.social.getFollowing,
    clerkId ? { clerkId } : "skip"
  );
}

/**
 * Bulk get user profiles by Clerk IDs
 */
export function useUsersByIds(clerkIds: string[] | undefined) {
  return useQuery(
    api.social.getUsersByIds,
    clerkIds ? { clerkIds } : "skip"
  );
}

/**
 * Search users by Convex query
 */
export function useUserSearch(searchQuery: string | undefined) {
  return useQuery(
    api.social.searchUsers,
    searchQuery ? { searchQuery } : "skip"
  );
}

/**
 * Get trending hashtags
 */
export function useTrendingHashtags(limit?: number) {
  return useQuery(api.social.getTrendingHashtags, { limit });
}

/**
 * Search posts by hashtag
 */
export function usePostsByHashtag(hashtag: string | undefined) {
  return useQuery(
    api.social.getPostsByHashtag,
    hashtag ? { hashtag } : "skip"
  );
}

/**
 * Check if user is following another user
 */
export function useIsFollowing(
  followerClerkId: string | undefined,
  followingClerkId: string | undefined
) {
  return useQuery(
    api.social.isFollowing,
    (followerClerkId && followingClerkId)
      ? { followerClerkId, followingClerkId }
      : "skip"
  );
}

// =====================================================
// FOLLOW MUTATIONS
// =====================================================

/**
 * Hook for follow mutations
 */
export function useFollowMutations() {
  const follow = useMutation(api.social.followUser);
  const unfollow = useMutation(api.social.unfollowUser);

  return useMemo(() => ({
    follow,
    unfollow,
  }), [follow, unfollow]);
}

// =====================================================
// SAVED POSTS
// =====================================================

/**
 * Get saved posts for a user
 */
export function useSavedPosts(clerkId: string | undefined, limit = 20) {
  return useQuery(
    api.social.getSavedPosts,
    clerkId ? { clerkId, limit } : "skip"
  );
}

/**
 * Check if post is saved by user
 */
export function useIsPostSaved(clerkId: string | undefined, postId: string | undefined) {
  return useQuery(
    api.social.isSaved,
    (clerkId && postId)
      ? { clerkId, postId }
      : "skip"
  );
}

// =====================================================
// SAVED POSTS MUTATIONS
// =====================================================

/**
 * Hook for saved posts mutations
 */
export function useSavedPostsMutations() {
  const save = useMutation(api.social.savePost);
  const unsave = useMutation(api.social.unsavePost);

  return useMemo(() => ({
    save,
    unsave,
  }), [save, unsave]);
}

// =====================================================
// BLOCKED USERS
// =====================================================

/**
 * Get blocked users
 */
export function useBlockedUsers(clerkId: string | undefined) {
  return useQuery(
    api.social.getBlockedUsers,
    clerkId ? { clerkId } : "skip"
  );
}

// =====================================================
// BLOCKED USERS MUTATIONS
// =====================================================

/**
 * Hook for blocking mutations
 */
export function useBlockMutations() {
  const block = useMutation(api.social.blockUser);
  const unblock = useMutation(api.social.unblockUser);

  return useMemo(() => ({
    block,
    unblock,
  }), [block, unblock]);
}

// =====================================================
// LEGACY API FUNCTIONS (DEPRECATED)
// =====================================================
// These are kept for backward compatibility but should not be used

export async function getPosts(filters?: any, limit = 20, skip = 0) {
  console.warn('getPosts: Use useFeed or useHomeFeed hook instead');
  return [];
}

export async function createPost(postData: any) {
  console.warn('createPost: Use usePostMutations hook instead');
  return null;
}

export async function updatePost(postId: string, updates: any) {
  console.warn('updatePost: Not supported - delete and recreate instead');
  return null;
}

export async function deletePost(postId: string, authorId: string) {
  console.warn('deletePost: Use usePostMutations hook instead');
}

export async function getComments(postId: string) {
  console.warn('getComments: Use useComments hook instead');
  return [];
}

export async function createComment(commentData: any) {
  console.warn('createComment: Use useCommentMutations hook instead');
  return null;
}

export async function deleteComment(commentId: string) {
  console.warn('deleteComment: Use useCommentMutations hook instead');
}

export async function updateComment(commentId: string, content: string) {
  console.warn('updateComment: Not supported - delete and recreate instead');
  return null;
}

export async function toggleReaction(
  targetId: string,
  targetType: 'post' | 'comment',
  emoji: string,
  userId: string
) {
  console.warn('toggleReaction: Use useReactionMutations hook instead');
  return null;
}

export async function getReactions(targetId: string, targetType: 'post' | 'comment') {
  console.warn('getReactions: Use useReactions hook instead');
  return [];
}

export async function followUser(followerId: string, followingId: string) {
  console.warn('followUser: Use useFollowMutations hook instead');
  return null;
}

export async function unfollowUser(followerId: string, followingId: string) {
  console.warn('unfollowUser: Use useFollowMutations hook instead');
  return null;
}

export async function getFollowers(userId: string) {
  console.warn('getFollowers: Use useFollowers hook instead');
  return [];
}

export async function getFollowing(userId: string) {
  console.warn('getFollowing: Use useFollowing hook instead');
  return [];
}

export async function savePost(userId: string, postId: string) {
  console.warn('savePost: Use useSavedPostsMutations hook instead');
  return null;
}

export async function unsavePost(userId: string, postId: string) {
  console.warn('unsavePost: Use useSavedPostsMutations hook instead');
  return null;
}

export async function checkIsSaved(userId: string, postId: string): Promise<boolean> {
  console.warn('checkIsSaved: Use useIsPostSaved hook instead');
  return false;
}

export async function getSavedPostsList(userId: string) {
  console.warn('getSavedPostsList: Use useSavedPosts hook instead');
  return [];
}

export async function updatePostCommentCount(postId: string, increment: number) {
  console.warn('updatePostCommentCount: Use Convex mutation instead');
}

export async function updatePostSaveCount(postId: string, increment: number) {
  console.warn('updatePostSaveCount: Use Convex mutation instead');
}

export async function updatePostRepostCount(postId: string, increment: number) {
  console.warn('updatePostRepostCount: Use Convex mutation instead');
}

export async function updatePostReactionCount(postId: string, increment: number) {
  console.warn('updatePostReactionCount: Use Convex mutation instead');
}

export async function repostPost(postId: string, userId: string, comment?: string) {
  console.warn('repostPost: Use usePostMutations hook instead');
  return { id: 'stub-repost-id' };
}

export async function hasUserReposted(userId: string, postId: string): Promise<boolean> {
  console.warn('hasUserReposted: Check user posts instead');
  return false;
}

export async function isSocialApiAvailable(): Promise<boolean> {
  // Convex is always available
  return true;
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Queries (use these in components)
  useFeed,
  useHomeFeed,
  useTrendingPosts,
  useSearchPosts,
  usePostsByAuthor,
  usePostsByCategory,
  usePost,
  useComments,
  useReplies,
  useReactions,
  useUserReaction,
  useFollowers,
  useFollowing,
  useIsFollowing,
  useSavedPosts,
  useIsPostSaved,
  useBlockedUsers,
  useUsersByIds,
  useUserSearch,
  useTrendingHashtags,
  usePostsByHashtag,

  // Mutations (use these in components)
  usePostMutations,
  useCommentMutations,
  useReactionMutations,
  useFollowMutations,
  useSavedPostsMutations,
  useBlockMutations,

  // Legacy functions (deprecated)
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  deleteComment,
  updateComment,
  toggleReaction,
  getReactions,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  savePost,
  unsavePost,
  checkIsSaved,
  getSavedPostsList,
  repostPost,
  hasUserReposted,
  updatePostCommentCount,
  updatePostSaveCount,
  updatePostRepostCount,
  updatePostReactionCount,
  isSocialApiAvailable,
};
