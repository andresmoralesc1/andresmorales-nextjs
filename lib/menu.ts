// Menu items. `href` is the locale-agnostic path; the middleware + LocaleSwitcher
// add the `/es/...` or `/pt/...` prefix automatically. The labels come from
// the i18n dictionary (see dictionaries/*.json → `nav.*`), NOT from this file.
//
// `minBp` controls the smallest Tailwind breakpoint at which the item is
// visible in the desktop nav. With 8 items + locale switcher + CTA, the
// desktop nav overflows `max-w-6xl` (1152px) at md (768px) and lg (1024px)
// viewports. Hiding secondary items below xl keeps the primary 3 + 3 + CTA
// compact at md/lg, then everything shows on wide displays. Mobile menu
// drawer always shows ALL items regardless of `minBp`.
export const MENU = [
  { href: '/', labelKey: 'home' as const, minBp: 'md' as const },
  { href: '/services', labelKey: 'services' as const, minBp: 'md' as const },
  { href: '/portfolio', labelKey: 'portfolio' as const, minBp: 'md' as const },
  { href: '/process', labelKey: 'process' as const, minBp: 'lg' as const },
  { href: '/about', labelKey: 'about' as const, minBp: 'lg' as const },
  { href: '/contact', labelKey: 'contact' as const, minBp: 'lg' as const },
  { href: '/guide/ai-automation-latam-2026', labelKey: 'guide' as const, minBp: 'xl' as const },
  { href: '/vs/make-vs-n8n', labelKey: 'compare' as const, minBp: 'xl' as const },
] as const;
