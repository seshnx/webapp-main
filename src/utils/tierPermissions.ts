import type { UserData } from '../types';

/**
 * Get the sponsored ad insertion interval (number of organic posts between ads)
 * - Free / Basic / Default: 1 ad every 5 posts (100% normal frequency)
 * - Pro / Studio / Enterprise: 1 ad every 50 posts (10% of Free/Basic frequency = 90% reduction)
 */
export function getAdInterval(userData?: UserData | null): number {
  if (!userData) return 5;

  const tier = (
    userData.subscriptionTier ||
    userData.tier ||
    'free'
  ).toLowerCase();

  const reducedAdTiers = ['pro', 'studio', 'enterprise', 'label', 'unlimited'];
  if (reducedAdTiers.includes(tier)) {
    return 50; // 10% of standard frequency (every 50 posts instead of every 5)
  }

  return 5; // Standard frequency for Free / Basic
}

/**
 * Check if the user is eligible to receive sponsored ads.
 * All tiers receive ads at their respective tier-adjusted frequency.
 */
export function shouldShowAds(userData?: UserData | null): boolean {
  return true;
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
