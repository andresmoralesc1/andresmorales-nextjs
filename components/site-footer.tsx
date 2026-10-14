import TicketStubFooter, {
  type StubLink,
  type StubLinkGroup,
} from '@/components/ui/ticket-stub-footer';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { getLocalizedPath } from '@/lib/i18n';

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Map a section/footer label to its localized route. Strings we don't
// recognize render as plain text (no href) so the user gets feedback
// that the link is decorative rather than broken.
const LABEL_TO_ROUTE: Record<string, string> = {
  // Sections (vertical sidebar match for nav)
  overview: '/',
  'vision general': '/',
  'visión general': '/',
  resumen: '/',
  services: '/services',
  servicios: '/services',
  serviços: '/services',
  servicos: '/services',
  portfolio: '/portfolio',
  portafolio: '/portfolio',
  portfólio: '/portfolio',
  portflio: '/portfolio',
  process: '/process',
  proceso: '/process',
  processo: '/process',
  about: '/about',
  'sobre mí': '/about',
  'sobre mi': '/about',
  sobre: '/about',
  brief: '/brief',
  contact: '/contact',
  contacto: '/contact',
  contato: '/contact',

  // Footer link columns — Services
  'ai automation': '/services/ai-automation',
  'automatización ia': '/services/ai-automation',
  'automatizacion ia': '/services/ai-automation',
  'automação ia': '/services/ai-automation',
  'automacao ia': '/services/ai-automation',
  'ui/ux design': '/services/ui-ux-design',
  'diseño ui/ux': '/services/ui-ux-design',
  'diseno ui/ux': '/services/ui-ux-design',
  'design ui/ux': '/services/ui-ux-design',
  'ai-powered web': '/services/web-development',
  'web con ia': '/services/web-development',
  'web com ia': '/services/web-development',
  production: '/work',
  producción: '/work',
  produccion: '/work',
  produção: '/work',
  producao: '/work',

  // Flagship proposals & live demos
  sneakers: '/sneakers',
  sneaker: '/sneakers',
  tênis: '/sneakers',
  tenis: '/sneakers',
  'e-commerce sneakers': '/sneakers',
  'sneaker e-commerce': '/sneakers',
  'e-commerce tênis': '/sneakers',
  'e-commerce tenis': '/sneakers',

  joyerías: '/joyerias',
  joyerias: '/joyerias',
  joyería: '/joyerias',
  joyeria: '/joyerias',
  jewelry: '/joyerias',
  joalheria: '/joyerias',
  'e-commerce joyerías': '/joyerias',
  'e-commerce joyerias': '/joyerias',
  'e-commerce joyería': '/joyerias',
  'e-commerce joyeria': '/joyerias',
  'luxury jewelry e-commerce': '/joyerias',
  'luxury jewelry': '/joyerias',
  'jewelry e-commerce': '/joyerias',
  'e-commerce joalheria': '/joyerias',

  'brief web': '/brief-web',
  'web brief': '/brief-web',
  'brief web interactivo': '/brief-web',
  'interactive web brief': '/brief-web',
  'brief web interativo': '/brief-web',

  // Resources column links
  blog: '/blog',
  guides: '/guide/ai-automation-latam-2026',
  guías: '/guide/ai-automation-latam-2026',
  guias: '/guide/ai-automation-latam-2026',
  compare: '/vs/make-vs-n8n',
  comparar: '/vs/make-vs-n8n',
  // FAQ has no dedicated page — render as plain text (no href) by
  // being absent from the map; linkWithHref falls through.
};

// SiteFooter — server component that wraps TicketStubFooter with
// dictionary-driven content and real localized routes for every
// link. Replaces the prior 4-column grid footer. Drop-in replacement
// for <Footer /> in the locale layout.
export async function SiteFooter() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  const t = dict.playground.ticket;

  const linkWithHref = (label: string): StubLink => {
    const rawKey = label.toLowerCase().trim();
    const cleanKey = normalizeKey(label);
    const route = LABEL_TO_ROUTE[cleanKey] || LABEL_TO_ROUTE[rawKey];
    return route ? { label, href: getLocalizedPath(route, locale) } : { label };
  };

  const productLinks: StubLink[] = t.linkGroups.product.links.map(linkWithHref);
  const demoLinks: StubLink[] = (t.linkGroups as unknown as { demos?: { links: string[] } }).demos?.links
    ? (t.linkGroups as unknown as { demos: { links: string[] } }).demos.links.map(linkWithHref)
    : [];
  const companyLinks: StubLink[] = t.linkGroups.resources.links.map(linkWithHref);

  const linkGroups: StubLinkGroup[] = [
    { title: t.linkGroups.product.title, links: productLinks },
    ...((t.linkGroups as unknown as { demos?: { title: string } }).demos
      ? [{ title: (t.linkGroups as unknown as { demos: { title: string } }).demos.title, links: demoLinks }]
      : []),
    { title: t.linkGroups.resources.title, links: companyLinks },
  ];

  return (
    <TicketStubFooter
      brand={t.brand}
      company={t.company}
      year={new Date().getFullYear()}
      eyebrow={t.eyebrow}
      headline={t.headline}
      description={t.description}
      cta={{ label: t.cta, href: getLocalizedPath('/contact', locale) }}
      sections={t.sections.map((label) => linkWithHref(label))}
      linkGroups={linkGroups}
      statusLabels={t.statusLabels as [string, string]}
      statusCaption={t.statusCaption}
      count={t.count}
      countLabel={t.countLabel}
      rate={t.rate}
      blurb={t.blurb}
      legal={[
        { label: t.legal[0] },
        { label: t.legal[1], href: getLocalizedPath('/terms', locale) },
        { label: t.legal[2], href: getLocalizedPath('/privacy', locale) },
      ]}
      background="#F8F5F4"
      ink="#1E1810"
      muted="#575250"
      accent="#f96e03"
      accentDeep="#ff5100"
      accentInk="#1E1810"
    />
  );
}