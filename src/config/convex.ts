import { ConvexReactClient } from "convex/react";

/**
 * Convex Configuration
 *
 * Supports both VITE_CONVEX_URL and CONVEX_DEPLOY_KEY environment variables.
 * CONVEX_DEPLOY_KEY is used by Vercel's Convex integration.
 *
 * If no URL is provided, a placeholder client is created to satisfy ConvexProvider requirements.
 * Hooks will work but won't connect until a real URL is provided.
 */
const convexUrl = import.meta.env.CONVEX_DEPLOY_KEY || import.meta.env.VITE_CONVEX_URL;

// Always create a client - use placeholder URL if not configured
// This ensures ConvexProvider always has a client, even if Convex isn't configured
// The placeholder URL won't connect, but satisfies the URL format requirement
const clientUrl: string = convexUrl && typeof convexUrl === 'string' && convexUrl.trim() !== ''
  ? convexUrl.trim()
  : 'https://placeholder.convex.cloud';

export const convex = new ConvexReactClient(clientUrl);

/**
 * Check if Convex is properly configured with a real URL
 * @returns True if Convex URL is configured (not placeholder)
 */
export const isConvexAvailable = (): boolean => {
  return Boolean(
    convexUrl &&
    typeof convexUrl === 'string' &&
    convexUrl.trim() !== '' &&
    clientUrl !== 'https://placeholder.convex.cloud'
  );
};
