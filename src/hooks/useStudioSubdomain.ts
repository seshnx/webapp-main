import { useMemo } from 'react';

/**
 * Detects whether the current page is being served from a studio subdomain.
 *
 * How it works:
 * 1. First checks the `x-studio-slug` response header set by Vercel Edge Middleware.
 *    This is the primary mechanism in production.
 * 2. Falls back to parsing `window.location.hostname` for subdomain detection.
 * 3. In local development, always returns `{ isSubdomain: false, slug: null }`
 *    — use `/s/:slug` routes to test studio profiles instead.
 *
 * @returns `{ isSubdomain: boolean, slug: string | null }`
 */
export function useStudioSubdomain(): { isSubdomain: boolean; slug: string | null } {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { isSubdomain: false, slug: null };
    }

    const hostname = window.location.hostname;

    // ── Local dev — no subdomains ──────────────────────────────
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return { isSubdomain: false, slug: null };
    }

    // ── Check for middleware-injected meta tag or header ───────
    // Edge middleware sets x-studio-slug header; we expose it via a meta tag
    // injected by index.html, or fall back to hostname parsing.
    const metaSlug = document.querySelector('meta[name="x-studio-slug"]')?.getAttribute('content');
    if (metaSlug) {
      return { isSubdomain: true, slug: metaSlug };
    }

    // ── Parse hostname ─────────────────────────────────────────
    const parts = hostname.split('.');
    const isSeshnxDomain = hostname.includes('seshnx.com');

    if (!isSeshnxDomain) {
      return { isSubdomain: false, slug: null };
    }

    // Skip main app and system subdomains
    const slug = parts[0];
    const skipList = ['app', 'www', 'api', 'media', 'admin', 'kiosk'];
    if (skipList.includes(slug) || parts.length < 3) {
      // parts.length < 3 means "seshnx.com" or "www.seshnx.com" (no subdomain)
      return { isSubdomain: false, slug: null };
    }

    return { isSubdomain: true, slug };
  }, []);
}
