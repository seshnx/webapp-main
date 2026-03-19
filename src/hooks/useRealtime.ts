/**
 * Real-Time Hooks
 *
 * React hooks for using Convex real-time features:
 * - Presence (online/offline status)
 * - Active sessions (collaboration)
 * - Unread counts
 * - Dashboard stats
 * - Activity feed
 */

import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type {
  ConvexPresence,
  ConvexActiveSession,
  ConvexNotification,
} from '../types/dataDistribution';

// ============================================================
// PRESENCE HOOKS
// ============================================================

/**
 * Hook for managing user presence
 */
export function usePresence(userId: string | undefined) {
  const setEnhancedPresence = useMutation(api.enhancedPresence.setEnhancedPresence);
  const [currentStatus, setCurrentStatus] = useState<'online' | 'offline' | 'away' | 'busy' | 'in_session'>('offline');

  // Set user online on mount
  useEffect(() => {
    if (!userId) return;

    const goOnline = async () => {
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

    // Set offline on unmount
    return () => {
      setEnhancedPresence({
        userId,
        status: 'offline',
      });
    };
  }, [userId, setEnhancedPresence]);

  // Set user away after inactivity
  useEffect(() => {
    if (!userId || currentStatus === 'offline') return;

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (currentStatus === 'online') {
          setEnhancedPresence({
            userId,
            status: 'away',
          });
          setCurrentStatus('away');
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    const handleActivity = () => {
      if (currentStatus === 'away' || currentStatus === 'offline') {
        setEnhancedPresence({
          userId,
          status: 'online',
        });
        setCurrentStatus('online');
      }
      resetTimer();
    };

    // Activity listeners
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearTimeout(inactivityTimer);
    };
  }, [userId, currentStatus, setEnhancedPresence]);

  const setStatus = useCallback((status: 'online' | 'offline' | 'away' | 'busy' | 'in_session') => {
    if (!userId) return;
    setEnhancedPresence({ userId, status });
    setCurrentStatus(status);
  }, [userId, setEnhancedPresence]);

  return {
    status: currentStatus,
    setStatus,
  };
}

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
 * Hook for getting users in a specific location (studio, room, session)
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
    update: (updates: {
      todayBookingCount?: number;
      todayRevenue?: number;
      weekBookingCount?: number;
      weekRevenue?: number;
    }) => userId && update({ userId, ...updates }),
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
// PUSH NOTIFICATION HOOKS
// ============================================================

/**
 * Hook for managing push notification tokens
 */
export function usePushTokens(userId: string | undefined) {
  const register = useMutation(api.enhancedPresence.registerPushToken);
  const unregister = useMutation(api.enhancedPresence.unregisterPushToken);
  const tokens = useQuery(
    api.enhancedPresence.getPushTokens,
    userId ? { userId } : 'skip'
  );

  const registerToken = useCallback(async (token: string, platform: 'ios' | 'android' | 'web') => {
    if (!userId) return;
    return await register({ userId, token, platform });
  }, [userId, register]);

  const unregisterToken = useCallback(async (token: string) => {
    return await unregister({ token });
  }, [unregister]);

  return {
    tokens: tokens || [],
    loading: tokens === undefined,
    register: registerToken,
    unregister: unregisterToken,
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
