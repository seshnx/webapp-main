import { useState, useEffect, useCallback } from 'react';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot,
    doc,
    getDoc,
    limit
} from 'firebase/firestore';
import { db, appId, getPaths } from '../config/firebase';

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
        if (!userId) {
            setLoading(false);
            return;
        }

        const savedRef = collection(db, getPaths(userId).savedPosts);
        const q = query(
            savedRef,
            orderBy('savedAt', 'desc'),
            limit(fetchLimit)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const saved = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSavedPosts(saved);
            setLoading(false);
        }, (error) => {
            console.error('Saved posts listener error:', error);
            setLoading(false);
        });

        return () => unsubscribe();
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
        if (!savedPosts.length) return [];

        try {
            const postsWithData = await Promise.all(
                savedPosts.map(async (saved) => {
                    const postRef = doc(db, `artifacts/${appId}/public/data/posts`, saved.postId || saved.id);
                    const postDoc = await getDoc(postRef);
                    
                    if (postDoc.exists()) {
                        return {
                            ...postDoc.data(),
                            id: postDoc.id,
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
                })
            );

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

