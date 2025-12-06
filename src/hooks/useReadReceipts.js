import { useState, useEffect, useCallback } from 'react';
import { ref, set, onValue, serverTimestamp } from 'firebase/database';
import { rtdb } from '../config/firebase';

/**
 * Hook for managing read receipts in a chat
 * Tracks which messages have been read by users
 * 
 * @param {string} chatId - Chat ID
 * @param {string} currentUserId - Current user's UID
 */
export function useReadReceipts(chatId, currentUserId) {
    const [readReceipts, setReadReceipts] = useState({});
    const [myLastRead, setMyLastRead] = useState(null);

    // Subscribe to read receipts for this chat
    useEffect(() => {
        if (!chatId || !currentUserId || !rtdb) return;

        const receiptsRef = ref(rtdb, `chats/${chatId}/readBy`);
        const unsubscribe = onValue(receiptsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setReadReceipts(data);
                
                // Get current user's last read
                if (data[currentUserId]) {
                    setMyLastRead(data[currentUserId].lastReadMessageId);
                }
            } else {
                setReadReceipts({});
                setMyLastRead(null);
            }
        }, (error) => {
            console.error('Read receipts listener error:', error);
        });

        return () => unsubscribe();
    }, [chatId, currentUserId, rtdb]);

    /**
     * Mark a message (or all messages up to a message) as read
     */
    const markAsRead = useCallback(async (messageId) => {
        if (!chatId || !currentUserId || !messageId || !rtdb) return;

        try {
            const receiptRef = ref(rtdb, `chats/${chatId}/readBy/${currentUserId}`);
            await set(receiptRef, {
                lastReadMessageId: messageId,
                readAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    }, [chatId, currentUserId, rtdb]);

    /**
     * Check if a specific message has been read by a user
     * A message is considered read if its timestamp is <= the last read message's timestamp
     * 
     * @param {string} messageId - Message ID to check
     * @param {string} userId - User ID to check read status for
     * @param {Array} messages - Optional messages array for timestamp comparison
     * @returns {boolean} True if message was read
     */
    const isMessageRead = useCallback((messageId, userId, messages = null) => {
        if (!messageId || !userId) return false;
        
        const userReceipt = readReceipts[userId];
        if (!userReceipt || !userReceipt.lastReadMessageId) return false;

        const lastReadMessageId = userReceipt.lastReadMessageId;
        
        // If exact match, definitely read
        if (lastReadMessageId === messageId) {
            return true;
        }

        // If we have messages array, compare timestamps
        if (messages && Array.isArray(messages)) {
            const message = messages.find(m => m.id === messageId);
            const lastReadMessage = messages.find(m => m.id === lastReadMessageId);
            
            if (message && lastReadMessage && message.t && lastReadMessage.t) {
                // Message is read if its timestamp is <= last read message timestamp
                return message.t <= lastReadMessage.t;
            }
        }

        // Fallback: Compare message IDs lexicographically
        // Firebase push keys are lexicographically sortable
        // If lastReadMessageId > messageId (lexicographically), message was read
        // This works because Firebase push keys maintain chronological order
        return lastReadMessageId > messageId;
    }, [readReceipts]);

    /**
     * Get the latest read message ID for a user
     */
    const getLastReadMessage = useCallback((userId) => {
        return readReceipts[userId]?.lastReadMessageId || null;
    }, [readReceipts]);

    /**
     * Check if current user has read a message
     */
    const hasCurrentUserRead = useCallback((messageId) => {
        return myLastRead === messageId;
    }, [myLastRead]);

    return {
        readReceipts,
        myLastRead,
        markAsRead,
        isMessageRead,
        getLastReadMessage,
        hasCurrentUserRead
    };
}

