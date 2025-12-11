import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';

/**
 * Hook for managing typing indicators in a chat
 * @param {string} chatId - Current chat ID
 * @param {string} userId - Current user's UID
 * @param {string} userName - Current user's display name
 * @returns {object} { typingUsers, setTyping, clearTyping }
 */
export function useTypingIndicator(chatId, userId, userName) {
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    
    // Check Convex availability
    const convexAvailable = isConvexAvailable();
    
    // Query typing indicators for the current chat
    const typingQuery = useMemo(() => {
        return chatId && convexAvailable ? { chatId } : "skip";
    }, [chatId, convexAvailable]);
    
    const typingData = useQuery(
        api.presence.getTypingIndicators,
        typingQuery
    );
    
    // Mutation to update typing status
    const updateTypingMutation = useMutation(api.presence.updateTypingIndicator);
    const clearTypingMutation = useMutation(api.presence.clearTypingIndicator);
    
    // Filter out current user from typing indicators
    const typingUsers = useMemo(() => {
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
 * @param {Array} typingUsers - Array of typing user objects
 * @returns {string} Formatted string
 */
export function formatTypingUsers(typingUsers) {
    if (!typingUsers || typingUsers.length === 0) return '';
    
    if (typingUsers.length === 1) {
        return `${typingUsers[0].name} is typing...`;
    }
    
    if (typingUsers.length === 2) {
        return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    }
    
    return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
}
