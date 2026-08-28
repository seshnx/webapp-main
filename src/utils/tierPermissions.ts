import type { UserData } from '../types';

/**
 * Check if the user is on an ad-supported tier (Free / Basic)
 * Pro, Studio, and Enterprise users receive an ad-free experience.
 */
export function shouldShowAds(userData?: UserData | null): boolean {
  if (!userData) return true; // Unauthenticated or default users see ads

  const tier = (
    userData.subscriptionTier ||
    userData.tier ||
    'free'
  ).toLowerCase();

  const adFreeTiers = ['pro', 'studio', 'enterprise', 'label', 'unlimited'];
  return !adFreeTiers.includes(tier);
}

/**
 * Check if a user has active Priority Creator Visibility ("Blue Checkmark")
 */
export function isUserPriorityBoosted(userData?: any): boolean {
  if (!userData) return false;
  if (!userData.isPriorityBoosted) return false;
  if (userData.boostExpiresAt && userData.boostExpiresAt < Date.now()) {
    return false;
  }
  return true;
}
