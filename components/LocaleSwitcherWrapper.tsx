import { LocaleSwitcher, type LocaleSwitcherLabels } from './LocaleSwitcher';
import type { Locale } from '@/lib/i18n';

interface LocaleSwitcherWrapperProps {
  /** Full dictionary from `getCurrentDictionary()` */
  dict: {
    locale: LocaleSwitcherLabels;
  };
  locale: Locale;
  className?: string;
}

/**
 * Server-component wrapper around the client `<LocaleSwitcher />`.
 *
 * Pass the already-resolved dictionary and locale so the client component
 * can stay focused on rendering.
 */
export function LocaleSwitcherWrapper({ dict, locale, className }: LocaleSwitcherWrapperProps) {
  return (
    <LocaleSwitcher
      currentLocale={locale}
      t={dict.locale}
      className={className}
    />
  );
}