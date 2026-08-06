import type { MetadataRoute } from 'next';

// Web App Manifest. Lives at /manifest.webmanifest because Next.js doesn't
// (yet) generate /manifest.json for static metadata files. Keep this small —
// `start_url` matters: with `/` instead of `/?utm_source=pwa`, the browser
// launches the user into the canonical URL, which avoids the canonical=/
// redirect handshake on the very first paint.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Andrés Morales — AI Consultant',
    short_name: 'Andrés Morales',
    description:
      'AI Consultant for Business Automation. n8n workflows, AI agents, internal tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F5F4',
    theme_color: '#f96e03',
    icons: [
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}