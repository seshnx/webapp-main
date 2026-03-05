/**
 * MongoDB Social Data Types
 *
 * TypeScript types for MongoDB collections used for social features.
 * All social media features (posts, comments, reactions, follows, notifications)
 */

/**
 * Social post stored in MongoDB
 */
export interface MongoPost {
  _id?: string;
  id: string; // UUID for compatibility with frontend
  author_id: string;
  content: string;
  media_urls?: string[];
  hashtags?: string[];
  mentions?: string[];
  category?: string;
  visibility: 'public' | 'followers' | 'private';
  parent_id?: string | null; // For replies/reposts
  repost_of?: string | null;
  engagement: {
    likes_count: number;
    comments_count: number;
    reposts_count: number;
    saves_count: number;
  };
  metadata?: {
    equipment?: any[];
    software?: any[];
    custom_fields?: Record<string, any>;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

/**
 * Comment stored in MongoDB
 */
export interface MongoComment {
  _id?: string;
  id: string; // UUID for compatibility
  post_id: string;
  author_id: string;
  content: string;
  parent_id?: string | null; // For nested replies
  reactions?: { emoji: string; user_ids: string[] }[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

/**
 * Reaction stored in MongoDB
 */
export interface MongoReaction {
  _id?: string;
  post_id: string;
  target_id: string; // post or comment ID
  target_type: 'post' | 'comment';
  emoji: string;
  user_id: string;
  created_at: Date;
}

/**
 * Follow relationship stored in MongoDB
 */
export interface MongoFollow {
  _id?: string;
  follower_id: string;
  following_id: string;
  created_at: Date;
}

/**
 * Saved post (bookmark) stored in MongoDB
 */
export interface MongoSavedPost {
  _id?: string;
  user_id: string;
  post_id: string;
  created_at: Date;
}

/**
 * Social notification stored in MongoDB
 */
export interface MongoSocialNotification {
  _id?: string;
  user_id: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'reply' | 'save' | 'repost';
  actor_id: string; // User who triggered notification
  target_id: string; // Post/comment being referenced
  message: string;
  read: boolean;
  created_at: Date;
  read_at?: Date;
}

/**
 * User block stored in MongoDB
 */
export interface MongoUserBlock {
  _id?: string;
  blocker_id: string;
  blocked_id: string;
  created_at: Date;
}

/**
 * Content report stored in MongoDB
 */
export interface MongoContentReport {
  _id?: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'user';
  target_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'actioned';
  created_at: Date;
  reviewed_at?: Date;
}

/**
 * Post metrics/analytics stored in MongoDB
 */
export interface MongoPostMetrics {
  _id?: string;
  post_id: string;
  views: number;
  impressions: number;
  reach: number;
  engagement_rate: number;
  date: Date;
}

/**
 * Post creation parameters
 */
export interface CreatePostParams {
  author_id: string;
  content: string;
  media_urls?: string[];
  category?: string;
  visibility?: 'public' | 'followers' | 'private';
  parent_id?: string | null;
  repost_of?: string | null;
  equipment?: any[];
  software?: any[];
  custom_fields?: Record<string, any>;
}

/**
 * Comment creation parameters
 */
export interface CreateCommentParams {
  post_id: string;
  author_id: string;
  content: string;
  parent_id?: string | null;
}

/**
 * Reaction toggle result
 */
export interface ReactionToggleResult {
  action: 'added' | 'removed';
  emoji: string;
}
