/**
 * MongoDB Configuration
 *
 * This file sets up the MongoDB client for flexible, schema-less data storage.
 * MongoDB is used for:
 * - Booking metadata (custom fields per studio type)
 * - Form schemas (dynamic booking forms)
 * - Form responses (customer-submitted data)
 * - Booking notes & attachments
 * - Cancellation reasons & refund notes
 * - SOCIAL FEATURES (posts, comments, reactions, follows, notifications)
 *
 * Core booking data (transactions, payments, audit trail) remains in Neon (PostgreSQL).
 */

import { MongoClient, Db } from 'mongodb';
import * as Sentry from '@sentry/react';

// MongoDB connection state
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

/**
 * Get MongoDB connection string from environment variables
 */
function getMongoConnectionString(): string {
  const connectionString = import.meta.env.VITE_MONGODB_CONNECTION_STRING;

  if (!connectionString) {
    console.warn('MongoDB connection string not found. MongoDB features will be disabled.');
    return '';
  }

  return connectionString;
}

/**
 * Get MongoDB database name
 */
function getMongoDbName(): string {
  return import.meta.env.VITE_MONGODB_DB_NAME || 'seshnx';
}

/**
 * Initialize MongoDB connection
 * Should be called once at application startup
 */
export async function initMongoDB(): Promise<void> {
  const connectionString = getMongoConnectionString();

  if (!connectionString) {
    console.warn('MongoDB not configured - flexible booking features will be disabled');
    return;
  }

  try {
    mongoClient = new MongoClient(connectionString);
    await mongoClient.connect();
    mongoDb = mongoClient.db(getMongoDbName());

    console.log('✅ MongoDB connected successfully');

    Sentry.captureMessage('MongoDB connected', 'info', {
      tags: { database: 'mongodb' }
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    Sentry.captureException(error, {
      tags: { database: 'mongodb', operation: 'init' }
    });

    // Don't throw - allow app to run without MongoDB
    mongoClient = null;
    mongoDb = null;
  }
}

/**
 * Get MongoDB database instance
 */
export function getMongoDb(): Db | null {
  return mongoDb;
}

/**
 * Check if MongoDB is available
 */
export function isMongoDbAvailable(): boolean {
  return mongoDb !== null && mongoClient !== null;
}

/**
 * Close MongoDB connection
 * Should be called when app shuts down
 */
export async function closeMongoDB(): Promise<void> {
  if (mongoClient) {
    try {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      Sentry.captureException(error, {
        tags: { database: 'mongodb', operation: 'close' }
      });
    }
  }
}

/**
 * MongoDB collection names
 */
export const MONGO_COLLECTIONS = {
  // Booking metadata (flexible attributes)
  BOOKING_METADATA: 'booking_metadata',

  // Form schemas (dynamic booking forms)
  FORM_SCHEMAS: 'form_schemas',

  // Form responses (customer submissions)
  FORM_RESPONSES: 'form_responses',

  // Booking notes
  BOOKING_NOTES: 'booking_notes',

  // Booking attachments
  BOOKING_ATTACHMENTS: 'booking_attachments',

  // Booking cancellations (reasons, refund notes)
  BOOKING_CANCELLATIONS: 'booking_cancellations',

  // Form version history
  FORM_VERSIONS: 'form_versions',

  // Form backups
  FORM_BACKUPS: 'form_backups',

  // ========== SOCIAL FEATURES COLLECTIONS ==========

  // Posts (social media posts)
  POSTS: 'posts',

  // Comments (post comments)
  COMMENTS: 'comments',

  // Reactions (likes and emoji reactions)
  REACTIONS: 'reactions',

  // Follows (social relationships)
  FOLLOWS: 'follows',

  // Saved posts (bookmarks)
  SAVED_POSTS: 'saved_posts',

  // Social notifications
  SOCIAL_NOTIFICATIONS: 'social_notifications',

  // User blocks
  USER_BLOCKS: 'user_blocks',

  // Content reports
  CONTENT_REPORTS: 'content_reports',

  // Post metrics/analytics
  POST_METRICS: 'post_metrics',
} as const;

/**
 * Get a MongoDB collection
 */
export function getCollection<T = any>(name: string) {
  if (!mongoDb) {
    throw new Error('MongoDB not initialized. Call initMongoDB() first.');
  }

  return mongoDb.collection<T>(name);
}

/**
 * Ensure MongoDB indexes exist
 * Run this during app initialization
 */
export async function ensureMongoIndexes(): Promise<void> {
  if (!mongoDb) {
    console.warn('MongoDB not available - skipping index creation');
    return;
  }

  try {
    // Booking metadata indexes
    await mongoDb.collection(MONGO_COLLECTIONS.BOOKING_METADATA).createIndex(
      { bookingId: 1 },
      { unique: true }
    );
    await mongoDb.collection(MONGO_COLLECTIONS.BOOKING_METADATA).createIndex(
      { studioId: 1 }
    );

    // Form schemas indexes
    await mongoDb.collection(MONGO_COLLECTIONS.FORM_SCHEMAS).createIndex(
      { studioId: 1, isActive: 1 }
    );
    await mongoDb.collection(MONGO_COLLECTIONS.FORM_SCHEMAS).createIndex(
      { schemaName: 1 }
    );

    // Form responses indexes
    await mongoDb.collection(MONGO_COLLECTIONS.FORM_RESPONSES).createIndex(
      { bookingId: 1 },
      { unique: true }
    );
    await mongoDb.collection(MONGO_COLLECTIONS.FORM_RESPONSES).createIndex(
      { studioId: 1, submittedAt: -1 }
    );

    // Booking notes indexes
    await mongoDb.collection(MONGO_COLLECTIONS.BOOKING_NOTES).createIndex(
      { bookingId: 1, createdAt: -1 }
    );

    // Booking cancellations indexes
    await mongoDb.collection(MONGO_COLLECTIONS.BOOKING_CANCELLATIONS).createIndex(
      { bookingId: 1 }
    );

    // ========== SOCIAL FEATURE INDEXES ==========

    // Posts indexes
    await mongoDb.collection(MONGO_COLLECTIONS.POSTS).createIndex({ id: 1 }, { unique: true });
    await mongoDb.collection(MONGO_COLLECTIONS.POSTS).createIndex({ author_id: 1, created_at: -1 });
    await mongoDb.collection(MONGO_COLLECTIONS.POSTS).createIndex({ hashtags: 1 });
    await mongoDb.collection(MONGO_COLLECTIONS.POSTS).createIndex({ mentions: 1 });
    await mongoDb.collection(MONGO_COLLECTIONS.POSTS).createIndex({ category: 1, created_at: -1 });
    await mongoDb.collection(MONGO_COLLECTIONS.POSTS).createIndex({ parent_id: 1, created_at: -1 });
    await mongoDb.collection(MONGO_COLLECTIONS.POSTS).createIndex({ deleted_at: 1 });

    // Comments indexes
    await mongoDb.collection(MONGO_COLLECTIONS.COMMENTS).createIndex({ post_id: 1, created_at: -1 });
    await mongoDb.collection(MONGO_COLLECTIONS.COMMENTS).createIndex({ parent_id: 1, created_at: -1 });
    await mongoDb.collection(MONGO_COLLECTIONS.COMMENTS).createIndex({ author_id: 1, created_at: -1 });

    // Reactions indexes
    await mongoDb.collection(MONGO_COLLECTIONS.REACTIONS).createIndex(
      { target_id: 1, target_type: 1, emoji: 1, user_id: 1 },
      { unique: true }
    );

    // Follows indexes
    await mongoDb.collection(MONGO_COLLECTIONS.FOLLOWS).createIndex(
      { follower_id: 1, following_id: 1 },
      { unique: true }
    );
    await mongoDb.collection(MONGO_COLLECTIONS.FOLLOWS).createIndex({ following_id: 1, follower_id: 1 });

    // Saved posts indexes
    await mongoDb.collection(MONGO_COLLECTIONS.SAVED_POSTS).createIndex({ user_id: 1, created_at: -1 });
    await mongoDb.collection(MONGO_COLLECTIONS.SAVED_POSTS).createIndex(
      { post_id: 1, user_id: 1 },
      { unique: true }
    );

    // Social notifications indexes
    await mongoDb.collection(MONGO_COLLECTIONS.SOCIAL_NOTIFICATIONS).createIndex(
      { user_id: 1, read: 1, created_at: -1 }
    );
    await mongoDb.collection(MONGO_COLLECTIONS.SOCIAL_NOTIFICATIONS).createIndex({ actor_id: 1, created_at: -1 });

    // User blocks indexes
    await mongoDb.collection(MONGO_COLLECTIONS.USER_BLOCKS).createIndex(
      { blocker_id: 1, blocked_id: 1 },
      { unique: true }
    );
    await mongoDb.collection(MONGO_COLLECTIONS.USER_BLOCKS).createIndex({ blocked_id: 1, blocker_id: 1 });

    // Content reports indexes
    await mongoDb.collection(MONGO_COLLECTIONS.CONTENT_REPORTS).createIndex(
      { target_id: 1, target_type: 1 }
    );
    await mongoDb.collection(MONGO_COLLECTIONS.CONTENT_REPORTS).createIndex({ status: 1, created_at: -1 });

    console.log('✅ MongoDB indexes created successfully');

    Sentry.captureMessage('MongoDB indexes created', 'info', {
      tags: { database: 'mongodb', operation: 'indexes' }
    });
  } catch (error) {
    console.error('❌ Failed to create MongoDB indexes:', error);
    Sentry.captureException(error, {
      tags: { database: 'mongodb', operation: 'indexes' }
    });
  }
}

/**
 * MongoDB collection accessors with type safety
 */
export const mongoCollections = {
  /**
   * Booking metadata collection
   * Stores flexible booking attributes (studio-specific requirements)
   */
  bookingMetadata: () => getCollection('booking_metadata'),

  /**
   * Form schemas collection
   * Stores dynamic booking form definitions
   */
  formSchemas: () => getCollection<any>('form_schemas'),

  /**
   * Form responses collection
   * Stores customer-submitted form data
   */
  formResponses: () => getCollection<any>('form_responses'),

  /**
   * Booking notes collection
   * Stores notes attached to bookings
   */
  bookingNotes: () => getCollection<{
    bookingId: string;
    content: string;
    authorId: string;
    authorName?: string;
    createdAt: Date;
  }>('booking_notes'),

  /**
   * Booking attachments collection
   * Stores file attachments for bookings
   */
  bookingAttachments: () => getCollection('booking_attachments'),

  /**
   * Booking cancellations collection
   * Stores cancellation reasons and refund notes
   */
  bookingCancellations: () => getCollection('booking_cancellations'),

  /**
   * Form versions collection
   * Stores version history for form schemas
   */
  formVersions: () => getCollection('form_versions'),

  /**
   * Form backups collection
   * Stores automated backups of form schemas
   */
  formBackups: () => getCollection('form_backups'),
};
