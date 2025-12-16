// Legacy Firebase config shim.
//
// This project has been migrated off Firebase. These exports exist only so older
// components can continue to function. Authentication should use Supabase directly.

export const appId = import.meta.env.VITE_APP_ID || 'seshnx-70c04';

// Placeholder objects for legacy compatibility
export const app = { id: appId };
export const db = { __type: 'supabase-firestore-compat' };
export const rtdb = null;

export const storage = {
  bucket: import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'public',
};

// Auth is no longer exported - use Supabase directly via supabase.auth
// This prevents adapter dependencies and ensures direct Supabase usage
export const auth = null;

export const getPaths = (uid) => {
  // When called without uid, return shared constants.
  if (!uid) {
    return {
      publicProfileCollectionGroup: 'public_profile',
    };
  }

  return {
    // Core profile docs
    userProfile: `artifacts/${appId}/users/${uid}/profiles/main`,
    userPublicProfile: `artifacts/${appId}/users/${uid}/public_profile/main`,
    userWallet: `artifacts/${appId}/users/${uid}/wallet/account`,

    // Social
    followers: `artifacts/${appId}/users/${uid}/followers`,
    following: `artifacts/${appId}/users/${uid}/following`,
    savedPosts: `artifacts/${appId}/users/${uid}/saved_posts`,
    notifications: `artifacts/${appId}/users/${uid}/notifications`,

    // EDU
    studentRecord: (schoolId, studentId) => `schools/${schoolId}/students/${studentId}`,

    // Labels
    labelRoster: () => `artifacts/${appId}/users/${uid}/label_roster`,

    // Marketplace
    marketplaceItems: `artifacts/${appId}/users/${uid}/marketplace_items`,
    userLibrary: `artifacts/${appId}/users/${uid}/library`,
    marketAssets: `users/${uid}/market_assets`,

    // Gear exchange
    gearListings: `artifacts/${appId}/users/${uid}/gear_listings`,

    // Distribution
    distributionReleases: `artifacts/${appId}/users/${uid}/distribution_releases`,
    royaltyReports: `artifacts/${appId}/users/${uid}/royalty_reports`,
    distributionStats: `artifacts/${appId}/distribution/stats/${uid}`,

    // Tech
    equipmentSubmissions: `artifacts/${appId}/users/${uid}/equipment_submissions`,

    // Sub-profiles by role
    userSubProfile: (role) => `artifacts/${appId}/users/${uid}/profiles/${role}`,

    // Public profile collectionGroup name
    publicProfileCollectionGroup: 'public_profile',
  };
};
