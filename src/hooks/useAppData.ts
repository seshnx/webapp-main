import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { AccountType } from '../types';

/**
 * Sub-profile data interface
 */
export interface SubProfileData {
  useRealName?: boolean;
  displayName?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  genres?: string[];
  instruments?: string[];
  rates?: number;
  sessionRate?: number;
  hourlyRate?: number;
  availabilityStatus?: string;
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
 * Now uses Convex real-time subscriptions - no polling needed!
 *
 * @param clerkUserId - Clerk User ID (string)
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
  clerkUserId: string | null | undefined,
  roles: AccountType[] | null | undefined
): SubProfilesMap {
  // Get all sub-profiles from Convex (real-time!)
  const subProfiles = useQuery(
    api.users.getSubProfiles,
    clerkUserId ? { userId: clerkUserId } : "skip"
  );

  if (!clerkUserId || !roles || roles.length === 0) {
    return {};
  }

  // Transform sub-profiles array to map by role
  const profilesMap: SubProfilesMap = {};
  const availableProfiles = subProfiles || [];

  roles.forEach(role => {
    const profile = availableProfiles.find(p => p.role === role);
    if (profile) {
      profilesMap[role] = {
        useRealName: profile.useRealName,
        displayName: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        skills: profile.skills,
        genres: profile.genres,
        instruments: profile.instruments,
        rates: profile.rates,
        sessionRate: profile.sessionRate,
        hourlyRate: profile.hourlyRate,
        availabilityStatus: profile.availabilityStatus,
        // Add role-specific fields as needed
      };
    } else {
      // Default profile if none exists for this role
      profilesMap[role] = { useRealName: true };
    }
  });

  return profilesMap;
}

/**
 * Hook for getting booking request count
 * Now uses Convex real-time subscriptions!
 *
 * @param ownerId - Studio owner ID (Clerk ID)
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
export function useBookingRequests(ownerId: string | null | undefined): number {
  // Get bookings by studio owner from Convex (real-time!)
  const bookings = useQuery(
    api.bookings.getBookingsByStudio,
    ownerId ? { ownerId, status: "Pending" } : "skip"
  );

  if (!ownerId) {
    return 0;
  }

  return bookings?.length || 0;
}

/**
 * Hook for getting notifications (aggregates bookings & messages)
 * Now uses Convex real-time subscriptions!
 *
 * @param clerkUserId - Clerk User ID
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
export function useAppDataNotifications(
  clerkUserId: string | null | undefined
): UINotification[] {
  // Get notifications from Convex (real-time!)
  const notifications = useQuery(
    api.notifications.getNotifications,
    clerkUserId ? { userId: clerkUserId } : "skip"
  );

  if (!clerkUserId || !notifications) {
    return [];
  }

  // Transform Convex notifications to UI format
  return notifications.map(n => ({
    id: n._id,
    type: n.type,
    title: n.title,
    text: n.message,
    timestamp: new Date(n.createdAt),
    read: n.read,
    actionData: n.actionData,
  }));
}

/**
 * Hook for getting complete user data
 * Uses Convex real-time subscriptions
 *
 * @param clerkUserId - Clerk User ID
 * @returns User object with all profile data
 *
 * @example
 * function UserProfile({ userId }) {
 *   const user = useUserData(userId);
 *
 *   if (!user) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <h1>{user.displayName}</h1>
 *       <p>{user.bio}</p>
 *     </div>
 *   );
 * }
 */
export function useUserData(clerkUserId: string | null | undefined) {
  // Get user from Convex (real-time!)
  return useQuery(
    api.users.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );
}

/**
 * Hook for getting user's active profile data
 * Returns the main user profile with all fields
 *
 * @param clerkUserId - Clerk User ID
 * @returns User profile data
 */
export function useUserProfile(clerkUserId: string | null | undefined) {
  const user = useUserData(clerkUserId);

  if (!user) {
    return null;
  }

  // Return complete user profile with all fields
  return {
    id: user._id,
    clerkId: user.clerkId,
    displayName: user.displayName,
    username: user.username,
    bio: user.bio,
    headline: user.headline,
    avatarUrl: user.avatarUrl,
    bannerUrl: user.bannerUrl,
    location: user.location,
    website: user.website,
    skills: user.skills,
    genres: user.genres,
    instruments: user.instruments,
    accountTypes: user.accountTypes,
    stats: user.stats,
    settings: user.settings,
    // Role-specific fields
    talentSubRole: user.talentSubRole,
    vocalRange: user.vocalRange,
    studioHours: user.studioHours,
    // Add more fields as needed
  };
}

/**
 * Hook for checking if user has a specific role
 *
 * @param clerkUserId - Clerk User ID
 * @param role - Role to check
 * @returns Boolean indicating if user has the role
 */
export function useHasRole(
  clerkUserId: string | null | undefined,
  role: AccountType
): boolean {
  const user = useUserData(clerkUserId);

  if (!user || !user.accountTypes) {
    return false;
  }

  return user.accountTypes.includes(role);
}

/**
 * Hook for getting user's active role
 *
 * @param clerkUserId - Clerk User ID
 * @returns Active role or null
 */
export function useActiveRole(clerkUserId: string | null | undefined): AccountType | null {
  const user = useUserData(clerkUserId);

  if (!user || !user.activeRole) {
    return null;
  }

  return user.activeRole as AccountType;
}
