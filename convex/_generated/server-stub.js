/* eslint-disable */
/**
 * Browser stub for convex/server
 * 
 * This file provides a stub implementation of convex/server exports
 * for browser builds. The real convex/server is server-side only.
 * 
 * The anyApi is a special runtime value that Convex uses. In the browser,
 * we provide a stub that allows the API structure to exist but will be
 * replaced by the real Convex client at runtime.
 */

// Stub for anyApi - creates a nested proxy structure that matches Convex's API
// This allows the generated API file to work, and the real Convex client
// will provide the actual function references at runtime
function createApiStub() {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === Symbol.toStringTag) return 'ConvexApi';
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        // Prevent the proxy from being treated as a Promise
        return undefined;
      }
      // Return another proxy for nested properties (e.g., api.messages.sendMessage)
      return createApiStub();
    },
    has(target, prop) {
      return true; // Allow any property access
    }
  });
}

export const anyApi = createApiStub();

// Stub for componentsGeneric
export function componentsGeneric() {
  return {};
}
