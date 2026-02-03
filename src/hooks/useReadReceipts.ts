import { useMemo, useCallback } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';

/**
 * Read receipt data
 */
export interface ReadReceipt {
  lastReadMessageId: string;
  readAt: number;
}

/**
 * Read receipts map (user ID -> receipt data)
 */
export interface ReadReceiptsMap {
  [userId: string]: ReadReceipt;
}

/**
 * Message interface
 */
export interface Message {
  id: string;
  t?: number; // Timestamp
  [key: string]: any;
}

/**
 * Read receipts hook return value
 */
export interface UseReadReceiptsReturn {
  readReceipts: ReadReceiptsMap;
  myLastRead: string | null;
  markAsRead: (messageIds: string | string[]) => Promise<void>;
  isMessageRead: (messageId: string, userId: string, messages?: Message[] | null) => boolean;
  getLastReadMessage: (userId: string) => string | null;
  hasCurrentUserRead: (messageId: string) => boolean;
}

/**
 * Hook for managing read receipts in a chat
 * Tracks which messages have been read by users
 *
 * @param chatId - Chat ID
 * @param currentUserId - Current user's UID
 * @returns Read receipts state and controls
 *
 * @example
 * function ChatMessages({ chatId, userId }) {
 *   const {
 *     readReceipts,
 *     myLastRead,
 *     markAsRead,
 *     isMessageRead
 *   } = useReadReceipts(chatId, userId);
 *
 *   const messages = useMessages(chatId);
 *
 *   useEffect(() => {
 *     if (messages.length > 0) {
 *       markAsRead(messages[messages.length - 1].id);
 *     }
 *   }, [messages]);
 *
 *   return (
 *     <div>
 *       {messages.map(msg => (
 *         <MessageBubble
 *           key={msg.id}
 *           message={msg}
 *           showReadReceipt={isMessageRead(msg.id, userId)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useReadReceipts(
  chatId: string | null | undefined,
  currentUserId: string | null | undefined
): UseReadReceiptsReturn {
  // Check Convex availability directly to avoid hook initialization issues
  const convexAvailable = isConvexAvailable();

  const readReceiptsQuery = useMemo(() => {
    return chatId && currentUserId && convexAvailable ? { chatId } : "skip";
  }, [chatId, currentUserId, convexAvailable]);

  // Fetch read receipts from Convex
  // Hook must always be called, but we skip if Convex not available
  const readReceiptsData = useQuery(
    api.readReceipts.getReadReceipts,
    readReceiptsQuery === "skip" ? "skip" : readReceiptsQuery
  );

  // Hooks must be called unconditionally (React rules)
  const markAsReadMutation = useMutation(api.readReceipts.markAsRead);
  const markMultipleAsReadMutation = useMutation(api.readReceipts.markMultipleAsRead);

  // Transform Convex data to match existing format
  const readReceipts = useMemo<ReadReceiptsMap>(() => {
    if (!readReceiptsData) return {};

    const receipts: ReadReceiptsMap = {};
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
  const myLastRead = readReceipts[currentUserId || '']?.lastReadMessageId || null;

  /**
   * Mark a message (or all messages up to a message) as read
   */
  const markAsRead = useCallback(async (messageIds: string | string[]): Promise<void> => {
    if (!chatId || !currentUserId || !messageIds || !isConvexAvailable() || !markAsReadMutation || !markMultipleAsReadMutation) return;

    try {
      const messageIdArray = Array.isArray(messageIds) ? messageIds : [messageIds];

      if (messageIdArray.length === 1) {
        await markAsReadMutation({
          chatId,
          messageId: messageIdArray[0] as any, // Convex ID type
          userId: currentUserId,
        });
      } else {
        await markMultipleAsReadMutation({
          chatId,
          messageIds: messageIdArray as any[], // Convex ID type
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
  const isMessageRead = useCallback((
    messageId: string,
    userId: string,
    messages?: Message[] | null
  ): boolean => {
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
  const getLastReadMessage = useCallback((userId: string): string | null => {
    return readReceipts[userId]?.lastReadMessageId || null;
  }, [readReceipts]);

  /**
   * Check if current user has read a message
   */
  const hasCurrentUserRead = useCallback((messageId: string): boolean => {
    if (!myLastRead) return false;
    return myLastRead === messageId || myLastRead >= messageId;
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
