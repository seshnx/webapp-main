import { useState, useEffect, useRef } from 'react';
import { ref, onDisconnect, set, serverTimestamp, onValue, get } from 'firebase/database';
import { rtdb } from '../config/firebase';

/**
 * Hook for managing user online/offline presence
 * Automatically sets user as online when component mounts, offline when disconnects
 * 
 * @param {string} userId - Current user's UID
 */
export function usePresence(userId) {
    const isOnlineRef = useRef(false);

    useEffect(() => {
        if (!userId || !rtdb) return;

        const userStatusRef = ref(rtdb, `presence/${userId}`);
        const userStatusDatabaseRef = ref(rtdb, `presence/${userId}`);
        
        // Set user as online
        set(userStatusDatabaseRef, {
            online: true,
            lastSeen: null
        }).then(() => {
            isOnlineRef.current = true;
        }).catch((error) => {
            console.error('Presence online error:', error);
        });

        // Handle disconnect
        const disconnectRef = ref(rtdb, '.info/connected');
        const disconnectUnsubscribe = onValue(disconnectRef, (snapshot) => {
            if (snapshot.val() === false) {
                // Client lost connection
                return;
            }

            // When client disconnects, set offline
            onDisconnect(userStatusDatabaseRef).set({
                online: false,
                lastSeen: serverTimestamp()
            }).then(() => {
                // Connection restored
                set(userStatusDatabaseRef, {
                    online: true,
                    lastSeen: null
                });
            });
        });

        // Cleanup: Set offline when component unmounts
        return () => {
            disconnectUnsubscribe();
            if (isOnlineRef.current) {
                set(userStatusDatabaseRef, {
                    online: false,
                    lastSeen: serverTimestamp()
                }).catch(console.error);
                isOnlineRef.current = false;
            }
        };
    }, [userId, rtdb]);
}

/**
 * Hook to subscribe to another user's presence status
 * 
 * @param {string} userId - User ID to monitor
 * @returns {object} { online, lastSeen, loading }
 */
export function useUserPresence(userId) {
    const [presence, setPresence] = useState({ online: false, lastSeen: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        if (!rtdb) {
            setPresence({ online: false, lastSeen: null });
            setLoading(false);
            return;
        }

        const presenceRef = ref(rtdb, `presence/${userId}`);
        const unsubscribe = onValue(presenceRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setPresence({
                    online: data.online === true,
                    lastSeen: data.lastSeen
                });
            } else {
                setPresence({ online: false, lastSeen: null });
            }
            setLoading(false);
        }, (error) => {
            console.error('Presence listener error:', error);
            setPresence({ online: false, lastSeen: null });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, rtdb]);

    return { ...presence, loading };
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

