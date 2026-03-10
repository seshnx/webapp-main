import React from 'react';

/**
 * Props for RouteWrapper component
 */
interface RouteWrapperProps {
  /** Name identifier for the route (used for debugging) */
  name?: string;
  /** Child components to render */
  children: React.ReactNode;
}

/**
 * RouteWrapper - Wraps route components to ensure proper isolation
 * This ensures each route component is completely isolated from others
 * and helps prevent hook count mismatches
 *
 * NOTE: Removed ErrorBoundary wrapper as it's a class component and can interfere
 * with React's hook tracking. ErrorBoundary is already at the root level in main.jsx
 */
export default function RouteWrapper({ name, children }: RouteWrapperProps): JSX.Element {
  // Just return children - no wrapper needed
  // The key prop on AppRoutes ensures proper remounting
  return <>{children}</>;
}
