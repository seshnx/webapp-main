/**
 * Higher-Order Component for adding debug tracking to social components
 */

import React, { useEffect, useRef } from 'react';
import { useSocialDebug, debugLog, logError, startPerformanceTracking, endPerformanceTracking } from '@/utils/socialDebug';

interface WithSocialDebugProps {
  componentName?: string;
  enableTracking?: boolean;
  trackMountTime?: boolean;
}

/**
 * HOC that wraps a component with debug tracking
 */
export function withSocialDebug<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithSocialDebugProps = {}
) {
  const { 
    componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component',
    enableTracking = true,
    trackMountTime = true 
  } = options;

  return function WithDebugComponent(props: P) {
    const debug = useSocialDebug(componentName);
    const renderCount = useRef(0);
    const updateCount = useRef(0);

    useEffect(() => {
      renderCount.current++;
      if (enableTracking) {
        debug.log(`Render #${renderCount.current}`);
      }
    });

    useEffect(() => {
      if (trackMountTime && enableTracking) {
        const mountId = startPerformanceTracking(`${componentName}_mount`);
        return () => {
          endPerformanceTracking(mountId);
        };
      }
    }, []);

    const enhancedProps = {
      ...props,
      debug,
      // Pass debug utilities as props if needed
      _debug: {
        log: debug.log,
        error: debug.error,
        track: debug.track,
      }
    } as P & { _debug?: typeof debug };

    return <WrappedComponent {...enhancedProps} />;
  };
}

/**
 * Hook for tracking API calls with debug info
 */
export function useTrackedApiCall() {
  const { log, error } = useSocialDebug('TrackedApiCall');

  return async function trackedCall<T>(
    name: string,
    apiFn: () => Promise<T>
  ): Promise<T> {
    const perfId = startPerformanceTracking(`api_${name}`);
    
    try {
      log(`API Call: ${name}`);
      const result = await apiFn();
      endPerformanceTracking(perfId);
      log(`API Success: ${name}`);
      return result;
    } catch (err) {
      endPerformanceTracking(perfId);
      error(err);
      throw err;
    }
  };
}

/**
 * Hook for tracking component updates
 */
export function useUpdateTracker(componentName: string) {
  const updateCount = useRef(0);
  const debug = useSocialDebug(componentName);

  useEffect(() => {
    updateCount.current++;
    debug.log(`Update #${updateCount.current}`);
  });
}

/**
 * Hook for tracking user interactions
 */
export function useInteractionTracker(componentName: string) {
  const debug = useSocialDebug(componentName);

  return {
    trackClick: (action: string, data?: any) => {
      debug.log(`Click: ${action}`, data);
    },
    trackInput: (field: string, value: any) => {
      debug.log(`Input: ${field}`, { value, type: typeof value });
    },
    trackError: (action: string, error: any) => {
      logError(error, `${componentName}.${action}`);
    },
  };
}
