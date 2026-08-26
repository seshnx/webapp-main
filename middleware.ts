/**
 * Vercel Edge Middleware — Subdomain Routing
 *
 * Detects studio subdomains (e.g. electric-lady.seshnx.com) and rewrites
 * to the SPA index.html with an x-studio-slug header so the client can
 * render the correct studio profile or dashboard.
 *
 * Main app (app.seshnx.com / seshnx.com) passes through untouched.
 *
 * Uses Vercel Edge Middleware runtime (works with Vite / non-Next projects).
 * Docs: https://vercel.com/docs/functions/edge-middleware
 */

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0]; // strip port

  // ── Dev bypass ──────────────────────────────────────────────
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return new Response(null, { status: 200 }); // passthrough — doesn't block
  }

  // ── Identify main app ───────────────────────────────────────
  const isMainApp =
    hostname === 'seshnx.com' ||
    hostname === 'www.seshnx.com' ||
    hostname === 'app.seshnx.com' ||
    !hostname.includes('seshnx.com');

  if (isMainApp) return new Response(null, { status: 200 });

  // ── Skip system subdomains ──────────────────────────────────
  const slug = hostname.split('.')[0];
  if (['api', 'media', 'admin', 'kiosk', 'www'].includes(slug)) {
    return new Response(null, { status: 200 });
  }

  // ── Rewrite to SPA with slug header ─────────────────────────
  // Vercel interprets the x-middleware-rewrite header as an internal rewrite.
  const rewriteUrl = new URL('/index.html', url.origin);
  const headers = new Headers();
  headers.set('x-middleware-rewrite', rewriteUrl.href);
  headers.set('x-studio-slug', slug);

  return new Response(null, {
    status: 200,
    headers,
  });
}

export const config = {
  matcher: [
    '/((?!api|assets|_next|favicon\\.ico|manifest|registerSW|sw|.*\\.map).*)',
  ],
};
