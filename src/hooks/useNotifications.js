import { useState, useEffect, useCallback } from 'react';
import { 
    collection, 
    query, 
    orderBy, 
    limit, 
    onSnapshot,
    doc,
    updateDoc,
    writeBatch,
    where,
    getDocs,
    serverTimestamp,
    addDoc
} from 'firebase/firestore';
import { db, appId, getPaths } from '../config/firebase';

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
        if (!userId) {
            setLoading(false);
            return;
        }

        const notificationsRef = collection(db, getPaths(userId).notifications);
        const q = query(
            notificationsRef,
            orderBy('timestamp', 'desc'),
            limit(fetchLimit)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifList);
            setUnreadCount(notifList.filter(n => !n.read).length);
            setLoading(false);
        }, (error) => {
            console.error('Notifications listener error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, fetchLimit]);

    /**
     * Mark a single notification as read
     */
    const markAsRead = useCallback(async (notificationId) => {
        if (!userId) return;
        
        try {
            const notifRef = doc(db, getPaths(userId).notifications, notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    }, [userId]);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback(async () => {
        if (!userId || unreadCount === 0) return;

        try {
            const batch = writeBatch(db);
            const unreadNotifs = notifications.filter(n => !n.read);
            
            unreadNotifs.forEach(notif => {
                const notifRef = doc(db, getPaths(userId).notifications, notif.id);
                batch.update(notifRef, { read: true });
            });

            await batch.commit();
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    }, [userId, notifications, unreadCount]);

    /**
     * Delete a notification
     */
    const deleteNotification = useCallback(async (notificationId) => {
        if (!userId) return;

        try {
            const notifRef = doc(db, getPaths(userId).notifications, notificationId);
            await updateDoc(notifRef, { deleted: true }); // Soft delete
        } catch (error) {
            console.error('Delete notification error:', error);
        }
    }, [userId]);

    /**
     * Clear all notifications (soft delete)
     */
    const clearAll = useCallback(async () => {
        if (!userId) return;

        try {
            const batch = writeBatch(db);
            notifications.forEach(notif => {
                const notifRef = doc(db, getPaths(userId).notifications, notif.id);
                batch.update(notifRef, { deleted: true });
            });
            await batch.commit();
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
    if (!targetUserId || targetUserId === fromUserId) return; // Don't notify yourself

    try {
        await addDoc(collection(db, getPaths(targetUserId).notifications), {
            type,
            fromUserId,
            fromUserName,
            fromUserPhoto: fromUserPhoto || null,
            postId,
            postPreview,
            commentId,
            message,
            read: false,
            timestamp: serverTimestamp()
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

