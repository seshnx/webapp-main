import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Notification types:
 * - follow: Someone followed you
 * - like: Someone reacted to your post
 * - comment: Someone commented on your post
 * - mention: Someone mentioned you in a post/comment
 * - reply: Someone replied to your comment
 * - save: Someone saved your post (optional, might be private)
 */

/**
 * Hook for managing user notifications
 * @param {string} userId - The authenticated user's UID
 * @param {number} fetchLimit - Max notifications to fetch (default 50)
 */
export function useNotifications(userId, fetchLimit = 50) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Subscribe to notifications
    useEffect(() => {
        if (!userId || !supabase) {
            setLoading(false);
            return;
        }

        // Initial fetch
        supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('deleted', false)
            .order('created_at', { ascending: false })
            .limit(fetchLimit)
            .then(({ data, error }) => {
                if (error) {
                    console.error('Notifications fetch error:', error);
                    setLoading(false);
                    return;
                }
                
                const notifList = (data || []).map(notif => ({
                    id: notif.id,
                    ...notif,
                    timestamp: notif.created_at,
                    read: notif.read || false
                }));
                setNotifications(notifList);
                setUnreadCount(notifList.filter(n => !n.read).length);
                setLoading(false);
            });

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`notifications-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                async () => {
                    const { data } = await supabase
                        .from('notifications')
                        .select('*')
                        .eq('user_id', userId)
                        .eq('deleted', false)
                        .order('created_at', { ascending: false })
                        .limit(fetchLimit);
                    
                    if (data) {
                        const notifList = data.map(notif => ({
                            id: notif.id,
                            ...notif,
                            timestamp: notif.created_at,
                            read: notif.read || false
                        }));
                        setNotifications(notifList);
                        setUnreadCount(notifList.filter(n => !n.read).length);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchLimit]);

    /**
     * Mark a single notification as read
     */
    const markAsRead = useCallback(async (notificationId) => {
        if (!userId || !supabase) return;
        
        try {
            await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)
                .eq('user_id', userId);
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    }, [userId]);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback(async () => {
        if (!userId || unreadCount === 0 || !supabase) return;

        try {
            const unreadNotifs = notifications.filter(n => !n.read);
            const notifIds = unreadNotifs.map(n => n.id);
            
            if (notifIds.length > 0) {
                await supabase
                    .from('notifications')
                    .update({ read: true })
                    .in('id', notifIds)
                    .eq('user_id', userId);
            }
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    }, [userId, notifications, unreadCount]);

    /**
     * Delete a notification
     */
    const deleteNotification = useCallback(async (notificationId) => {
        if (!userId || !supabase) return;

        try {
            await supabase
                .from('notifications')
                .update({ deleted: true })
                .eq('id', notificationId)
                .eq('user_id', userId);
        } catch (error) {
            console.error('Delete notification error:', error);
        }
    }, [userId]);

    /**
     * Clear all notifications (soft delete)
     */
    const clearAll = useCallback(async () => {
        if (!userId || !supabase) return;

        try {
            const notifIds = notifications.map(n => n.id);
            if (notifIds.length > 0) {
                await supabase
                    .from('notifications')
                    .update({ deleted: true })
                    .in('id', notifIds)
                    .eq('user_id', userId);
            }
        } catch (error) {
            console.error('Clear all error:', error);
        }
    }, [userId, notifications]);

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
 */
export async function createNotification({
    targetUserId,
    type,
    fromUserId,
    fromUserName,
    fromUserPhoto,
    postId = null,
    postPreview = null,
    commentId = null,
    message
}) {
    if (!targetUserId || targetUserId === fromUserId || !supabase) return; // Don't notify yourself

    try {
        await supabase
            .from('notifications')
            .insert({
                user_id: targetUserId,
                type,
                from_user_id: fromUserId,
                from_user_name: fromUserName,
                from_user_photo: fromUserPhoto || null,
                post_id: postId,
                post_preview: postPreview,
                comment_id: commentId,
                message,
                read: false,
                deleted: false,
                created_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Create notification error:', error);
    }
}

/**
 * Notification message templates
 */
export const NOTIFICATION_MESSAGES = {
    follow: 'started following you',
    like: 'reacted to your post',
    comment: 'commented on your post',
    mention: 'mentioned you',
    reply: 'replied to your comment',
    save: 'saved your post'
};

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type) => {
    const icons = {
        follow: 'UserPlus',
        like: 'Heart',
        comment: 'MessageCircle',
        mention: 'AtSign',
        reply: 'CornerDownRight',
        save: 'Bookmark'
    };
    return icons[type] || 'Bell';
};

