import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexAvailable } from '../config/convex';

/**
 * User presence data
 */
export interface UserPresenceData {
  online: boolean;
  lastSeen: number | null;
  loading: boolean;
}

/**
 * Hook for managing user online/offline presence
 * Automatically sets user as online when component mounts, offline when disconnects
 *
 * @param userId - Current user's UID
 *
 * @example
 * function App() {
 *   const { userId } = useAuth();
 *   usePresence(userId); // Automatically manages presence
 *
 *   return <div>...</div>;
 * }
 */
export function usePresence(userId: string | null | undefined): void {
  const isOnlineRef = useRef<boolean>(false);

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
 * @param userId - User ID to monitor
 * @returns Presence data
 *
 * @example
 * function UserStatus({ userId }) {
 *   const { online, lastSeen, loading } = useUserPresence(userId);
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <span className={online ? 'online' : 'offline'}>
 *         {online ? 'Online' : formatLastSeen(lastSeen)}
 *       </span>
 *     </div>
 *   );
 * }
 */
export function useUserPresence(userId: string | null | undefined): UserPresenceData {
  // This removes the potential source of the "Cannot access 'W' before initialization" error.
  const convexAvailable = isConvexAvailable();

  const presenceQuery = useMemo(() => {
    return userId && convexAvailable ? { userId } : "skip";
  }, [userId, convexAvailable]);

  const presenceData = useQuery(
    api.presence.getPresence,
    presenceQuery === "skip" ? "skip" : presenceQuery
  );

  if (!presenceData) {
    return { online: false, lastSeen: null, loading: !isConvexAvailable() };
  }

  return {
    online: presenceData.online === true,
    lastSeen: presenceData.lastSeen ?? null,
    loading: false,
  };
}

/**
 * Format last seen timestamp to human-readable string
 *
 * @param timestamp - Timestamp in milliseconds or Date object
 * @returns Formatted string (e.g., "5m ago", "2h ago", "2024-01-15")
 *
 * @example
 * formatLastSeen(Date.now()); // "Just now"
 * formatLastSeen(Date.now() - 300000); // "5m ago"
 * formatLastSeen(null); // "Never"
 */
export function formatLastSeen(timestamp: number | Date | null | undefined): string {
  if (!timestamp) return 'Never';

  const lastSeenMs = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
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
