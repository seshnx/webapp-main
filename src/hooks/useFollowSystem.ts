import { useState, useEffect, useCallback } from 'react';
import {
  getFollowing,
  getFollowers,
  followUser as followUserQuery,
  unfollowUser as unfollowUserQuery,
  getFollowingCount,
  getFollowersCount,
  getProfilesByIds
} from '../config/neonQueries';

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
 * Hook for managing the social follow system (Neon Version)
 *
 * @param currentUserId - The authenticated user's ID
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
  const [following, setFollowing] = useState<FollowProfile[]>([]);
  const [followers, setFollowers] = useState<FollowProfile[]>([]);
  const [stats, setStats] = useState<FollowStats>({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Helper: Get detailed profiles for a list of IDs
  const fetchProfiles = async (userIds: string[]): Promise<FollowProfile[]> => {
    if (!userIds || userIds.length === 0) return [];

    try {
      const profiles = await getProfilesByIds(userIds);

      return profiles.map(p => ({
        odId: p.user_id || p.id || '',
        userId: p.user_id || p.id || '',
        displayName: p.display_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
        photoURL: p.avatar_url || p.photo_url || null,
        role: p.active_role || p.role
      }));
    } catch (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
  };

  const loadData = useCallback(async () => {
    if (!currentUserId) return;

    try {
      // 1. Get IDs of who I follow
      const followingIds = await getFollowing(currentUserId);
      const followingProfiles = await fetchProfiles(followingIds);
      setFollowing(followingProfiles);

      // 2. Get IDs of who follows me
      const followerIds = await getFollowers(currentUserId);
      const followerProfiles = await fetchProfiles(followerIds);
      setFollowers(followerProfiles);

      // 3. Stats
      setStats({
        followingCount: followingIds.length,
        followersCount: followerIds.length
      });

      setLoading(false);
    } catch (err) {
      console.error("Error loading follow data:", err);
      setLoading(false);
    }
  }, [currentUserId]);

  // Initial Load & Polling
  useEffect(() => {
    loadData();

    if (!currentUserId) return;

    // Set up polling to check for follow changes (every 30 seconds)
    const pollInterval = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [currentUserId, loadData]);

  const isFollowing = useCallback((targetUserId: string): boolean => {
    return following.some(f => f.odId === targetUserId);
  }, [following]);

  const followUser = useCallback(async (targetUserId: string): Promise<FollowResult> => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      return { success: false };
    }

    try {
      await followUserQuery(currentUserId, targetUserId);

      // Optimistic update
      loadData();
      return { success: true };
    } catch (error) {
      console.error('Follow error:', error);
      return { success: false, error };
    }
  }, [currentUserId, loadData]);

  const unfollowUser = useCallback(async (targetUserId: string): Promise<FollowResult> => {
    if (!currentUserId || !targetUserId) {
      return { success: false };
    }

    try {
      await unfollowUserQuery(currentUserId, targetUserId);

      // Optimistic update
      loadData();
      return { success: true };
    } catch (error) {
      console.error('Unfollow error:', error);
      return { success: false, error };
    }
  }, [currentUserId, loadData]);

  const toggleFollow = useCallback(async (targetUserId: string): Promise<FollowResult> => {
    if (isFollowing(targetUserId)) {
      return unfollowUser(targetUserId);
    } else {
      return followUser(targetUserId);
    }
  }, [isFollowing, followUser, unfollowUser]);

  const getFollowingIds = useCallback((): string[] => {
    return following.map(f => f.odId);
  }, [following]);

  return {
    following,
    followers,
    stats,
    loading,
    isFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowingIds
  };
}

/**
 * Hook for fetching social stats for a specific user (read-only)
 *
 * @param userId - User ID to fetch stats for
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
  const [stats, setStats] = useState<FollowStats>({ followersCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const [followers, following] = await Promise.all([
          getFollowersCount(userId),
          getFollowingCount(userId)
        ]);

        setStats({
          followersCount: followers,
          followingCount: following
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching social stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading };
}
