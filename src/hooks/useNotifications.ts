import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationQuery,
  clearAllNotifications as clearAllNotificationsQuery,
  createNotification as createNotificationQuery,
  type Notification
} from '../config/neonQueries';

/**
 * Extended notification interface with UI properties
 */
export interface UINotification extends Notification {
  timestamp: string | Date;
  read: boolean;
  deleted?: boolean;
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
 *
 * @param userId - The authenticated user's UID
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
  userId: string | null | undefined,
  fetchLimit: number = 50
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Subscribe to notifications
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        const data = await getNotifications(userId, { limit: fetchLimit });

        const notifList: UINotification[] = data.map(notif => ({
          id: notif.id,
          ...notif,
          timestamp: notif.created_at || new Date(),
          read: notif.read || false
        }));
        setNotifications(notifList);
        setUnreadCount(notifList.filter(n => !n.read).length);
        setLoading(false);
      } catch (error) {
        console.error('Notifications fetch error:', error);
        setLoading(false);
      }
    };

    loadNotifications();

    // Set up polling (every 30 seconds)
    const pollInterval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [userId, fetchLimit]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    if (!userId) return;

    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }, [userId]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!userId || unreadCount === 0) return;

    try {
      await markAllNotificationsAsRead(userId);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  }, [userId, unreadCount]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    if (!userId) return;

    try {
      await deleteNotificationQuery(notificationId);
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  }, [userId]);

  /**
   * Clear all notifications (soft delete)
   */
  const clearAll = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      await clearAllNotificationsQuery(userId);
    } catch (error) {
      console.error('Clear all error:', error);
    }
  }, [userId]);

  return {
    notifications: notifications.filter(n => !n.deleted),
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

  try {
    await createNotificationQuery({
      user_id: targetUserId,
      type,
      from_user_id: fromUserId,
      from_user_name: fromUserName,
      from_user_photo: fromUserPhoto,
      post_id: postId,
      post_preview: postPreview,
      comment_id: commentId,
      message,
      metadata: {
        postId,
        postPreview,
        commentId,
        fromUserName,
        fromUserPhoto
      }
    });
  } catch (error) {
    console.error('Create notification error:', error);
  }
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
