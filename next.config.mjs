import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lock file tracing to this repo. Without this, Next 15 infers workspace
  // root from `bun.lock` in the parent dir and may mis-trace assets like
  // /public/uploads/* into the wrong output bundle path.
  outputFileTracingRoot: __dirname,
  experimental: {
    // Inline imported CSS as <style> tags inside the HTML <head> instead
    // of a render-blocking <link rel="stylesheet">. App Router, prod only.
    // Resolves the "render-blocking CSS" Lighthouse warning — the browser
    // can start painting without waiting for the CSS file to download.
    // Tradeoff: HTML size goes up by the inlined CSS size (~50KB here),
    // but the LCP/FCP improvement is worth it because CSS is now part of
    // the same HTTP/2 stream as the HTML and doesn't compete with the
    // image/font fetches on the critical path.
    inlineCss: true,
  },
  // Don't send `X-Powered-By: Next.js` header. Caddy also strips it via
  // `header_down -X-Powered-By` on the portafolio block, but defense in
  // depth: turn it off at the app layer too so a future Caddy change
  // doesn't regress this.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'andresmorales.com.co' },
      { protocol: 'https', hostname: 'i0.wp.com' },
      { protocol: 'https', hostname: 'i1.wp.com' },
      { protocol: 'https', hostname: 'i2.wp.com' },
    ],
    // Cap the variants Next.js generates for srcset. The previous defaults
    // emitted 17 widths (16, 32, 48, ..., 3840) for every image — the
    // browser would never request 3840w for a 1000×1000 source, and the
    // long srcset string bloated the HTML. Trim to the widths that
    // actually ship to real viewports.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Match Lighthouse's "modern formats" recommendation. WebP covers
    // ~95% of browsers in 2026; AVIF is on the way but not universal yet.
    // Safari <16 doesn't support AVIF — Next.js will fall back to WebP
    // automatically when the request's Accept header doesn't include avif.
    formats: ['image/avif', 'image/webp'],
    // Cap optimization time. The default of 60s lets a single bad image
    // hang the request thread. 7s is plenty for any image we'd serve.
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Back-compat: links from the legacy WordPress site (Google, bookmarks,
  // other sites) may still point at /wp-content/uploads/.... Send them
  // to the local /uploads/... path with a 308 (permanent) redirect so
  // search engines update their indexes. Permanent vs temporary matters
  // here: we want crawlers to drop the old URL, not keep checking it.
  async redirects() {
    return [
      {
        source: '/wp-content/uploads/:path*',
        destination: '/uploads/:path*',
        permanent: true,
      },
    ];
  },
  // Force fresh HTML on every request so designers don't fight stale
  // prerenders, and add `Vary: Cookie` so the browser never serves a cached
  // Spanish header to a user whose cookie now says Portuguese (or vice
  // versa). Without `Vary: Cookie` the browser is free to reuse a cached
  // RSC payload after a locale switch, which manifests as the header
  // appearing to "stick" to the previous language until a hard refresh.
  //
  // Important: this used to be a global `:path*` rule, but that nuked
  // the cache of every /_next/static/* asset, /_next/image, and /api
  // route — every visit re-downloaded the entire bundle. The negative
  // lookahead `(?!...)` excludes:
  //   - `/_next/static/*` — hashed JS/CSS bundles (safe forever, see Caddy
  //     overrides for 1-year immutable)
  //   - `/_next/image*`    — optimized images (see Caddy: 1 day cache)
  //   - `/api/*`           — route handlers (no-store is correct here)
  //   - static assets under /uploads, /logo, /og, etc. — files with
  //     content hashes in the URL or content-addressed uploads.
  async headers() {
    return [
      {
        source: '/:path((?!_next/static|_next/image|_next/media|api/|uploads/|favicon|robots\\.txt|sitemap\\.xml|.*\\.png|.*\\.jpg|.*\\.webp|.*\\.svg|.*\\.woff2?).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Vary', value: 'Cookie, Accept-Encoding' },
          // CSP is set by Caddy (andresmorales.com.co vhost). Setting it here
          // too used to send a SECOND Content-Security-Policy header, and
          // browsers enforce the intersection — every page was actually
          // running under the strictest of the two, which is why
          // particles.js (added later) and Plausible were blocked even
          // though Caddy allowed them. Caddy is now the single source of
          // truth for security headers. We keep the cache + Vary rules
          // because those are Next.js-layer concerns (per-route, not edge).
          //
          // Note: googletagmanager / google-analytics references below were
          // removed July 2026 — the site no longer uses GTM/GA4, only Umami
          // (self-hosted) for analytics. Calendar.app is still used for the
          // booking iframe on /contact and stays in Caddy's frame-src.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  // Next 16 defaults Turbopack; webpack hook removed. The previous
  // webpack hook did two things — strip Next's `polyfill-module`
  // (Baseline ES2019+ shims for trimStart/flat/Object.fromEntries etc.)
  // and the `next-devtools` panel. Turbopack's browser targets match
  // our browserslist, so polyfill-module isn't shipped in the first
  // place, and Next 16 drops next-devtools from production bundles
  // automatically. Empty `turbopack: {}` opts in explicitly.
  turbopack: {},
};

export default nextConfig;
