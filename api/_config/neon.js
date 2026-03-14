/**
 * Neon PostgreSQL Configuration for Vercel Serverless Functions
 *
 * This is a Node.js-compatible version of the Neon config for API routes.
 * Client-side code should use src/config/neon.ts instead.
 */

import { neon } from '@neondatabase/serverless';

// Get environment variables (Node.js compatible)
const neonUrl = process.env.VITE_NEON_DATABASE_URL;

if (!neonUrl) {
  console.error(
    '❌ Neon: VITE_NEON_DATABASE_URL is not set in environment variables. ' +
    'Database operations will not work.'
  );
}

/**
 * Neon SQL Client for serverless functions
 */
export const neonClient = neonUrl ? neon(neonUrl) : null;

/**
 * Execute a SQL query
 *
 * @param {string} sql - SQL query with placeholders ($1, $2, etc.)
 * @param {any[]} params - Parameter values
 * @returns {Promise<any[]>} Query results
 */
export async function query(sql, params = []) {
  if (!neonClient) {
    throw new Error('Neon client is not configured. Check VITE_NEON_DATABASE_URL environment variable.');
  }

  try {
    const result = await neonClient(sql, params);
    return result;
  } catch (error) {
    console.error('Neon query error:', error);
    throw error;
  }
}

/**
 * Check if Neon is properly configured
 *
 * @returns {boolean} True if Neon connection string is present
 */
export function isNeonConfigured() {
  return !!neonUrl;
}
