/* eslint-disable */
/**
 * STUB: Generated `api` utility.
 * This file is a placeholder until `npx convex dev` generates the real one.
 * @module
 */

// A recursive Proxy that returns itself for any property access,
// so `api.users.syncUserFromClerk` etc. resolve without errors at runtime.
function makeApiProxy(): any {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === '__esModule' || prop === 'default') return undefined;
        return makeApiProxy();
      },
    }
  );
}

export const api: any = makeApiProxy();
export const internal: any = makeApiProxy();
