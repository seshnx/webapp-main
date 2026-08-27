/**
 * Real-time Follows Hook using Convex
 */

import { useMemo, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { isConvexAvailable } from '../config/convex';

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

export function useRealtimeFollows(options: UseRealtimeFollowsOptions = {}): FollowStats {
  const { enabled = true, userId, onFollowChange } = options;
  const convexAvailable = isConvexAvailable();
  const isConnected = convexAvailable && enabled;

  const followersData = useQuery(
    api.social.getFollowers,
    (enabled && userId && convexAvailable) ? { clerkId: userId } : 'skip'
  );

  const followingData = useQuery(
    api.social.getFollowing,
    (enabled && userId && convexAvailable) ? { clerkId: userId } : 'skip'
  );

  useEffect(() => {
    if (onFollowChange && followersData !== undefined) {
      onFollowChange();
    }
  }, [followersData, followingData, onFollowChange]);

  return {
    followerCount: followersData?.length ?? 0,
    followingCount: followingData?.length ?? 0,
    isLoading: followersData === undefined || followingData === undefined,
    isConnected,
  };
}

export function useIsFollowing(
  followerId?: string | null,
  followingId?: string | null,
  enabled = true
): boolean {
  const convexAvailable = isConvexAvailable();

  const isFollowingData = useQuery(
    api.social.isFollowing,
    (enabled && followerId && followingId && convexAvailable)
      ? { followerClerkId: followerId, followingClerkId: followingId }
      : 'skip'
  );

  return isFollowingData ?? false;
}

export function useFollowers(
  userId?: string | null,
  enabled = true
): Array<{ followerId: string; createdAt: number }> {
  const convexAvailable = isConvexAvailable();

  const followers = useQuery(
    api.social.getFollowers,
    (enabled && userId && convexAvailable) ? { clerkId: userId } : 'skip'
  );

  return useMemo(() => {
    if (!followers) return [];
    return followers.map((f: any) => ({
      followerId: f.clerkId ?? f._id,
      createdAt: f.timestamp ?? 0,
    }));
  }, [followers]);
}

export function useFollowing(
  userId?: string | null,
  enabled = true
): Array<{ followingId: string; createdAt: number }> {
  const convexAvailable = isConvexAvailable();

  const following = useQuery(
    api.social.getFollowing,
    (enabled && userId && convexAvailable) ? { clerkId: userId } : 'skip'
  );

  return useMemo(() => {
    if (!following) return [];
    return following.map((f: any) => ({
      followingId: f.clerkId ?? f._id,
      createdAt: f.timestamp ?? 0,
    }));
  }, [following]);
}

export function useSyncFollow() {
  const followMutation = useMutation(api.users.followUser);
  const unfollowMutation = useMutation(api.users.unfollowUser);

  const syncFollow = async (
    followerId: string,
    followingId: string,
    _createdAt: number
  ) => {
    try {
      await followMutation({ followerClerkId: followerId, followingClerkId: followingId });
      return { success: true };
    } catch (error) {
      console.error('Failed to follow user via Convex:', error);
      return { success: false, error };
    }
  };

  const removeFollow = async (followerId: string, followingId: string) => {
    try {
      await unfollowMutation({ followerClerkId: followerId, followingClerkId: followingId });
      return { success: true };
    } catch (error) {
      console.error('Failed to unfollow user via Convex:', error);
      return { success: false, error };
    }
  };

  return { syncFollow, removeFollow };
}
