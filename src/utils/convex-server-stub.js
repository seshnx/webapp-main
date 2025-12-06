/* eslint-disable */
/**
 * Browser stub for convex/server
 * 
 * This file provides a stub implementation of convex/server exports
 * for browser builds. The real convex/server is server-side only.
 */

// Stub for anyApi - creates a nested proxy structure that matches Convex's API
function createApiStub() {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === Symbol.toStringTag) return 'ConvexApi';
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined;
      }
      return createApiStub();
    },
    has(target, prop) {
      return true;
    }
  });
}

export const anyApi = createApiStub();

export function componentsGeneric() {
  return {};
}

