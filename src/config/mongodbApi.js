/**
 * MongoDB Configuration (JavaScript version for API routes)
 *
 * This is the JavaScript version of mongodb.ts for use in .mjs API routes.
 * Client-side code should use mongodb.ts (TypeScript version).
 */

import { MongoClient } from 'mongodb';
import * as Sentry from '@sentry/react';

// MongoDB connection state - use globalThis to share across module instances in serverless
// In ES modules, each import creates its own scope, so we need a global reference
const getGlobalState = () => {
  if (typeof globalThis !== 'undefined') {
    if (!globalThis.__MONGODB_STATE__) {
      globalThis.__MONGODB_STATE__ = { mongoClient: null, mongoDb: null };
    }
    return globalThis.__MONGODB_STATE__;
  }
  // Fallback for browser/dev
  return { mongoClient: null, mongoDb: null };
};

const getState = () => getGlobalState();

/**
 * Get MongoDB connection string from environment variables
 */
function getMongoConnectionString() {
  // Server-side: use process.env (for API routes)
  if (typeof process !== 'undefined' && process.env?.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  // Fallback to client-side env var
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONGODB_CONNECTION_STRING) {
    return import.meta.env.VITE_MONGODB_CONNECTION_STRING;
  }

  console.warn('MongoDB connection string not found. MongoDB features will be disabled.');
  return '';
}

/**
 * Get MongoDB database name
 */
function getMongoDbName() {
  // Server-side: use process.env
  if (typeof process !== 'undefined' && process.env?.MONGODB_DB_NAME) {
    return process.env.MONGODB_DB_NAME;
  }

  // Client-side: use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MONGODB_DB_NAME) {
    return import.meta.env.VITE_MONGODB_DB_NAME;
  }

  return 'sesh-nx';
}

/**
 * Initialize MongoDB connection
 * Should be called once at application startup
 */
export async function initMongoDB() {
  const connectionString = getMongoConnectionString();

  if (!connectionString) {
    console.warn('MongoDB not configured - flexible features will be disabled');
    return;
  }

  try {
    const state = getState();
    state.mongoClient = new MongoClient(connectionString);
    await state.mongoClient.connect();
    state.mongoDb = state.mongoClient.db(getMongoDbName());

    console.log('✅ MongoDB connected successfully');

    if (typeof Sentry !== 'undefined' && Sentry.captureMessage) {
      Sentry.captureMessage('MongoDB connected', 'info', {
        tags: { database: 'mongodb' }
      });
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);

    if (typeof Sentry !== 'undefined' && Sentry.captureException) {
      Sentry.captureException(error, {
        tags: { database: 'mongodb', operation: 'init' }
      });
    }

    // Don't throw - allow app to run without MongoDB
    const state = getState();
    state.mongoClient = null;
    state.mongoDb = null;
  }
}

/**
 * Get MongoDB database instance
 */
export function getMongoDb() {
  return getState().mongoDb;
}

/**
 * Check if MongoDB is available
 */
export function isMongoDbAvailable() {
  const state = getState();
  return state.mongoDb !== null && state.mongoClient !== null;
}

/**
 * Close MongoDB connection
 * Should be called when app shuts down
 */
export async function closeMongoDB() {
  const state = getState();
  if (state.mongoClient) {
    try {
      await state.mongoClient.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      if (typeof Sentry !== 'undefined' && Sentry.captureException) {
        Sentry.captureException(error, {
          tags: { database: 'mongodb', operation: 'close' }
        });
      }
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

  // Cancellation reasons and refund notes
  CANCELLATION_REASONS: 'cancellation_reasons',

  // SOCIAL FEATURES
  SOCIAL_POSTS: 'social_posts',
  SOCIAL_COMMENTS: 'social_comments',
  SOCIAL_REACTIONS: 'social_reactions',
  SOCIAL_FOLLOWS: 'social_follows',
  SOCIAL_SAVED: 'social_saved',
  SOCIAL_NOTIFICATIONS: 'social_notifications',
};