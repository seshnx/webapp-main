import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook for managing and fetching saved/bookmarked posts
 * @param {string} userId - The authenticated user's UID
 * @param {number} fetchLimit - Max saved posts to fetch (default 50)
 */
export function useSavedPosts(userId, fetchLimit = 50) {
    const [savedPosts, setSavedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Subscribe to saved posts
    useEffect(() => {
        if (!userId || !supabase) {
            setLoading(false);
            return;
        }

        // Initial fetch
        supabase
            .from('saved_posts')
            .select('*')
            .eq('user_id', userId)
            .order('saved_at', { ascending: false })
            .limit(fetchLimit)
            .then(({ data, error }) => {
                if (error) {
                    console.error('Saved posts fetch error:', error);
                    setLoading(false);
                    return;
                }
                
                const saved = (data || []).map(item => ({
                    id: item.id,
                    postId: item.post_id,
                    authorId: item.author_id,
                    authorName: item.author_name,
                    preview: item.preview,
                    savedAt: item.saved_at,
                    hasMedia: item.has_media
                }));
                setSavedPosts(saved);
                setLoading(false);
            });

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`saved-posts-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'saved_posts',
                    filter: `user_id=eq.${userId}`
                },
                async () => {
                    const { data } = await supabase
                        .from('saved_posts')
                        .select('*')
                        .eq('user_id', userId)
                        .order('saved_at', { ascending: false })
                        .limit(fetchLimit);
                    
                    if (data) {
                        const saved = data.map(item => ({
                            id: item.id,
                            postId: item.post_id,
                            authorId: item.author_id,
                            authorName: item.author_name,
                            preview: item.preview,
                            savedAt: item.saved_at,
                            hasMedia: item.has_media
                        }));
                        setSavedPosts(saved);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchLimit]);

    /**
     * Check if a specific post is saved
     */
    const isPostSaved = useCallback((postId) => {
        return savedPosts.some(p => p.id === postId || p.postId === postId);
    }, [savedPosts]);

    /**
     * Get the full post data for saved posts
     * This fetches the actual post documents
     */
    const fetchSavedPostsWithData = useCallback(async () => {
        if (!savedPosts.length || !supabase) return [];

        try {
            const postIds = savedPosts.map(s => s.postId || s.id).filter(Boolean);
            
            if (postIds.length === 0) return [];

            const { data: posts, error } = await supabase
                .from('posts')
                .select('*')
                .in('id', postIds);
            
            if (error) throw error;

            const postsMap = new Map((posts || []).map(p => [p.id, p]));
            
            const postsWithData = savedPosts.map((saved) => {
                const post = postsMap.get(saved.postId || saved.id);
                
                if (post) {
                    return {
                        ...post,
                        id: post.id,
                        userId: post.user_id,
                        displayName: post.display_name,
                        authorPhoto: post.author_photo,
                        timestamp: post.created_at,
                        savedAt: saved.savedAt
                    };
                }
                // Return minimal data if post was deleted
                return {
                    id: saved.postId || saved.id,
                    deleted: true,
                    authorName: saved.authorName,
                    preview: saved.preview,
                    savedAt: saved.savedAt
                };
            });

            return postsWithData.filter(p => !p.deleted);
        } catch (error) {
            console.error('Error fetching saved posts data:', error);
            return [];
        }
    }, [savedPosts]);

    return {
        savedPosts,
        loading,
        isPostSaved,
        fetchSavedPostsWithData,
        savedCount: savedPosts.length
    };
}

