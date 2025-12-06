import { useState, useEffect, useCallback } from 'react';
import { 
    doc, 
    setDoc, 
    deleteDoc, 
    getDoc, 
    collection, 
    query, 
    onSnapshot,
    serverTimestamp,
    increment,
    writeBatch,
    orderBy,
    limit
} from 'firebase/firestore';
import { db, appId, getPaths } from '../config/firebase';

/**
 * Hook for managing the social follow system
 * @param {string} currentUserId - The authenticated user's UID
 * @param {object} currentUserData - The authenticated user's profile data
 */
export function useFollowSystem(currentUserId, currentUserData) {
    const [following, setFollowing] = useState([]); // UIDs the current user follows
    const [followers, setFollowers] = useState([]); // UIDs that follow the current user
    const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
    const [loading, setLoading] = useState(true);

    // Subscribe to current user's following list
    useEffect(() => {
        if (!currentUserId) {
            setLoading(false);
            return;
        }

        const followingRef = collection(db, getPaths(currentUserId).following);
        const followersRef = collection(db, getPaths(currentUserId).followers);
        const statsRef = doc(db, getPaths(currentUserId).socialStats);

        // Listen to who current user follows
        const unsubFollowing = onSnapshot(
            query(followingRef, orderBy('timestamp', 'desc')),
            (snapshot) => {
                const followingList = snapshot.docs.map(d => ({
                    odId: d.id,
                    ...d.data()
                }));
                setFollowing(followingList);
            },
            (error) => console.error('Following listener error:', error)
        );

        // Listen to current user's followers
        const unsubFollowers = onSnapshot(
            query(followersRef, orderBy('timestamp', 'desc')),
            (snapshot) => {
                const followersList = snapshot.docs.map(d => ({
                    odId: d.id,
                    ...d.data()
                }));
                setFollowers(followersList);
            },
            (error) => console.error('Followers listener error:', error)
        );

        // Listen to stats document
        const unsubStats = onSnapshot(statsRef, (snapshot) => {
            if (snapshot.exists()) {
                setStats(snapshot.data());
            }
            setLoading(false);
        });

        return () => {
            unsubFollowing();
            unsubFollowers();
            unsubStats();
        };
    }, [currentUserId]);

    /**
     * Check if current user is following a specific user
     */
    const isFollowing = useCallback((targetUserId) => {
        return following.some(f => f.odId === targetUserId);
    }, [following]);

    /**
     * Follow a user
     */
    const followUser = useCallback(async (targetUserId, targetUserData) => {
        if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

        const batch = writeBatch(db);

        // Add to current user's following list
        const followingDocRef = doc(db, getPaths(currentUserId).following, targetUserId);
        batch.set(followingDocRef, {
            displayName: targetUserData?.displayName || targetUserData?.firstName || 'User',
            photoURL: targetUserData?.photoURL || null,
            role: targetUserData?.activeProfileRole || 'User',
            timestamp: serverTimestamp()
        });

        // Add to target user's followers list
        const followerDocRef = doc(db, getPaths(targetUserId).followers, currentUserId);
        batch.set(followerDocRef, {
            displayName: currentUserData?.displayName || `${currentUserData?.firstName || ''} ${currentUserData?.lastName || ''}`.trim() || 'User',
            photoURL: currentUserData?.photoURL || null,
            role: currentUserData?.activeProfileRole || 'User',
            timestamp: serverTimestamp()
        });

        // Update stats for current user
        const currentUserStatsRef = doc(db, getPaths(currentUserId).socialStats);
        batch.set(currentUserStatsRef, { followingCount: increment(1) }, { merge: true });

        // Update stats for target user
        const targetUserStatsRef = doc(db, getPaths(targetUserId).socialStats);
        batch.set(targetUserStatsRef, { followersCount: increment(1) }, { merge: true });

        // Create notification for target user
        const notificationRef = doc(collection(db, getPaths(targetUserId).notifications));
        batch.set(notificationRef, {
            type: 'follow',
            fromUserId: currentUserId,
            fromUserName: currentUserData?.displayName || `${currentUserData?.firstName || ''} ${currentUserData?.lastName || ''}`.trim() || 'Someone',
            fromUserPhoto: currentUserData?.photoURL || null,
            message: 'started following you',
            read: false,
            timestamp: serverTimestamp()
        });

        try {
            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Follow error:', error);
            return { success: false, error };
        }
    }, [currentUserId, currentUserData]);

    /**
     * Unfollow a user
     */
    const unfollowUser = useCallback(async (targetUserId) => {
        if (!currentUserId || !targetUserId) return;

        const batch = writeBatch(db);

        // Remove from current user's following list
        const followingDocRef = doc(db, getPaths(currentUserId).following, targetUserId);
        batch.delete(followingDocRef);

        // Remove from target user's followers list
        const followerDocRef = doc(db, getPaths(targetUserId).followers, currentUserId);
        batch.delete(followerDocRef);

        // Update stats for current user
        const currentUserStatsRef = doc(db, getPaths(currentUserId).socialStats);
        batch.set(currentUserStatsRef, { followingCount: increment(-1) }, { merge: true });

        // Update stats for target user
        const targetUserStatsRef = doc(db, getPaths(targetUserId).socialStats);
        batch.set(targetUserStatsRef, { followersCount: increment(-1) }, { merge: true });

        try {
            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Unfollow error:', error);
            return { success: false, error };
        }
    }, [currentUserId]);

    /**
     * Toggle follow state
     */
    const toggleFollow = useCallback(async (targetUserId, targetUserData) => {
        if (isFollowing(targetUserId)) {
            return unfollowUser(targetUserId);
        } else {
            return followUser(targetUserId, targetUserData);
        }
    }, [isFollowing, followUser, unfollowUser]);

    /**
     * Get social stats for any user
     */
    const getUserStats = useCallback(async (userId) => {
        try {
            const statsDoc = await getDoc(doc(db, getPaths(userId).socialStats));
            return statsDoc.exists() ? statsDoc.data() : { followersCount: 0, followingCount: 0 };
        } catch (error) {
            console.error('Get stats error:', error);
            return { followersCount: 0, followingCount: 0 };
        }
    }, []);

    /**
     * Get list of UIDs that the current user follows (for feed filtering)
     */
    const getFollowingIds = useCallback(() => {
        return following.map(f => f.odId);
    }, [following]);

    return {
        following,
        followers,
        stats,
        loading,
        isFollowing,
        followUser,
        unfollowUser,
        toggleFollow,
        getUserStats,
        getFollowingIds
    };
}

/**
 * Hook for fetching social stats for a specific user (read-only)
 * Use this in profile views for users other than the current user
 */
export function useUserSocialStats(userId) {
    const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const statsRef = doc(db, getPaths(userId).socialStats);
        const unsub = onSnapshot(statsRef, (snapshot) => {
            if (snapshot.exists()) {
                setStats(snapshot.data());
            }
            setLoading(false);
        });

        return () => unsub();
    }, [userId]);

    return { stats, loading };
}

