'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_FLAGS,
  getLocalizedPath,
  type Locale,
} from '@/lib/i18n';
import { track } from '@/lib/analytics';

export interface LocaleSwitcherLabels {
  switchTo: string;
  en: string;
  es: string;
  pt: string;
}

interface LocaleSwitcherProps {
  currentLocale: Locale;
  t: LocaleSwitcherLabels;
  className?: string;
}

const COOKIE_NAME = 'NEXT_LOCALE';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

/**
 * Persist the chosen locale in a cookie so the middleware can read it on
 * subsequent requests — even when the user lands on a non-prefixed URL
 * (e.g. they click "Contact" from `/es/services` and we redirect to
 * `/contact` for the canonical English path, but `getCurrentDictionary()`
 * still needs to know the user wants Spanish).
 *
 * `document.cookie` is safe here: this is a client component, and the
 * cookie is read by middleware on the next request.
 */
function setLocaleCookie(locale: Locale) {
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

/**
 * Inline flag-button locale switcher.
 *
 * Default locale (`en`) is served without a URL prefix; non-default locales
 * get `/es` / `/pt` prefixed to the current path. The chosen locale is also
 * persisted in `NEXT_LOCALE` so the rest of the site keeps using the
 * preferred language when navigating between non-prefixed URLs.
 */
export function LocaleSwitcher({ currentLocale, t, className }: LocaleSwitcherProps) {
  const pathname = usePathname() || '/';

  return (
    <div
      role="group"
      aria-label={t.switchTo}
      className={
        'flex items-center gap-1 text-base leading-none ' + (className ?? '')
      }
    >
      {LOCALES.map((loc) => {
        const href = getLocalizedPath(pathname, loc);
        const isActive = loc === currentLocale;
        const labelKey =
          loc === DEFAULT_LOCALE ? 'en' : loc === 'es' ? 'es' : 'pt';
        return (
          <Link
            key={loc}
            href={href}
            aria-label={t[labelKey]}
            aria-current={isActive ? 'true' : undefined}
            title={t[labelKey]}
            // Setting the cookie before navigation guarantees the next
            // RSC render (which runs in the same SPA transition) sees the
            // updated value via `x-locale`. We persist on every click,
            // including when re-selecting the same locale — that's a
            // no-op in practice and keeps the logic simple.
            onClick={() => {
              setLocaleCookie(loc);
              track('locale_switched', {
                from: currentLocale,
                to: loc,
                path: pathname,
              });
            }}
            className={
              'inline-flex items-center justify-center rounded-md px-1.5 py-1 ' +
              'transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current ' +
              (isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80')
            }
          >
            <span aria-hidden="true">{LOCALE_FLAGS[loc]}</span>
          </Link>
        );
      })}
    </div>
  );
}
