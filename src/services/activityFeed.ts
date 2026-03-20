/**
 * Activity Feed Service
 *
 * Aggregates activity data from Convex (social, bookings, EDU, notifications)
 * to create a unified activity feed for the dashboard.
 */

import type { ActivityItem, ActivityFilter } from '../types/dashboard';
import { MessageCircle, Calendar, TrendingUp, Bell, AlertTriangle, Sparkles } from 'lucide-react';

// Import Convex functions
import { fetchQuery } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

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
    // Fetch data from multiple sources in parallel using Convex
    const [posts, bookings, eduAnnouncements] = await Promise.all([
      fetchPostActivity(userId, filter?.limit),
      fetchBookingActivity(userId, filter?.limit),
      fetchEDUAnnouncementActivity(userId, filter?.limit)
      // TODO: Add notification activity when implemented
      // fetchNotificationActivity(userId, filter?.limit),
      // TODO: Add payment activity when implemented
      // fetchPaymentActivity(userId, filter?.limit)
    ]);

    activities.push(...posts, ...bookings, ...eduAnnouncements);

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
    // Fetch posts from Convex
    const posts = await fetchQuery(api.social.getPostsByAuthor, {
      authorId: userId,
      limit
    });

    return (posts || []).map(post => ({
      id: `post-${post._id}`,
      type: 'post' as const,
      timestamp: new Date(post.createdAt),
      actor: {
        id: post.authorId,
        displayName: post.authorName || 'Unknown',
        photoURL: post.authorPhoto
      },
      content: {
        title: 'New post created',
        description: post.content?.substring(0, 100) + (post.content?.length > 100 ? '...' : ''),
        metadata: {
          postId: post._id,
          likesCount: post.likeCount || 0,
          commentsCount: post.commentCount || 0
        }
      },
      actionUrl: `/feed/post/${post._id}`,
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
 * Fetch recent bookings as activity items
 */
async function fetchBookingActivity(userId: string, limit = 5): Promise<ActivityItem[]> {
  try {
    // Fetch upcoming bookings from Convex
    const bookings = await fetchQuery(api.bookings.getUpcomingBookings, {
      clientId: userId,
      limit
    });

    return (bookings || []).map(booking => ({
      id: `booking-${booking._id}`,
      type: 'booking' as const,
      timestamp: new Date(booking.startTime),
      content: {
        title: 'Booking confirmed',
        description: `${booking.roomName} - ${new Date(booking.startTime).toLocaleDateString()}`,
        metadata: {
          bookingId: booking._id,
          studioName: booking.studioName
        }
      },
      actionUrl: `/bookings/${booking._id}`,
      icon: ACTIVITY_ICONS.booking,
      priority: 'high' as const,
      read: false
    }));
  } catch (error) {
    console.error('Error fetching booking activity:', error);
    return [];
  }
}

/**
 * Fetch EDU announcements as activity items
 */
async function fetchEDUAnnouncementActivity(userId: string, limit = 5): Promise<ActivityItem[]> {
  try {
    // Get user's school ID and type from their profile
    const user = await fetchQuery(api.users.getUserByClerkId, { clerkId: userId });

    if (!user?.schoolId) {
      return [];
    }

    // Determine user type
    const userType = user?.accountTypes?.includes('Student') ? 'student' : 'staff';

    // Fetch unread announcements
    const announcements = await fetchQuery(api.eduAnnouncements.getUnreadEduAnnouncements, {
      userId,
      schoolId: user.schoolId,
      userType
    });

    return (announcements || []).slice(0, limit).map(announcement => ({
      id: `announcement-${announcement._id}`,
      type: 'announcement' as const,
      timestamp: new Date(announcement.createdAt),
      actor: announcement.createdByName ? {
        id: announcement.createdBy,
        displayName: announcement.createdByName,
        photoURL: announcement.createdByPhoto
      } : undefined,
      content: {
        title: announcement.title,
        description: announcement.content?.substring(0, 100) + (announcement.content?.length > 100 ? '...' : ''),
        metadata: {
          announcementId: announcement._id,
          priority: announcement.priority,
          category: announcement.category
        }
      },
      actionUrl: `/edu/announcements/${announcement._id}`,
      icon: ACTIVITY_ICONS.announcement,
      priority: (announcement.priority === 'urgent' ? 'high' : announcement.priority === 'low' ? 'low' : 'medium') as ActivityItem['priority'],
      read: false
    }));
  } catch (error) {
    console.error('Error fetching EDU announcement activity:', error);
    return [];
  }
}

/**
 * Fetch recent payments as activity items
 * TODO: Implement when payment system is ready
 */
async function fetchPaymentActivity(userId: string, limit = 5): Promise<ActivityItem[]> {
  try {
    // const payments = await fetchQuery(api.bookings.getPaymentsByUser, { userId, limit });

    // Not implemented yet
    return [];
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
