/**
 * i18n core module — locale list, helpers, and dictionary loader.
 *
 * Manual dictionary approach (no next-intl). The `Dictionary` type is derived
 * directly from the English JSON so the three locales stay structurally in sync.
 */

export const LOCALES = ['en', 'es', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇨🇴',
  pt: '🇧🇷',
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

export const LOCALE_OG: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_CO',
  pt: 'pt_BR',
};

/**
 * BCP 47 language tag for `<html lang>` and JSON-LD `inLanguage`.
 * Region-less primary subtag is enough for screen-reader / browser font
 * fallback purposes — search engines infer region from `og:locale`.
 */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt',
};

/**
 * Type guard for arbitrary string → Locale.
 * Safe with `null` / `undefined` (returns false) so it can be used on headers.
 */
export function isLocale(s: string | undefined | null): s is Locale {
  if (!s) return false;
  return (LOCALES as readonly string[]).includes(s);
}

export type Dictionary = typeof import('@/dictionaries/en.json');

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
  es: () => import('@/dictionaries/es.json').then((m) => m.default),
  pt: () => import('@/dictionaries/pt.json').then((m) => m.default),
};

/**
 * Load the dictionary for a given locale. Falls back to the default locale
 * if the requested locale is invalid (defensive — middleware usually guarantees
 * a valid value).
 */
export async function getDictionary(locale: Locale | string): Promise<Dictionary> {
  const safe: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return dictionaries[safe]();
}

/**
 * Build the URL path for a target locale, given the current pathname.
 * - Strips any existing locale prefix (`/es/contact` → `/contact`).
 * - Adds the target prefix unless it's the default `en` (no prefix on default).
 */
export function getLocalizedPath(currentPath: string, targetLocale: Locale): string {
  const stripped =
    currentPath.replace(/^\/(en|es|pt)(?=\/|$)/, '') || '/';
  if (targetLocale === DEFAULT_LOCALE) return stripped;
  return `/${targetLocale}${stripped === '/' ? '' : stripped}`;
}