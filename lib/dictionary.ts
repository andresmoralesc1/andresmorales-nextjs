import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, getDictionary, type Locale, type Dictionary } from './i18n';

/**
 * Server-component helper: resolves the current locale from the request.
 *
 * Resolution priority:
 *   1. `x-locale` request header (set by `middleware.ts` based on URL
 *      prefix and `NEXT_LOCALE` cookie). Most reliable because it is set
 *      once per request in a single place.
 *   2. `NEXT_LOCALE` cookie (read directly via `cookies()` as a fallback
 *      in case `x-locale` is not propagated — e.g. in some edge / RSC
 *      streaming edge cases).
 *   3. Default locale (`en`).
 */
export async function getCurrentLocale(): Promise<Locale> {
  const h = await headers();
  const fromHeader = h.get('x-locale');
  if (isLocale(fromHeader)) return fromHeader;

  const c = await cookies();
  const fromCookie = c.get('NEXT_LOCALE')?.value;
  if (isLocale(fromCookie)) return fromCookie;

  return DEFAULT_LOCALE;
}

/**
 * Server-component helper: load the dictionary for the current locale.
 * Delegates locale resolution to `getCurrentLocale()`.
 */
export async function getCurrentDictionary(): Promise<Dictionary> {
  const locale = await getCurrentLocale();
  return getDictionary(locale);
}
