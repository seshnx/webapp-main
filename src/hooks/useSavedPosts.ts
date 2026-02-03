import { useState, useEffect, useCallback } from 'react';
import {
  getSavedPosts,
  getPosts,
  savePost as savePostToDb,
  unsavePost as unsavePostFromDb
} from '../config/neonQueries';

/**
 * Saved post data from database
 */
export interface SavedPostData {
  id: string;
  postId?: string;
  userId: string;
  author_id?: string;
  author_name?: string;
  preview?: string;
  has_media?: boolean;
  savedAt: string | Date;
  [key: string]: any;
}

/**
 * Full post data with saved status
 */
export interface PostWithData {
  id: string;
  userId?: string;
  displayName?: string;
  authorPhoto?: string;
  timestamp?: string | Date;
  savedAt?: string | Date;
  deleted?: boolean;
  authorName?: string;
  preview?: string;
  content?: string;
  text?: string;
  media_urls?: string[];
  [key: string]: any;
}

/**
 * Save post parameters
 */
export interface SavePostParams {
  authorId?: string;
  userId?: string;
  authorName?: string;
  displayName?: string;
  preview?: string;
  content?: string;
  hasMedia?: boolean;
}

/**
 * Saved posts hook return value
 */
export interface UseSavedPostsReturn {
  savedPosts: SavedPostData[];
  loading: boolean;
  isPostSaved: (postId: string) => boolean;
  savePost: (postId: string, postData: SavePostParams) => Promise<boolean>;
  removeSavedPost: (postId: string) => Promise<boolean>;
  fetchSavedPostsWithData: () => Promise<PostWithData[]>;
  savedCount: number;
}

/**
 * Hook for managing and fetching saved/bookmarked posts
 *
 * @param userId - The authenticated user's UID
 * @param fetchLimit - Max saved posts to fetch (default 50)
 * @returns Saved posts state and controls
 *
 * @example
 * function SavedPostsList({ userId }) {
 *   const {
 *     savedPosts,
 *     loading,
 *     savePost,
 *     removeSavedPost,
 *     fetchSavedPostsWithData,
 *     savedCount
 *   } = useSavedPosts(userId, 50);
 *
 *   const [postsWithData, setPostsWithData] = useState([]);
 *
 *   useEffect(() => {
 *     fetchSavedPostsWithData().then(setPostsWithData);
 *   }, [savedPosts]);
 *
 *   return (
 *     <div>
 *       <h2>Saved Posts ({savedCount})</h2>
 *       {loading ? (
 *         <div>Loading...</div>
 *       ) : (
 *         postsWithData.map(post => (
 *           <PostCard
 *             key={post.id}
 *             post={post}
 *             isSaved={true}
 *             onUnsave={() => removeSavedPost(post.id)}
 *           />
 *         ))
 *       )}
 *     </div>
 *   );
 * }
 */
export function useSavedPosts(
  userId: string | null | undefined,
  fetchLimit: number = 50
): UseSavedPostsReturn {
  const [savedPosts, setSavedPosts] = useState<SavedPostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch saved posts
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSaved = async () => {
      try {
        const saved = await getSavedPosts(userId, fetchLimit);
        setSavedPosts(saved || []);
        setLoading(false);
      } catch (error) {
        console.error('Saved posts fetch error:', error);
        setLoading(false);
      }
    };

    fetchSaved();

    // Note: Supabase realtime subscription removed.
    // Can be replaced with Convex subscription if needed.
  }, [userId, fetchLimit]);

  /**
   * Check if a specific post is saved
   */
  const isPostSaved = useCallback((postId: string): boolean => {
    return savedPosts.some(p => p.id === postId || p.postId === postId);
  }, [savedPosts]);

  /**
   * Save a post
   */
  const savePost = useCallback(async (postId: string, postData: SavePostParams): Promise<boolean> => {
    if (!userId) return false;

    try {
      await savePostToDb(userId, postId, {
        author_id: postData.authorId || postData.userId,
        author_name: postData.authorName || postData.displayName,
        preview: postData.preview || postData.content,
        has_media: postData.hasMedia || false
      });

      // Refresh saved posts
      const saved = await getSavedPosts(userId, fetchLimit);
      setSavedPosts(saved || []);

      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  }, [userId, fetchLimit]);

  /**
   * Unsave a post
   */
  const removeSavedPost = useCallback(async (postId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      await unsavePostFromDb(userId, postId);

      // Refresh saved posts
      const saved = await getSavedPosts(userId, fetchLimit);
      setSavedPosts(saved || []);

      return true;
    } catch (error) {
      console.error('Error unsaving post:', error);
      return false;
    }
  }, [userId, fetchLimit]);

  /**
   * Get the full post data for saved posts
   * This fetches the actual post documents
   */
  const fetchSavedPostsWithData = useCallback(async (): Promise<PostWithData[]> => {
    if (!savedPosts.length) return [];

    try {
      const postIds = savedPosts.map(s => s.postId || s.id).filter(Boolean) as string[];

      if (postIds.length === 0) return [];

      // Use Neon getPosts function
      const posts = await getPosts({ limit: 100 });
      const filteredPosts = posts.filter(p => postIds.includes(p.id));

      const postsMap = new Map(filteredPosts.map(p => [p.id, p]));

      const postsWithData: PostWithData[] = savedPosts.map((saved): PostWithData => {
        const post = postsMap.get(saved.postId || saved.id);

        if (post) {
          return {
            ...post,
            id: post.id,
            userId: post.user_id || post.userId,
            displayName: post.display_name || post.displayName,
            authorPhoto: post.author_photo,
            timestamp: post.created_at || post.timestamp,
            savedAt: saved.savedAt
          };
        }
        // Return minimal data if post was deleted
        return {
          id: saved.postId || saved.id,
          deleted: true,
          authorName: saved.author_name,
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
    savePost,
    removeSavedPost,
    fetchSavedPostsWithData,
    savedCount: savedPosts.length
  };
}
