import { useState, useEffect } from 'react';
import { getSubProfile } from '../config/neonQueries';
import { useNotifications as useNeonNotifications } from './useNotifications';
import type { AccountType } from '../types';

// NOTE: Convex real-time hooks for bookings and notifications are not yet implemented.
// Use polling-based hooks (useMarketplace, useNotifications) for now.
// See useConvexRealtime.ts for commented-out real-time hooks.

/**
 * Sub-profile data interface
 */
export interface SubProfileData {
  useRealName?: boolean;
  [key: string]: any;
}

/**
 * Sub-profiles map (role -> profile data)
 */
export interface SubProfilesMap {
  [role: string]: SubProfileData;
}

/**
 * Notification interface (UI format)
 */
export interface UINotification {
  id: string;
  type: string;
  title: string;
  text?: string | null;
  timestamp: Date;
  read: boolean;
  actionData?: Record<string, any>;
}

/**
 * Hook for loading user sub-profiles based on their roles
 *
 * @param uid - User ID
 * @param roles - Array of account types/roles
 * @returns Map of role to profile data
 *
 * @example
 * function Profile({ userId, roles }) {
 *   const subProfiles = useUserSubProfiles(userId, roles);
 *
 *   return (
 *     <div>
 *       {roles.map(role => (
 *         <div key={role}>
 *           <h3>{role} Profile</h3>
 *           <pre>{JSON.stringify(subProfiles[role], null, 2)}</pre>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useUserSubProfiles(
  uid: string | null | undefined,
  roles: AccountType[] | null | undefined
): SubProfilesMap {
  const [subProfiles, setSubProfiles] = useState<SubProfilesMap>({});

  useEffect(() => {
    if (!uid || !roles || roles.length === 0) {
      setSubProfiles({});
      return;
    }

    const loadSubProfiles = async () => {
      try {
        const profilesMap: SubProfilesMap = {};
        await Promise.all(
          roles.map(async (role) => {
            try {
              const profile = await getSubProfile(uid, role);
              profilesMap[role] = profile || { useRealName: true };
            } catch (err) {
              profilesMap[role] = { useRealName: true };
            }
          })
        );

        setSubProfiles(profilesMap);
      } catch (err) {
        console.error('Error loading sub profiles:', err);
      }
    };

    loadSubProfiles();

    // Poll for changes every 30 seconds (since we don't have real-time subscriptions)
    const interval = setInterval(loadSubProfiles, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [uid, JSON.stringify(roles)]);

  return subProfiles;
}

/**
 * Hook for getting booking request count
 *
 * @param uid - User ID
 * @returns Number of pending booking requests
 *
 * @example
 * function Header() {
 *   const { userId } = useAuth();
 *   const bookingCount = useBookingRequests(userId);
 *
 *   return (
 *     <header>
 *       <Link to="/bookings">
 *         Bookings {bookingCount > 0 && `(${bookingCount})`}
 *       </Link>
 *     </header>
 *   );
 * }
 */
export function useBookingRequests(uid: string | null | undefined): number {
  // TODO: Use pending bookings query from Neon
  // For now, return 0 as placeholder
  return 0;
}

/**
 * Hook for getting notifications (aggregates bookings & messages)
 * Uses Neon-based notifications
 *
 * @param uid - User ID
 * @returns Array of notifications
 *
 * @example
 * function NotificationCenter({ userId }) {
 *   const notifications = useAppDataNotifications(userId);
 *
 *   return (
 *     <div>
 *       <h2>Notifications</h2>
 *       {notifications.map(notif => (
 *         <NotificationItem key={notif.id} notification={notif} />
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useAppDataNotifications(uid: string | null | undefined): UINotification[] {
  // Use Neon-based notifications hook
  const { notifications: neonNotifs } = useNeonNotifications(uid || null);

  // Transform Neon notifications to the expected format
  const notifications: UINotification[] = neonNotifs.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    text: n.message,
    timestamp: new Date(n.created_at),
    read: n.read,
    actionData: n.metadata,
  }));

  return notifications;
}
