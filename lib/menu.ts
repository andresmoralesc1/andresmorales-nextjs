// Menu items. `href` is the locale-agnostic path; the middleware + LocaleSwitcher
// add the `/es/...` or `/pt/...` prefix automatically. The labels come from
// the i18n dictionary (see dictionaries/*.json → `nav.*`), NOT from this file.
export const MENU = [
  { href: '/', labelKey: 'home' as const },
  { href: '/services', labelKey: 'services' as const },
  { href: '/portfolio', labelKey: 'portfolio' as const },
  { href: '/guide/ai-automation-latam-2026', labelKey: 'guide' as const },
  { href: '/process', labelKey: 'process' as const },
  { href: '/about', labelKey: 'about' as const },
  { href: '/vs/make-vs-n8n', labelKey: 'compare' as const },
  { href: '/contact', labelKey: 'contact' as const },
] as const;
