/**
 * Sentry Stub
 * 
 * This file provides a stub implementation of Sentry when @sentry/react is not installed.
 * It allows Vite to resolve the import without errors, and the actual errorReporting.js
 * will handle the case where Sentry is not available.
 */

// Marker to identify this as a stub
export const __SENTRY_STUB__ = true;

// Stub functions that do nothing
export const init = () => {};
export const captureException = () => {};
export const captureMessage = () => {};
export const getCurrentHub = () => ({ getClient: () => null });

// Stub classes
export class BrowserTracing {}
export class Replay {}

// Export default object for compatibility
export default {
  __SENTRY_STUB__: true,
  init: () => {},
  captureException: () => {},
  captureMessage: () => {},
  getCurrentHub: () => ({ getClient: () => null }),
  BrowserTracing,
  Replay,
};

