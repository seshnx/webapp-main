/* eslint-disable */
/**
 * Browser-compatible API utility for Convex
 * 
 * This is a browser-safe version of the generated API.
 * The original api.js imports from convex/server which is server-side only.
 * 
 * This file provides the same API structure using browser-safe proxies.
 */

// Create a proxy-based API that matches Convex's API pattern
// This allows useQuery/useMutation to work with API references
function createApiProxy() {
  return new Proxy(() => {}, {
    get(target, prop) {
      if (prop === Symbol.toStringTag) return 'ConvexApi';
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return undefined;
      }
      // Return another proxy for nested API calls
      return createApiProxy();
    },
    apply() {
      // If called as function, return the proxy itself
      return createApiProxy();
    },
  });
}

export const api = createApiProxy();
export const internal = createApiProxy();
export const components = {};

