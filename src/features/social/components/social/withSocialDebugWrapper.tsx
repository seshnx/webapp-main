/**
 * Debug Wrapper for Social Components
 * 
 * Wraps existing social components with debugging capabilities without modifying their internals
 */

import React, { useEffect, useRef, useState } from 'react';
import { Bug, AlertCircle } from 'lucide-react';
import { 
  debugLog, 
  logError, 
  startPerformanceTracking, 
  endPerformanceTracking,
  getDebugStats 
} from '@/utils/socialDebug';

interface WithSocialDebugWrapperProps {
  children: React.ReactElement;
  componentName?: string;
  showDebugInfo?: boolean;
  trackRenders?: boolean;
  trackUpdateTime?: number; // Warn if component updates more frequently than this (ms)
}

interface DebugState {
  renderCount: number;
  mountTime: number;
  lastUpdateTime: number;
  updateTimes: number[];
  errors: Array<{ time: number; error: any }>;
}

export function WithSocialDebugWrapper({
  children,
  componentName = 'Component',
  showDebugInfo = false,
  trackRenders = true,
  trackUpdateTime = 100
}: WithSocialDebugWrapperProps) {
  const [debugState, setDebugState] = useState<DebugState>({
    renderCount: 0,
    mountTime: performance.now(),
    lastUpdateTime: performance.now(),
    updateTimes: [],
    errors: []
  });

  const updateTimerRef = useRef<number>();
  const renderCountRef = useRef(0);

  useEffect(() => {
    const mountId = startPerformanceTracking(`${componentName}_mount`);
    debugLog('MOUNT', `${componentName} mounted`);

    return () => {
      const duration = endPerformanceTracking(mountId);
      debugLog('MOUNT', `${componentName} unmounted`, { 
        duration: `${duration.toFixed(2)}ms`,
        totalRenders: renderCountRef.current
      });
    };
  }, [componentName]);

  useEffect(() => {
    if (!trackRenders) return;

    renderCountRef.current++;
    const now = performance.now();
    const timeSinceLastUpdate = now - debugState.lastUpdateTime;
    const totalTime = now - debugState.mountTime;

    // Track rapid updates
    const newUpdateTimes = [...debugState.updateTimes, now];
    
    // Check for update spam (more than 10 updates in 1 second)
    const recentUpdates = newUpdateTimes.filter(t => now - t < 1000);
    if (recentUpdates.length > 10) {
      console.warn(`⚠️ ${componentName} updating too frequently!`, {
        updatesInLastSecond: recentUpdates.length,
        totalRenders: renderCountRef.current,
        avgTimeBetweenUpdates: `${(1000 / recentUpdates.length).toFixed(2)}ms`
      });
    }

    setDebugState(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastUpdateTime: now,
      updateTimes: newUpdateTimes.slice(-20) // Keep last 20 updates
    }));
  });

  // Clone child component and add debug props
  const debuggedChild = React.cloneElement(children, {
    ...children.props,
    _debug: {
      log: (message: string, data?: any) => debugLog(componentName, message, data),
      error: (error: any) => {
        logError(error, componentName);
        setDebugState(prev => ({
          ...prev,
          errors: [...prev.errors, { time: performance.now(), error }]
        }));
      },
      track: (name: string) => startPerformanceTracking(`${componentName}_${name}`)
    }
  });

  const debugInfo = (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded p-2 mb-2 text-xs">
      <div className="flex items-center justify-between mb-1">
        <strong className="flex items-center gap-1">
          <Bug size={12} />
          {componentName} Debug
        </strong>
        <span className="text-gray-500">
          {debugState.renderCount} renders
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-gray-600 dark:text-gray-400">
        <div>Mount: {(debugState.mountTime).toFixed(0)}ms</div>
        <div>Last update: {((performance.now() - debugState.lastUpdateTime)).toFixed(0)}ms ago</div>
        <div>Total time: {((performance.now() - debugState.mountTime) / 1000).toFixed(2)}s</div>
        <div>Errors: {debugState.errors.length}</div>
      </div>
      {debugState.errors.length > 0 && (
        <div className="mt-1 text-red-600">
          <AlertCircle size={12} className="inline mr-1" />
          {debugState.errors.length} errors
        </div>
      )}
    </div>
  );

  return (
    <div className="social-debug-wrapper">
      {showDebugInfo && debugInfo}
      {debuggedChild}
    </div>
  );
}

/**
 * Simple render tracker - just logs renders without UI
 */
export function withRenderTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  return function RenderTrackedComponent(props: P) {
    const renderCount = useRef(0);
    const mountTime = useRef(performance.now());

    useEffect(() => {
      renderCount.current++;
      
      // Warn on excessive renders
      if (renderCount.current > 100) {
        console.warn(`⚠️ ${name} has rendered ${renderCount.current} times`, {
          mountTime: ((performance.now() - mountTime.current) / 1000).toFixed(2) + 's'
        });
      }
    });

    useEffect(() => {
      debugLog('MOUNT', `${name} mounted`);
      return () => {
        const duration = performance.now() - mountTime.current;
        debugLog('MOUNT', `${name} unmounted`, {
          duration: `${duration.toFixed(2)}ms`,
          totalRenders: renderCount.current
        });
      };
    }, [name]);

    return <WrappedComponent {...props} />;
  };
}

import { useRef } from 'react';
