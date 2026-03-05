/**
 * MongoDB Profile Management
 *
 * Handles flexible user profile data stored in MongoDB.
 * Complements Neon (PostgreSQL) for legal identity data.
 */

import { mongoCollections, isMongoDbAvailable } from './mongodb';
import * as Sentry from '@sentry/react';
import type {
  MongoUserProfile,
  SubProfile,
  NotificationSettings,
  ThemeSettings,
  PrivacySettings,
  SocialLink,
  PortfolioItem,
  EquipmentItem,
} from '../types/dataDistribution';

// ============================================================
// USER PROFILE OPERATIONS
// ============================================================

/**
 * Get user profile from MongoDB
 */
export async function getMongoUserProfile(userId: string): Promise<MongoUserProfile | null> {
  if (!isMongoDbAvailable()) {
    console.warn('MongoDB not available - profile features disabled');
    return null;
  }

  try {
    const profile = await mongoCollections
      .collection<MongoUserProfile>('user_profiles')
      .findOne({ user_id: userId });

    return profile;
  } catch (error) {
    console.error('Failed to get MongoDB user profile:', error);
    Sentry.captureException(error, {
      tags: { database: 'mongodb', operation: 'get_profile' },
      extra: { userId }
    });
    return null;
  }
}

/**
 * Create user profile in MongoDB
 */
export async function createMongoUserProfile(
  userId: string,
  data: Partial<MongoUserProfile>
): Promise<MongoUserProfile> {
  if (!isMongoDbAvailable()) {
    throw new Error('MongoDB not available');
  }

  try {
    const now = new Date();
    const profile: MongoUserProfile = {
      user_id: userId,
      display_name: data.display_name || '',
      username: data.username || '',
      profile_handle: data.profile_handle || data.username || '',
      bio: data.bio,
      tagline: data.tagline,
      active_profile: data.active_profile || 'fan',
      sub_profiles: data.sub_profiles || [],
      profile_switching_history: [],
      notification_settings: data.notification_settings || getDefaultNotificationSettings(),
      theme_settings: data.theme_settings || getDefaultThemeSettings(),
      privacy_settings: data.privacy_settings || getDefaultPrivacySettings(),
      accessibility_settings: data.accessibility_settings || {},
      social_links: data.social_links || [],
      genres: data.genres || [],
      skills: data.skills || [],
      influences: data.influences,
      portfolio: data.portfolio || [],
      equipment_inventory: data.equipment_inventory,
      availability_schedule: data.availability_schedule,
      custom_fields: data.custom_fields || {},
      profile_photos: data.profile_photos || [],
      banner_photos: data.banner_photos,
      profile_completed_at: now,
      profile_views: 0,
      last_modified: now,
    };

    const result = await mongoCollections
      .collection<MongoUserProfile>('user_profiles')
      .insertOne(profile as any);

    profile._id = result.insertedId.toString();

    Sentry.captureMessage('MongoDB user profile created', 'info', {
      tags: { database: 'mongodb', operation: 'create_profile' },
      extra: { userId, display_name: profile.display_name }
    });

    return profile;
  } catch (error) {
    console.error('Failed to create MongoDB user profile:', error);
    Sentry.captureException(error, {
      tags: { database: 'mongodb', operation: 'create_profile' },
      extra: { userId }
    });
    throw error;
  }
}

/**
 * Update user profile in MongoDB
 */
export async function updateMongoUserProfile(
  userId: string,
  updates: Partial<MongoUserProfile>
): Promise<void> {
  if (!isMongoDbAvailable()) {
    console.warn('MongoDB not available - cannot update profile');
    return;
  }

  try {
    await mongoCollections
      .collection<MongoUserProfile>('user_profiles')
      .updateOne(
        { user_id: userId },
        {
          $set: {
            ...updates,
            last_modified: new Date(),
          },
        }
      );

    Sentry.captureMessage('MongoDB user profile updated', 'info', {
      tags: { database: 'mongodb', operation: 'update_profile' },
      extra: { userId, updated_fields: Object.keys(updates) }
    });
  } catch (error) {
    console.error('Failed to update MongoDB user profile:', error);
    Sentry.captureException(error, {
      tags: { database: 'mongodb', operation: 'update_profile' },
      extra: { userId, updates }
    });
    throw error;
  }
}

// ============================================================
// DISPLAY IDENTITY UPDATES
// ============================================================

/**
 * Update display name (instant, no verification needed)
 */
export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  await updateMongoUserProfile(userId, { display_name: displayName });
}

/**
 * Update username/handle
 */
export async function updateUsername(userId: string, username: string): Promise<void> {
  // Check if username is already taken
  const existing = await mongoCollections
    .collection<MongoUserProfile>('user_profiles')
    .findOne({ username });

  if (existing && existing.user_id !== userId) {
    throw new Error('Username already taken');
  }

  await updateMongoUserProfile(userId, {
    username,
    profile_handle: username,
  });
}

/**
 * Update bio
 */
export async function updateBio(userId: string, bio: string): Promise<void> {
  await updateMongoUserProfile(userId, { bio });
}

/**
 * Update tagline
 */
export async function updateTagline(userId: string, tagline: string): Promise<void> {
  await updateMongoUserProfile(userId, { tagline });
}

// ============================================================
// ACTIVE PROFILE MANAGEMENT
// ============================================================

/**
 * Switch active profile
 */
export async function switchActiveProfile(
  userId: string,
  newProfileId: string
): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Check if profile exists in sub_profiles
  const subProfile = profile.sub_profiles?.find(p => p.id === newProfileId);
  if (!subProfile) {
    throw new Error('Sub-profile not found');
  }

  // Update active profile
  await updateMongoUserProfile(userId, {
    active_profile: newProfileId,
    profile_switching_history: [
      ...(profile.profile_switching_history || []),
      {
        from_profile: profile.active_profile,
        to_profile: newProfileId,
        switched_at: new Date(),
      },
    ],
  });

  Sentry.captureMessage('User switched active profile', 'info', {
    tags: { database: 'mongodb', operation: 'switch_profile' },
    extra: { userId, from_profile: profile.active_profile, to_profile: newProfileId }
  });
}

/**
 * Add sub-profile
 */
export async function addSubProfile(
  userId: string,
  subProfile: Omit<SubProfile, 'created_at'>
): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const newSubProfile: SubProfile = {
    ...subProfile,
    created_at: new Date(),
  };

  await updateMongoUserProfile(userId, {
    sub_profiles: [...(profile.sub_profiles || []), newSubProfile],
  });
}

/**
 * Remove sub-profile
 */
export async function removeSubProfile(userId: string, subProfileId: string): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const updatedSubProfiles = (profile.sub_profiles || []).filter(p => p.id !== subProfileId);

  // If removing active profile, switch to first available
  let newActiveProfile = profile.active_profile;
  if (profile.active_profile === subProfileId) {
    newActiveProfile = updatedSubProfiles[0]?.id || 'fan';
  }

  await updateMongoUserProfile(userId, {
    sub_profiles: updatedSubProfiles,
    active_profile: newActiveProfile,
  });
}

// ============================================================
// PREFERENCES MANAGEMENT
// ============================================================

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  await updateMongoUserProfile(userId, {
    notification_settings: {
      ...profile.notification_settings,
      ...settings,
    },
  });
}

/**
 * Update theme settings
 */
export async function updateThemeSettings(
  userId: string,
  settings: Partial<ThemeSettings>
): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  await updateMongoUserProfile(userId, {
    theme_settings: {
      ...profile.theme_settings,
      ...settings,
    },
  });
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(
  userId: string,
  settings: Partial<PrivacySettings>
): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  await updateMongoUserProfile(userId, {
    privacy_settings: {
      ...profile.privacy_settings,
      ...settings,
    },
  });
}

// ============================================================
// SOCIAL & CREATIVE
// ============================================================

/**
 * Add social link
 */
export async function addSocialLink(userId: string, link: SocialLink): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  await updateMongoUserProfile(userId, {
    social_links: [...(profile.social_links || []), link],
  });
}

/**
 * Remove social link
 */
export async function removeSocialLink(userId: string, platform: string): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const updatedLinks = (profile.social_links || []).filter(l => l.platform !== platform);

  await updateMongoUserProfile(userId, {
    social_links: updatedLinks,
  });
}

/**
 * Update genres
 */
export async function updateGenres(userId: string, genres: string[]): Promise<void> {
  await updateMongoUserProfile(userId, { genres });
}

/**
 * Update skills
 */
export async function updateSkills(userId: string, skills: string[]): Promise<void> {
  await updateMongoUserProfile(userId, { skills });
}

/**
 * Add portfolio item
 */
export async function addPortfolioItem(userId: string, item: PortfolioItem): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const newItem: PortfolioItem = {
    ...item,
    id: item.id || `portfolio_${Date.now()}`,
    created_at: item.created_at || new Date(),
  };

  await updateMongoUserProfile(userId, {
    portfolio: [...(profile.portfolio || []), newItem],
  });
}

/**
 * Remove portfolio item
 */
export async function removePortfolioItem(userId: string, itemId: string): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const updatedPortfolio = (profile.portfolio || []).filter(p => p.id !== itemId);

  await updateMongoUserProfile(userId, {
    portfolio: updatedPortfolio,
  });
}

// ============================================================
// DYNAMIC DATA
// ============================================================

/**
 * Update equipment inventory
 */
export async function updateEquipmentInventory(
  userId: string,
  equipment: EquipmentItem[]
): Promise<void> {
  await updateMongoUserProfile(userId, {
    equipment_inventory: equipment,
  });
}

/**
 * Add equipment item
 */
export async function addEquipmentItem(userId: string, item: EquipmentItem): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const newItem: EquipmentItem = {
    ...item,
    id: item.id || `equipment_${Date.now()}`,
  };

  await updateMongoUserProfile(userId, {
    equipment_inventory: [...(profile.equipment_inventory || []), newItem],
  });
}

/**
 * Update custom fields
 */
export async function updateCustomFields(
  userId: string,
  customFields: Record<string, any>
): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  await updateMongoUserProfile(userId, {
    custom_fields: {
      ...(profile.custom_fields || {}),
      ...customFields,
    },
  });
}

// ============================================================
// PROFILE PHOTOS
// ============================================================

/**
 * Add profile photo
 */
export async function addProfilePhoto(
  userId: string,
  url: string,
  isPrimary: boolean = false
): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  let updatedPhotos = [...(profile.profile_photos || [])];

  if (isPrimary) {
    // Set all others to non-primary
    updatedPhotos = updatedPhotos.map(p => ({ ...p, is_primary: false }));
  }

  updatedPhotos.push({
    url,
    is_primary: isPrimary || updatedPhotos.length === 0,
    uploaded_at: new Date(),
  });

  await updateMongoUserProfile(userId, {
    profile_photos: updatedPhotos,
  });
}

/**
 * Set primary profile photo
 */
export async function setPrimaryProfilePhoto(userId: string, url: string): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const updatedPhotos = (profile.profile_photos || []).map(p => ({
    ...p,
    is_primary: p.url === url,
  }));

  await updateMongoUserProfile(userId, {
    profile_photos: updatedPhotos,
  });
}

/**
 * Remove profile photo
 */
export async function removeProfilePhoto(userId: string, url: string): Promise<void> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  let updatedPhotos = (profile.profile_photos || []).filter(p => p.url !== url);

  // If we removed the primary photo, make the first one primary
  if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.is_primary)) {
    updatedPhotos[0].is_primary = true;
  }

  await updateMongoUserProfile(userId, {
    profile_photos: updatedPhotos,
  });
}

// ============================================================
// PROFILE COMPLETION
// ============================================================

/**
 * Calculate profile completion score
 */
export async function getProfileCompletionScore(userId: string): Promise<number> {
  const profile = await getMongoUserProfile(userId);
  if (!profile) {
    return 0;
  }

  let score = 0;
  const maxScore = 100;

  // Display identity (20 points)
  if (profile.display_name && profile.display_name !== '') score += 5;
  if (profile.username && profile.username !== '') score += 5;
  if (profile.bio && profile.bio !== '') score += 5;
  if (profile.tagline && profile.tagline !== '') score += 5;

  // Social & creative (20 points)
  if (profile.social_links && profile.social_links.length > 0) score += 5;
  if (profile.genres && profile.genres.length > 0) score += 5;
  if (profile.skills && profile.skills.length > 0) score += 5;
  if (profile.portfolio && profile.portfolio.length > 0) score += 5;

  // Media (15 points)
  if (profile.profile_photos && profile.profile_photos.length > 0) score += 10;
  if (profile.banner_photos && profile.banner_photos.length > 0) score += 5;

  // Dynamic data (15 points)
  if (profile.equipment_inventory && profile.equipment_inventory.length > 0) score += 10;
  if (profile.custom_fields && Object.keys(profile.custom_fields).length > 0) score += 5;

  // Sub-profiles (10 points)
  if (profile.sub_profiles && profile.sub_profiles.length > 1) score += 10;

  // Preferences (10 points)
  if (profile.notification_settings) score += 5;
  if (profile.theme_settings) score += 5;

  // Privacy (10 points)
  if (profile.privacy_settings) score += 10;

  return Math.min(score, maxScore);
}

// ============================================================
// SEARCH & DISCOVERY
// ============================================================

/**
 * Search users by display name, username, or bio
 */
export async function searchMongoUsers(
  query: string,
  filters?: {
    active_profile?: string;
    genres?: string[];
    skills?: string[];
    limit?: number;
  }
): Promise<MongoUserProfile[]> {
  if (!isMongoDbAvailable()) {
    return [];
  }

  try {
    const searchRegex = new RegExp(query, 'i');
    const mongoQuery: any = {
      $or: [
        { display_name: searchRegex },
        { username: searchRegex },
        { bio: searchRegex },
        { tagline: searchRegex },
      ],
    };

    // Apply filters
    if (filters?.active_profile) {
      mongoQuery.active_profile = filters.active_profile;
    }
    if (filters?.genres && filters.genres.length > 0) {
      mongoQuery.genres = { $in: filters.genres };
    }
    if (filters?.skills && filters.skills.length > 0) {
      mongoQuery.skills = { $in: filters.skills };
    }

    const results = await mongoCollections
      .collection<MongoUserProfile>('user_profiles')
      .find(mongoQuery)
      .limit(filters?.limit || 20)
      .toArray();

    return results;
  } catch (error) {
    console.error('Failed to search MongoDB users:', error);
    Sentry.captureException(error, {
      tags: { database: 'mongodb', operation: 'search_users' },
      extra: { query, filters }
    });
    return [];
  }
}

/**
 * Get users by active profile type
 */
export async function getUsersByProfile(
  profileType: string,
  limit: number = 50
): Promise<MongoUserProfile[]> {
  if (!isMongoDbAvailable()) {
    return [];
  }

  try {
    const results = await mongoCollections
      .collection<MongoUserProfile>('user_profiles')
      .find({ active_profile: profileType })
      .limit(limit)
      .toArray();

    return results;
  } catch (error) {
    console.error('Failed to get users by profile:', error);
    Sentry.captureException(error, {
      tags: { database: 'mongodb', operation: 'get_users_by_profile' },
      extra: { profileType }
    });
    return [];
  }
}

// ============================================================
// DEFAULT SETTINGS
// ============================================================

function getDefaultNotificationSettings(): NotificationSettings {
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

function getDefaultThemeSettings(): ThemeSettings {
  return {
    mode: 'system',
    accent_color: '#3D84ED',
    font_size: 'medium',
  };
}

function getDefaultPrivacySettings(): PrivacySettings {
  return {
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    show_location: false,
    allow_messages_from: 'anyone',
  };
}
