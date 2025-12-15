import { useState, useEffect } from 'react';
import { doc, collection, onSnapshot, getDoc, query, where } from 'firebase/firestore';
import { db, getPaths, appId } from '../config/firebase';

export const useUserSubProfiles = (uid, roles) => {
    const [subProfiles, setSubProfiles] = useState({});
    
    useEffect(() => {
        if (!uid || !roles || roles.length === 0) {
            setSubProfiles({});
            return;
        }

        const unsubscribes = roles.map(role => {
            return onSnapshot(doc(db, getPaths(uid).userSubProfile(role)), (docSnap) => {
                setSubProfiles(prev => ({
                    ...prev,
                    [role]: docSnap.exists() ? docSnap.data() : { useRealName: true }
                }));
            });
        });

        return () => unsubscribes.forEach(u => u());
    }, [uid, JSON.stringify(roles)]);

    return subProfiles;
};

export const useBookingRequests = (uid) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!uid) return;
       const q = query(
            collection(db, `artifacts/${appId}/public/data/bookings`),
            where("targetId", "==", uid),
            where("status", "==", "Pending")
        );
        
        return onSnapshot(q, (snap) => {
            setCount(snap.size);
        });
    }, [uid]);

    return count;
};

// UPDATED: Notifications Hook (Aggregates Bookings & Messages)
export const useNotifications = (uid) => {
    const [notifications, setNotifications] = useState([]);
    const [bookingNotifs, setBookingNotifs] = useState([]);
    const [messageNotifs, setMessageNotifs] = useState([]); // Chat notifications should come from Convex conversations
    
    // 1. Booking Requests (Firestore)
    useEffect(() => {
        if (!uid) return;
        const q = query(
            collection(db, `artifacts/${appId}/public/data/bookings`), 
            where("targetId", "==", uid),
            where("status", "==", "Pending")
        );
        
        return onSnapshot(q, (snap) => {
            const notifs = snap.docs.map(d => ({
                id: d.id,
                type: 'booking',
                title: 'New Booking Request',
                text: `${d.data().senderName} wants to book a ${d.data().serviceType || 'session'}.`,
                timestamp: d.data().timestamp, // Firestore Timestamp
                actionData: d.data()
            }));
            setBookingNotifs(notifs);
        });
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
            const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || 0);
            const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || 0);
            return timeB - timeA;
        });
        setNotifications(combined);
    }, [bookingNotifs, messageNotifs]);

    return notifications;
};
