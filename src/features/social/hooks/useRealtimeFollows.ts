/**
 * Real-time Follows Hook using Convex
 *
 * Replaces Socket.IO for real-time follow events
 * Works seamlessly with Vercel deployment
 */

import { useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/api';
import { isConvexAvailable } from '@/config/convex';

interface UseRealtimeFollowsOptions {
  enabled?: boolean;
  userId?: string | null;
  onNewFollower?: (followerId: string) => void;
  onFollowChange?: () => void;
}

interface FollowStats {
  followerCount: number;
  followingCount: number;
  isLoading: boolean;
  isConnected: boolean;
}

/**
 * Hook for real-time follow updates using Convex
 *
 * @example
 * function ProfileHeader({ userId }) {
 *   const { followerCount, followingCount } = useRealtimeFollows({
 *     userId,
 *     onNewFollower: (followerId) => {
 *       showNotification(`New follower!`);
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       <span>{followerCount} followers</span>
 *       <span>{followingCount} following</span>
 *     </div>
 *   );
 * }
 */
export function useRealtimeFollows(
  options: UseRealtimeFollowsOptions = {}
): FollowStats {
  const { enabled = true, userId, onNewFollower, onFollowChange } = options;

  const convexAvailable = isConvexAvailable();
  const isConnected = convexAvailable && enabled;

  // Get follower count
  const followerCountQuery = useMemo(() => {
    if (!enabled || !userId || !convexAvailable) {
      return 'skip';
    }
    return { userId };
  }, [enabled, userId, convexAvailable]);

  const followerCountData = useQuery(
    api.follows.getFollowerCount,
    followerCountQuery === 'skip' ? 'skip' : followerCountQuery
  );

  // Get following count
  const followingCountQuery = useMemo(() => {
    if (!enabled || !userId || !convexAvailable) {
      return 'skip';
    }
    return { userId };
  }, [enabled, userId, convexAvailable]);

  const followingCountData = useQuery(
    api.follows.getFollowingCount,
    followingCountQuery === 'skip' ? 'skip' : followingCountQuery
  );

  // Notify on count changes
  useEffect(() => {
    if (onFollowChange && followerCountData !== undefined) {
      onFollowChange();
    }
  }, [followerCountData, followingCountData, onFollowChange]);

  return {
    followerCount: followerCountData ?? 0,
    followingCount: followingCountData ?? 0,
    isLoading: followerCountData === undefined || followingCountData === undefined,
    isConnected,
  };
}

/**
 * Hook to check if current user is following another user
 */
export function useIsFollowing(
  followerId?: string | null,
  followingId?: string | null,
  enabled = true
): boolean {
  const convexAvailable = isConvexAvailable();
  const isConnected = convexAvailable && enabled;

  const isFollowingQuery = useMemo(() => {
    if (!enabled || !followerId || !followingId || !convexAvailable) {
      return 'skip';
    }
    return { followerId, followingId };
  }, [enabled, followerId, followingId, convexAvailable]);

  const isFollowingData = useQuery(
    api.follows.isFollowing,
    isFollowingQuery === 'skip' ? 'skip' : isFollowingQuery
  );

  return isFollowingData ?? false;
}

/**
 * Hook to get user's followers list
 */
export function useFollowers(
  userId?: string | null,
  enabled = true
): Array<{ followerId: string; createdAt: number }> {
  const convexAvailable = isConvexAvailable();

  const followersQuery = useMemo(() => {
    if (!enabled || !userId || !convexAvailable) {
      return 'skip';
    }
    return { userId };
  }, [enabled, userId, convexAvailable]);

  const followers = useQuery(
    api.follows.getFollowers,
    followersQuery === 'skip' ? 'skip' : followersQuery
  );

  return useMemo(() => {
    if (!followers || followers === 'skip') {
      return [];
    }

    return followers.map((f: any) => ({
      followerId: f.followerId,
      createdAt: f.createdAt,
    }));
  }, [followers]);
}

/**
 * Hook to get who user is following
 */
export function useFollowing(
  userId?: string | null,
  enabled = true
): Array<{ followingId: string; createdAt: number }> {
  const convexAvailable = isConvexAvailable();

  const followingQuery = useMemo(() => {
    if (!enabled || !userId || !convexAvailable) {
      return 'skip';
    }
    return { userId };
  }, [enabled, userId, convexAvailable]);

  const following = useQuery(
    api.follows.getFollowing,
    followingQuery === 'skip' ? 'skip' : followingQuery
  );

  return useMemo(() => {
    if (!following || following === 'skip') {
      return [];
    }

    return following.map((f: any) => ({
      followingId: f.followingId,
      createdAt: f.createdAt,
    }));
  }, [following]);
}

/**
 * Hook to sync a follow relationship from MongoDB to Convex
 */
export function useSyncFollow() {
  const syncFollowMutation = useMutation(api.follows.syncFollow);
  const removeFollowMutation = useMutation(api.follows.removeFollow);

  const syncFollow = async (
    followerId: string,
    followingId: string,
    createdAt: number
  ) => {
    try {
      await syncFollowMutation({ followerId, followingId, createdAt });
      return { success: true };
    } catch (error) {
      console.error('Failed to sync follow to Convex:', error);
      return { success: false, error };
    }
  };

  const removeFollow = async (followerId: string, followingId: string) => {
    try {
      await removeFollowMutation({ followerId, followingId });
      return { success: true };
    } catch (error) {
      console.error('Failed to remove follow from Convex:', error);
      return { success: false, error };
    }
  };

  return { syncFollow, removeFollow };
}
