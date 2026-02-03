/**
 * useBreadcrumbs Hook
 *
 * React hook that provides breadcrumb information for the current route.
 * Uses the current URL pathname to generate breadcrumb items.
 *
 * @example
 * function MyComponent() {
 *   const { breadcrumbs, currentPath, currentLabel } = useBreadcrumbs();
 *
 *   return (
 *     <nav>
 *       {breadcrumbs.map((crumb, index) => (
 *         <span key={index}>
 *           {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : crumb.label}
 *           {index < breadcrumbs.length - 1 && ' > '}
 *         </span>
 *       ))}
 *     </nav>
 *   );
 * }
 */

import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  getBreadcrumbsForPath,
  hasBreadcrumbs,
  type BreadcrumbItem
} from '../config/breadcrumbConfig';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Breadcrumb hook return value
 */
export interface UseBreadcrumbsReturn {
  // Breadcrumb data
  breadcrumbs: BreadcrumbItem[];
  currentPath: string;
  currentLabel: string;
  parentPath: string | null;
  rootPath: string;

  // State checks
  hasConfiguredBreadcrumbs: boolean;
  isRoot: boolean;
  hasParent: boolean;

  // Navigation helpers
  canGoBack: boolean;
  goBackPath: string | null;
}

/**
 * Hook for breadcrumb navigation
 *
 * @returns Breadcrumb data and utilities
 */
export function useBreadcrumbs(): UseBreadcrumbsReturn {
  const location = useLocation();
  const params = useParams();
  const { t } = useLanguage();

  /**
   * Generate breadcrumbs with translated labels
   */
  const breadcrumbs = useMemo(() => {
    const rawBreadcrumbs = getBreadcrumbsForPath(location.pathname, params);

    // Translate labels
    return rawBreadcrumbs.map(crumb => ({
      ...crumb,
      label: t(crumb.label)
    }));
  }, [location.pathname, params, t]);

  /**
   * Current path (last segment of breadcrumbs)
   */
  const currentPath = useMemo(() => {
    return location.pathname;
  }, [location.pathname]);

  /**
   * Current page label (last breadcrumb item)
   */
  const currentLabel = useMemo(() => {
    if (breadcrumbs.length > 0) {
      return breadcrumbs[breadcrumbs.length - 1].label;
    }
    return '';
  }, [breadcrumbs]);

  /**
   * Parent path (second-to-last breadcrumb)
   */
  const parentPath = useMemo(() => {
    if (breadcrumbs.length > 1) {
      const parent = breadcrumbs[breadcrumbs.length - 2];
      return parent.path || null;
    }
    return null;
  }, [breadcrumbs]);

  /**
   * Check if current path has breadcrumb configuration
   */
  const hasConfiguredBreadcrumbs = useMemo(() => {
    return hasBreadcrumbs(location.pathname);
  }, [location.pathname]);

  /**
   * Get root path (typically /dashboard)
   */
  const rootPath = useMemo(() => {
    if (breadcrumbs.length > 0) {
      return breadcrumbs[0].path || '/';
    }
    return '/';
  }, [breadcrumbs]);

  /**
   * Check if at root level
   */
  const isRoot = useMemo(() => {
    return location.pathname === '/' || location.pathname === '/dashboard';
  }, [location.pathname]);

  return {
    // Breadcrumb data
    breadcrumbs,
    currentPath,
    currentLabel,
    parentPath,
    rootPath,

    // State checks
    hasConfiguredBreadcrumbs,
    isRoot,
    hasParent: !!parentPath,

    // Navigation helpers
    canGoBack: breadcrumbs.length > 1,
    goBackPath: parentPath,
  };
}

/**
 * Breadcrumb titles hook return value
 */
export interface UseBreadcrumbTitlesReturn {
  setBreadcrumbTitle: (key: string, title: string) => void;
}

/**
 * Hook for building dynamic breadcrumb titles
 * Useful for loading data to populate dynamic breadcrumbs
 *
 * @example
 * function UserProfile() {
 *   const { userId } = useParams();
 *   const { setBreadcrumbTitle } = useBreadcrumbTitles();
 *   const { user } = useUserProfile(userId);
 *
 *   useEffect(() => {
 *     if (user?.displayName) {
 *       setBreadcrumbTitle('user', user.displayName);
 *     }
 *   }, [user]);
 * }
 */
export function useBreadcrumbTitles(): UseBreadcrumbTitlesReturn {
  // This can be extended to support dynamic title updates
  // For now, it's a placeholder for future enhancement

  const setBreadcrumbTitle = (key: string, title: string): void => {
    // Could use a context or state management to update titles
    console.log(`Set breadcrumb title for ${key}: ${title}`);
  };

  return {
    setBreadcrumbTitle
  };
}

export default useBreadcrumbs;
