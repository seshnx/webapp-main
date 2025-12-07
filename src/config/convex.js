import { ConvexReactClient } from "convex/react";

/**
 * Convex Configuration
 * 
 * Supports both VITE_CONVEX_URL and CONVEX_DEPLOY_KEY environment variables.
 * CONVEX_DEPLOY_KEY is used by Vercel's Convex integration.
 * 
 * If no URL is provided, the client will be created but won't connect.
 * This allows the app to run without Convex, but chat features will be disabled.
 */
const convexUrl = import.meta.env.CONVEX_DEPLOY_KEY || import.meta.env.VITE_CONVEX_URL;

if (!convexUrl && import.meta.env.PROD) {
  console.warn(
    '⚠️ Convex URL not configured. Chat functionality will be disabled.\n' +
    'Set VITE_CONVEX_URL or CONVEX_DEPLOY_KEY environment variable to enable Convex features.'
  );
}

// Create client with provided URL or empty string (Convex will handle gracefully)
export const convex = new ConvexReactClient(convexUrl || '');

/**
 * Check if Convex is properly configured
 * @returns {boolean} True if Convex URL is configured
 */
export const isConvexAvailable = () => {
  return Boolean(convexUrl && convexUrl.trim() !== '');
};

