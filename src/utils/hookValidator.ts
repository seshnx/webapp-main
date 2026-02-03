/**
 * Development-only hook validator
 * Helps identify components with inconsistent hook calls
 */

const hookCallCounts = new Map<string, number>();
const componentStack: string[] = [];

export function useHookValidator(componentName: string): () => void {
  if (import.meta.env.PROD) return () => undefined;

  const currentCount = hookCallCounts.get(componentName) || 0;
  const newCount = currentCount + 1;
  hookCallCounts.set(componentName, newCount);

  componentStack.push(componentName);

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

export function resetHookValidator(): void {
  hookCallCounts.clear();
  componentStack.length = 0;
}
