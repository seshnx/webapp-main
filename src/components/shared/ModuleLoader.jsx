import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * ModuleLoader - Loading component for lazy-loaded modules
 * 
 * Provides a smooth loading animation while modules are being loaded.
 * Used as fallback in Suspense boundaries.
 */
export default function ModuleLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 fade-in">
      <div className="relative">
        <Loader2 
          className="animate-spin text-brand-blue" 
          size={48}
          strokeWidth={2.5}
        />
        <div className="absolute inset-0 border-4 border-brand-blue/20 rounded-full animate-pulse"></div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
        {message}
      </p>
    </div>
  );
}

