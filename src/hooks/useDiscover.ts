import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * User data interface
 */
export interface UserData {
  id?: string;
  uid?: string;
  [key: string]: any;
}

/**
 * Discover hook return value
 */
export interface UseDiscoverReturn {
  loading: boolean;
  sounds: any[];
  artists: any[];
  producers: any[];
  studios: any[];
  schools: any[];
  following: string[];
  refresh: () => void;
  filterBy: (filters: any) => void;
}

/**
 * Hook for discovering content and users
 * Uses Convex real-time queries for discovery data.
 *
 * @param user - User object
 * @param _userData - Additional user data (unused)
 * @returns Discover data and functions
 */
export function useDiscover(
  user: UserData | null,
  _userData?: any
): UseDiscoverReturn {
  const userId = user?.id || user?.uid;

  // Load following list from Convex
  const followingData = useQuery(
    api.social.getFollowing,
    userId ? { clerkId: userId } : "skip"
  );

  // Discovery queries
  const artistsData = useQuery(api.social.discoverArtists, { limit: 20 });
  const producersData = useQuery(api.social.discoverProducers, { limit: 20 });
  const studiosData = useQuery(api.social.discoverStudios, { limit: 20 });
  const soundsData = useQuery(api.social.discoverSounds, { limit: 20 });
  const schoolsData = useQuery(api.social.discoverSchools, { limit: 20 });

  const following = useMemo(() => {
    return (followingData || []).map(f => f.clerkId);
  }, [followingData]);

  const loading =
    followingData === undefined ||
    artistsData === undefined ||
    producersData === undefined ||
    studiosData === undefined ||
    soundsData === undefined ||
    schoolsData === undefined;

  const refresh = (): void => {
    // Convex queries auto-refresh in real-time; no-op
  };

  const filterBy = (_filters: any): void => {
    // TODO: Implement client-side filtering
  };

  return {
    loading,
    sounds: soundsData ?? [],
    artists: artistsData ?? [],
    producers: producersData ?? [],
    studios: studiosData ?? [],
    schools: schoolsData ?? [],
    following,
    refresh,
    filterBy,
  };
}
