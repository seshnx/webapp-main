import React from 'react';
import ErrorBoundary from '../components/shared/ErrorBoundary';

/**
 * RouteWrapper - Wraps route components to ensure proper isolation
 * This ensures each route component is completely isolated from others
 * and helps prevent hook count mismatches
 */
export default function RouteWrapper({ name, children }) {
  return (
    <ErrorBoundary name={name}>
      {children}
    </ErrorBoundary>
  );
}

