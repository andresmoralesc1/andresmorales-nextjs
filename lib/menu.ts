// Menu items. `href` is the locale-agnostic path; the middleware + LocaleSwitcher
// add the `/es/...` or `/pt/...` prefix automatically. The labels come from
// the i18n dictionary (see dictionaries/*.json → `nav.*`), NOT from this file.
export const MENU = [
  { href: '/', labelKey: 'home' as const },
  { href: '/services', labelKey: 'services' as const },
  { href: '/portfolio', labelKey: 'portfolio' as const },
  { href: '/contact', labelKey: 'contact' as const },
] as const;
