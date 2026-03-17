import { ConvexReactClient } from "convex/react";
import { cleanEnv } from '../utils/env.js';

/**
 * Convex Configuration
 *
 * Supports both VITE_CONVEX_URL and CONVEX_DEPLOY_KEY environment variables.
 * VITE_CONVEX_URL is prioritized for local development and manual configuration.
 * CONVEX_DEPLOY_KEY is used by Vercel's Convex integration.
 *
 * Environment Variables:
 * - VITE_CONVEX_URL: Direct Convex deployment URL (e.g., https://your-deployment.convex.cloud)
 * - CONVEX_DEPLOY_KEY: Deployment key from Vercel Convex integration
 *
 * If no URL is provided, a placeholder client is created to satisfy ConvexProvider requirements.
 * The placeholder URL won't connect, but satisfies the URL format requirement.
 */

// Try to get Convex URL from environment variables (in priority order)
const rawConvexUrl = cleanEnv(import.meta.env.VITE_CONVEX_URL) ||
                     cleanEnv(import.meta.env.CONVEX_DEPLOY_KEY);

// Internal function to validate and get the Convex URL
const getConvexUrlInternal = (): string => {
  // If we have a URL from environment variables, use it
  if (rawConvexUrl && typeof rawConvexUrl === 'string' && rawConvexUrl.trim() !== '') {
    const cleanedUrl = rawConvexUrl.trim();

    // Validate it's not the ignore placeholder
    if (cleanedUrl !== '<ignore_deploy_key>' &&
        cleanedUrl !== 'ignore_deploy_key' &&
        !cleanedUrl.includes('<ignore>')) {
      return cleanedUrl;
    }
  }

  // Fall back to placeholder URL if no valid URL is provided
  // This ensures ConvexProvider always has a client, even if Convex isn't configured
  return 'https://placeholder.convex.cloud';
};

const clientUrl = getConvexUrlInternal();

// Create Convex client
export const convex = new ConvexReactClient(clientUrl);

/**
 * Check if Convex is properly configured with a real URL
 * @returns True if Convex URL is configured (not placeholder)
 */
export const isConvexAvailable = (): boolean => {
  const isRealUrl = clientUrl !== 'https://placeholder.convex.cloud';
  const isValidUrl = clientUrl.startsWith('https://') &&
                     clientUrl.includes('.convex.cloud');

  return isRealUrl && isValidUrl;
};

/**
 * Get the current Convex deployment URL
 * @returns The Convex URL being used (or placeholder if not configured)
 */
export const getConvexUrl = (): string => {
  return clientUrl;
};

/**
 * Get Convex connection status for debugging
 * @returns Object with connection status information
 */
export const getConvexStatus = () => {
  const isAvailable = isConvexAvailable();
  const url = getConvexUrl();

  return {
    isAvailable,
    url: isAvailable ? url : undefined,
    isPlaceholder: url === 'https://placeholder.convex.cloud',
    hasEnvVar: Boolean(rawConvexUrl),
    rawEnvVar: rawConvexUrl,
  };
};

// Log Convex status in development
if (import.meta.env.DEV) {
  const status = getConvexStatus();

  if (status.isAvailable) {
    console.log('✅ Convex connected:', status.url);
  } else if (status.hasEnvVar) {
    console.warn('⚠️ Convex environment variable found but invalid:', status.rawEnvVar);
    console.warn('🔧 Real-time features (chat, presence, notifications) will not work');
  } else {
    console.warn('⚠️ Convex not configured');
    console.warn('🔧 Set VITE_CONVEX_URL environment variable to enable real-time features');
    console.warn('📖 Example: VITE_CONVEX_URL=https://your-deployment.convex.cloud');
  }
}
