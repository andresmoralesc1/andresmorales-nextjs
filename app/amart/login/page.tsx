import type { Metadata } from 'next';
import AmArtLoginClient from './amart-login-client';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Acceso Curador | Bocetos de Piel — AmArt',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AmArtLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#12100E]" />}>
      <AmArtLoginClient />
    </Suspense>
  );
}
