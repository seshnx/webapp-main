/**
 * Unified Data Service
 *
 * Provides a single API for interacting with all three databases.
 * Abstracts away the complexity of the tri-database architecture.
 *
 * Architecture:
 * - Neon (PostgreSQL): Immutable core data
 * - MongoDB: Flexible profile data
 * - Convex: Real-time data
 */

import { getNeonUser, createNeonUser, updateNeonUser } from '../config/neonQueries';
import {
  getMongoUserProfile,
  createMongoUserProfile,
  updateMongoUserProfile,
} from '../config/mongodb.js';
import { api } from '../../convex/_generated';
import { useQuery, useMutation } from 'convex/react';
import type {
  NeonUserProfile,
  MongoUserProfile,
  ConvexPresence,
  CompleteUserProfile,
} from '../types/dataDistribution';

// ============================================================
// USER PROFILE OPERATIONS
// ============================================================

/**
 * Get complete user profile (merged from Neon + MongoDB + Convex)
 */
export async function getCompleteUserProfile(userId: string): Promise<CompleteUserProfile | null> {
  try {
    // Parallel queries for performance
    const [neonUser, mongoProfile, convexPresence] = await Promise.all([
      getNeonUser(userId),
      getMongoUserProfile(userId),
      // Note: Convex queries are done through React hooks on frontend
      // This is a backend function, so we'd use Convex HTTP API here
      Promise.resolve(null), // Placeholder for Convex data
    ]);

    if (!neonUser) {
      return null;
    }

    // Merge into complete profile
    return {
      // From Neon (Core)
      id: neonUser.id,
      clerk_user_id: neonUser.clerk_user_id,
      first_name: neonUser.first_name,
      last_name: neonUser.last_name,
      email: neonUser.email,
      phone: neonUser.phone,
      billing_address: neonUser.billing_address,
      account_created_at: neonUser.account_created_at,

      // From MongoDB (Flexible)
      display_name: mongoProfile?.display_name || `${neonUser.first_name} ${neonUser.last_name}`,
      username: mongoProfile?.username || neonUser.email.split('@')[0],
      bio: mongoProfile?.bio,
      active_profile: mongoProfile?.active_profile || 'fan',
      sub_profiles: mongoProfile?.sub_profiles || [],
      notification_settings: mongoProfile?.notification_settings || getDefaultNotificationSettings(),
      social_links: mongoProfile?.social_links || [],
      portfolio: mongoProfile?.portfolio || [],

      // From Convex (Real-time)
      online_status: convexPresence?.status || 'offline',
      last_seen: convexPresence?.lastSeen,
    };
  } catch (error) {
    console.error('Failed to get complete user profile:', error);
    throw error;
  }
}

/**
 * Create complete user profile (Neon + MongoDB)
 */
export async function createCompleteUserProfile(data: {
  // Neon data (required)
  clerk_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  billing_address?: any;

  // MongoDB data (optional)
  display_name?: string;
  username?: string;
  bio?: string;
  active_profile?: string;
  notification_settings?: any;
  social_links?: any[];
}): Promise<CompleteUserProfile> {
  try {
    // 1. Create Neon user (core identity)
    const neonUser = await createNeonUser({
      clerk_user_id: data.clerk_user_id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      billing_address: data.billing_address,
      kyc_verified: false,
      terms_accepted_at: new Date(),
    });

    // 2. Create MongoDB profile (flexible data)
    const mongoProfile = await createMongoUserProfile({
      user_id: neonUser.id,
      display_name: data.display_name || `${data.first_name} ${data.last_name}`,
      username: data.username || data.email.split('@')[0],
      profile_handle: data.username || data.email.split('@')[0],
      bio: data.bio,
      active_profile: data.active_profile || 'fan',
      sub_profiles: [],
      notification_settings: data.notification_settings || getDefaultNotificationSettings(),
      social_links: data.social_links || [],
      portfolio: [],
      equipment_inventory: [],
      custom_fields: {},
    });

    // 3. Set online status in Convex (done from frontend via hooks)
    // This is handled by the usePresence hook on mount

    return {
      id: neonUser.id,
      clerk_user_id: neonUser.clerk_user_id,
      first_name: neonUser.first_name,
      last_name: neonUser.last_name,
      email: neonUser.email,
      phone: neonUser.phone,
      billing_address: neonUser.billing_address,
      account_created_at: neonUser.account_created_at,

      display_name: mongoProfile.display_name,
      username: mongoProfile.username,
      bio: mongoProfile.bio,
      active_profile: mongoProfile.active_profile,
      sub_profiles: mongoProfile.sub_profiles,
      notification_settings: mongoProfile.notification_settings,
      social_links: mongoProfile.social_links,
      portfolio: mongoProfile.portfolio,

      online_status: 'offline', // Will be updated by usePresence hook
    };
  } catch (error) {
    console.error('Failed to create complete user profile:', error);
    throw error;
  }
}

/**
 * Update user display name (MongoDB only)
 */
export async function updateUserDisplayName(
  userId: string,
  displayName: string
): Promise<void> {
  try {
    // Only update MongoDB (display name is flexible)
    await updateMongoUserProfile(userId, {
      display_name: displayName,
    });

    // Note: Real-time notification would be done via Convex hook
  } catch (error) {
    console.error('Failed to update display name:', error);
    throw error;
  }
}

/**
 * Update user email (Neon only - requires re-verification)
 */
export async function updateUserEmail(
  userId: string,
  email: string
): Promise<void> {
  try {
    // Update Neon (legal identity)
    await updateNeonUser(userId, {
      email,
      email_verified_at: null, // Requires re-verification
    });

    // Note: This would trigger email verification flow
  } catch (error) {
    console.error('Failed to update email:', error);
    throw error;
  }
}

/**
 * Switch active profile (MongoDB only)
 */
export async function switchActiveProfile(
  userId: string,
  newProfile: string
): Promise<void> {
  try {
    const mongoProfile = await getMongoUserProfile(userId);

    if (!mongoProfile) {
      throw new Error('MongoDB profile not found');
    }

    // Check if profile exists
    const profileExists = mongoProfile.sub_profiles?.find(p => p.id === newProfile);
    if (!profileExists) {
      throw new Error('Profile not found');
    }

    // Update active profile
    await updateMongoUserProfile(userId, {
      active_profile: newProfile,
      profile_switching_history: [
        ...(mongoProfile.profile_switching_history || []),
        {
          from_profile: mongoProfile.active_profile,
          to_profile: newProfile,
          switched_at: new Date(),
        },
      ],
    });

    // Update Convex presence with new active profile
    // This is done from frontend via hooks
  } catch (error) {
    console.error('Failed to switch active profile:', error);
    throw error;
  }
}

/**
 * Update notification settings (MongoDB only)
 */
export async function updateNotificationSettings(
  userId: string,
  settings: any
): Promise<void> {
  try {
    await updateMongoUserProfile(userId, {
      notification_settings: settings,
    });
  } catch (error) {
    console.error('Failed to update notification settings:', error);
    throw error;
  }
}

/**
 * Update billing address (Neon only - requires verification)
 */
export async function updateBillingAddress(
  userId: string,
  address: any
): Promise<void> {
  try {
    await updateNeonUser(userId, {
      billing_address: address,
    });

    // Note: This might require address verification for payments
  } catch (error) {
    console.error('Failed to update billing address:', error);
    throw error;
  }
}

// ============================================================
// SEARCH & DISCOVERY
// ============================================================

/**
 * Search users by display name (MongoDB) + filter by location (Neon)
 */
export async function searchUsers(query: {
  search?: string; // Search in display_name (MongoDB)
  city?: string; // Filter by city (Neon)
  state?: string; // Filter by state (Neon)
  active_profile?: string; // Filter by profile type (MongoDB)
  online_status?: 'online' | 'offline'; // Filter by online status (Convex)
}): Promise<CompleteUserProfile[]> {
  try {
    // This would involve complex queries across all databases
    // Implementation depends on your specific search requirements
    // For now, returning empty array as placeholder

    console.warn('searchUsers not fully implemented yet');
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
 * React hook for complete user profile
 * Merges data from Neon + MongoDB + Convex automatically
 */
export function useCompleteUserProfile(userId: string | undefined) {
  // This would be implemented in a separate hooks file
  // Using the individual hooks for Neon, MongoDB, and Convex
  // and merging the results

  // Placeholder - actual implementation would use:
  // - useNeonUser(userId)
  // - useMongoUserProfile(userId)
  // - usePresence(userId)
  // And merge the results

  return {
    profile: null,
    loading: false,
    error: null,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDefaultNotificationSettings() {
  return {
    email: {
      bookings: true,
      messages: true,
      promotions: false,
      recommendations: true,
    },
    push: {
      bookings: true,
      messages: true,
      session_reminders: true,
    },
    in_app: {
      sound_enabled: true,
      desktop_notifications: true,
    },
  };
}

// ============================================================
// TYPE EXPORTS
// ============================================================

export type {
  NeonUserProfile,
  MongoUserProfile,
  ConvexPresence,
  CompleteUserProfile,
};
