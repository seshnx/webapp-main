/**
 * Convex Sync Utility
 *
 * Syncs data changes from Neon to Convex for real-time updates
 * This keeps Convex in sync with the primary database (Neon)
 */

import { fetchMutation, fetchQuery } from "convex/nextjs";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

/**
 * Sync booking to Convex for real-time updates
 *
 * @param {object} booking - Booking data from Neon
 * @returns {Promise<void>}
 */
export async function syncBookingToConvex(booking) {
  if (!CONVEX_URL) {
    console.warn('Convex URL not configured');
    return;
  }

  try {
    await fetchMutation(CONVEX_URL, "bookings", "syncBooking", {
      id: booking.id,
      senderId: booking.sender_id || booking.senderId,
      senderName: booking.sender_name || booking.senderName,
      senderPhoto: booking.sender_photo || booking.senderPhoto,
      targetId: booking.target_id || booking.targetId || booking.studio_owner_id,
      status: booking.status,
      serviceType: booking.service_type || booking.serviceType,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      offerAmount: booking.offer_amount || booking.offerAmount,
      message: booking.message,
      createdAt: booking.created_at ? new Date(booking.created_at).getTime() : undefined,
    });
  } catch (error) {
    console.error('Failed to sync booking to Convex:', error);
  }
}

/**
 * Remove booking from Convex
 *
 * @param {string} bookingId - Booking ID
 * @returns {Promise<void>}
 */
export async function removeBookingFromConvex(bookingId) {
  if (!CONVEX_URL) return;

  try {
    await fetchMutation(CONVEX_URL, "bookings", "removeBooking", {
      bookingId,
    });
  } catch (error) {
    console.error('Failed to remove booking from Convex:', error);
  }
}

/**
 * Sync notification to Convex for real-time updates
 *
 * @param {object} notification - Notification data from Neon
 * @returns {Promise<void>}
 */
export async function syncNotificationToConvex(notification) {
  if (!CONVEX_URL) return;

  try {
    await fetchMutation(CONVEX_URL, "notifications", "syncNotification", {
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message || notification.content,
      read: notification.read || false,
      createdAt: notification.created_at ? new Date(notification.created_at).getTime() : undefined,
      metadata: notification.metadata || notification.reference_id ? {
        referenceType: notification.reference_type,
        referenceId: notification.reference_id,
      } : undefined,
    });
  } catch (error) {
    console.error('Failed to sync notification to Convex:', error);
  }
}

/**
 * Mark notification as read in Convex
 *
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function markNotificationReadInConvex(notificationId) {
  if (!CONVEX_URL) return;

  try {
    await fetchMutation(CONVEX_URL, "notifications", "markAsRead", {
      notificationId,
    });
  } catch (error) {
    console.error('Failed to mark notification as read in Convex:', error);
  }
}

/**
 * Broadcast profile update to Convex
 *
 * @param {string} userId - User ID
 * @param {string} field - Field that was updated
 * @param {object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
export async function broadcastProfileUpdate(userId, field, metadata = {}) {
  if (!CONVEX_URL) return;

  try {
    await fetchMutation(CONVEX_URL, "profileUpdates", "broadcastProfileUpdate", {
      userId,
      field,
      metadata,
    });
  } catch (error) {
    console.error('Failed to broadcast profile update to Convex:', error);
  }
}

/**
 * Mark all notifications as read in Convex
 *
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function markAllNotificationsReadInConvex(userId) {
  if (!CONVEX_URL) return;

  try {
    await fetchMutation(CONVEX_URL, "notifications", "markAllAsRead", {
      userId,
    });
  } catch (error) {
    console.error('Failed to mark all notifications as read in Convex:', error);
  }
}
