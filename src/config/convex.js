import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.warn('⚠️ Convex URL not found. Chat functionality will be disabled.');
  console.warn('   Set VITE_CONVEX_URL in Vercel environment variables.');
}

export const convex = convexUrl 
  ? new ConvexReactClient(convexUrl)
  : null;

// Helper to check if Convex is available
export const isConvexAvailable = () => {
  return convex !== null;
};

