// Admin layout — applies noindex/nofollow + self-canonical to every
// /admin/* route. Defense in depth: the actual gating (redirect to
// login) happens at the page level, but if a stale URL ever leaks
// into Google's index we don't want it surfacing in search results, and
// we don't want Google to inherit the homepage canonical from the
// login page either.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin',
  alternates: {
    canonical: '/admin/login',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
