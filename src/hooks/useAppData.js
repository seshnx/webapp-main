import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useUserSubProfiles = (uid, roles) => {
    const [subProfiles, setSubProfiles] = useState({});
    
    useEffect(() => {
        if (!uid || !roles || roles.length === 0 || !supabase) {
            setSubProfiles({});
            return;
        }

        const loadSubProfiles = async () => {
            try {
                const { data, error } = await supabase
                    .from('sub_profiles')
                    .select('*')
                    .eq('user_id', uid)
                    .in('role', roles);
                
                if (error) throw error;
                
                const profilesMap = {};
                roles.forEach(role => {
                    const profile = data?.find(p => p.role === role);
                    profilesMap[role] = profile || { useRealName: true };
                });
                
                setSubProfiles(profilesMap);
            } catch (err) {
                console.error('Error loading sub profiles:', err);
            }
        };

        loadSubProfiles();

        // Subscribe to changes
        const channel = supabase
            .channel(`sub-profiles-${uid}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'sub_profiles',
                filter: `user_id=eq.${uid}`
            }, () => {
                loadSubProfiles();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [uid, JSON.stringify(roles)]);

    return subProfiles;
};

export const useBookingRequests = (uid) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!uid || !supabase) return;

        const loadCount = async () => {
            try {
                const { count: bookingCount, error } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('target_id', uid)
                    .eq('status', 'Pending');
                
                if (error) throw error;
                setCount(bookingCount || 0);
            } catch (err) {
                console.error('Error loading booking count:', err);
            }
        };

        loadCount();

        // Subscribe to changes
        const channel = supabase
            .channel(`booking-requests-${uid}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'bookings',
                filter: `target_id=eq.${uid}`
            }, () => {
                loadCount();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [uid]);

    return count;
};

// UPDATED: Notifications Hook (Aggregates Bookings & Messages)
export const useNotifications = (uid) => {
    const [notifications, setNotifications] = useState([]);
    const [bookingNotifs, setBookingNotifs] = useState([]);
    const [messageNotifs, setMessageNotifs] = useState([]); // Chat notifications should come from Convex conversations
    
    // 1. Booking Requests (Supabase)
    useEffect(() => {
        if (!uid || !supabase) return;

        const loadBookings = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('target_id', uid)
                    .eq('status', 'Pending')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                const notifs = (data || []).map(d => ({
                    id: d.id,
                    type: 'booking',
                    title: 'New Booking Request',
                    text: `${d.sender_name || 'Someone'} wants to book a ${d.service_type || 'session'}.`,
                    timestamp: d.created_at ? new Date(d.created_at) : new Date(),
                    actionData: d
                }));
                
                setBookingNotifs(notifs);
            } catch (err) {
                console.error('Error loading booking notifications:', err);
            }
        };

        loadBookings();

        // Subscribe to changes
        const channel = supabase
            .channel(`notifications-bookings-${uid}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'bookings',
                filter: `target_id=eq.${uid}`
            }, () => {
                loadBookings();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [uid]);

    // 2. Unread Messages (Convex-backed in chat UI)
    // NOTE: This legacy hook previously relied on Firebase RTDB. We intentionally
    // keep this empty here; the main app uses Convex conversations/unreadCount instead.
    useEffect(() => {
        setMessageNotifs([]);
    }, [uid]);

    // 3. Merge & Sort
    useEffect(() => {
        const combined = [...bookingNotifs, ...messageNotifs].sort((a, b) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp || 0);
            const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp || 0);
            return timeB - timeA;
        });
        setNotifications(combined);
    }, [bookingNotifs, messageNotifs]);

    return notifications;
};
