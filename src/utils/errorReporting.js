/**
 * Error Reporting Utility
 * 
 * Centralized error logging and reporting service.
 * Supports:
 * - Sentry (optional, if VITE_SENTRY_DSN is set)
 * - Local storage for debugging
 * - Console logging in development
 */

// Lazy load Sentry to avoid bundling if not used
let Sentry = null;
const initSentry = async () => {
  if (Sentry !== null) return Sentry; // Already initialized or attempted
  
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    Sentry = false; // Mark as not available
    return null;
  }

  try {
    // Dynamic import to avoid bundling Sentry if not configured
    const sentryModule = await import('@sentry/react');
    Sentry = sentryModule;
    
    // Initialize Sentry if not already initialized
    if (!sentryModule.getCurrentHub().getClient()) {
      sentryModule.init({
        dsn,
        environment: import.meta.env.MODE || 'development',
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
        replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0, // Always capture replays on errors
        integrations: [
          new sentryModule.BrowserTracing(),
          new sentryModule.Replay(),
        ],
      });
    }
    
    return Sentry;
  } catch (e) {
    console.warn('Failed to initialize Sentry:', e);
    Sentry = false; // Mark as failed
    return null;
  }
};

/**
 * Log an error with context
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional error information
 * @param {Object} context - Additional context (user, component, etc.)
 */
export const logError = (error, errorInfo = {}, context = {}) => {
  const errorData = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    name: error?.name,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...errorInfo,
    context,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('🚨 Error Reported:', errorData);
  }

  // Send to Sentry if available (async, non-blocking)
  initSentry().then(sentry => {
    if (sentry && sentry.captureException) {
      sentry.captureException(error, {
        extra: errorData,
        tags: {
          component: context.component || 'Unknown',
          errorBoundary: context.errorBoundary || 'None',
        },
        contexts: {
          custom: context,
        },
      });
    }
  }).catch(() => {
    // Ignore Sentry errors
  });

  // Store errors locally for debugging (limited to last 10)
  try {
    const storedErrors = JSON.parse(localStorage.getItem('seshnx_errors') || '[]');
    storedErrors.unshift(errorData);
    storedErrors.splice(10); // Keep only last 10 errors
    localStorage.setItem('seshnx_errors', JSON.stringify(storedErrors));
  } catch (e) {
    // Ignore localStorage errors
  }

  return errorData;
};

/**
 * Report a non-error event (warnings, info)
 * @param {string} message - The message to report
 * @param {string} level - 'warning' | 'info' | 'error'
 * @param {Object} context - Additional context
 */
export const reportEvent = (message, level = 'info', context = {}) => {
  const eventData = {
    message,
    level,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    context,
  };

  if (import.meta.env.DEV) {
    console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](
      `📊 Event [${level}]:`,
      eventData
    );
  }

  // Send to Sentry if available (async, non-blocking)
  initSentry().then(sentry => {
    if (sentry && sentry.captureMessage) {
      sentry.captureMessage(message, {
        level: level === 'error' ? 'error' : level === 'warning' ? 'warning' : 'info',
        extra: eventData,
      });
    }
  }).catch(() => {
    // Ignore Sentry errors
  });

  return eventData;
};

/**
 * Get stored errors (for debugging)
 * @returns {Array} Array of stored errors
 */
export const getStoredErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('seshnx_errors') || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Clear stored errors
 */
export const clearStoredErrors = () => {
  try {
    localStorage.removeItem('seshnx_errors');
  } catch (e) {
    // Ignore
  }
};

