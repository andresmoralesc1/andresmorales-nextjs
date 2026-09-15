import { pageMetadata } from '@/lib/metadata';
import { wpImage } from '@/lib/theme';
import { YoutubeEmbed } from '@/components/YoutubeEmbed';
import { ParticlesBackground } from '@/components/particles-background';
import { Cta } from '@/components/sections/cta';
import Image from 'next/image';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { Reveal } from '@/components/reveal';
import { JsonLd, breadcrumbSchema } from '@/lib/json-ld';
import type { Metadata } from 'next';




export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  return pageMetadata({
    title: dict.metadata.portfolioTitle,
    description: dict.metadata.portfolioDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/portfolio' : `/${safeLang}/portfolio`,
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Featured Client Work — 9 proyectos en grid (3 cols)
const FEATURED_PROJECTS = [
  {
    key: 'proj1',
    image: '/sites/gps_andresmorales_com_co.png',
    href: 'https://gps.andresmorales.com.co/',
  },
  {
    key: 'proj2',
    image: '/sites/juanbecerra_co.png',
    href: 'https://www.juanbecerra.co/',
  },
  {
    key: 'proj3',
    image: '/sites/dash_andresmorales_com_co_login.png',
    href: 'https://dash.andresmorales.com.co/login',
    access: {
      email: 'admin@kambelleh.com',
      password: 'Kambelleh2026!',
    },
  },
  {
    key: 'proj4',
    image: '/sites/hubiagency_vercel_app.png',
    href: 'https://hubiagency.vercel.app/',
  },
  {
    key: 'proj5',
    image: '/sites/superllantas_co.png',
    href: 'https://superllantas.co/',
  },
  {
    key: 'proj6',
    image: '/sites/soapartesana_vercel_app.png',
    href: 'https://soapartesana.vercel.app/',
  },
  {
    key: 'proj7',
    image: '/sites/carmen-job-search_vercel_app.png',
    href: 'https://carmen-job-search.vercel.app/',
  },
  {
    key: 'proj8',
    image: '/sites/talobot_vercel_app_es.png',
    href: 'https://talobot.vercel.app/es',
  },
  {
    key: 'proj9',
    image: '/sites/toryskateshop_com.png',
    href: 'https://toryskateshop.com/',
  },
];

// More work — additional live projects (Cleida, Temptum, Gato, MECCA)
const MORE_PROJECTS = [
  {
    key: 'proj10',
    image: '/sites/gato_home.png',
    href: 'https://gato.andresmorales.com.co/',
  },
  {
    key: 'proj11',
    image: '/sites/mecca_home.png',
    href: 'https://shop.andresmorales.com.co/',
  },
  {
    key: 'proj12',
    image: '/sites/cleida_home.png',
    href: 'https://cleida.com.co/',
  },
  {
    key: 'proj13',
    image: '/sites/temptum_home.png',
    href: 'https://temptum-ai.vercel.app/',
  },
];

// Smart Automation — 4 cases with correct images (do NOT use Superllantas image)
const AUTOMATION_CASES = ['case1', 'case2', 'case3', 'case4'] as const;

// AI Creative in Action — videos migrated from the legacy WP portfolio.
// Shorts are 9:16 (portrait); landscape videos are 16:9.
const CREATIVE_VIDEOS = [
  { id: 'fRkb3zK9k-o', key: 'vid1', orientation: 'landscape' as const },
  { id: 'mL5cogF4oAw', key: 'vid2', orientation: 'landscape' as const },
  { id: '3_fOS-UILJ8', key: 'vid3', orientation: 'portrait' as const },
  { id: '6fcPRr3VVTc', key: 'vid4', orientation: 'portrait' as const },
  { id: 'ml5SfgmmDbw', key: 'vid5', orientation: 'portrait' as const },
  { id: 'ZfxnA1rrcd4', key: 'vid6', orientation: 'portrait' as const },
];

const SERVICE_CATEGORIES = [
  {
    key: 'cat1',
    images: [
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-112222.png'),
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-122124.png'),
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-122107.png'),
    ],
  },
  {
    key: 'cat3',
    images: [
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-11-205339.png'),
      wpImage('/wp-content/uploads/2023/04/13.png'),
      wpImage('/wp-content/uploads/2023/04/15.png'),
      wpImage('/wp-content/uploads/2023/04/17.png'),
    ],
  },
];

const AUTOMATION_IMAGES: Record<(typeof AUTOMATION_CASES)[number], string> = {
  case1: wpImage('/wp-content/uploads/2025/09/Untitled-design-1.gif'),
  case2: wpImage('/wp-content/uploads/2025/09/Untitled-design.gif'),
  case3: '/uploads/2025/06/pexels-photos-scaled.jpg',
  case4: '/uploads/2025/06/pexels-multi-scaled.jpg',
};

type PortfolioDict = Record<string, string>;

export default async function PortfolioPage() {
  const [dict, lang] = await Promise.all([getCurrentDictionary(), getCurrentLocale()]);
  const p = dict.portfolio as unknown as PortfolioDict;

  // CollectionPage (portfolio) + ItemList of the 9 featured projects +
  // BreadcrumbList. Each project becomes a `ListItem` with a CreativeWork
  // body (provider = the Person entity in the root layout) so Google can
  // surface portfolio work as a structured list in branded searches.
  const portfolioUrl = `https://andresmorales.com.co${lang === 'en' ? '' : `/${lang}`}/portfolio`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dict.metadata.portfolioTitle,
    description: dict.metadata.portfolioDescription,
    url: portfolioUrl,
    inLanguage: lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
    publisher: { '@id': 'https://andresmorales.com.co/#person' },
    isPartOf: { '@id': 'https://andresmorales.com.co/#website' },
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: p.featuredTitle,
    description: p.featuredSubtitle,
    numberOfItems: FEATURED_PROJECTS.length,
    itemListElement: FEATURED_PROJECTS.map((proj, idx) => {
      const title = p[`${proj.key}Title`] || proj.key;
      const desc = p[`${proj.key}Desc`] || '';
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: title,
        description: desc,
        url: proj.href,
        item: {
          '@type': 'CreativeWork',
          name: title,
          description: desc,
          url: proj.href,
          creator: { '@id': 'https://andresmorales.com.co/#person' },
          provider: { '@id': 'https://andresmorales.com.co/#person' },
        },
      };
    }),
  };

  // Second ItemList — More work (additional live projects not in featured)
  const moreItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: p.moreTitle,
    description: p.moreSubtitle,
    numberOfItems: MORE_PROJECTS.length,
    itemListElement: MORE_PROJECTS.map((proj, idx) => {
      const title = p[`${proj.key}Title`] || proj.key;
      const desc = p[`${proj.key}Desc`] || '';
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: title,
        description: desc,
        url: proj.href,
        item: {
          '@type': 'CreativeWork',
          name: title,
          description: desc,
          url: proj.href,
          creator: { '@id': 'https://andresmorales.com.co/#person' },
          provider: { '@id': 'https://andresmorales.com.co/#person' },
        },
      };
    }),
  };

  const breadcrumbs = breadcrumbSchema([
    {
      name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home',
      path: lang === 'en' ? '/' : `/${lang}`,
    },
    { name: dict.metadata.portfolioTitle, path: lang === 'en' ? '/portfolio' : `/${lang}/portfolio` },
  ]);

  return (
    <>
      <JsonLd data={[collectionSchema, itemList, moreItemList, breadcrumbs]} />
      {/* Hero — pitch + dual CTA. Cream background, white text (inverted
          from the white/cream-foreground pattern used by the home hero). */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-portfolio" variant="soft" />
        <div className="container-page text-center max-w-3xl relative z-10">
          <p className="text-xs uppercase tracking-widest text-black mb-3 font-secondary font-bold">
            {p.heroEyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-black">
            {dict.metadata.portfolioH1}
          </h1>
          <p className="text-black text-lg md:text-xl mb-8">
            {p.heroSubtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://calendar.app.google/W8BViMH3wNwoP7ZD9"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme-1 hover:bg-theme-2 text-secondary font-secondary font-bold rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              {p.heroCta1}
              <span aria-hidden>→</span>
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary font-secondary font-bold rounded-lg transition-all"
            >
              {p.heroCta2}
            </a>
          </div>
        </div>
      </section>

      {/* Featured Client Work — grid con screenshots reales */}
      <section className="section bg-theme-5">
        <Reveal stagger className="container-page">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
              {p.featuredEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.featuredTitle}
            </h2>
            <p className="text-text">
              {p.featuredSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {FEATURED_PROJECTS.map((proj) => {
              const title = p[`${proj.key}Title`];
              const subtitle = p[`${proj.key}Subtitle`];
              const metric = p[`${proj.key}Metric`];
              const desc = p[`${proj.key}Desc`];
              return (
                <a
                  key={proj.key}
                  href={proj.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block bg-primary rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-theme-9">
                    <Image
                      src={proj.image}
                      alt={title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold px-2.5 py-1 rounded-full bg-theme-1 shadow-md">
                      {p.cardBadgeLive}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="inline-block text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold mb-2">
                      {subtitle}
                    </span>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 text-secondary">
                      {title}
                    </h3>
                    <p className="text-sm text-text leading-relaxed mb-3">
                      {desc}
                    </p>
                    {proj.access && (
                      <div className="border-t border-theme-8 mt-3 pt-3 space-y-2">
                        <div className="text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold">
                          {p.cardDemoCreds}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-secondary font-bold text-text/80 uppercase tracking-wider w-14">
                            {p.cardEmail}
                          </span>
                          <code className="font-mono text-secondary bg-theme-8/40 px-2 py-1 rounded flex-1 break-all">
                            {proj.access.email}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-secondary font-bold text-text/80 uppercase tracking-wider w-14">
                            {p.cardPass}
                          </span>
                          <code className="font-mono text-secondary bg-theme-8/40 px-2 py-1 rounded flex-1 break-all">
                            {proj.access.password}
                          </code>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-secondary font-bold text-secondary uppercase tracking-wider">
                        {metric}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-secondary font-bold text-secondary group-hover:text-accent opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                        {p.cardVisitLive}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* More work — additional live projects (Cleida, Temptum, Gato, MECCA) */}
      <section className="section bg-primary">
        <Reveal stagger className="container-page">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
              {p.moreEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.moreTitle}
            </h2>
            <p className="text-text">
              {p.moreSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-5xl mx-auto">
            {MORE_PROJECTS.map((proj) => {
              const title = p[`${proj.key}Title`];
              const subtitle = p[`${proj.key}Subtitle`];
              const metric = p[`${proj.key}Metric`];
              const desc = p[`${proj.key}Desc`];
              return (
                <a
                  key={proj.key}
                  href={proj.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block bg-primary rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-theme-9">
                    <Image
                      src={proj.image}
                      alt={title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold px-2.5 py-1 rounded-full bg-theme-1 shadow-md">
                      {p.cardBadgeLive}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="inline-block text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold mb-2">
                      {subtitle}
                    </span>
                    <h3 className="font-heading text-xl md:text-2xl mb-2 text-secondary">
                      {title}
                    </h3>
                    <p className="text-sm text-text leading-relaxed mb-3">
                      {desc}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-secondary font-bold text-secondary uppercase tracking-wider">
                        {metric}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-secondary font-bold text-secondary group-hover:text-accent opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                        {p.cardVisitLive}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* Smart Automation in Action — 2x2 grid */}
      <section className="section bg-primary">
        <Reveal stagger className="container-page">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
              {p.autoEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.autoTitle}
            </h2>
            <p className="text-text max-w-2xl mx-auto">
              {p.autoSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {AUTOMATION_CASES.map((key, idx) => {
              const title = p[`${key}Title`];
              const subtitle = p[`${key}Subtitle`];
              const metric = p[`${key}Metric`];
              const desc = p[`${key}Desc`];
              const badge = p[`${key}Badge`];
              return (
                <article
                  key={key}
                  className="bg-background rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-video bg-theme-9 overflow-hidden">
                    <Image
                      src={AUTOMATION_IMAGES[key]}
                      alt={title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold px-2.5 py-1 rounded-full bg-theme-1 shadow-md">
                      {badge}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-secondary font-bold text-secondary uppercase tracking-wider">
                        {p.autoCasePrefix.replace('{n}', String(idx + 1).padStart(2, '0'))}
                      </span>
                      <span className="text-xs text-text">·</span>
                      <span className="text-xs text-text">{subtitle}</span>
                    </div>
                    <h3 className="font-heading text-xl md:text-2xl mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-text leading-relaxed mb-3">
                      {desc}
                    </p>
                    <div className="text-sm font-secondary font-bold text-secondary">
                      {metric}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* AI Creative in Action — videos migrated from the legacy WP portfolio */}
      <section className="section bg-theme-5">
        <Reveal stagger className="container-page">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
              {p.creativeEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.creativeTitle}
            </h2>
            <p className="text-text">
              {p.creativeSubtitle}
            </p>
          </div>

          {/* Landscape videos — full-width 16:9 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {CREATIVE_VIDEOS.filter((v) => v.orientation === 'landscape').map(
              (v) => {
                const title = p[`${v.key}Title`];
                const caption = p[`${v.key}Caption`];
                return (
                  <div key={v.id}>
                    <YoutubeEmbed
                      id={v.id}
                      title={title}
                      orientation="landscape"
                    />
                    <div className="mt-3">
                      <h3 className="font-heading text-lg md:text-xl mb-1">
                        {title}
                      </h3>
                      <p className="text-sm text-text">{caption}</p>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {/* Portrait / Shorts — 9:16 grid centered */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {CREATIVE_VIDEOS.filter((v) => v.orientation === 'portrait').map(
              (v) => {
                const title = p[`${v.key}Title`];
                const caption = p[`${v.key}Caption`];
                return (
                  <div key={v.id}>
                    <YoutubeEmbed
                      id={v.id}
                      title={title}
                      orientation="portrait"
                    />
                    <div className="mt-2">
                      <h3 className="font-heading text-sm md:text-base leading-tight mb-1">
                        {title}
                      </h3>
                      <p className="text-xs text-text leading-snug">
                        {caption}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </Reveal>
      </section>

      {/* Service Categories — 3 categories with descriptions */}
      <section className="section bg-primary">
        <Reveal stagger className="container-page">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-black mb-2 font-secondary font-bold">
              {p.catEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.catTitle}
            </h2>
            <p className="text-text max-w-2xl mx-auto">
              {p.catSubtitle}
            </p>
          </div>
          <div className="space-y-12">
            {SERVICE_CATEGORIES.map((cat) => {
              const title = p[`${cat.key}Title`];
              const desc = p[`${cat.key}Desc`];
              return (
                <div key={cat.key}>
                  <div className="mb-5">
                    <h3 className="font-heading text-xl md:text-2xl mb-1">
                      {title}
                    </h3>
                    <p className="text-text text-sm max-w-3xl">{desc}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {cat.images.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl overflow-hidden bg-theme-9 hover:scale-[1.03] hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <Image
                          src={src}
                          alt={`${title} example ${i + 1}`}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      <Cta />
    </>
  );
}
