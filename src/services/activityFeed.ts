/**
 * Activity Feed Service
 *
 * Aggregates activity data from multiple sources (Neon + MongoDB)
 * to create a unified activity feed for the dashboard.
 */

import type { ActivityItem, ActivityFilter } from '../types/dashboard';
// import { getPosts } from '../config/mongoSocial';
// import { getSocialNotifications } from '../config/mongoSocial';

const getPosts = async (args: any) => [];
const getSocialNotifications = async (userId: string, limit: number) => [];

// Import Neon queries when available
// import { getBookings, getPayments } from '../config/neonQueries';

import { MessageCircle, Calendar, TrendingUp, Bell, AlertTriangle, Sparkles } from 'lucide-react';

// =====================================================
// ICON MAPPING
// =====================================================

const ACTIVITY_ICONS: Record<ActivityItem['type'], React.ElementType> = {
  post: MessageCircle,
  booking: Calendar,
  notification: Bell,
  payment: TrendingUp,
  alert: AlertTriangle,
  announcement: Sparkles
};

// =====================================================
// DATA AGGREGATION FUNCTIONS
// =====================================================

/**
 * Fetch activity feed from all sources
 */
export async function fetchActivityFeed(
  userId: string,
  filter?: ActivityFilter
): Promise<ActivityItem[]> {
  const activities: ActivityItem[] = [];

  try {
    // Fetch data from multiple sources in parallel
    const [posts, notifications] = await Promise.all([
      fetchPostActivity(userId, filter?.limit),
      fetchNotificationActivity(userId, filter?.limit)
      // TODO: Add Neon data sources
      // fetchBookingActivity(userId, filter?.limit),
      // fetchPaymentActivity(userId, filter?.limit)
    ]);

    activities.push(...posts, ...notifications);

    // Sort by timestamp (newest first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply filters
    let filtered = activities;

    if (filter?.types && filter.types.length > 0) {
      filtered = filtered.filter(item => filter.types!.includes(item.type));
    }

    if (filter?.priorities && filter.priorities.length > 0) {
      filtered = filtered.filter(item => filter.priorities!.includes(item.priority));
    }

    if (filter?.startDate) {
      filtered = filtered.filter(item => item.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter(item => item.timestamp <= filter.endDate!);
    }

    // Apply limit and offset
    const limit = filter?.limit || 20;
    const offset = filter?.offset || 0;

    return filtered.slice(offset, offset + limit);
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }
}

/**
 * Fetch recent posts as activity items
 */
async function fetchPostActivity(userId: string, limit = 10): Promise<ActivityItem[]> {
  try {
    const posts = await getPosts({
      author_id: userId,
      limit
    });

    return posts.map(post => ({
      id: `post-${post.id}`,
      type: 'post' as const,
      timestamp: new Date(post.created_at),
      actor: {
        id: post.author_id,
        displayName: post.display_name || 'Unknown',
        photoURL: post.author_photo
      },
      content: {
        title: 'New post created',
        description: post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : ''),
        metadata: {
          postId: post.id,
          likesCount: post.engagement?.likes_count || 0,
          commentsCount: post.engagement?.comments_count || 0
        }
      },
      actionUrl: `/feed/post/${post.id}`,
      icon: ACTIVITY_ICONS.post,
      priority: 'medium' as const,
      read: false
    }));
  } catch (error) {
    console.error('Error fetching post activity:', error);
    return [];
  }
}

/**
 * Fetch notifications as activity items
 */
async function fetchNotificationActivity(userId: string, limit = 10): Promise<ActivityItem[]> {
  try {
    const notifications = await getSocialNotifications(userId, limit);

    return notifications.map(notification => ({
      id: `notification-${notification._id || notification.id}`,
      type: 'notification' as const,
      timestamp: new Date(notification.created_at),
      actor: notification.actor_id ? {
        id: notification.actor_id,
        displayName: notification.actor_display_name || 'Someone',
        photoURL: notification.actor_photo
      } : undefined,
      content: {
        title: notification.title || 'Notification',
        description: notification.message,
        metadata: {
          notificationId: notification._id || notification.id,
          type: notification.type
        }
      },
      actionUrl: notification.action_url,
      icon: ACTIVITY_ICONS.notification,
      priority: notification.priority as ActivityItem['priority'] || 'medium',
      read: notification.read
    }));
  } catch (error) {
    console.error('Error fetching notification activity:', error);
    return [];
  }
}

/**
 * Fetch recent bookings as activity items
 * TODO: Implement when Neon booking queries are available
 */
async function fetchBookingActivity(userId: string, limit = 5): Promise<ActivityItem[]> {
  try {
    // const bookings = await getBookings(userId, { limit, status: 'Confirmed' });

    // Mock data for now
    return [];
    /*
    return bookings.map(booking => ({
      id: `booking-${booking.id}`,
      type: 'booking' as const,
      timestamp: new Date(booking.start_time),
      content: {
        title: 'Booking confirmed',
        description: `${booking.venue_name} - ${formatDate(booking.start_time)}`,
        metadata: { bookingId: booking.id }
      },
      actionUrl: `/bookings/${booking.id}`,
      icon: ACTIVITY_ICONS.booking,
      priority: 'high' as const,
      read: false
    }));
    */
  } catch (error) {
    console.error('Error fetching booking activity:', error);
    return [];
  }
}

/**
 * Fetch recent payments as activity items
 * TODO: Implement when Neon payment queries are available
 */
async function fetchPaymentActivity(userId: string, limit = 5): Promise<ActivityItem[]> {
  try {
    // const payments = await getPayments(userId, { limit });

    // Mock data for now
    return [];
    /*
    return payments.map(payment => ({
      id: `payment-${payment.id}`,
      type: 'payment' as const,
      timestamp: new Date(payment.created_at),
      content: {
        title: 'Payment received',
        description: `$${payment.amount} - ${payment.description}`,
        metadata: { paymentId: payment.id }
      },
      actionUrl: `/payments/${payment.id}`,
      icon: ACTIVITY_ICONS.payment,
      priority: 'high' as const,
      read: false
    }));
    */
  } catch (error) {
    console.error('Error fetching payment activity:', error);
    return [];
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Create a manual activity item (for system-generated events)
 */
export function createActivityItem(
  type: ActivityItem['type'],
  content: ActivityItem['content'],
  options?: {
    actor?: ActivityItem['actor'];
    actionUrl?: string;
    priority?: ActivityItem['priority'];
    metadata?: Record<string, any>;
  }
): ActivityItem {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date(),
    actor: options?.actor,
    content,
    actionUrl: options?.actionUrl,
    icon: ACTIVITY_ICONS[type],
    priority: options?.priority || 'medium',
    read: false
  };
}

/**
 * Mark an activity as read
 * TODO: Implement persistence when needed
 */
export async function markActivityAsRead(activityId: string): Promise<void> {
  try {
    // For notifications, update in MongoDB
    if (activityId.startsWith('notification-')) {
      const notificationId = activityId.replace('notification-', '');
      // await markNotificationAsRead(notificationId);
    }
    // For other types, we might need a separate activity tracking system
  } catch (error) {
    console.error('Error marking activity as read:', error);
  }
}

/**
 * Mark all activities as read
 * TODO: Implement persistence when needed
 */
export async function markAllActivitiesAsRead(userId: string): Promise<void> {
  try {
    // Mark all notifications as read
    // await markAllNotificationsAsRead(userId);
  } catch (error) {
    console.error('Error marking all activities as read:', error);
  }
}

/**
 * Format activity timestamp for display
 */
export function formatActivityTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return timestamp.toLocaleDateString();
}

/**
 * Get activity feed stats
 */
export async function getActivityFeedStats(userId: string): Promise<{
  unreadCount: number;
  totalCount: number;
  byType: Record<ActivityItem['type'], number>;
}> {
  try {
    const activities = await fetchActivityFeed(userId);

    return {
      unreadCount: activities.filter(a => !a.read).length,
      totalCount: activities.length,
      byType: activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {} as Record<ActivityItem['type'], number>)
    };
  } catch (error) {
    console.error('Error getting activity feed stats:', error);
    return {
      unreadCount: 0,
      totalCount: 0,
      byType: {
        post: 0,
        booking: 0,
        notification: 0,
        payment: 0,
        alert: 0,
        announcement: 0
      }
    };
  }
}
