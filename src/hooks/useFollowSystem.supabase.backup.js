import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook for managing the social follow system (Supabase Version)
 * @param {string} currentUserId - The authenticated user's ID
 */
export function useFollowSystem(currentUserId) {
    const [following, setFollowing] = useState([]); // List of profiles current user follows
    const [followers, setFollowers] = useState([]); // List of profiles following current user
    const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
    const [loading, setLoading] = useState(true);

    // Fetch Helper: Get detailed profiles for a list of IDs
    const fetchProfiles = async (userIds) => {
        if (!userIds || userIds.length === 0) return [];
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url, active_role')
            .in('id', userIds);
        
        if (error) {
            console.error("Error fetching profiles:", error);
            return [];
        }
        
        return data.map(p => ({
            odId: p.id, // Keeping odId for compatibility with existing components
            displayName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            photoURL: p.avatar_url,
            role: p.active_role
        }));
    };

    const loadData = useCallback(async () => {
        if (!currentUserId || !supabase) return;

        try {
            // 1. Get IDs of who I follow
            const { data: followingData } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUserId);
            
            const followingIds = followingData?.map(f => f.following_id) || [];
            const followingProfiles = await fetchProfiles(followingIds);
            setFollowing(followingProfiles);

            // 2. Get IDs of who follows me
            const { data: followersData } = await supabase
                .from('follows')
                .select('follower_id')
                .eq('following_id', currentUserId);
            
            const followerIds = followersData?.map(f => f.follower_id) || [];
            const followerProfiles = await fetchProfiles(followerIds);
            setFollowers(followerProfiles);

            // 3. Stats
            setStats({
                followingCount: followingIds.length,
                followersCount: followerIds.length
            });
            
            setLoading(false);
        } catch (err) {
            console.error("Error loading follow data:", err);
            setLoading(false);
        }
    }, [currentUserId]);

    // Initial Load & Realtime Subscription
    useEffect(() => {
        loadData();

        if (!currentUserId || !supabase) return;

        // Subscribe to changes in the 'follows' table that involve this user
        const channel = supabase
            .channel('public:follows')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'follows',
                filter: `follower_id=eq.${currentUserId}` 
            }, () => loadData())
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'follows',
                filter: `following_id=eq.${currentUserId}` 
            }, () => loadData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, loadData]);

    const isFollowing = useCallback((targetUserId) => {
        return following.some(f => f.odId === targetUserId);
    }, [following]);

    const followUser = useCallback(async (targetUserId) => {
        if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;
        
        const { error } = await supabase
            .from('follows')
            .insert([{ follower_id: currentUserId, following_id: targetUserId }]);

        if (error) {
            console.error('Follow error:', error);
            return { success: false, error };
        }
        
        // Optimistic update
        loadData();
        return { success: true };
    }, [currentUserId, loadData]);

    const unfollowUser = useCallback(async (targetUserId) => {
        if (!currentUserId || !targetUserId) return;

        const { error } = await supabase
            .from('follows')
            .delete()
            .match({ follower_id: currentUserId, following_id: targetUserId });

        if (error) {
            console.error('Unfollow error:', error);
            return { success: false, error };
        }

        // Optimistic update
        loadData();
        return { success: true };
    }, [currentUserId, loadData]);

    const toggleFollow = useCallback(async (targetUserId) => {
        if (isFollowing(targetUserId)) {
            return unfollowUser(targetUserId);
        } else {
            return followUser(targetUserId);
        }
    }, [isFollowing, followUser, unfollowUser]);

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
        getFollowingIds
    };
}

/**
 * Hook for fetching social stats for a specific user (read-only)
 */
export function useUserSocialStats(userId) {
    const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId || !supabase) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            const { count: followers } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', userId);

            const { count: following } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', userId);

            setStats({
                followersCount: followers || 0,
                followingCount: following || 0
            });
            setLoading(false);
        };

        fetchStats();
    }, [userId]);

    return { stats, loading };
}
