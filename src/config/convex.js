import { ConvexReactClient } from "convex/react";

// Support both VITE_CONVEX_URL and CONVEX_DEPLOY_KEY (Vercel uses CONVEX_DEPLOY_KEY)
const convexUrl = import.meta.env.CONVEX_DEPLOY_KEY || import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.warn('⚠️ Convex URL not found. Chat functionality will be disabled.');
  console.warn('   Set CONVEX_DEPLOY_KEY in Vercel environment variables.');
}

export const convex = convexUrl 
  ? new ConvexReactClient(convexUrl)
  : null;

// Helper to check if Convex is available
export const isConvexAvailable = () => {
  return convex !== null;
};

