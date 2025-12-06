import { ConvexReactClient } from "convex/react";

// Support both VITE_CONVEX_URL and CONVEX_DEPLOY_KEY (Vercel uses CONVEX_DEPLOY_KEY)
const convexUrl = import.meta.env.CONVEX_DEPLOY_KEY || import.meta.env.VITE_CONVEX_URL;

// Always create a client - use a dummy URL if not configured
// This ensures ConvexProvider always has a client, even if Convex isn't configured
// Hooks will work but won't connect until a real URL is provided
const clientUrl = convexUrl || "https://placeholder.convex.cloud";

export const convex = new ConvexReactClient(clientUrl);

// Helper to check if Convex is available (has a real URL)
export const isConvexAvailable = () => {
  return convexUrl !== null && convexUrl !== undefined && convexUrl !== "";
};

