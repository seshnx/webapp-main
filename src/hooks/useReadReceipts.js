import { useMemo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';

/**
 * Hook for managing read receipts in a chat
 * Tracks which messages have been read by users
 * 
 * @param {string} chatId - Chat ID
 * @param {string} currentUserId - Current user's UID
 */
export function useReadReceipts(chatId, currentUserId) {
    // Fetch read receipts from Convex
    const readReceiptsData = useQuery(
        api.readReceipts.getReadReceipts,
        chatId && currentUserId && isConvexAvailable() ? { chatId } : "skip"
    );

    const markAsReadMutation = useMutation(api.readReceipts.markAsRead);
    const markMultipleAsReadMutation = useMutation(api.readReceipts.markMultipleAsRead);

    // Transform Convex data to match existing format
    const readReceipts = useMemo(() => {
        if (!readReceiptsData) return {};
        
        const receipts = {};
        readReceiptsData.forEach(receipt => {
            if (!receipts[receipt.userId]) {
                receipts[receipt.userId] = {
                    lastReadMessageId: receipt.messageId,
                    readAt: receipt.readAt,
                };
            } else {
                // Keep the latest read message
                if (receipt.readAt > receipts[receipt.userId].readAt) {
                    receipts[receipt.userId] = {
                        lastReadMessageId: receipt.messageId,
                        readAt: receipt.readAt,
                    };
                }
            }
        });
        return receipts;
    }, [readReceiptsData]);

    // Get current user's last read
    const myLastRead = readReceipts[currentUserId]?.lastReadMessageId || null;

    /**
     * Mark a message (or all messages up to a message) as read
     */
    const markAsRead = useCallback(async (messageIds) => {
        if (!chatId || !currentUserId || !messageIds || !isConvexAvailable()) return;

        try {
            const messageIdArray = Array.isArray(messageIds) ? messageIds : [messageIds];
            
            if (messageIdArray.length === 1) {
                await markAsReadMutation({
                    chatId,
                    messageId: messageIdArray[0],
                    userId: currentUserId,
                });
            } else {
                await markMultipleAsReadMutation({
                    chatId,
                    messageIds: messageIdArray,
                    userId: currentUserId,
                });
            }
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    }, [chatId, currentUserId, markAsReadMutation, markMultipleAsReadMutation]);

    /**
     * Check if a specific message has been read by a user
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
                return message.t <= lastReadMessage.t;
            }
        }

        // For Convex, we can compare IDs directly
        // Convex IDs are sortable and maintain order
        return lastReadMessageId >= messageId;
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
        return myLastRead === messageId || (myLastRead && myLastRead >= messageId);
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
