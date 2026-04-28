/**
 * Unified User Data Service
 *
 * Provides a single interface for user data that intelligently routes
 * between Neon (PostgreSQL) and MongoDB based on data characteristics.
 *
 * NEON = Core identity, roles, financial, bookings (stable, structured)
 * MONGODB = Display profile, skills, settings, social (flexible, frequent changes)
 */

// TODO: Replace Neon profile functions with Convex equivalents
// import { fetchQuery, fetchMutation } from 'convex/server';
// import { api } from '@convex/api';

// Stub for getCoreUserProfile - returns null until Convex migration is complete
const getCoreUserProfile = async (userId: string): Promise<any> => {
  // TODO: Replace with: return await fetchQuery(api.users.getCoreProfile, { userId });
  return null;
};

// Stub for updateNeonProfile - no-op until Convex migration is complete
const updateNeonProfile = async (userId: string, updates: Record<string, any>): Promise<void> => {
  // TODO: Replace with: await fetchMutation(api.users.updateProfile, { userId, ...updates });
  console.log('updateNeonProfile (TODO: implement via Convex):', { userId, fields: Object.keys(updates) });
};
// import {
//   getProfile as getMongoProfile,
//   upsertProfile as upsertMongoProfile,
//   getFollowing,
//   getFollowers,
//   updateLastActive,
// } from '../config/mongoSocial';

const getMongoProfile = async (id: string) => null;
const upsertMongoProfile = async (id: string, updates: any) => {};
const getFollowing = async (id: string, limit: number) => [];
const getFollowers = async (id: string, limit: number) => [];
const updateLastActive = async (id: string) => {};
const searchProfiles = async (query: any) => [];
import type { UserData, AccountType } from '../types';

// =====================================================
// TYPES
// =====================================================

interface UnifiedUserUpdates {
  // Neon: Core identity (rarely changes)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  accountTypes?: string[];
  activeRole?: string;
  preferredRole?: string;
  currentTier?: string;
  profilePhotoUrl?: string;
  bannerUrl?: string;

  // MongoDB: Flexible display (often changes)
  displayName?: string;
  username?: string;
  bio?: string;
  headline?: string;
  skills?: string[];
  specialties?: string[];
  genres?: string[];
  instruments?: string[];
  software?: string[];

  // MongoDB: Location
  location?: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };

  // MongoDB: Portfolio
  portfolioUrls?: Array<{
    title: string;
    url: string;
    type: 'soundcloud' | 'spotify' | 'youtube' | 'website' | 'other';
  }>;

  // Settings (MongoDB)
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    accessibility?: {
      fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
      reducedMotion?: boolean;
      highContrast?: boolean;
    };
    social?: {
      feedAlgorithm?: 'chronological' | 'recommended' | 'following';
      autoPlayVideos?: boolean;
      showSuggestedAccounts?: boolean;
    };
    notifications?: {
      email?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
  };
}

interface CompleteUserProfile extends UserData {
  // From Neon
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accountTypes: AccountType[];
  activeRole: AccountType;
  preferredRole: AccountType;
  currentTier?: string;
  walletBalance?: number;
  earningsBalance?: number;

  // From MongoDB
  displayName?: string;
  username?: string;
  bio?: string;
  headline?: string;
  skills?: string[];
  specialties?: string[];
  genres?: string[];
  instruments?: any;
  software?: string[];
  location?: any;
  portfolioUrls?: Array<{
    title: string;
    url: string;
    type: 'soundcloud' | 'spotify' | 'youtube' | 'website' | 'other';
  }>;
  stats?: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
  };

  // Computed
  effectiveDisplayName: string;
}

// =====================================================
// MAIN SERVICE FUNCTIONS
// =====================================================

/**
 * Get complete user profile from both databases
 * Merges Neon core data with MongoDB social/flexible data
 */
export async function getCompleteUser(clerkUserId: string): Promise<CompleteUserProfile | null> {
  try {
    const [coreProfile, socialProfile] = await Promise.all([
      getCoreUserProfile(clerkUserId)
        .catch(err => {
          console.warn('Neon profile fetch failed:', err);
          return null;
        }),
      getMongoProfile(clerkUserId)
        .catch(err => {
          console.warn('MongoDB profile fetch failed:', err);
          return null;
        })
    ]);

    if (!coreProfile && !socialProfile) {
      return null;
    }

    // Merge profiles, prioritizing MongoDB for display data
    return {
      // Core identity (Neon)
      id: coreProfile?.id || socialProfile?._id,
      email: coreProfile?.email || '',
      firstName: coreProfile?.first_name || socialProfile?.displayName?.split(' ')[0],
      lastName: coreProfile?.last_name || '',
      phone: coreProfile?.phone || '',
      accountTypes: coreProfile?.account_types || ['Fan'],
      activeRole: coreProfile?.active_role || coreProfile?.account_types?.[0] || 'Fan',
      preferredRole: coreProfile?.preferred_role || coreProfile?.account_types?.[0] || 'Fan',
      currentTier: coreProfile?.current_tier,
      walletBalance: coreProfile?.wallet_balance || 0,
      earningsBalance: coreProfile?.earnings_balance || 0,

      // Display profile (MongoDB)
      displayName: socialProfile?.displayName,
      username: socialProfile?.username,
      bio: socialProfile?.bio,
      headline: socialProfile?.headline,
      skills: socialProfile?.skills || [],
      specialties: socialProfile?.specialties || [],
      genres: socialProfile?.genres || [],
      instruments: socialProfile?.instruments || [],
      software: socialProfile?.software || [],
      location: socialProfile?.location,
      portfolioUrls: socialProfile?.portfolioUrls,
      stats: socialProfile?.stats || {
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        likesReceived: 0,
        commentsReceived: 0
      },

      // Photo (MongoDB priority for recent updates, fallback to Neon)
      photoURL: socialProfile?.avatarUrl || coreProfile?.profile_photo_url,
      bannerURL: socialProfile?.bannerUrl || coreProfile?.banner_url,

      // Settings (MongoDB)
      settings: socialProfile?.settings || coreProfile?.settings || {},

      // Computed display name
      effectiveDisplayName: socialProfile?.displayName ||
        `${coreProfile?.first_name || ''} ${coreProfile?.last_name || ''}`.trim() ||
        'User'
    };
  } catch (error) {
    console.error('Error fetching complete user profile:', error);
    return null;
  }
}

/**
 * Update user profile - routes updates to correct database
 */
export async function updateUserProfile(
  clerkUserId: string,
  updates: UnifiedUserUpdates
): Promise<void> {
  try {
    // Separate updates by destination
    const neonUpdates: Record<string, any> = {};
    const mongoUpdates: Record<string, any> = {};

    // Core identity → Neon
    if (updates.firstName !== undefined) neonUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) neonUpdates.last_name = updates.lastName;
    if (updates.email !== undefined) neonUpdates.email = updates.email;
    if (updates.phone !== undefined) neonUpdates.phone = updates.phone;
    if (updates.accountTypes !== undefined) neonUpdates.account_types = updates.accountTypes;
    if (updates.activeRole !== undefined) neonUpdates.active_role = updates.activeRole;
    if (updates.preferredRole !== undefined) neonUpdates.preferred_role = updates.preferredRole;
    if (updates.currentTier !== undefined) neonUpdates.current_tier = updates.currentTier;
    if (updates.profilePhotoUrl !== undefined) {
      neonUpdates.profile_photo_url = updates.profilePhotoUrl;
      mongoUpdates.avatarUrl = updates.profilePhotoUrl; // Sync to MongoDB too
    }
    if (updates.bannerUrl !== undefined) {
      neonUpdates.banner_url = updates.bannerUrl;
      mongoUpdates.bannerUrl = updates.bannerUrl; // Sync to MongoDB too
    }

    // Flexible display data → MongoDB
    if (updates.displayName !== undefined) mongoUpdates.displayName = updates.displayName;
    if (updates.username !== undefined) mongoUpdates.username = updates.username;
    if (updates.bio !== undefined) mongoUpdates.bio = updates.bio;
    if (updates.headline !== undefined) mongoUpdates.headline = updates.headline;
    if (updates.skills !== undefined) mongoUpdates.skills = updates.skills;
    if (updates.specialties !== undefined) mongoUpdates.specialties = updates.specialties;
    if (updates.genres !== undefined) mongoUpdates.genres = updates.genres;
    if (updates.instruments !== undefined) mongoUpdates.instruments = updates.instruments;
    if (updates.software !== undefined) mongoUpdates.software = updates.software;
    if (updates.location !== undefined) mongoUpdates.location = updates.location;
    if (updates.portfolioUrls !== undefined) mongoUpdates.portfolioUrls = updates.portfolioUrls;
    if (updates.settings !== undefined) mongoUpdates.settings = updates.settings;

    // Compute effective display name
    const effectiveDisplayName = updates.displayName ||
      `${updates.firstName || ''} ${updates.lastName || ''}`.trim() ||
      undefined;
    if (effectiveDisplayName) {
      neonUpdates.effective_display_name = effectiveDisplayName;
    }

    // Parallel updates to both databases
    const _results = await Promise.all([
      Object.keys(neonUpdates).length > 0
        ? updateNeonProfile(clerkUserId, neonUpdates)
        : Promise.resolve(null),
      Object.keys(mongoUpdates).length > 0
        ? upsertMongoProfile(clerkUserId, mongoUpdates)
        : Promise.resolve(null)
    ]);

    console.log('✅ Profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Search users - combines Neon core data with MongoDB flexible data
 */
export async function searchUsers(query: {
  skills?: string[];
  specialties?: string[];
  genres?: string[];
  location?: {
    coordinates: [number, number];
    maxDistance?: number;
  };
  searchText?: string;
  limit?: number;
}): Promise<CompleteUserProfile[]> {
  try {
    // Search in MongoDB (flexible data)
    const mongoResults = await searchProfiles({
      skills: query.skills,
      location: query.location,
      searchText: query.searchText,
      limit: query.limit || 20
    });

    // Fetch core data from Neon for results
    const enrichedResults = await Promise.all(
      mongoResults.map(async (mongoProfile) => {
        const coreProfile = await getCoreUserProfile(mongoProfile._id)
          .catch(() => null);

        return {
          id: mongoProfile._id,
          email: coreProfile?.email || '',
          firstName: coreProfile?.first_name || mongoProfile.displayName?.split(' ')[0],
          lastName: coreProfile?.last_name || '',
          accountTypes: coreProfile?.account_types || ['Fan'],
          activeRole: coreProfile?.active_role || 'Fan',
          preferredRole: coreProfile?.preferred_role || 'Fan',

          // MongoDB data
          displayName: mongoProfile.displayName,
          username: mongoProfile.username,
          bio: mongoProfile.bio,
          headline: mongoProfile.headline,
          skills: mongoProfile.skills || [],
          specialties: mongoProfile.specialties || [],
          genres: mongoProfile.genres || [],
          instruments: mongoProfile.instruments || [],
          software: mongoProfile.software || [],
          location: mongoProfile.location,
          portfolioUrls: mongoProfile.portfolioUrls,
          stats: mongoProfile.stats,

          photoURL: mongoProfile.avatarUrl || coreProfile?.profile_photo_url,
          bannerURL: mongoProfile.bannerUrl || coreProfile?.banner_url,
          settings: mongoProfile.settings || coreProfile?.settings || {},

          // Computed
          effectiveDisplayName: mongoProfile.displayName ||
            `${coreProfile?.first_name || ''} ${coreProfile?.last_name || ''}`.trim() ||
            'User'
        };
      })
    );

    return enrichedResults;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

/**
 * Get user's social stats (followers, posts, etc.)
 */
export async function getUserStats(clerkUserId: string): Promise<{
  followersCount: number;
  followingCount: number;
  postsCount: number;
  likesReceived: number;
  commentsReceived: number;
} | null> {
  try {
    const profile = await getMongoProfile(clerkUserId);
    return profile?.stats || null;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
}

/**
 * Update user's last active timestamp
 */
export async function updateUserActivity(clerkUserId: string): Promise<void> {
  try {
    await updateLastActive(clerkUserId);
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
}

/**
 * Get user's following list (with basic profile data)
 */
export async function getUserFollowing(
  clerkUserId: string,
  limit = 50
): Promise<Array<{ id: string; displayName?: string; username?: string; photoURL?: string }>> {
  try {
    const followingIds = await getFollowing(clerkUserId, limit);

    // Fetch profiles for following users
    const profiles = await Promise.all(
      followingIds.slice(0, limit).map(async (id) => {
        const profile = await getCompleteUser(id);
        return profile ? {
          id: profile.id,
          displayName: profile.displayName,
          username: profile.username,
          photoURL: profile.photoURL
        } : null;
      })
    );

    return profiles.filter((p): p is NonNullable<typeof p> => p !== null);
  } catch (error) {
    console.error('Error fetching user following:', error);
    return [];
  }
}

/**
 * Get user's followers list (with basic profile data)
 */
export async function getUserFollowers(
  clerkUserId: string,
  limit = 50
): Promise<Array<{ id: string; displayName?: string; username?: string; photoURL?: string }>> {
  try {
    const followerIds = await getFollowers(clerkUserId, limit);

    // Fetch profiles for followers
    const profiles = await Promise.all(
      followerIds.slice(0, limit).map(async (id) => {
        const profile = await getCompleteUser(id);
        return profile ? {
          id: profile.id,
          displayName: profile.displayName,
          username: profile.username,
          photoURL: profile.photoURL
        } : null;
      })
    );

    return profiles.filter((p): p is NonNullable<typeof p> => p !== null);
  } catch (error) {
    console.error('Error fetching user followers:', error);
    return [];
  }
}

// Re-export MongoDB functions - STUBS
export const followUser = async () => {};
export const unfollowUser = async () => {};
export const isFollowing = async () => false;
export const mongoCreatePost = async () => {};
export const mongoGetPosts = async () => [];
export const mongoGetPostById = async () => null;
export const toggleReaction = async () => {};
export const savePost = async () => {};
export const unsavePost = async () => {};
export const getSavedPosts = async () => [];
export const markAllNotificationsAsRead = async () => {};
