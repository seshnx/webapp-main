import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Saved post data from database
 */
export interface SavedPostData {
  _id: Id<"saved_posts">;
  id: string; // compatibility
  postId: Id<"posts">;
  userId: Id<"users">;
  authorName?: string;
  preview?: string;
  hasMedia?: boolean;
  created_at: number;
}

/**
 * Full post data with saved status
 */
export interface PostWithData {
  id: string;
  userId?: string;
  displayName?: string;
  authorPhoto?: string;
  timestamp?: number;
  savedAt?: number;
  deleted?: boolean;
  authorName?: string;
  preview?: string;
  content?: string;
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
  savePost: (postId: string, postData?: SavePostParams) => Promise<boolean>;
  removeSavedPost: (postId: string) => Promise<boolean>;
  fetchSavedPostsWithData: () => Promise<PostWithData[]>;
  savedCount: number;
}

/**
 * Hook for managing and fetching saved/bookmarked posts
 */
export function useSavedPosts(
  userId: string | null | undefined,
  _fetchLimit: number = 50
): UseSavedPostsReturn {
  const [localSavedPosts, setLocalSavedPosts] = useState<SavedPostData[]>([]);

  const savedPostsData = useQuery(
    api.social.getSavedPosts,
    userId ? { clerkId: userId } : "skip"
  );

  const saveMutation = useMutation(api.social.savePost);
  const unsaveMutation = useMutation(api.social.unsavePost);

  useEffect(() => {
    if (savedPostsData) {
      setLocalSavedPosts(savedPostsData.map((s: any) => ({
        ...s,
        id: s._id,
        postId: s.postId,
        userId: s.userId,
        created_at: s._creationTime
      })));
    }
  }, [savedPostsData]);

  const loading = savedPostsData === undefined;
  const savedPosts = localSavedPosts;

  /**
   * Check if a specific post is saved
   */
  const isPostSaved = useCallback((postId: string): boolean => {
    return savedPosts.some(p => p.postId === postId || p.id === postId);
  }, [savedPosts]);

  /**
   * Save a post
   */
  const savePost = useCallback(async (postId: string, _postData: SavePostParams = {}): Promise<boolean> => {
    if (!userId) return false;
    try {
      await saveMutation({
        userId: userId,
        postId: postId as Id<"posts">
      });
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  }, [userId, saveMutation]);

  /**
   * Unsave a post
   */
  const removeSavedPost = useCallback(async (postId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      await unsaveMutation({
        userId: userId,
        postId: postId as Id<"posts">
      });
      return true;
    } catch (error) {
      console.error('Error unsaving post:', error);
      return false;
    }
  }, [userId, unsaveMutation]);

  /**
   * Get the full post data for saved posts
   */
  const fetchSavedPostsWithData = useCallback(async (): Promise<PostWithData[]> => {
    return []; // Handled by standard Convex subscriptions in components
  }, []);

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
