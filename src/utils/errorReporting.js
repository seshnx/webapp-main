/**
 * Error Reporting Utility
 * 
 * Centralized error logging and reporting service.
 * Currently logs to console, but can be extended to integrate with:
 * - Sentry
 * - LogRocket
 * - Custom error tracking service
 */

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

  // TODO: Integrate with error reporting service
  // Example: Sentry.captureException(error, { extra: errorData });
  // Example: LogRocket.captureException(error, { extra: errorData });

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

  // TODO: Send to analytics/error tracking service
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

