/**
 * Error Reporting Utility
 *
 * Centralized error logging and reporting service.
 * Supports:
 * - Sentry (optional, requires @sentry/react package and VITE_SENTRY_DSN)
 * - Local storage for debugging
 * - Console logging in development
 */

// Lazy load Sentry to avoid bundling if not used
let Sentry: any | null = null;
let sentryLoadAttempted = false;

interface ErrorInfo {
  [key: string]: any;
}

interface Context {
  component?: string;
  errorBoundary?: string;
  [key: string]: any;
}

interface ErrorData {
  message: string;
  stack?: string;
  name?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  [key: string]: any;
}

interface EventData {
  message: string;
  level: string;
  timestamp: string;
  url: string;
  context: Context;
}

/**
 * Initialize Sentry if available
 */
const initSentry = async (): Promise<any | null> => {
  if (Sentry !== null) return Sentry;
  if (sentryLoadAttempted) return null;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    sentryLoadAttempted = true;
    Sentry = false;
    return null;
  }

  sentryLoadAttempted = true;

  try {
    const sentryModule = await import('@sentry/react');

    Sentry = sentryModule;
    const { init } = sentryModule;

    const hub = sentryModule.getCurrentHub?.();
    if (!hub?.getClient?.()) {
      init({
        dsn,
        environment: import.meta.env.MODE || 'development',
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,
      });
    }

    return Sentry;
  } catch (e: any) {
    if (import.meta.env.DEV) {
      console.debug('Sentry not available:', e.message);
    }
    Sentry = false;
    return null;
  }
};

/**
 * Log an error with context
 */
export const logError = (
  error: Error,
  errorInfo: ErrorInfo = {},
  context: Context = {}
): ErrorData => {
  const errorData: ErrorData = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    name: error?.name,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...errorInfo,
    context,
  };

  if (import.meta.env.DEV) {
    console.error('🚨 Error Reported:', errorData);
  }

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

  try {
    const storedErrors = JSON.parse(localStorage.getItem('seshnx_errors') || '[]');
    storedErrors.unshift(errorData);
    storedErrors.splice(10);
    localStorage.setItem('seshnx_errors', JSON.stringify(storedErrors));
  } catch (e) {
    // Ignore localStorage errors
  }

  return errorData;
};

/**
 * Report a non-error event (warnings, info)
 */
export const reportEvent = (
  message: string,
  level: 'warning' | 'info' | 'error' = 'info',
  context: Context = {}
): EventData => {
  const eventData: EventData = {
    message,
    level,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    context,
  };

  if (import.meta.env.DEV) {
    const logMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
    console[logMethod](`📊 Event [${level}]:`, eventData);
  }

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
 */
export const getStoredErrors = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('seshnx_errors') || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Clear stored errors
 */
export const clearStoredErrors = (): void => {
  try {
    localStorage.removeItem('seshnx_errors');
  } catch (e) {
    // Ignore
  }
};
