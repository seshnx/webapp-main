/**
 * MongoDB Schema Definitions for SeshNx Platform
 *
 * This file defines the MongoDB collections and schemas for flexible,
 * frequently-changing user data and all SocialNx features.
 *
 * DATABASE: mongodb (separate from Neon PostgreSQL)
 *
 * COLLECTIONS:
 * - profiles: Flexible user profile data
 * - social_follows: Social graph (followers/following)
 * - posts: Social posts with media
 * - comments: Post comments
 * - reactions: Post reactions/likes
 * - notifications: User notifications
 * - social_settings: User social privacy settings
 */

import { MongoClient, Db, Collection, IndexSpecification } from 'mongodb';

// =====================================================
// TYPES & INTERFACES
// =====================================================

/**
 * MongoDB Profile Document
 * Stores flexible, frequently-changing user profile data
 */
interface MongoProfile {
  _id: string; // Clerk user ID
  clerkUserId: string; // Reference to clerk_users table in Neon

  // Display Identity (flexible, can change)
  displayName: string;
  username: string;
  bio?: string;
  headline?: string;

  // Visual Profile
  avatarUrl?: string;
  bannerUrl?: string;
  portfolioUrls?: Array<{
    title: string;
    url: string;
    type: 'soundcloud' | 'spotify' | 'youtube' | 'website' | 'other';
  }>;

  // Skills & Expertise (flexible arrays)
  skills: string[];
  specialties: string[];
  genres: string[];
  instruments: string[];
  software: string[];

  // Location
  location?: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
  };

  // Social Metrics (denormalized for performance)
  stats: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
  };

  // Verification & Badges
  badges?: string[];
  verifiedAt?: Date;
  verificationLevel?: 'none' | 'basic' | 'verified' | 'featured';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

/**
 * Social Follow Document
 * Represents a follow relationship between two users
 */
interface MongoSocialFollow {
  _id: string; // Unique ID
  followerId: string; // User who is following
  followeeId: string; // User being followed
  createdAt: Date;

  // For soft deletes (unfollows)
  unfollowedAt?: Date;
  isActive: boolean;
}

/**
 * Post Document
 * Social posts with media and engagement
 */
interface MongoPost {
  _id: string;
  clerkUserId: string; // Author

  // Post Content
  content?: string;
  media?: Array<{
    type: 'image' | 'video' | 'audio' | 'gif';
    url: string;
    thumbnailUrl?: string;
    duration?: number; // For video/audio
    width?: number;
    height?: number;
  }>;

  // Post Metadata
  postedAsRole?: string; // Which account type posted (Talent, Producer, etc.)
  mentions?: string[]; // Array of mentioned user IDs
  hashtags?: string[];
  location?: {
    name: string;
    coordinates?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };

  // Engagement (denormalized)
  stats: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    viewsCount: number;
  };

  // Visibility & Reach
  visibility: 'public' | 'followers' | 'private';
  repliedToPostId?: string; // For reply threads
  quotedPostId?: string; // For quote posts

  // Content Moderation
  isReported: boolean;
  reportsCount: number;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;

  // Index for sorting
  score?: number; // Computed engagement score for "For You" feeds
}

/**
 * Comment Document
 * Comments on posts
 */
interface MongoComment {
  _id: string;
  postId: string;
  clerkUserId: string;
  parentCommentId?: string; // For nested replies

  content: string;
  media?: Array<{
    type: 'image' | 'video' | 'gif';
    url: string;
  }>;

  // Engagement
  likesCount: number;
  repliesCount: number;

  // Moderation
  isReported: boolean;
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reaction Document
 * Reactions (likes, etc.) on posts and comments
 */
interface MongoReaction {
  _id: string;
  clerkUserId: string;
  targetId: string; // Post ID or Comment ID
  targetType: 'post' | 'comment';
  type: 'like' | 'love' | 'fire' | 'clap' | 'celebrate';

  createdAt: Date;
}

/**
 * Notification Document
 * User notifications for social interactions
 */
interface MongoNotification {
  _id: string;
  clerkUserId: string; // Recipient

  type: 'follow' | 'like' | 'comment' | 'mention' | 'reply' | 'post' | 'share' | 'milestone';

  // Actor who triggered notification
  actorId: string;
  actorDisplayName: string;
  actorAvatarUrl?: string;

  // Related content
  targetId?: string; // Post ID, Comment ID, etc.
  targetType?: 'post' | 'comment' | 'profile';
  content?: string; // Snippet of related content

  // Status
  isRead: boolean;
  readAt?: Date;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date; // For auto-deletion
}

/**
 * Social Settings Document
 * User privacy and social settings
 */
interface MongoSocialSettings {
  _id: string;
  clerkUserId: string;

  // Privacy
  profileVisibility: 'public' | 'followers' | 'private';
  messagePermission: 'everyone' | 'followers' | 'none';
  showOnlineStatus: boolean;
  showActivityStatus: boolean;

  // Feed Preferences
  feedAlgorithm: 'chronological' | 'recommended' | 'following';
  autoPlayVideos: boolean;
  showSuggestedAccounts: boolean;

  // Notifications
  notificationPreferences: {
    follows: boolean;
    likes: boolean;
    comments: boolean;
    mentions: boolean;
    posts: boolean;
    shares: boolean;
    email: boolean;
    push: boolean;
  };

  // Content Moderation
  blockList: string[]; // Blocked user IDs
  muteList: string[]; // Muted user IDs
  restrictedWords: string[];

  // Timestamps
  updatedAt: Date;
}

// =====================================================
// COLLECTION SETUP & INDEXES
// =====================================================

/**
 * Initialize MongoDB collections with proper indexes
 */
export async function setupMongoCollections(db: Db): Promise<void> {
  console.log('📦 Setting up MongoDB collections...');

  // =====================================================
  // PROFILES COLLECTION
  // =====================================================
  const profilesCollection = db.collection<MongoProfile>('profiles');

  await profilesCollection.createIndexes([
    // Primary lookups
    { key: { clerkUserId: 1 }, unique: true },
    { key: { username: 1 }, unique: true, sparse: true },

    // Search & Discovery
    { key: { displayName: 'text', bio: 'text', skills: 'text', specialties: 'text' } },
    { key: { 'location.coordinates': '2dsphere' }, name: 'location_geo' },

    // Social graph queries
    { key: { 'stats.followersCount': -1 } },
    { key: { createdAt: -1 } },
    { key: { lastActiveAt: -1 } },

    // Skill-based searches
    { key: { skills: 1 } },
    { key: { specialties: 1 } },
    { key: { genres: 1 } },
  ]);

  // =====================================================
  // SOCIAL_FOLLOWS COLLECTION
  // =====================================================
  const followsCollection = db.collection<MongoSocialFollow>('social_follows');

  await followsCollection.createIndexes([
    // Unique active follow (prevent duplicates)
    {
      key: { followerId: 1, followeeId: 1, isActive: 1 },
      unique: true,
      partialFilterExpression: { isActive: true }
    },

    // Queries: Get followers
    { key: { followeeId: 1, isActive: 1, createdAt: -1 } },

    // Queries: Get following
    { key: { followerId: 1, isActive: 1, createdAt: -1 } },

    // Cleanup: Remove old unfollows
    { key: { unfollowedAt: 1 }, expireAfterSeconds: 7776000 }, // 90 days
  ]);

  // =====================================================
  // POSTS COLLECTION
  // =====================================================
  const postsCollection = db.collection<MongoPost>('posts');

  await postsCollection.createIndexes([
    // Primary lookups
    { key: { clerkUserId: 1, createdAt: -1 } },

    // Feed queries: "For You" algorithm
    { key: { score: -1, createdAt: -1 } }, // Engagement-based ranking

    // Feed queries: Following feed
    { key: { clerkUserId: 1, createdAt: -1 } },

    // Discovery: Trending posts
    { key: { 'stats.likesCount': -1, createdAt: -1 } },
    { key: { 'stats.commentsCount': -1, createdAt: -1 } },

    // Hashtag search
    { key: { hashtags: 1 } },

    // Location-based discovery
    { key: { 'location.coordinates': '2dsphere' }, name: 'posts_location' },

    // Replies & quotes
    { key: { repliedToPostId: 1 } },
    { key: { quotedPostId: 1 } },

    // Moderation
    { key: { moderationStatus: 1, isReported: -1 } },

    // Cleanup
    { key: { updatedAt: 1 }, expireAfterSeconds: 31536000 }, // 1 year for deleted posts
  ]);

  // =====================================================
  // COMMENTS COLLECTION
  // =====================================================
  const commentsCollection = db.collection<MongoComment>('comments');

  await commentsCollection.createIndexes([
    // Get comments for a post
    { key: { postId: 1, createdAt: 1 } },

    // Get replies to a comment
    { key: { parentCommentId: 1, createdAt: 1 } },

    // Get user's comments
    { key: { clerkUserId: 1, createdAt: -1 } },

    // Cleanup
    { key: { isDeleted: 1, updatedAt: 1 }, expireAfterSeconds: 7776000 }, // 90 days
  ]);

  // =====================================================
  // REACTIONS COLLECTION
  // =====================================================
  const reactionsCollection = db.collection<MongoReaction>('reactions');

  await reactionsCollection.createIndexes([
    // Prevent duplicate reactions
    {
      key: { clerkUserId: 1, targetId: 1, targetType: 1, type: 1 },
      unique: true
    },

    // Get reactions for a post/comment
    { key: { targetId: 1, targetType: 1, createdAt: -1 } },

    // Get user's reactions
    { key: { clerkUserId: 1, targetType: 1, createdAt: -1 } },
  ]);

  // =====================================================
  // NOTIFICATIONS COLLECTION
  // =====================================================
  const notificationsCollection = db.collection<MongoNotification>('notifications');

  await notificationsCollection.createIndexes([
    // Get user's notifications (unread first)
    { key: { clerkUserId: 1, isRead: 1, createdAt: -1 } },

    // Cleanup old read notifications
    {
      key: { isRead: 1, createdAt: 1 },
      expireAfterSeconds: 2592000, // 30 days
      partialFilterExpression: { isRead: true }
    },

    // Expiry date
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
  ]);

  // =====================================================
  // SOCIAL_SETTINGS COLLECTION
  // =====================================================
  const settingsCollection = db.collection<MongoSocialSettings>('social_settings');

  await settingsCollection.createIndexes([
    // One settings doc per user
    { key: { clerkUserId: 1 }, unique: true },
  ]);

  console.log('✅ MongoDB collections and indexes created successfully');
}

// =====================================================
// DATA VALIDATION SCHEMAS (Optional - for MongoDB Schema Validation)
// =====================================================

/**
 * JSON Schema validation rules for MongoDB
 * These can be applied using db.createCollection() with validator option
 */
export const MONGO_VALIDATION_SCHEMAS = {
  profiles: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['_id', 'clerkUserId', 'displayName', 'username', 'stats'],
      properties: {
        _id: { bsonType: 'string' },
        clerkUserId: { bsonType: 'string' },
        displayName: { bsonType: 'string', minLength: 1, maxLength: 100 },
        username: { bsonType: 'string', minLength: 3, maxLength: 30, pattern: '^[a-zA-Z0-9_-]+$' },
        bio: { bsonType: 'string', maxLength: 500 },
        skills: { bsonType: 'array', items: { bsonType: 'string' } },
        stats: {
          bsonType: 'object',
          required: ['followersCount', 'followingCount', 'postsCount'],
          properties: {
            followersCount: { bsonType: 'int', minimum: 0 },
            followingCount: { bsonType: 'int', minimum: 0 },
            postsCount: { bsonType: 'int', minimum: 0 },
          }
        }
      }
    }
  },

  posts: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['_id', 'clerkUserId', 'stats', 'visibility', 'createdAt'],
      properties: {
        _id: { bsonType: 'string' },
        clerkUserId: { bsonType: 'string' },
        content: { bsonType: 'string', maxLength: 5000 },
        visibility: { bsonType: 'string', enum: ['public', 'followers', 'private'] },
        stats: {
          bsonType: 'object',
          required: ['likesCount', 'commentsCount'],
          properties: {
            likesCount: { bsonType: 'int', minimum: 0 },
            commentsCount: { bsonType: 'int', minimum: 0 },
          }
        }
      }
    }
  },

  social_follows: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['_id', 'followerId', 'followeeId', 'isActive'],
      properties: {
        _id: { bsonType: 'string' },
        followerId: { bsonType: 'string' },
        followeeId: { bsonType: 'string' },
        isActive: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
      }
    }
  }
};

// Export types for use in other files
export type {
  MongoProfile,
  MongoSocialFollow,
  MongoPost,
  MongoComment,
  MongoReaction,
  MongoNotification,
  MongoSocialSettings
};
