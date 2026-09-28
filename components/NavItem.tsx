'use client';

import { usePathname } from 'next/navigation';
import { TrackLink } from '@/components/track';

// Client component that highlights the active nav item. Lives apart from
// the parent Header (which is server) so that only this leaf needs the
// `usePathname` hook + the 'use client' directive.
//
// Active detection strips any locale prefix from the current pathname
// before comparing against the menu's href. The menu hrefs themselves
// are locale-agnostic (`/services`, not `/es/services`) — Next's `<Link>`
// passes them through, and middleware re-renders the page for that
// locale on the server side without an actual route prefix in the
// underlying URL when the language is the default.
export function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname() || '/';
  const normalized = pathname.replace(/^\/(en|es|pt)(?=\/|$)/, '') || '/';
  const isActive =
    href === '/'
      ? normalized === '/'
      : normalized === href || normalized.startsWith(href + '/');
  return (
    <TrackLink
      href={href}
      event="nav_link_clicked"
      label={`nav-${href === '/' ? 'home' : href.replace(/^\//, '')}`}
      aria-current={isActive ? 'page' : undefined}
      className={`text-sm font-secondary font-bold uppercase tracking-widest link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm ${
        isActive
          ? 'text-secondary border-b-2 border-theme-1 pb-0.5'
          : 'text-secondary hover:text-accent'
      }`}
    >
      {label}
    </TrackLink>
  );
}
