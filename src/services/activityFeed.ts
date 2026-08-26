/**
 * Activity Feed Service
 *
 * Aggregates activity data from Convex (social, bookings, EDU, notifications)
 * to create a unified activity feed for the dashboard.
 *
 * NOTE: These functions should be called from within React components
 * that have access to ConvexProvider context.
 */

import type { ActivityItem, ActivityFilter } from '../types/dashboard';
import { MessageCircle, Calendar, TrendingUp, Bell, AlertTriangle, Sparkles } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

// =====================================================
// REACT HOOKS FOR ACTIVITY DATA
// =====================================================

/**
 * Hook to fetch post activity for the current user
 */
export function usePostActivity(userId: string | undefined, limit = 10) {
  const posts = useQuery(
    api.social.getPostsByAuthor,
    userId ? { clerkId: userId, limit } : "skip"
  );

  return {
    data: (posts || []).map(post => ({
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
    })),
    isLoading: posts === undefined,
    error: posts === null
  };
}

/**
 * Hook to fetch booking activity for the current user
 */
export function useBookingActivity(userId: string | undefined, limit = 5) {
  const bookings = useQuery(
    api.sbookings.getUpcomingBookings,
    userId ? { clerkId: userId, limit } : "skip"
  );

  return {
    data: (bookings || []).map(booking => ({
      id: `booking-${booking._id}`,
      type: 'booking' as const,
      timestamp: new Date(booking.startTime),
      actor: {
        id: booking.clientId,
        displayName: booking.clientName || 'Client',
        photoURL: booking.clientPhoto
      },
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
    })),
    isLoading: bookings === undefined,
    error: bookings === null
  };
}

/**
 * Hook to fetch EDU announcement activity
 */
export function useEDUAnnouncementActivity(userId: string | undefined, limit = 5) {
  // First get the user to check if they have a school
  const user = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const userType = user?.accountTypes?.includes('Student') ? 'student' : 'staff';

  // Only fetch announcements if user has a schoolId
  const shouldFetchAnnouncements = user?.schoolId && userId;

  const announcements = useQuery(
    api.eduAnnouncements.getUnreadEduAnnouncements,
    shouldFetchAnnouncements ? {
      userId,
      schoolId: user.schoolId as Id<"schools">,
      userType
    } : "skip"
  );

  // Determine loading state - only loading if we're actually fetching and haven't gotten results yet
  const isLoading = shouldFetchAnnouncements
    ? (user === undefined || announcements === undefined)
    : false; // Not loading if we don't have a schoolId

  return {
    data: (announcements || []).slice(0, limit).map(announcement => ({
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
      priority: announcement.priority === 'urgent' ? 'high' as const : 'medium' as const,
      read: false
    })),
    isLoading,
    error: user === null || announcements === null
  };
}

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
 * Main React hook to fetch activity feed from all sources
 * This should be used within React components that have access to ConvexProvider
 */
export function useActivityFeed(userId: string | undefined, filter?: ActivityFilter) {
  // Use the individual hooks to fetch data from different sources
  const posts = usePostActivity(userId, filter?.limit);
  const bookings = useBookingActivity(userId, filter?.limit);
  const eduAnnouncements = useEDUAnnouncementActivity(userId, filter?.limit);

  // Combine all activities
  const activities = [
    ...(posts.data || []),
    ...(bookings.data || []),
    ...(eduAnnouncements.data || [])
  ];

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

  return {
    data: filtered.slice(offset, offset + limit),
    isLoading: posts.isLoading || bookings.isLoading || eduAnnouncements.isLoading,
    error: posts.error || bookings.error || eduAnnouncements.error
  };
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use useActivityFeed hook instead
 */
export async function fetchActivityFeed(
  userId: string,
  filter?: ActivityFilter
): Promise<ActivityItem[]> {
  console.warn('fetchActivityFeed should only be called from React components. Use useActivityFeed hook instead.');
  return [];
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
