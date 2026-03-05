/**
 * MongoDB Browser Adapter
 *
 * This is a browser-safe stub for the MongoDB Node.js driver.
 * MongoDB is a server-side only package and cannot run in the browser.
 *
 * All MongoDB operations should be:
 * 1. Called from server-side code (API routes, server actions)
 * 2. Or called through a backend API
 *
 * Frontend code should use the API layer, not MongoDB directly.
 */

// Stub MongoDB client for browser compatibility
export class MongoClient {
  constructor() {
    if (typeof window !== 'undefined') {
      console.warn('MongoDB is a server-side only package. Use API routes for database operations.');
    }
  }

  async connect() {
    return null;
  }

  async close() {
    return;
  }

  get db() {
    return null;
  }
}

// Stub Db class
export class Db {
  constructor() {
    if (typeof window !== 'undefined') {
      console.warn('MongoDB is a server-side only package.');
    }
  }

  collection() {
    return null;
  }

  async createCollection() {
    return null;
  }
}

// Export a null MongoClient instance
export const mongoClient = null;
export const mongoDb = null;

// Default export
export default {
  MongoClient,
  Db,
  mongoClient,
  mongoDb,
};
