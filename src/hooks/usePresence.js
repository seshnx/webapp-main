import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';

/**
 * Hook for managing user online/offline presence
 * Automatically sets user as online when component mounts, offline when disconnects
 * 
 * @param {string} userId - Current user's UID
 */
export function usePresence(userId) {
    const isOnlineRef = useRef(false);
    // Hook must be called unconditionally (React rules)
    const updatePresenceMutation = useMutation(api.presence.updatePresence);

    useEffect(() => {
        if (!userId || !isConvexAvailable()) return;

        // Set user as online
        updatePresenceMutation({
            userId,
            online: true,
            lastSeen: Date.now(),
        }).then(() => {
            isOnlineRef.current = true;
        }).catch((error) => {
            console.error('Presence online error:', error);
        });

        // Set up interval to update lastSeen periodically
        const interval = setInterval(() => {
            if (isOnlineRef.current) {
                updatePresenceMutation({
                    userId,
                    online: true,
                    lastSeen: Date.now(),
                }).catch(console.error);
            }
        }, 30000); // Update every 30 seconds

        // Cleanup: Set offline when component unmounts
        return () => {
            clearInterval(interval);
            if (isOnlineRef.current) {
                updatePresenceMutation({
                    userId,
                    online: false,
                    lastSeen: Date.now(),
                }).catch(console.error);
                isOnlineRef.current = false;
            }
        };
    }, [userId, updatePresenceMutation]);
}

/**
 * Hook to subscribe to another user's presence status
 * 
 * @param {string} userId - User ID to monitor
 * @returns {object} { online, lastSeen, loading }
 */
export function useUserPresence(userId) {
    const presenceData = useQuery(
        api.presence.getPresence,
        userId && isConvexAvailable() ? { userId } : "skip"
    );

    if (!presenceData) {
        return { online: false, lastSeen: null, loading: !isConvexAvailable() };
    }

    return {
        online: presenceData.online === true,
        lastSeen: presenceData.lastSeen,
        loading: false,
    };
}

/**
 * Format last seen timestamp to human-readable string
 */
export function formatLastSeen(timestamp) {
    if (!timestamp) return 'Never';
    
    const lastSeenMs = typeof timestamp === 'number' ? timestamp : timestamp;
    const now = Date.now();
    const diffMs = now - lastSeenMs;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Date(lastSeenMs).toLocaleDateString();
}
