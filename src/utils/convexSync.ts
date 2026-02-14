/**
 * Convex Sync Utility
 *
 * Syncs data changes from Neon to Convex for real-time updates
 * This keeps Convex in sync with the primary database (Neon)
 */

import { fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || '';

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
 * Sync booking to Convex for real-time updates
 *
 * @param booking - Booking data from Neon
 */
export async function syncBookingToConvex(booking: SyncBooking): Promise<void> {
  if (!CONVEX_URL) {
    console.warn('Convex URL not configured');
    return;
  }

  try {
    // TODO: Implement proper Convex mutation call
    // await fetchMutation(CONVEX_URL, api.bookings.syncBooking, { ... });
    console.debug('Sync booking to Convex:', booking.id);
  } catch (error) {
    console.error('Failed to sync booking to Convex:', error);
  }
}

/**
 * Remove booking from Convex
 *
 * @param bookingId - Booking ID
 */
export async function removeBookingFromConvex(bookingId: string): Promise<void> {
  if (!CONVEX_URL) return;
  try {
    // TODO: Implement proper Convex mutation call
    console.debug('Remove booking from Convex:', bookingId);
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
  if (!CONVEX_URL) return;
  try {
    // TODO: Implement proper Convex mutation call
    console.debug('Sync notification to Convex:', notification.id);
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
  if (!CONVEX_URL) return;
  try {
    // TODO: Implement proper Convex mutation call
    console.debug('Mark notification as read in Convex:', notificationId);
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
  if (!CONVEX_URL) return;
  try {
    // TODO: Implement proper Convex mutation call
    console.debug('Broadcast profile update to Convex:', userId, field);
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
  if (!CONVEX_URL) return;
  try {
    // TODO: Implement proper Convex mutation call
    console.debug('Mark all notifications as read in Convex:', userId);
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
  if (!CONVEX_URL) {
    console.warn('Convex URL not configured');
    return;
  }

  try {
    await fetchMutation(api.comments.syncComment, {
      commentId: comment.commentId,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      displayName: comment.displayName,
      authorPhoto: comment.authorPhoto,
      parentId: comment.parentId,
      reactionCount: comment.reactionCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
    console.debug('Synced comment to Convex:', comment.commentId);
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
  if (!CONVEX_URL) return;
  try {
    await fetchMutation(api.comments.deleteComment, { commentId });
    console.debug('Removed comment from Convex:', commentId);
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
  if (!CONVEX_URL) return;
  try {
    await fetchMutation(api.comments.updateReactionCount, {
      commentId,
      reactionCount,
    });
    console.debug('Updated comment reaction count in Convex:', commentId, reactionCount);
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
  if (!CONVEX_URL) return;
  try {
    await fetchMutation(api.reactions.syncReaction, {
      targetId: reaction.targetId,
      targetType: reaction.targetType,
      userId: reaction.userId,
      emoji: reaction.emoji,
      timestamp: reaction.timestamp,
    });
    console.debug('Synced reaction to Convex:', reaction.targetId, reaction.emoji);
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
  if (!CONVEX_URL) return;
  try {
    await fetchMutation(api.reactions.removeReaction, {
      targetId,
      targetType,
      userId,
    });
    console.debug('Removed reaction from Convex:', targetId, userId);
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
  if (!CONVEX_URL) return;
  try {
    await fetchMutation(api.comments.bulkSyncComments, { comments });
    console.debug('Bulk synced comments to Convex:', comments.length);
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
  if (!CONVEX_URL) return;
  try {
    await fetchMutation(api.reactions.bulkSyncReactions, { reactions });
    console.debug('Bulk synced reactions to Convex:', reactions.length);
  } catch (error) {
    console.error('Failed to bulk sync reactions to Convex:', error);
  }
}
