/**
 * Follow System Hook - Convex Only
 *
 * All follow operations now use Convex for real-time updates.
 * No more polling - everything is real-time!
 */

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated';
import { useMemo, useCallback } from 'react';

/**
 * User profile interface for follow system
 */
export interface FollowProfile {
  odId: string; // For backward compatibility
  userId: string;
  displayName: string;
  photoURL?: string | null;
  role?: string;
}

/**
 * Follow stats interface
 */
export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

/**
 * Follow operation result
 */
export interface FollowResult {
  success: boolean;
  error?: unknown;
}

/**
 * Hook for managing the social follow system
 * Now uses Convex real-time subscriptions - no polling needed!
 *
 * @param currentUserId - The authenticated user's Clerk ID
 * @returns Follow system state and operations
 *
 * @example
 * function Profile({ userId }) {
 *   const {
 *     following,
 *     followers,
 *     stats,
 *     isFollowing,
 *     followUser,
 *     unfollowUser,
 *     toggleFollow
 *   } = useFollowSystem(userId);
 *
 *   return (
 *     <div>
 *       <h2>Followers: {stats.followersCount}</h2>
 *       <button onClick={() => toggleFollow(userId)}>
 *         {isFollowing(userId) ? 'Unfollow' : 'Follow'}
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useFollowSystem(currentUserId: string | null | undefined) {
  // Get followers from Convex (real-time!)
  const followers = useQuery(
    api.social.getFollowers,
    currentUserId ? { userId: currentUserId } : "skip"
  );

  // Get following from Convex (real-time!)
  const following = useQuery(
    api.social.getFollowing,
    currentUserId ? { userId: currentUserId } : "skip"
  );

  // Mutations
  const followMutation = useMutation(api.social.followUser);
  const unfollowMutation = useMutation(api.social.unfollowUser);

  // Transform Convex data to FollowProfile format
  const followersList: FollowProfile[] = useMemo(() => {
    if (!followers) return [];

    return followers.map(f => ({
      odId: f.followerId,
      userId: f.followerId,
      displayName: f.followerName || 'Unknown',
      photoURL: f.followerPhoto || null,
      role: f.followerRole,
    }));
  }, [followers]);

  const followingList: FollowProfile[] = useMemo(() => {
    if (!following) return [];

    return following.map(f => ({
      odId: f.followingId,
      userId: f.followingId,
      displayName: f.followingName || 'Unknown',
      photoURL: f.followingPhoto || null,
      role: f.followingRole,
    }));
  }, [following]);

  // Stats from user data (could also be fetched from user stats)
  const stats: FollowStats = useMemo(() => ({
    followersCount: followersList.length,
    followingCount: followingList.length,
  }), [followersList.length, followingList.length]);

  const loading = followers === undefined || following === undefined;

  // Check if following a specific user
  const isFollowing = useCallback((targetUserId: string): boolean => {
    return followingList.some(f => f.userId === targetUserId);
  }, [followingList]);

  // Follow a user
  const followUser = useCallback(async (targetUserId: string): Promise<FollowResult> => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return { success: false };
    }

    try {
      await followMutation({
        followerId: currentUserId,
        followingId: targetUserId,
      });
      return { success: true };
    } catch (error) {
      console.error('Follow error:', error);
      return { success: false, error };
    }
  }, [currentUserId, followMutation]);

  // Unfollow a user
  const unfollowUser = useCallback(async (targetUserId: string): Promise<FollowResult> => {
    if (!currentUserId || !targetUserId) {
      return { success: false };
    }

    try {
      await unfollowMutation({
        followerId: currentUserId,
        followingId: targetUserId,
      });
      return { success: true };
    } catch (error) {
      console.error('Unfollow error:', error);
      return { success: false, error };
    }
  }, [currentUserId, unfollowMutation]);

  // Toggle follow/unfollow
  const toggleFollow = useCallback(async (targetUserId: string): Promise<FollowResult> => {
    if (isFollowing(targetUserId)) {
      return unfollowUser(targetUserId);
    } else {
      return followUser(targetUserId);
    }
  }, [isFollowing, followUser, unfollowUser]);

  // Get following IDs
  const getFollowingIds = useCallback((): string[] => {
    return followingList.map(f => f.userId);
  }, [followingList]);

  return {
    following: followingList,
    followers: followersList,
    stats,
    loading,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowingIds,
  };
}

/**
 * Hook for fetching social stats for a specific user (read-only)
 * Now uses Convex real-time subscriptions!
 *
 * @param userId - User Clerk ID to fetch stats for
 * @returns Stats and loading state
 *
 * @example
 * function UserStats({ userId }) {
 *   const { stats, loading } = useUserSocialStats(userId);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <p>{stats.followersCount} followers</p>
 *       <p>{stats.followingCount} following</p>
 *     </div>
 *   );
 * }
 */
export function useUserSocialStats(userId: string | null | undefined) {
  // Get user from Convex (includes stats)
  const user = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const stats: FollowStats = useMemo(() => ({
    followersCount: user?.stats?.followersCount || 0,
    followingCount: user?.stats?.followingCount || 0,
  }), [user]);

  return {
    stats,
    loading: user === undefined,
  };
}

/**
 * Hook for checking if current user follows another user
 * Now uses Convex real-time subscriptions!
 *
 * @param followerId - Current user's Clerk ID
 * @param followingId - Target user's Clerk ID
 * @returns Object with isFollowing boolean and loading state
 *
 * @example
 * function FollowButton({ currentUserId, targetUserId }) {
 *   const { isFollowing, loading } = useIsFollowing(currentUserId, targetUserId);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <button>
 *       {isFollowing ? 'Following' : 'Follow'}
 *     </button>
 *   );
 * }
 */
export function useIsFollowing(
  followerId: string | null | undefined,
  followingId: string | null | undefined
) {
  const isFollowingData = useQuery(
    api.social.isFollowing,
    (followerId && followingId)
      ? { followerId: followerId as any, followingId: followingId as any }
      : "skip"
  );

  return {
    isFollowing: isFollowingData?.isFollowing || false,
    loading: isFollowingData === undefined,
  };
}

/**
 * Hook for follow mutations only
 * Use this when you only need the follow/unfollow actions
 */
export function useFollowMutations() {
  const follow = useMutation(api.social.followUser);
  const unfollow = useMutation(api.social.unfollowUser);

  return {
    follow: async (followerId: string, followingId: string) => {
      try {
        await follow({
          followerId,
          followingId,
        });
        return { success: true };
      } catch (error) {
        console.error('Follow error:', error);
        return { success: false, error };
      }
    },

    unfollow: async (followerId: string, followingId: string) => {
      try {
        await unfollow({
          followerId,
          followingId,
        });
        return { success: true };
      } catch (error) {
        console.error('Unfollow error:', error);
        return { success: false, error };
      }
    },
  };
}
