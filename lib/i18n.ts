// Stub for future i18n. Not active yet — site stays English-only.
// When ready, replace each English string with `t('footer.copyright')` etc.
// Strategy chosen: JSON messages + lightweight hook (Option B from the plan).
//
// Why this stub exists now:
//   - Establishes the file location and helper signature so contributors
//     know where to wire strings when i18n lands.
//   - The `t()` function is a no-op identity for English today; flipping
//     to bilingual later means adding locale detection + active dictionary
//     without touching call sites again.

export type Locale = 'en' | 'es';

export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'es'];

// Stub: returns the key as-is. Real implementation will look up active dictionary.
export function t(key: string, _vars?: Record<string, string | number>): string {
  return key;
}

// Stub: returns the default locale. Real implementation will read cookie / URL.
export function getActiveLocale(): Locale {
  return DEFAULT_LOCALE;
}

// Future: messages/en.json + messages/es.json
//   { "footer": { "copyright": "© {year} Andrés Morales", ... } }
//
// Wiring example (in a component):
//   import { t } from '@/lib/i18n';
//   <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
