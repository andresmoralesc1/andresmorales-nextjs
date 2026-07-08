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
};

export default nextConfig;
