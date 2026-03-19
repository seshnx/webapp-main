/**
 * Unified Data Service - Convex Only
 *
 * Single API for all user data operations using Convex.
 * All data is now stored in Convex for real-time updates.
 *
 * Architecture:
 * - Convex: Complete user profiles with all role-specific fields
 * - Real-time subscriptions for all data updates
 */

import { api } from '../../convex/_generated/api';
import { useQuery, useMutation } from 'convex/react';
import type { Id } from '../../convex/_generated/dataModel';

// ============================================================
// USER PROFILE OPERATIONS
// ============================================================

/**
 * Get complete user profile from Convex
 * Uses Clerk ID to look up user - all data in one place
 */
export async function getCompleteUserProfile(clerkUserId: string) {
  try {
    // In a backend context, we'd use the Convex HTTP API
    // For now, this is a placeholder - frontend uses useQuery hooks
    console.warn('getCompleteUserProfile: Use Convex useQuery hook on frontend');
    return null;
  } catch (error) {
    console.error('Failed to get complete user profile:', error);
    throw error;
  }
}

/**
 * Create complete user profile via Convex
 * Called from Clerk webhook or user onboarding
 */
export async function createCompleteUserProfile(data: {
  clerkId: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
}): Promise<any> {
  try {
    // This would be called from the Clerk webhook endpoint
    // The webhook endpoint uses Convex syncUserFromClerk mutation
    console.warn('createCompleteUserProfile: Use Convex syncUserFromClerk mutation from webhook');
    return null;
  } catch (error) {
    console.error('Failed to create complete user profile:', error);
    throw error;
  }
}

/**
 * Update user display name
 */
export async function updateUserDisplayName(
  clerkUserId: string,
  displayName: string
): Promise<void> {
  try {
    // This would be called via Convex mutation
    console.warn('updateUserDisplayName: Use Convex updateProfile mutation');
  } catch (error) {
    console.error('Failed to update display name:', error);
    throw error;
  }
}

/**
 * Update user email (requires re-verification via Clerk)
 */
export async function updateUserEmail(
  clerkUserId: string,
  email: string
): Promise<void> {
  try {
    // Email updates should go through Clerk for verification
    // Then sync to Convex via webhook
    console.warn('updateUserEmail: Update via Clerk, will sync automatically');
  } catch (error) {
    console.error('Failed to update email:', error);
    throw error;
  }
}

/**
 * Update user settings (notification preferences, privacy, etc.)
 */
export async function updateUserSettings(
  clerkUserId: string,
  settings: {
    privacy?: string;
    notificationsEnabled?: boolean;
    showEmail?: boolean;
    showLocation?: boolean;
  }
): Promise<void> {
  try {
    console.warn('updateUserSettings: Use Convex updateProfile mutation');
  } catch (error) {
    console.error('Failed to update user settings:', error);
    throw error;
  }
}

// ============================================================
// SUB-PROFILE OPERATIONS
// ============================================================

/**
 * Create a new sub-profile for multi-role users
 */
export async function createSubProfile(data: {
  clerkUserId: string;
  role: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  genres?: string[];
  instruments?: string[];
  rates?: number;
  sessionRate?: number;
  hourlyRate?: number;
}): Promise<any> {
  try {
    console.warn('createSubProfile: Use Convex createSubProfile mutation');
    return null;
  } catch (error) {
    console.error('Failed to create sub-profile:', error);
    throw error;
  }
}

/**
 * Update an existing sub-profile
 */
export async function updateSubProfile(
  clerkUserId: string,
  subProfileId: string,
  updates: any
): Promise<void> {
  try {
    console.warn('updateSubProfile: Use Convex updateSubProfile mutation');
  } catch (error) {
    console.error('Failed to update sub-profile:', error);
    throw error;
  }
}

/**
 * Switch active profile
 */
export async function switchActiveProfile(
  clerkUserId: string,
  subProfileId: string
): Promise<void> {
  try {
    console.warn('switchActiveProfile: Use Convex mutation');
  } catch (error) {
    console.error('Failed to switch active profile:', error);
    throw error;
  }
}

// ============================================================
// SEARCH & DISCOVERY
// ============================================================

/**
 * Search users by profile fields
 * Uses Convex searchUsersByProfile query
 */
export async function searchUsers(query: {
  searchText?: string;
  talentSubRole?: string;
  vocalRange?: string;
  genres?: string[];
  skills?: string[];
  location?: string;
  availabilityStatus?: string;
  accountType?: string;
  limit?: number;
}): Promise<any[]> {
  try {
    console.warn('searchUsers: Use Convex searchUsers or searchUsersByProfile query');
    return [];
  } catch (error) {
    console.error('Failed to search users:', error);
    throw error;
  }
}

// ============================================================
// REACT HOOKS FOR FRONTEND
// ============================================================

/**
 * React hook for current user profile
 * Uses Convex real-time subscription
 */
export function useCurrentUser(clerkId: string | undefined) {
  return useQuery(
    api.users.getUserByClerkId,
    clerkId ? { clerkId } : "skip"
  );
}

/**
 * React hook for user by username
 */
export function useUserByUsername(username: string | undefined) {
  return useQuery(
    api.users.getUserByUsername,
    username ? { username } : "skip"
  );
}

/**
 * React hook for user search
 */
export function useUserSearch(searchText: string, limit = 20) {
  return useQuery(api.users.searchUsers, {
    searchText: searchText || "",
    limit,
  });
}

/**
 * React hook for profile search by fields
 */
export function useProfileSearch(filters: {
  talentSubRole?: string;
  vocalRange?: string;
  genres?: string[];
  skills?: string[];
  location?: string;
  availabilityStatus?: string;
  limit?: number;
}) {
  return useQuery(api.users.searchUsersByProfile, filters);
}

/**
 * React hook for sub-profiles
 */
export function useSubProfiles(userId: string | undefined) {
  return useQuery(
    api.users.getSubProfiles,
    userId ? { userId } : "skip"
  );
}

// ============================================================
// MUTATION HOOKS
// ============================================================

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const updateProfile = useMutation(api.users.updateProfile);
  const syncFromClerk = useMutation(api.users.syncUserFromClerk);

  return {
    updateProfile,
    syncFromClerk,
  };
}

/**
 * Hook for sub-profile operations
 */
export function useSubProfileMutations() {
  const create = useMutation(api.users.createSubProfile);
  const update = useMutation(api.users.updateSubProfile);
  const remove = useMutation(api.users.deleteSubProfile);

  return {
    create,
    update,
    remove,
  };
}

/**
 * Hook for follow system
 */
export function useFollowMutations() {
  const follow = useMutation(api.users.followUser);
  const unfollow = useMutation(api.users.unfollowUser);

  return {
    follow,
    unfollow,
  };
}

// ============================================================
// EXPORTS
// ============================================================

// All hooks are now exported for use in components
// Backend functions are deprecated - use Convex mutations directly

export default {
  // Queries (use these in components)
  useCurrentUser,
  useUserByUsername,
  useUserSearch,
  useProfileSearch,
  useSubProfiles,

  // Mutations (use these in components)
  useUpdateProfile,
  useSubProfileMutations,
  useFollowMutations,

  // Backend functions (deprecated - kept for backward compatibility)
  getCompleteUserProfile,
  createCompleteUserProfile,
  updateUserDisplayName,
  updateUserEmail,
  updateUserSettings,
  createSubProfile,
  updateSubProfile,
  switchActiveProfile,
  searchUsers,
};
