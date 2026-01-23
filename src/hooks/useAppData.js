import { useState, useEffect } from 'react';
import { getSubProfile } from '../config/neonQueries';
// Import Convex real-time hooks
import {
  usePendingBookings,
  useNotifications as useConvexNotifications,
} from './useConvexRealtime';

export const useUserSubProfiles = (uid, roles) => {
    const [subProfiles, setSubProfiles] = useState({});

    useEffect(() => {
        if (!uid || !roles || roles.length === 0) {
            setSubProfiles({});
            return;
        }

        const loadSubProfiles = async () => {
            try {
                const profilesMap = {};
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
};

export const useBookingRequests = (uid) => {
    // Use Convex real-time for pending bookings
    const { bookings, count } = usePendingBookings(uid);

    return count;
};

// UPDATED: Notifications Hook (Aggregates Bookings & Messages)
export const useNotifications = (uid) => {
    // Use Convex real-time for notifications
    const { notifications: convexNotifs } = useConvexNotifications(uid);

    // Transform Convex notifications to the expected format
    const notifications = convexNotifs.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        text: n.message,
        timestamp: new Date(n.createdAt),
        read: n.read,
        actionData: n.metadata,
    }));

    return notifications;
};
