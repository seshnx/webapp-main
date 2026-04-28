import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';

interface FeatureSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  featureName?: string;
  className?: string;
}

/**
 * FeatureSuspense
 * 
 * A unified wrapper for lazy-loaded feature components that provides:
 * 1. An ErrorBoundary to catch and isolate runtime crashes within the feature.
 * 2. A Suspense boundary with a standardized loading state.
 */
export const FeatureSuspense: React.FC<FeatureSuspenseProps> = ({
  children,
  fallback,
  featureName = 'Feature',
  className = "flex items-center justify-center min-h-[400px]"
}) => {
  const defaultFallback = (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-brand-blue" size={40} />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Loading {featureName}...
        </p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary name={featureName}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default FeatureSuspense;
