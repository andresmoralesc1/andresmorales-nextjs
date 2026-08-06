'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent, ReactNode } from 'react';
import { track } from '@/lib/analytics';

// <TrackLink> — drop-in <a> / Next <Link> replacement that auto-fires
// a tracking event (default: `nav_link_clicked`) on click. Wraps both
// internal (`next/link`) and external (plain `<a>`) links.
//
// Usage:
//   <TrackLink href="/brief" event="cta_clicked" label="header-cta">Start a project</TrackLink>
//   <TrackLink href="https://linkedin.com/..." event="nav_link_clicked">LinkedIn</TrackLink>
//
// Implementation notes:
//   - We fire `track()` synchronously on click. Plausible's deferred
//     script buffers the call until it loads, so it's safe even when
//     the script hasn't loaded yet.
//   - The `data-track` and `data-track-label` attributes are kept so a
//     future debugger extension can locate tracked elements without
//     code-search.
//   - All extra `<a>` props (including `onClick`) are forwarded to the
//     underlying element so callers can attach additional handlers.

type TrackEvent =
  | 'nav_link_clicked'
  | 'cta_clicked'
  | 'service_card_clicked'
  | 'portfolio_project_clicked'
  | 'blog_post_clicked'
  | 'blog_external_link_clicked'
  | 'locale_switched';

type AnchorProps = Omit<ComponentProps<'a'>, 'href' | 'children'>;

type TrackLinkProps = AnchorProps & {
  href: string;
  event?: TrackEvent;
  /** Stable identifier you can filter on in Plausible. */
  label?: string;
  /** Optional children. */
  children: ReactNode;
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || href.startsWith('tel:');
}

export function TrackLink({
  href,
  event = 'nav_link_clicked',
  label,
  children,
  onClick,
  ...rest
}: TrackLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Don't double-fire if the user is opening in a new tab/window.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    track(event, { href, label });
    onClick?.(e);
  };

  const dataAttrs = {
    'data-track': event,
    'data-track-label': label,
  };

  if (isExternal(href)) {
    return (
      <a
        {...rest}
        {...dataAttrs}
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link {...rest} {...dataAttrs} href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}

// <TrackCta> — semantic shortcut for the site's primary conversion
// points ("Start a project", "Book a call", etc.). Equivalent to
// <TrackLink event="cta_clicked" /> but typed for the specific event.
type TrackCtaProps = Omit<TrackLinkProps, 'event'>;

export function TrackCta(props: TrackCtaProps) {
  return <TrackLink {...props} event="cta_clicked" />;
}

// <TrackNavLink> — for the header nav. Default event = nav_link_clicked.
export function TrackNavLink(props: TrackLinkProps) {
  return <TrackLink {...props} event="nav_link_clicked" />;
}
