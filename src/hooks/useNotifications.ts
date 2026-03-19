import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated';
import { useMemo } from 'react';

/**
 * Extended notification interface with UI properties
 */
export interface UINotification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  read: boolean;
  timestamp: Date;
  actionData?: Record<string, any>;
  fromUserId?: string;
  fromUserName?: string;
  fromUserPhoto?: string | null;
  postId?: string | null;
  postPreview?: string | null;
  commentId?: string | null;
}

/**
 * Notification types
 */
export type NotificationType =
  | 'follow'      // Someone followed you
  | 'like'        // Someone reacted to your post
  | 'comment'     // Someone commented on your post
  | 'mention'     // Someone mentioned you in a post/comment
  | 'reply'       // Someone replied to your comment
  | 'save';       // Someone saved your post

/**
 * Create notification parameters
 */
export interface CreateNotificationParams {
  targetUserId: string;
  type: NotificationType;
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto?: string | null;
  postId?: string | null;
  postPreview?: string | null;
  commentId?: string | null;
  message?: string | null;
}

/**
 * Notifications hook return value
 */
export interface UseNotificationsReturn {
  notifications: UINotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

/**
 * Hook for managing user notifications
 * Now uses Convex real-time subscriptions - no polling needed!
 *
 * @param clerkUserId - The authenticated user's Clerk ID
 * @param fetchLimit - Max notifications to fetch (default 50)
 * @returns Notifications state and controls
 *
 * @example
 * function NotificationCenter({ userId }) {
 *   const {
 *     notifications,
 *     unreadCount,
 *     markAsRead,
 *     markAllAsRead
 *   } = useNotifications(userId, 50);
 *
 *   return (
 *     <div>
 *       <h2>Notifications ({unreadCount})</h2>
 *       <button onClick={markAllAsRead}>Mark all as read</button>
 *       {notifications.map(notif => (
 *         <NotificationItem
 *           key={notif.id}
 *           notification={notif}
 *           onRead={() => markAsRead(notif.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useNotifications(
  clerkUserId: string | null | undefined,
  fetchLimit: number = 50
): UseNotificationsReturn {
  // Get notifications from Convex (real-time!)
  const notifications = useQuery(
    api.notifications.getNotifications,
    clerkUserId ? { userId: clerkUserId, limit: fetchLimit } : "skip"
  );

  // Get unread count from Convex
  const unreadCountData = useQuery(
    api.notifications.getUnreadCount,
    clerkUserId ? { userId: clerkUserId } : "skip"
  );

  // Mutations
  const markAsReadMutation = useMutation(api.notifications.markAsRead);
  const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead);
  const deleteMutation = useMutation(api.notifications.deleteNotification);
  const clearAllMutation = useMutation(api.notifications.clearAll);

  // Transform Convex notifications to UI format
  const uiNotifications: UINotification[] = useMemo(() => {
    if (!notifications) return [];

    return notifications.map(notif => ({
      id: notif._id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      timestamp: new Date(notif.createdAt),
      actionData: notif.actionData,
      fromUserId: notif.actionData?.fromUserId,
      fromUserName: notif.actionData?.fromUserName,
      fromUserPhoto: notif.actionData?.fromUserPhoto,
      postId: notif.actionData?.postId,
      postPreview: notif.actionData?.postPreview,
      commentId: notif.actionData?.commentId,
    }));
  }, [notifications]);

  const unreadCount = unreadCountData?.count || 0;
  const loading = notifications === undefined;

  /**
   * Mark a single notification as read
   */
  const markAsRead = async (notificationId: string): Promise<void> => {
    if (!clerkUserId) return;

    try {
      await markAsReadMutation({
        notificationId: notificationId as any,
      });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async (): Promise<void> => {
    if (!clerkUserId || unreadCount === 0) return;

    try {
      await markAllAsReadMutation({
        userId: clerkUserId,
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  /**
   * Delete a notification
   */
  const deleteNotification = async (notificationId: string): Promise<void> => {
    if (!clerkUserId) return;

    try {
      await deleteMutation({
        notificationId: notificationId as any,
      });
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  /**
   * Clear all notifications (soft delete)
   */
  const clearAll = async (): Promise<void> => {
    if (!clerkUserId) return;

    try {
      await clearAllMutation({
        userId: clerkUserId,
      });
    } catch (error) {
      console.error('Clear all error:', error);
    }
  };

  return {
    notifications: uiNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
}

/**
 * Helper function to create notifications (use in other parts of the app)
 * Call this when actions happen that should notify users
 *
 * @param params - Notification parameters
 *
 * @example
 * // When someone follows a user
 * await createNotification({
 *   targetUserId: 'user_123',
 *   type: 'follow',
 *   fromUserId: 'user_456',
 *   fromUserName: 'Alice'
 * });
 *
 * // When someone likes a post
 * await createNotification({
 *   targetUserId: 'user_123',
 *   type: 'like',
 *   fromUserId: 'user_456',
 *   fromUserName: 'Alice',
 *   postId: 'post_789',
 *   postPreview: 'Great post!'
 * });
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const {
    targetUserId,
    type,
    fromUserId,
    fromUserName,
    fromUserPhoto = null,
    postId = null,
    postPreview = null,
    commentId = null,
    message = null
  } = params;

  if (!targetUserId || targetUserId === fromUserId) return; // Don't notify yourself

  // This would need to be called from a context where we have access to Convex client
  // For now, log a warning - this should be called via Convex mutation from the action
  console.warn('createNotification: Use Convex mutation api.notifications.create from your action handler');
}

/**
 * Notification message templates
 */
export const NOTIFICATION_MESSAGES: Record<NotificationType, string> = {
  follow: 'started following you',
  like: 'reacted to your post',
  comment: 'commented on your post',
  mention: 'mentioned you',
  reply: 'replied to your comment',
  save: 'saved your post'
};

/**
 * Get notification icon based on type
 *
 * @param type - Notification type
 * @returns Icon name (for lucide-react or similar icon library)
 */
export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    follow: 'UserPlus',
    like: 'Heart',
    comment: 'MessageCircle',
    mention: 'AtSign',
    reply: 'CornerDownRight',
    save: 'Bookmark'
  };
  return icons[type] || 'Bell';
};

/**
 * Hook for notification mutations
 * Use this to create notifications from user actions
 */
export function useNotificationMutations() {
  const create = useMutation(api.notifications.createNotification);

  return {
    create,
  };
}
