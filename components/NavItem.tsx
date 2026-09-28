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
export function NavItem({
  href,
  label,
  minBp = 'md',
}: {
  href: string;
  label: string;
  /** Minimum Tailwind breakpoint at which this item is visible.
   *  Defaults to 'md' (768px+). Items set to 'lg' or 'xl' are
   *  hidden on narrower viewports to prevent the desktop nav from
   *  overflowing the max-w-6xl container. */
  minBp?: 'md' | 'lg' | 'xl';
}) {
  const pathname = usePathname() || '/';
  const normalized = pathname.replace(/^\/(en|es|pt)(?=\/|$)/, '') || '/';
  const isActive =
    href === '/'
      ? normalized === '/'
      : normalized === href || normalized.startsWith(href + '/');
  // Active state used to add `border-b-2 + pb-0.5`, which shifted the
  // text 2px upward on every navigation. Now the border is always
  // present (transparent for non-active) — no layout shift.
  const visClass =
    minBp === 'xl' ? 'hidden xl:flex' : minBp === 'lg' ? 'hidden lg:flex' : '';
  return (
    <TrackLink
      href={href}
      event="nav_link_clicked"
      label={`nav-${href === '/' ? 'home' : href.replace(/^\//, '')}`}
      aria-current={isActive ? 'page' : undefined}
      className={`${visClass} items-center border-b-2 text-sm font-secondary font-bold uppercase tracking-widest link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm ${
        isActive
          ? 'text-secondary border-theme-1'
          : 'text-secondary border-transparent hover:text-accent hover:border-theme-1/30'
      }`}
    >
      {label}
    </TrackLink>
  );
}
