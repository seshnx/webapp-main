/**
 * Development-only hook validator
 * Helps identify components with inconsistent hook calls
 * 
 * Usage: Wrap components with useHookValidator in development
 */

let hookCallCounts = new Map();
let componentStack = [];

export function useHookValidator(componentName) {
  if (import.meta.env.PROD) return; // Only in development
  
  const currentCount = hookCallCounts.get(componentName) || 0;
  const newCount = currentCount + 1;
  hookCallCounts.set(componentName, newCount);
  
  componentStack.push(componentName);
  
  // Log if hook count changes unexpectedly
  if (currentCount > 0 && newCount !== currentCount) {
    console.warn(`[Hook Validator] ${componentName} hook count changed: ${currentCount} -> ${newCount}`, {
      stack: [...componentStack],
      allCounts: Object.fromEntries(hookCallCounts)
    });
  }
  
  return () => {
    componentStack.pop();
  };
}

export function resetHookValidator() {
  hookCallCounts.clear();
  componentStack = [];
}

