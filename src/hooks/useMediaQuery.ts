import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive media queries
 *
 * @param query - Media query string (e.g., '(max-width: 1024px)')
 * @returns Whether the media query matches
 *
 * @example
 * function MyComponent() {
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 *   const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 *
 *   return isMobile ? <MobileLayout /> : <DesktopLayout />;
 * }
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Pre-built media query hooks for common breakpoints
 *
 * @example
 * function MyComponent() {
 *   const isMobile = useIsMobile();
 *   const isTablet = useIsTablet();
 *   const isDesktop = useIsDesktop();
 *
 *   if (isMobile) return <MobileView />;
 *   if (isTablet) return <TableView />;
 *   return <DesktopView />;
 * }
 */

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
