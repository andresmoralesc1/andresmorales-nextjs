/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
