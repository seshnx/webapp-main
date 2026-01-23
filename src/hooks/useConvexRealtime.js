/**
 * Real-time hooks using Convex
 *
 * These hooks provide real-time updates for bookings, notifications, and profile changes
 * using Convex instead of polling or Supabase subscriptions
 */

import { useQuery, useMutation, useSubscription } from "../../convex/_generated/react";
import { api } from "../../convex/_generated/api";

/**
 * Hook for real-time pending bookings (for studio owners)
 * Automatically updates when new booking requests come in
 */
export function usePendingBookings(targetId) {
  const { data: bookings, isLoading } = useQuery(
    api.bookings.getPendingBookings,
    { targetId },
    // Enabled only if targetId is provided
    targetId ? undefined : false
  );

  return {
    bookings: bookings || [],
    isLoading,
    count: bookings?.length || 0,
  };
}

/**
 * Hook for real-time all bookings for a user
 * Updates when bookings are created, updated, or status changes
 */
export function useUserBookings(userId) {
  const { data: bookings, isLoading } = useQuery(
    api.bookings.getBookingsByUser,
    { userId },
    userId ? undefined : false
  );

  return {
    bookings: bookings || [],
    isLoading,
  };
}

/**
 * Hook for real-time notifications for a user
 * Automatically updates when new notifications arrive
 */
export function useNotifications(userId) {
  const { data: notifications, isLoading } = useQuery(
    api.notifications.getNotifications,
    { userId },
    userId ? undefined : false
  );

  return {
    notifications: notifications || [],
    isLoading,
  };
}

/**
 * Hook for real-time unread notifications
 */
export function useUnreadNotifications(userId) {
  const { data: notifications, isLoading } = useQuery(
    api.notifications.getUnreadNotifications,
    { userId },
    userId ? undefined : false
  );

  return {
    notifications: notifications || [],
    isLoading,
    count: notifications?.length || 0,
  };
}

/**
 * Hook for unread notification count
 */
export function useUnreadNotificationCount(userId) {
  const { data: count, isLoading } = useQuery(
    api.notifications.getUnreadCount,
    { userId },
    userId ? undefined : false
  );

  return {
    count: count || 0,
    isLoading,
  };
}

/**
 * Hook for marking notification as read
 */
export function useMarkNotificationRead() {
  const markAsRead = useMutation(api.notifications.markAsRead);

  return {
    markAsRead: async (notificationId) => {
      await markAsRead.mutate({ notificationId });
    },
    isLoading: markAsRead.isLoading,
  };
}

/**
 * Hook for marking all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  return {
    markAllAsRead: async (userId) => {
      await markAllAsRead.mutate({ userId });
    },
    isLoading: markAllAsRead.isLoading,
  };
}

/**
 * Hook for real-time profile updates
 */
export function useProfileUpdates(userId) {
  const { data: updates, isLoading } = useQuery(
    api.profileUpdates.getProfileUpdates,
    { userId },
    userId ? undefined : false
  );

  return {
    updates: updates || [],
    isLoading,
    hasUpdates: (updates?.length || 0) > 0,
  };
}

/**
 * Hook to broadcast profile updates
 */
export function useBroadcastProfileUpdate() {
  const broadcast = useMutation(api.profileUpdates.broadcastProfileUpdate);

  return {
    broadcast: async (userId, field, metadata) => {
      await broadcast.mutate({ userId, field, metadata });
    },
    isLoading: broadcast.isLoading,
  };
}
