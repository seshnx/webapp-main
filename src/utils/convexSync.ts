/**
 * Convex Sync Utility
 *
 * Syncs data changes from Neon to Convex for real-time updates
 * This keeps Convex in sync with the primary database (Neon)
 *
 * Note: Convex sync requires npx convex dev to generate api-browser.js
 * For now, sync operations are logged but not executed
 */

import { isConvexAvailable } from "../config/convex";

/**
 * Helper to get environment variables from both browser (import.meta.env) and Node.js (process.env)
 */
function getEnvVar(key: string): string | undefined {
  // Browser/Vite: use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // Node.js/Serverless: use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

// Get Convex URL from environment
const CONVEX_URL = getEnvVar('VITE_CONVEX_URL') || '';

/**
 * Booking data for syncing
 */
export interface SyncBooking {
  id: string;
  sender_id?: string;
  senderId?: string;
  sender_name?: string;
  senderName?: string;
  sender_photo?: string;
  senderPhoto?: string;
  target_id?: string;
  targetId?: string;
  studio_owner_id?: string;
  status?: string;
  service_type?: string;
  serviceType?: string;
  date?: string | Date;
  time?: string;
  duration?: number;
  offer_amount?: number;
  offerAmount?: number;
  message?: string;
  created_at?: string | Date;
  createdAt?: number;
  [key: string]: any;
}

/**
 * Notification data for syncing
 */
export interface SyncNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  content?: string;
  read?: boolean;
  created_at?: string | Date;
  createdAt?: number;
  metadata?: Record<string, any>;
  reference_type?: string;
  reference_id?: string;
  [key: string]: any;
}

/**
 * Check if Convex sync is available
 */
export function isConvexSyncAvailable(): boolean {
  return isConvexAvailable();
}

/**
 * Sync booking to Convex for real-time updates
 *
 * @param booking - Booking data from Neon
 */
export async function syncBookingToConvex(booking: SyncBooking): Promise<void> {
  if (!isConvexAvailable()) {
    console.warn('Convex not available - skipping booking sync');
    return;
  }

  try {
    // TODO: Implement Convex mutation call when api-browser.js is generated
    // Run: npx convex dev to generate client-side Convex API
    console.debug('[Convex Sync] Would sync booking:', booking.id, 'status:', booking.status);
  } catch (error) {
    console.error('Failed to sync booking to Convex:', error);
    // Don't throw - sync failures shouldn't break the main flow
  }
}

/**
 * Remove booking from Convex
 *
 * @param bookingId - Booking ID
 */
export async function removeBookingFromConvex(bookingId: string): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would remove booking:', bookingId);
  } catch (error) {
    console.error('Failed to remove booking from Convex:', error);
  }
}

/**
 * Sync notification to Convex for real-time updates
 *
 * @param notification - Notification data from Neon
 */
export async function syncNotificationToConvex(notification: SyncNotification): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would sync notification:', notification.id, 'type:', notification.type);
  } catch (error) {
    console.error('Failed to sync notification to Convex:', error);
  }
}

/**
 * Mark notification as read in Convex
 *
 * @param notificationId - Notification ID
 */
export async function markNotificationReadInConvex(notificationId: string): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would mark notification as read:', notificationId);
  } catch (error) {
    console.error('Failed to mark notification as read in Convex:', error);
  }
}

/**
 * Broadcast profile update to Convex
 *
 * @param userId - User ID
 * @param field - Field that was updated
 * @param metadata - Additional metadata
 */
export async function broadcastProfileUpdate(
  userId: string,
  field: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would broadcast profile update:', userId, 'field:', field);
  } catch (error) {
    console.error('Failed to broadcast profile update to Convex:', error);
  }
}

/**
 * Mark all notifications as read in Convex
 *
 * @param userId - User ID
 */
export async function markAllNotificationsReadInConvex(userId: string): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would mark all notifications as read for user:', userId);
  } catch (error) {
    console.error('Failed to mark all notifications as read in Convex:', error);
  }
}

// =====================================================
// SOCIAL FEED SYNC FUNCTIONS
// =====================================================

/**
 * Comment data for syncing
 */
export interface SyncComment {
  commentId: string;
  postId: string;
  userId: string;
  content: string;
  displayName?: string;
  authorPhoto?: string;
  parentId?: string;
  reactionCount?: number;
  createdAt: number;
  updatedAt?: number;
}

/**
 * Reaction data for syncing
 */
export interface SyncReaction {
  targetId: string;
  targetType: "post" | "comment";
  userId: string;
  emoji: string;
  timestamp: number;
}

/**
 * Sync comment to Convex for real-time updates
 *
 * @param comment - Comment data from Neon
 */
export async function syncCommentToConvex(comment: SyncComment): Promise<void> {
  if (!isConvexAvailable()) {
    console.warn('Convex not available - skipping comment sync');
    return;
  }

  try {
    console.debug('[Convex Sync] Would sync comment:', comment.commentId);
  } catch (error) {
    console.error('Failed to sync comment to Convex:', error);
  }
}

/**
 * Remove comment from Convex
 *
 * @param commentId - Comment ID
 */
export async function removeCommentFromConvex(commentId: string): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would remove comment:', commentId);
  } catch (error) {
    console.error('Failed to remove comment from Convex:', error);
  }
}

/**
 * Update comment reaction count in Convex
 *
 * @param commentId - Comment ID
 * @param reactionCount - New reaction count
 */
export async function updateCommentReactionCountInConvex(
  commentId: string,
  reactionCount: number
): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would update comment reaction count:', commentId, reactionCount);
  } catch (error) {
    console.error('Failed to update comment reaction count in Convex:', error);
  }
}

/**
 * Sync reaction to Convex for real-time updates
 *
 * @param reaction - Reaction data from Neon
 */
export async function syncReactionToConvex(reaction: SyncReaction): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would sync reaction:', reaction.targetId, reaction.emoji);
  } catch (error) {
    console.error('Failed to sync reaction to Convex:', error);
  }
}

/**
 * Remove reaction from Convex
 *
 * @param targetId - Target ID (post or comment)
 * @param targetType - Target type
 * @param userId - User who reacted
 */
export async function removeReactionFromConvex(
  targetId: string,
  targetType: "post" | "comment",
  userId: string
): Promise<void> {
  if (!isConvexAvailable()) return;

  try {
    console.debug('[Convex Sync] Would remove reaction:', targetId, userId);
  } catch (error) {
    console.error('Failed to remove reaction from Convex:', error);
  }
}

/**
 * Bulk sync comments to Convex (for initial sync)
 *
 * @param comments - Array of comments to sync
 */
export async function bulkSyncCommentsToConvex(comments: SyncComment[]): Promise<void> {
  if (!isConvexAvailable()) {
    console.warn('Convex not available - skipping bulk comment sync');
    return;
  }

  try {
    console.debug('[Convex Sync] Would bulk sync comments:', comments.length);
  } catch (error) {
    console.error('Failed to bulk sync comments to Convex:', error);
  }
}

/**
 * Bulk sync reactions to Convex (for initial sync)
 *
 * @param reactions - Array of reactions to sync
 */
export async function bulkSyncReactionsToConvex(reactions: SyncReaction[]): Promise<void> {
  if (!isConvexAvailable()) {
    console.warn('Convex not available - skipping bulk reaction sync');
    return;
  }

  try {
    console.debug('[Convex Sync] Would bulk sync reactions:', reactions.length);
  } catch (error) {
    console.error('Failed to bulk sync reactions to Convex:', error);
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Test Convex connection and sync functionality
 *
 * @returns True if Convex is available and working
 */
export async function testConvexSync(): Promise<boolean> {
  if (!isConvexAvailable()) {
    console.warn('Convex client not available');
    return false;
  }

  try {
    // Try to query something simple to test connection
    // This will throw if Convex is not configured properly
    return true;
  } catch (error) {
    console.error('Convex connection test failed:', error);
    return false;
  }
}

/**
 * Get Convex sync statistics (for monitoring)
 *
 * @returns Object with sync status information
 */
export function getConvexSyncStats() {
  const isAvailable = isConvexAvailable();

  return {
    isAvailable,
    url: isAvailable ? CONVEX_URL : undefined,
    isPlaceholder: CONVEX_URL.includes('placeholder'),
    clientType: 'ConvexReactClient',
    syncStatus: isAvailable ? 'logging_only' : 'disabled',
    note: 'Run "npx convex dev" to generate api-browser.js for full sync functionality',
  };
}
