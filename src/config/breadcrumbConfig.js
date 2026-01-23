/**
 * Breadcrumb Navigation Configuration
 *
 * Defines the breadcrumb hierarchy for all routes in the application.
 * Each route maps to an array of breadcrumb items showing the navigation path.
 *
 * @example
 * '/bookings/calendar' → [
 *   { label: 'Dashboard', path: '/dashboard' },
 *   { label: 'Bookings', path: '/bookings' },
 *   { label: 'Calendar' }
 * ]
 */

import { t } from '../contexts/LanguageContext';

/**
 * Base breadcrumb configuration
 * Maps route paths to breadcrumb arrays
 */
export const breadcrumbConfig = {
  // Dashboard
  '/dashboard': [
    { label: 'dashboard', path: '/dashboard' }
  ],

  // Feed
  '/feed': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'feed', path: '/feed' }
  ],
  '/feed/discover': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'feed', path: '/feed' },
    { label: 'discover' }
  ],

  // Messages
  '/messages': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'messages', path: '/messages' }
  ],

  // Bookings
  '/bookings': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'bookings', path: '/bookings' }
  ],
  '/bookings/my-bookings': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'bookings', path: '/bookings' },
    { label: 'myBookings' }
  ],
  '/bookings/calendar': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'bookings', path: '/bookings' },
    { label: 'calendar' }
  ],
  '/bookings/find-talent': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'bookings', path: '/bookings' },
    { label: 'findTalent' }
  ],
  '/bookings/broadcast-list': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'bookings', path: '/bookings' },
    { label: 'broadcastList' }
  ],

  // Marketplace
  '/marketplace': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'marketplace', path: '/marketplace' }
  ],

  // Tech Services
  '/tech': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'techServices', path: '/tech' }
  ],

  // Payments
  '/payments': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'payments', path: '/payments' }
  ],

  // Profile
  '/profile': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'profile', path: '/profile' }
  ],

  // Business Center
  '/business-center': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'businessCenter', path: '/business-center' }
  ],

  // Studio Operations
  '/studio-ops': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'studioOps', path: '/studio-ops' }
  ],

  // Labels
  '/labels': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'labels', path: '/labels' }
  ],
  '/labels/dashboard': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'labels', path: '/labels' },
    { label: 'dashboard' }
  ],
  '/labels/contracts': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'labels', path: '/labels' },
    { label: 'contracts' }
  ],

  // Legal
  '/legal': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'legal', path: '/legal' }
  ],

  // Education Routes
  '/edu-student': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'student', path: '/edu-student' }
  ],
  '/edu-intern': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'intern', path: '/edu-intern' }
  ],
  '/edu-overview': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'eduOverview', path: '/edu-overview' }
  ],
  '/edu-admin': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'eduAdmin', path: '/edu-admin' }
  ],
};

/**
 * Dynamic route patterns
 * Handles routes with parameters like /profile/:userId
 */
export const dynamicBreadcrumbPatterns = {
  // User profile
  '/profile/:userId': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'profile', path: '/profile' },
    { label: 'user', isDynamic: true }
  ],

  // Studio portal
  '/studio/:studioId/portal': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'studioOps', path: '/studio-ops' },
    { label: 'studio', isDynamic: true },
    { label: 'portal' }
  ],

  // Booking details
  '/booking/:bookingId': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'bookings', path: '/bookings' },
    { label: 'booking', isDynamic: true }
  ],

  // Messages conversation
  '/messages/:conversationId': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'messages', path: '/messages' },
    { label: 'conversation', isDynamic: true }
  ],

  // Post details
  '/post/:postId': [
    { label: 'dashboard', path: '/dashboard' },
    { label: 'feed', path: '/feed' },
    { label: 'post', isDynamic: true }
  ],
};

/**
 * Route aliases for backward compatibility
 * Maps old paths to new breadcrumb structures
 */
export const routeAliases = {
  '/': '/dashboard',
  '/home': '/dashboard',
};

/**
 * Get breadcrumbs for a specific path
 *
 * @param {string} pathname - Current URL pathname
 * @param {object} params - URL parameters (for dynamic routes)
 * @returns {Array} Breadcrumb items
 *
 * @example
 * getBreadcrumbsForPath('/bookings/calendar');
 * // Returns: [{ label: 'dashboard', path: '/dashboard' }, ...]
 */
export function getBreadcrumbsForPath(pathname, params = {}) {
  // Check for aliases
  const normalizedPath = routeAliases[pathname] || pathname;

  // Check exact match first
  if (breadcrumbConfig[normalizedPath]) {
    return breadcrumbConfig[normalizedPath];
  }

  // Check dynamic routes
  for (const [pattern, breadcrumbs] of Object.entries(dynamicBreadcrumbPatterns)) {
    const match = matchDynamicRoute(normalizedPath, pattern, params);
    if (match) {
      return breadcrumbs.map(crumb => ({
        ...crumb,
        label: crumb.isDynamic ? getDynamicLabel(crumb.label, match) : crumb.label
      }));
    }
  }

  // Build breadcrumbs from path segments
  return buildBreadcrumbsFromPath(normalizedPath);
}

/**
 * Match a pathname against a dynamic route pattern
 *
 * @param {string} pathname - Current URL pathname
 * @param {string} pattern - Route pattern (e.g., '/profile/:userId')
 * @param {object} params - URL parameters
 * @returns {object|null} Matched parameters or null
 */
function matchDynamicRoute(pathname, pattern, params) {
  const patternSegments = pattern.split('/');
  const pathSegments = pathname.split('/');

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const match = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i];
    const pathSegment = pathSegments[i];

    if (patternSegment.startsWith(':')) {
      const paramName = patternSegment.substring(1);
      match[paramName] = pathSegment;
    } else if (patternSegment !== pathSegment) {
      return null;
    }
  }

  return { ...match, ...params };
}

/**
 * Get dynamic label for breadcrumb item
 *
 * @param {string} labelKey - Label key or template
 * @param {object} params - Route parameters
 * @returns {string} Display label
 */
function getDynamicLabel(labelKey, params) {
  // If it's a parameter value, use it
  if (params[labelKey]) {
    return params[labelKey];
  }

  // Otherwise return the key itself
  return labelKey;
}

/**
 * Build breadcrumbs from path segments (fallback)
 *
 * @param {string} pathname - Current URL pathname
 * @returns {Array} Breadcrumb items
 */
function buildBreadcrumbsFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += '/' + segment;

    // Convert kebab-case to readable format
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    breadcrumbs.push({
      label: label.toLowerCase(),
      path: i === segments.length - 1 ? null : currentPath
    });
  }

  return breadcrumbs;
}

/**
 * Check if a path has a breadcrumb configuration
 *
 * @param {string} pathname - URL pathname to check
 * @returns {boolean} True if breadcrumbs exist for path
 */
export function hasBreadcrumbs(pathname) {
  const normalizedPath = routeAliases[pathname] || pathname;
  return !!breadcrumbConfig[normalizedPath];
}

export default breadcrumbConfig;
