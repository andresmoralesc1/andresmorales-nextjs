import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { HeaderClient } from '@/components/header-client';

/**
 * Header — server boundary. Loads the dictionary + locale for the current
 * request and hands them off to the client `HeaderClient` (which owns the
 * scroll-aware condensation + interactive bits).
 *
 * Reads dictionary + locale via the `x-locale` header set by middleware.
 */
export async function Header() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);
  return <HeaderClient dict={dict} locale={locale} />;
}
