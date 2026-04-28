/**
 * Real-Time Components
 *
 * React components for Convex real-time features:
 * - Presence indicators (SVG-based with proper status visuals)
 * - Typing indicators
 * - Online users list
 * - Unread counts badge
 * - Session participants
 * - Dashboard stats card
 * - User presence card
 */

import React, { useState } from 'react';
import {
  Circle, User, Users, Clock, MapPin,
  Calendar, DollarSign, MessageSquare, Bell,
} from 'lucide-react';
import {
  useBatchPresence,
  useUnreadCounts,
  useDashboardStats,
  useActiveSession,
  useTypingIndicator,
  useUsersInLocation,
} from '@/hooks/useRealtime';
import type { SubProfile } from '@/types/dataDistribution';

// ============================================================
// SVG STATUS DOT COMPONENT
// ============================================================

interface StatusDotProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'in_session';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * SVG-based status indicator matching user spec:
 * - Online (green): filled green dot with glow
 * - Away (yellow): filled yellow dot with subtle pulse
 * - Offline (gray): 2px stroke, no fill circle
 * - Busy (red): red circle with diagonal slash (Do Not Disturb)
 * - In Session (purple): filled purple dot with glow
 */
function StatusDot({ status, size = 'md' }: StatusDotProps) {
  const dimensions = {
    sm: { w: 8, h: 8 },
    md: { w: 12, h: 12 },
    lg: { w: 16, h: 16 },
  };
  const { w, h } = dimensions[size];
  const cx = w / 2;
  const cy = h / 2;

  if (status === 'online') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={cx - 1} fill="#22C55E" />
        <circle cx={cx} cy={cy} r={cx - 2} fill="none" stroke="#22C55E" strokeWidth="0.5" opacity="0.3" />
      </svg>
    );
  }

  if (status === 'away') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={cx - 1} fill="#EAB308" />
        <circle cx={cx} cy={cy} r={cx - 2.5} fill="none" stroke="#EAB308" strokeWidth="0.75" opacity="0.4" className="animate-pulse" />
      </svg>
    );
  }

  if (status === 'offline') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={cx - 2} fill="none" stroke="#9CA3AF" strokeWidth="2" />
      </svg>
    );
  }

  if (status === 'busy') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
        {/* Outer circle */}
        <circle cx={cx} cy={cy} r={cx - 2} stroke="#EF4444" strokeWidth="1.5" fill="none" />
        {/* Diagonal slash line */}
        <line
          x1={cx - (cx - 2) * 0.707}
          y1={cy - (cy - 2) * 0.707}
          x2={cx + (cx - 2) * 0.707}
          y2={cy + (cy - 2) * 0.707}
          stroke="#EF4444"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (status === 'in_session') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={cx - 1} fill="#8B5CF6" />
        <circle cx={cx} cy={cy} r={cx - 2} fill="none" stroke="#8B5CF6" strokeWidth="0.5" opacity="0.3" />
      </svg>
    );
  }

  // Fallback to offline
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={cx - 2} fill="none" stroke="#9CA3AF" strokeWidth="2" />
    </svg>
  );
}

// ============================================================
// PRESENCE INDICATOR
// ============================================================

interface PresenceIndicatorProps {
  userId: string;
  showStatus?: boolean;
  showLastSeen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Shows online/offline status with SVG dot
 */
export function PresenceIndicator({
  userId,
  showStatus = true,
  showLastSeen = false,
  size = 'md',
}: PresenceIndicatorProps) {
  const { presence } = useBatchPresence([userId]);
  const userPresence = presence?.[userId];

  const status = userPresence?.status || 'offline';
  const lastSeen = userPresence?.lastSeen;

  const formatLastSeen = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex items-center gap-2">
      <StatusDot status={status} size={size} />
      {showStatus && (
        <span className="text-xs text-gray-600 capitalize">
          {status.replace('_', ' ')}
        </span>
      )}
      {showLastSeen && lastSeen && status !== 'online' && (
        <span className="text-xs text-gray-500">
          {formatLastSeen(lastSeen)}
        </span>
      )}
    </div>
  );
}

// ============================================================
// TYPING INDICATOR
// ============================================================

interface TypingIndicatorProps {
  conversationId: string;
  excludeUserId?: string;
}

/**
 * Shows who is typing in a conversation
 */
export function TypingIndicator({ conversationId, excludeUserId }: TypingIndicatorProps) {
  const { typingUsers, loading } = useTypingIndicator(conversationId);

  if (loading || typingUsers.length === 0) {
    return null;
  }

  const visibleTypers = typingUsers.filter(u => u.userId !== excludeUserId);

  if (visibleTypers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {visibleTypers.length === 1
          ? visibleTypers[0].userName + ' is typing...'
          : visibleTypers.map(u => u.userName).join(', ') + ' are typing...'}
      </span>
    </div>
  );
}

// ============================================================
// PROFILE SWITCHER
// ============================================================

interface ProfileSwitcherProps {
  userId: string;
  subProfiles: SubProfile[];
  activeProfile: string;
  onSwitch?: (profileId: string) => void;
}

/**
 * Allows users to switch between active profiles
 */
export function ProfileSwitcher({
  userId,
  subProfiles,
  activeProfile,
  onSwitch,
}: ProfileSwitcherProps) {
  const [switching, setSwitching] = React.useState(false);

  const handleSwitch = async (profileId: string) => {
    if (switching || profileId === activeProfile) return;
    setSwitching(true);
    try {
      onSwitch?.(profileId);
    } catch (error) {
      console.error('Failed to switch profile:', error);
    } finally {
      setSwitching(false);
    }
  };

  const getProfileIcon = (type: string) => {
    const icons: Record<string, string> = {
      talent: '🎤',
      engineer: '🎛️',
      producer: '🎹',
      studio: '🎸',
      technician: '🔧',
      label: '🏷️',
      student: '📚',
      fan: '❤️',
    };
    return icons[type] || '👤';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Active as:</span>
      <div className="flex gap-2">
        {subProfiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSwitch(profile.id)}
            disabled={switching}
            className={[
              'px-3 py-1.5 rounded-lg text-sm font-medium transition',
              profile.id === activeProfile
                ? 'bg-brand-blue text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              switching ? 'opacity-50 cursor-not-allowed' : ''
            ].filter(Boolean).join(' ')}
          >
            <span className="mr-1">{getProfileIcon(profile.type)}</span>
            {profile.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ONLINE USERS LIST
// ============================================================

interface OnlineUsersListProps {
  locationType?: 'studio' | 'room' | 'session';
  locationId?: string;
  maxUsers?: number;
}

/**
 * Shows list of online users, optionally filtered by location
 */
export function OnlineUsersList({ locationType, locationId, maxUsers = 10 }: OnlineUsersListProps) {
  const { users, loading } = locationType && locationId
    ? useUsersInLocation(locationType, locationId)
    : { users: [], loading: false };

  const displayUsers = users.slice(0, maxUsers);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">Loading online users...</p>
      </div>
    );
  }

  if (displayUsers.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">No users online</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-green-500" />
        <h3 className="text-sm font-semibold">Online ({displayUsers.length})</h3>
      </div>
      <div className="space-y-2">
        {displayUsers.map((user) => (
          <div key={user.userId} className="flex items-center gap-3 p-2 bg-white rounded-lg">
            <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.displayName}</p>
              {user.currentLocation && (
                <p className="text-xs text-gray-500">
                  {user.currentLocation.name}
                </p>
              )}
            </div>
            <StatusDot status="online" size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// UNREAD COUNTS BADGE
// ============================================================

interface UnreadCountsBadgeProps {
  userId: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Shows badge with unread counts for messages, notifications, bookings
 */
export function UnreadCountsBadge({ userId, position = 'top-right' }: UnreadCountsBadgeProps) {
  const { counts, loading } = useUnreadCounts(userId);

  if (loading) {
    return null;
  }

  const totalCount = (counts?.messages || 0) + (counts?.notifications || 0) + (counts?.bookingRequests || 0);

  if (totalCount === 0) {
    return null;
  }

  const positionClasses = {
    'top-right': 'top-0 right-0 -mt-1 -mr-1',
    'top-left': 'top-0 left-0 -mt-1 -ml-1',
    'bottom-right': 'bottom-0 right-0 -mb-1 -mr-1',
    'bottom-left': 'bottom-0 left-0 -mb-1 -ml-1',
  };

  return (
    <div className={['absolute', positionClasses[position], 'flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full'].join(' ')}>
      {totalCount > 9 ? '9+' : totalCount}
    </div>
  );
}

// ============================================================
// SESSION PARTICIPANTS
// ============================================================

interface SessionParticipantsProps {
  sessionId: string;
}

/**
 * Shows participants in an active collaboration session
 */
export function SessionParticipants({ sessionId }: SessionParticipantsProps) {
  const { session, loading } = useActiveSession(sessionId);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading session...</div>;
  }

  if (!session) {
    return <div className="text-sm text-gray-500">No active session</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-brand-blue" />
          <h3 className="text-sm font-semibold">Session Participants</h3>
        </div>
        <span className="text-xs text-gray-500">{session.participantCount} online</span>
      </div>

      <div className="space-y-2">
        {/* Host */}
        {session.participants?.filter(p => p.role === 'host').map((participant) => (
          <div key={participant.userId} className="flex items-center gap-3 p-2 bg-brand-blue/10 rounded-lg border border-brand-blue/20">
            <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
              {participant.displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{participant.displayName}</p>
              <p className="text-xs text-brand-blue">Host</p>
            </div>
            <StatusDot status="online" size="sm" />
          </div>
        ))}

        {/* Guests */}
        {session.participants?.filter(p => p.role === 'guest').map((participant) => (
          <div key={participant.userId} className="flex items-center gap-3 p-2 bg-white rounded-lg">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {participant.displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{participant.displayName}</p>
              <p className="text-xs text-gray-500">Guest</p>
            </div>
            <StatusDot status="online" size="sm" />
          </div>
        ))}

        {/* Observers */}
        {session.participants?.filter(p => p.role === 'observer').map((participant) => (
          <div key={participant.userId} className="flex items-center gap-3 p-2 bg-white rounded-lg opacity-60">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">
              {participant.displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{participant.displayName}</p>
              <p className="text-xs text-gray-500">Observer</p>
            </div>
            <StatusDot status="online" size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD STATS CARD
// ============================================================

interface DashboardStatsCardProps {
  userId: string;
}

/**
 * Shows real-time dashboard stats
 */
export function DashboardStatsCard({ userId }: DashboardStatsCardProps) {
  const { stats, loading } = useDashboardStats(userId);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Dashboard</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Today's Bookings */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium uppercase">Today</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.todayBookingCount}</p>
          <p className="text-xs text-blue-600">Bookings</p>
        </div>

        {/* Today's Revenue */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium uppercase">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-900">${stats.todayRevenue}</p>
          <p className="text-xs text-green-600">Today</p>
        </div>

        {/* Unread Messages */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-purple-600" />
            <span className="text-xs text-purple-600 font-medium uppercase">Messages</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{stats.unreadMessages}</p>
          <p className="text-xs text-purple-600">Unread</p>
        </div>

        {/* Active Notifications */}
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="text-orange-600" />
            <span className="text-xs text-orange-600 font-medium uppercase">Alerts</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{stats.activeNotifications}</p>
          <p className="text-xs text-orange-600">Active</p>
        </div>
      </div>

      {/* Week Stats */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">This Week</span>
          <span className="font-semibold">{stats.weekBookingCount} bookings</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Revenue</span>
          <span className="font-semibold text-green-600">{stats.weekRevenue}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// USER PRESENCE CARD
// ============================================================

interface UserPresenceCardProps {
  userId: string;
  displayName: string;
  photoUrl?: string;
}

/**
 * Shows user with their presence status and current location
 */
export function UserPresenceCard({ userId, displayName, photoUrl }: UserPresenceCardProps) {
  const { presence } = useBatchPresence([userId]);
  const userPresence = presence?.[userId];

  const status = userPresence?.status || 'offline';
  const location = userPresence?.currentLocation;
  const lastSeen = userPresence?.lastSeen;

  const formatLastSeen = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition">
      <div className="relative">
        {photoUrl ? (
          <img src={photoUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center text-white text-lg font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute bottom-0 right-0">
          <StatusDot status={status} size="sm" />
        </div>
      </div>

      <div className="flex-1">
        <p className="font-medium text-gray-900">{displayName}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {location ? (
            <>
              <MapPin size={12} />
              <span>{location.name}</span>
            </>
          ) : status !== 'online' && lastSeen ? (
            <>
              <Clock size={12} />
              <span>{formatLastSeen(lastSeen)}</span>
            </>
          ) : (
            <span className="capitalize text-green-600">Online</span>
          )}
        </div>
      </div>
    </div>
  );
}
