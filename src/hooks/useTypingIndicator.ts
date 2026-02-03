import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';

/**
 * Typing user interface
 */
export interface TypingUser {
  id: string;
  name: string;
}

/**
 * Typing indicator hook return value
 */
export interface UseTypingIndicatorReturn {
  typingUsers: TypingUser[];
  setTyping: () => void;
  clearTyping: () => void;
}

/**
 * Hook for managing typing indicators in a chat
 *
 * @param chatId - Current chat ID
 * @param userId - Current user's UID
 * @param userName - Current user's display name
 * @returns Typing indicator state and controls
 *
 * @example
 * function ChatInput({ chatId, userId, userName }) {
 *   const { typingUsers, setTyping, clearTyping } = useTypingIndicator(chatId, userId, userName);
 *
 *   const handleInputChange = (e) => {
 *     setTyping();
 *     // Handle input change...
 *   };
 *
 *   const handleSendMessage = () => {
 *     clearTyping();
 *     // Send message...
 *   };
 *
 *   return (
 *     <div>
 *       {typingUsers.length > 0 && (
 *         <div>{formatTypingUsers(typingUsers)}</div>
 *       )}
 *       <input onChange={handleInputChange} />
 *       <button onClick={handleSendMessage}>Send</button>
 *     </div>
 *   );
 * }
 */
export function useTypingIndicator(
  chatId: string | null | undefined,
  userId: string | null | undefined,
  userName: string | null | undefined
): UseTypingIndicatorReturn {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef<boolean>(false);

  // Check Convex availability
  const convexAvailable = isConvexAvailable();

  // Query typing indicators for the current chat
  const typingQuery = useMemo(() => {
    return chatId && convexAvailable ? { chatId } : "skip";
  }, [chatId, convexAvailable]);

  const typingData = useQuery(
    api.presence.getTypingIndicators,
    typingQuery === "skip" ? "skip" : typingQuery
  );

  // Mutation to update typing status
  const updateTypingMutation = useMutation(api.presence.updateTypingIndicator);
  const clearTypingMutation = useMutation(api.presence.clearTypingIndicator);

  // Filter out current user from typing indicators
  const typingUsers = useMemo<TypingUser[]>(() => {
    if (!typingData) return [];
    return typingData
      .filter(indicator => indicator.userId !== userId && indicator.isTyping)
      .map(indicator => ({
        id: indicator.userId,
        name: indicator.userName,
      }));
  }, [typingData, userId]);

  // Set typing status with auto-clear after delay
  const setTyping = useCallback(() => {
    if (!chatId || !userId || !convexAvailable) return;

    // Only update if not already marked as typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      updateTypingMutation({
        chatId,
        userId,
        userName: userName || 'User',
        isTyping: true,
      }).catch(console.error);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-clear typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        clearTypingMutation({
          chatId,
          userId,
        }).catch(console.error);
      }
    }, 3000);
  }, [chatId, userId, userName, convexAvailable, updateTypingMutation, clearTypingMutation]);

  // Immediately clear typing status
  const clearTyping = useCallback(() => {
    if (!chatId || !userId || !convexAvailable) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      clearTypingMutation({
        chatId,
        userId,
      }).catch(console.error);
    }
  }, [chatId, userId, convexAvailable, clearTypingMutation]);

  // Cleanup on unmount or chat change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear typing when leaving chat
      if (chatId && userId && isTypingRef.current && convexAvailable) {
        clearTypingMutation({
          chatId,
          userId,
        }).catch(console.error);
      }
    };
  }, [chatId, userId, convexAvailable, clearTypingMutation]);

  return {
    typingUsers,
    setTyping,
    clearTyping,
  };
}

/**
 * Format typing users into display string
 *
 * @param typingUsers - Array of typing user objects
 * @returns Formatted string
 *
 * @example
 * formatTypingUsers([{ id: '1', name: 'Alice' }]);
 * // "Alice is typing..."
 *
 * formatTypingUsers([
 *   { id: '1', name: 'Alice' },
 *   { id: '2', name: 'Bob' }
 * ]);
 * // "Alice and Bob are typing..."
 *
 * formatTypingUsers([
 *   { id: '1', name: 'Alice' },
 *   { id: '2', name: 'Bob' },
 *   { id: '3', name: 'Charlie' }
 * ]);
 * // "Alice and 2 others are typing..."
 */
export function formatTypingUsers(typingUsers: TypingUser[] | null | undefined): string {
  if (!typingUsers || typingUsers.length === 0) return '';

  if (typingUsers.length === 1) {
    return `${typingUsers[0].name} is typing...`;
  }

  if (typingUsers.length === 2) {
    return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
  }

  return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
}
