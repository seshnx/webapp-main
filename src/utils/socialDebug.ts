/**
 * Social Components Debug Utility
 */



const DEBUG_SOCIAL = import.meta.env.DEBUG_SOCIAL === 'true' || 
                      typeof window !== 'undefined' && localStorage.getItem('DEBUG_SOCIAL') === 'true';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

const performanceMetrics: PerformanceMetric[] = [];
const errorLog: Array<{ timestamp: Date; error: any; context?: string }> = [];
const apiCalls: Array<{ 
  timestamp: Date; 
  endpoint: string; 
  method: string; 
  duration?: number; 
  success: boolean;
  error?: string;
}> = [];

export function debugLog(category: string, message: string, data?: any) {
  if (!DEBUG_SOCIAL) return;
  const timestamp = new Date().toISOString();
  const prefix = `[Social Debug ${category}]`;
  if (data) {
    console.log(`${prefix} ${timestamp}`, message, data);
  } else {
    console.log(`${prefix} ${timestamp}`, message);
  }
}

export function logError(error: any, context?: string) {
  const timestamp = new Date();
  errorLog.push({ timestamp, error, context });
  console.error(`[Social Error] ${timestamp.toISOString()}`, {
    error: error.message || error,
    context,
    stack: error.stack
  });
}

export function startPerformanceTracking(name: string, metadata?: Record<string, any>): string {
  const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  performanceMetrics.push({
    name,
    startTime: performance.now(),
    metadata
  });
  debugLog('PERF', `Started tracking: ${name}`, { id, metadata });
  return id;
}

export function endPerformanceTracking(id: string): number {
  const metric = performanceMetrics.find(m => m.name.startsWith(id.split('_')[0]));
  if (metric) {
    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    debugLog('PERF', `Ended tracking: ${metric.name}`, {
      duration: `${metric.duration.toFixed(2)}ms`,
      metadata: metric.metadata
    });
    return metric.duration;
  }
  return 0;
}

export function trackApiCall(endpoint: string, method: string, duration?: number, success?: boolean, error?: string) {
  apiCalls.push({
    timestamp: new Date(),
    endpoint,
    method,
    duration,
    success: success !== false,
    error
  });
  debugLog('API', `${method} ${endpoint}`, {
    duration: duration ? `${duration.toFixed(2)}ms` : 'pending',
    success: success !== false,
    error
  });
}

export function getDebugStats() {
  return {
    enabled: DEBUG_SOCIAL,
    performanceMetrics: performanceMetrics.filter(m => m.duration),
    errorLog,
    apiCalls,
    mongoAvailable: false,
    summary: {
      totalErrors: errorLog.length,
      totalApiCalls: apiCalls.length,
      failedApiCalls: apiCalls.filter(c => !c.success).length,
      avgApiDuration: apiCalls
        .filter(c => c.duration)
        .reduce((sum, c) => sum + c.duration!, 0) / (apiCalls.filter(c => c.duration).length || 1)
    }
  };
}

export function printDebugSummary() {
  const stats = getDebugStats();
  console.group('🐛 Social Debug Summary');
  console.log('Debug Mode:', stats.enabled ? 'ON' : 'OFF');
  console.log('MongoDB Available:', stats.mongoAvailable);
  
  console.group('📊 Performance Metrics');
  stats.performanceMetrics.forEach(m => {
    console.log(`${m.name}: ${m.duration?.toFixed(2)}ms`);
  });
  console.groupEnd();
  
  if (stats.errorLog.length > 0) {
    console.group('❌ Errors');
    stats.errorLog.forEach(({ timestamp, error, context }) => {
      console.error(`${timestamp.toISOString()} - ${context || 'Unknown'}:`, error.message);
    });
    console.groupEnd();
  }
  
  console.group('📡 API Calls');
  console.log(`Total: ${stats.summary.totalApiCalls}`);
  console.log(`Failed: ${stats.summary.failedApiCalls}`);
  console.log(`Avg Duration: ${stats.summary.avgApiDuration.toFixed(2)}ms`);
  console.groupEnd();
  
  console.groupEnd();
  return stats;
}

export function clearDebugLogs() {
  performanceMetrics.length = 0;
  errorLog.length = 0;
  apiCalls.length = 0;
  debugLog('SYSTEM', 'Debug logs cleared');
}

export function setDebugMode(enabled: boolean) {
  if (typeof window !== 'undefined') {
    if (enabled) {
      localStorage.setItem('DEBUG_SOCIAL', 'true');
      console.log('🐛 Social debug mode ENABLED');
    } else {
      localStorage.removeItem('DEBUG_SOCIAL');
      console.log('🐛 Social debug mode DISABLED');
    }
  }
}

export function useSocialDebug(componentName: string) {
  const mountTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    debugLog('MOUNT', `Component mounted: ${componentName}`);
    return () => {
      const duration = performance.now() - mountTime.current;
      debugLog('MOUNT', `Component unmounted: ${componentName}`, { 
        duration: `${duration.toFixed(2)}ms` 
      });
    };
  }, [componentName]);
  
  return {
    log: (message: string, data?: any) => debugLog(componentName, message, data),
    error: (error: any) => logError(error, componentName),
    track: (name: string) => startPerformanceTracking(`${componentName}_${name}`),
  };
}

if (typeof window !== 'undefined') {
  (window as any).SocialDebug = {
    getStats: getDebugStats,
    printSummary: printDebugSummary,
    clearLogs: clearDebugLogs,
    setEnabled: setDebugMode,
    isEnabled: () => DEBUG_SOCIAL
  };
  debugLog('SYSTEM', 'Social Debug utilities loaded');
  console.log('💡 Tip: Access debug tools via window.SocialDebug');
}

import React from 'react';
