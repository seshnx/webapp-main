/**
 * Real-Time Hooks
 *
 * React hooks for Convex real-time features:
 * - Presence with session timeouts, heartbeat, and active tab detection
 * - Typing indicators
 * - Dashboard stats
 * - Activity feed
 *
 * Best practices:
 * - visibilitychange API for detect tab focus/blur
 * - Periodic heartbeat (30s interval) to keep presence alive
 * - beforeunload to mark offline on page close
 * - 5 min idle → away, 30 min idle → offline
 * - Cleanup all timers/intervals on unmount
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// ============================================================
// PRESENCE TIMING CONSTANTS
// ============================================================

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds
const AWAY_TIMEOUT = 5 * 60 * 1000; // 5 minutes of idle → away
const OFFLINE_TIMEOUT = 30 * 60 * 1000; // 30 minutes of idle → offline
const INACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart'] as const;

type PresenceStatus = 'online' | 'offline' | 'away' | 'busy' | 'in_session';

// ============================================================
// PRESENCE HOOKS
// ============================================================

/**
 * Hook for managing user presence with session timeout, heartbeat, and active tab detection.
 *
 * Features:
 * - Sends heartbeat every 30 seconds to keep presence alive
 * - Marks away after 5 min of inactivity
 * - Marks offline after 30 min of inactivity
 * - Detects tab visibility changes (visibilitychange API)
 * - Clean offline on page close (beforeunload)
 * - Activity listeners reset inactivity timer
 */
export function usePresence(userId: string | undefined) {
  const setEnhancedPresence = useMutation(api.enhancedPresence.setEnhancedPresence);
  const [currentStatus, setCurrentStatus] = useState<PresenceStatus>('offline');

  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offlineRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibilityRef = useRef<boolean>(true);

  // Detect tab visibility changes
  useEffect(() => {
    const handleVisibility = () => {
      const isHidden = document.hidden;
      visibilityRef.current = !isHidden;

      if (isHidden && currentStatus !== 'offline') {
        // Tab hidden — mark away (don't update server yet, heartbeat will handle it)
        setCurrentStatus('away');
      } else if (!isHidden && currentStatus === 'away') {
        // Tab visible again — come back online
        setCurrentStatus('online');
        // The heartbeat will update the server on next cycle
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentStatus]);

  // Set user online on mount, offline on unmount
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const goOnline = async () => {
      if (cancelled) return;
      await setEnhancedPresence({
        userId,
        status: 'online',
        deviceInfo: {
          type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: navigator.userAgent,
        },
      });
    };

    goOnline();
    setCurrentStatus('online');

    // Mark offline on page close/unmount
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability during page unload
      setEnhancedPresence({ userId, status: 'offline' });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cancelled = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Mark offline on cleanup
      setEnhancedPresence({ userId, status: 'offline' });
    };
  }, [userId, setEnhancedPresence]);

  // Heartbeat — periodically update server presence
  useEffect(() => {
    if (!userId || currentStatus === 'offline') return;

    heartbeatRef.current = setInterval(async () => {
      if (!visibilityRef.current) return; // Tab not visible, skip heartbeat
      try {
        await setEnhancedPresence({
          userId,
          status: currentStatus,
        });
      } catch {
        // Heartbeat failed silently — will retry next interval
      }
    }, HEARTBEAT_INTERVAL);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [userId, currentStatus, setEnhancedPresence]);

  // Inactivity detection — away after 5 min, offline after 30 min
  useEffect(() => {
    if (!userId || currentStatus === 'offline') return;

    const resetInactivity = () => {
      // Clear existing timers
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      if (offlineRef.current) clearTimeout(offlineRef.current);

      // Set away timer (5 min)
      inactivityRef.current = setTimeout(() => {
        if (currentStatus === 'online' || currentStatus === 'in_session') {
          setCurrentStatus('away');
          setEnhancedPresence({ userId, status: 'away' });
        }
      }, AWAY_TIMEOUT);

      // Set offline timer (30 min)
      offlineRef.current = setTimeout(() => {
        setCurrentStatus('offline');
        setEnhancedPresence({ userId, status: 'offline' });
      }, OFFLINE_TIMEOUT);
    };

    const handleActivity = () => {
      // If we were away, come back online
      if (currentStatus === 'away') {
        setCurrentStatus('online');
        setEnhancedPresence({ userId, status: 'online' });
      }
      resetInactivity();
    };

    // Attach activity listeners
    INACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    resetInactivity();

    return () => {
      INACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      if (offlineRef.current) clearTimeout(offlineRef.current);
    };
  }, [userId, currentStatus, setEnhancedPresence]);

  const setStatus = useCallback((status: PresenceStatus) => {
    if (!userId) return;
    setEnhancedPresence({ userId, status });
    setCurrentStatus(status);
  }, [userId, setEnhancedPresence]);

  return {
    status: currentStatus,
    setStatus,
  };
}

// ============================================================
// PRESENCE QUERY HOOKS
// ============================================================

/**
 * Hook for getting presence of multiple users
 */
export function useBatchPresence(userIds: string[]) {
  const presence = useQuery(
    api.enhancedPresence.getBatchEnhancedPresence,
    userIds.length > 0 ? { userIds } : 'skip'
  );
  return {
    presence: presence || {},
    loading: presence === undefined,
  };
}

/**
 * Hook for getting single user's presence
 */
export function useUserPresence(userId: string | undefined) {
  const presence = useQuery(
    api.enhancedPresence.getEnhancedPresence,
    userId ? { userId } : 'skip'
  );
  return {
    presence: presence || null,
    loading: presence === undefined,
  };
}

/**
 * Hook for getting users presence (deprecated alias)
 */
export function useUserPresenceList(userIds: string[]) {
  return useBatchPresence(userIds);
}

/**
 * Hook for getting single user's presence by ID
 */
export function useUserPresenceById(userId: string) {
  return useUserPresence(userId);
}

/**
 * Hook for getting batch presence as a simple array
 */
export function useBatchPresenceSimple(userIds: string[]) {
  const result = useQuery(
    api.enhancedPresence.getBatchEnhancedPresence,
    userIds.length > 0 ? { userIds } : 'skip'
  );
  return {
    presences: result || [],
    loading: result === undefined,
  };
}

/**
 * Hook for getting single user's presence (simple)
 */
export function useUserPresenceSimple(userId: string) {
  return useUserPresence(userId);
}

/**
 * Hook for getting single enhanced presence record
 */
export function useSinglePresence(userId: string | undefined) {
  const presence = useQuery(
    api.enhancedPresence.getEnhancedPresence,
    userId ? { userId } : 'skip'
  );
  return {
    presence: presence || null,
    loading: presence === undefined,
  };
}
/**
 * Hook for getting users in a specific location
 */
export function useUsersInLocation(
  locationType: 'studio' | 'room' | 'session',
  locationId: string
) {
  const users = useQuery(
    api.enhancedPresence.getUsersInLocation,
    { locationType, locationId }
  );
  return {
    users: users || [],
    loading: users === undefined,
  };
}

// ============================================================
// ACTIVE SESSIONS HOOKS
// ============================================================

/**
 * Hook for managing active sessions (collaboration)
 */
export function useActiveSession(sessionId: string | undefined) {
  const createSession = useMutation(api.enhancedPresence.createActiveSession);
  const joinSession = useMutation(api.enhancedPresence.joinActiveSession);
  const leaveSession = useMutation(api.enhancedPresence.leaveActiveSession);
  const endSession = useMutation(api.enhancedPresence.endActiveSession);

  const session = useQuery(
    api.enhancedPresence.getActiveSession,
    sessionId ? { sessionId } : 'skip'
  );

  const create = useCallback(async (
    bookingId: string,
    hostId: string,
    hostName: string
  ) => {
    const newSessionId = `${hostId}-${Date.now()}`;
    await createSession({
      sessionId: newSessionId,
      bookingId,
      hostId,
      hostName,
    });
    return newSessionId;
  }, [createSession]);

  const join = useCallback(async (
    sessionId: string,
    userId: string,
    displayName: string,
    role: 'guest' | 'observer' = 'guest'
  ) => {
    return await joinSession({
      sessionId,
      userId,
      displayName,
      role,
    });
  }, [joinSession]);

  const leave = useCallback(async (sessionId: string, userId: string) => {
    return await leaveSession({ sessionId, userId });
  }, [leaveSession]);

  const end = useCallback(async (sessionId: string, hostId: string) => {
    return await endSession({ sessionId, hostId });
  }, [endSession]);

  return {
    session,
    loading: session === undefined,
    create,
    join,
    leave,
    end,
  };
}

/**
 * Hook for getting user's current active session
 */
export function useUserActiveSession(userId: string | undefined) {
  const session = useQuery(
    api.enhancedPresence.getUserActiveSession,
    userId ? { userId } : 'skip'
  );
  return {
    session,
    loading: session === undefined,
    isActive: !!session,
  };
}

// ============================================================
// UNREAD COUNTS HOOKS
// ============================================================

/**
 * Hook for getting unread counts (messages, notifications, bookings)
 */
export function useUnreadCounts(userId: string | undefined) {
  const counts = useQuery(
    api.enhancedPresence.getUnreadCounts,
    userId ? { userId } : 'skip'
  );
  const refresh = useMutation(api.enhancedPresence.refreshUnreadCounts);

  return {
    counts: counts || {
      messages: 0,
      notifications: 0,
      bookingRequests: 0,
      sessionInvites: 0,
    },
    loading: counts === undefined,
    refresh: () => userId && refresh({ userId }),
  };
}

// ============================================================
// DASHBOARD STATS HOOKS
// ============================================================

/**
 * Hook for getting dashboard stats
 */
export function useDashboardStats(userId: string | undefined) {
  const stats = useQuery(
    api.enhancedPresence.getDashboardStats,
    userId ? { userId } : 'skip'
  );
  const update = useMutation(api.enhancedPresence.updateDashboardStats);
  return {
    stats: stats || {
      todayBookingCount: 0,
      todayRevenue: 0,
      weekBookingCount: 0,
      weekRevenue: 0,
      unreadMessages: 0,
      activeNotifications: 0,
    },
    loading: stats === undefined,
    update: (updates: Record<string, number>) => {
      if (userId) update({ userId, ...updates });
    },
  };
}

// ============================================================
// ACTIVITY FEED HOOKS
// ============================================================

/**
 * Hook for getting activity feed
 */
export function useActivityFeed(userId: string | undefined, limit = 20) {
  const activities = useQuery(
    api.enhancedPresence.getActivityFeed,
    userId ? { userId, limit } : 'skip'
  );
  return {
    activities: activities || [],
    loading: activities === undefined,
  };
}

/**
 * Hook for getting recent activity across all users (admin)
 */
export function useRecentActivity(limit = 50) {
  const activities = useQuery(
    api.enhancedPresence.getRecentActivity,
    { limit }
  );
  return {
    activities: activities || [],
    loading: activities === undefined,
  };
}

// ============================================================
// TYPING INDICATORS HOOK
// ============================================================

/**
 * Hook for managing typing indicators
 */
export function useTypingIndicator(conversationId: string | undefined) {
  const setTyping = useMutation(api.presence.updateTypingIndicator);
  const typingUsers = useQuery(
    api.presence.getTypingIndicators,
    conversationId ? { chatId: conversationId } : 'skip'
  );
  const startTyping = useCallback((userId: string, userName: string) => {
    if (!conversationId) return;
    setTyping({
      chatId: conversationId,
      userId,
      userName,
      isTyping: true,
    });
  }, [conversationId, setTyping]);

  const stopTyping = useCallback((userId: string, userName: string) => {
    if (!conversationId) return;
    setTyping({
      chatId: conversationId,
      userId,
      userName,
      isTyping: false,
    });
  }, [conversationId, setTyping]);

  return {
    typingUsers: typingUsers || [],
    loading: typingUsers === undefined,
    startTyping,
    stopTyping,
  };
}
