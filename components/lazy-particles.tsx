"use client";

import dynamic from 'next/dynamic';

// particles.js is ~40 KB of decoration that should NOT be in the LCP
// critical path. This client-side wrapper lets us `dynamic({ ssr: false })`
// it inside an otherwise server-rendered hero. The hero streams its HTML
// immediately; the canvas mounts after hydration completes. On mobile
// the inner component short-circuits to `null`, so this whole bundle
// doesn't run there.
const ParticlesBackground = dynamic(
  () =>
    import('@/components/particles-background').then((m) => m.ParticlesBackground),
  { ssr: false, loading: () => null }
);

export function LazyParticles(props: {
  id: string;
  variant?: 'dark' | 'cream' | 'soft';
}) {
  return <ParticlesBackground {...props} />;
}