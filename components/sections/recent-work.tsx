import Image from 'next/image';
import Link from 'next/link';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { getLocalizedPath } from '@/lib/i18n';
import { ExternalLink, Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';

// RecentWork — Flagship 4 Projects Showcase.
// Features Barriotech, Kambelleh PMS, Andrés Morales CMS Sandbox, and El Gato Colectivo.

type FlagshipProject = {
  key: string;
  image: string;
  liveUrl: string;
  caseStudySlug: string;
  demoUrl?: string;
  demoBadge?: string;
  tags: string[];
};

const FLAGSHIP_PROJECTS: FlagshipProject[] = [
  {
    key: 'proj1',
    image: '/sites/gps_andresmorales_com_co.png',
    liveUrl: 'https://barriotech.com.co/',
    caseStudySlug: 'barriotech',
    tags: ['Next.js', 'PostgreSQL', 'Leaflet', 'Wompi'],
  },
  {
    key: 'proj3',
    image: '/sites/dash_andresmorales_com_co_login.png',
    liveUrl: 'https://dash.andresmorales.com.co/login',
    demoUrl: 'https://dash.andresmorales.com.co/login',
    demoBadge: '⚡ Demo 1-Clic',
    caseStudySlug: 'kambelleh',
    tags: ['React 18', 'Node.js', 'PostgreSQL', 'Multi-tenant'],
  },
  {
    key: 'projCms',
    image: '/sites/cms_demo_preview.png',
    liveUrl: '/demo/cms',
    demoUrl: '/demo/cms',
    demoBadge: '⚡ Sandbox Datos Falsos',
    caseStudySlug: 'cms-andres-morales',
    tags: ['Next.js 16', 'TypeScript', 'n8n', 'Mailcow'],
  },
  {
    key: 'proj10',
    image: '/sites/gato_home.png',
    liveUrl: 'https://gatocolectivo.com/',
    caseStudySlug: 'gato-colectivo',
    tags: ['Next.js', 'Marketplace', 'Wompi', 'Subdominios'],
  },
];

export async function RecentWork() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  const r = dict.homeRecent as unknown as {
    eyebrow: string;
    title: string;
    subtitle: string;
    viewAll: string;
    liveBadge: string;
  };

  const p = dict.portfolio as unknown as Record<string, string>;
  const portfolioHref = getLocalizedPath('/portfolio', locale);

  return (
    <section className="section bg-theme-5 overflow-hidden relative">
      <div className="container-page">
        {/* Section Header */}
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-secondary font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{r.eyebrow}</span>
          </div>
          <h2 className="font-heading text-3xl md:text-5xl mb-4 text-secondary leading-tight">
            {r.title}
          </h2>
          <p className="text-text text-base md:text-lg leading-relaxed">
            {r.subtitle}
          </p>
        </div>

        {/* 4 Flagship Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FLAGSHIP_PROJECTS.map((proj) => {
            const title = p[`${proj.key}Title`];
            const subtitle = p[`${proj.key}Subtitle`];
            const desc = p[`${proj.key}Desc`];
            const metric = p[`${proj.key}Metric`];

            const caseStudyHref = getLocalizedPath(`/work/${proj.caseStudySlug}`, locale);
            const liveHref = proj.demoUrl?.startsWith('/')
              ? getLocalizedPath(proj.demoUrl, locale)
              : proj.liveUrl;
            const isInternalDemo = liveHref.startsWith('/');

            return (
              <div
                key={proj.key}
                className="group flex flex-col bg-primary rounded-3xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-theme-9">
                  <Image
                    src={proj.image}
                    alt={title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className="text-[10px] uppercase tracking-wider text-secondary font-secondary font-bold px-2.5 py-1 rounded-full bg-theme-1 shadow-md backdrop-blur">
                      {metric || r.liveBadge}
                    </span>
                    {proj.demoBadge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-md animate-pulse">
                        {proj.demoBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold opacity-80 block mb-1.5">
                      {subtitle}
                    </span>
                    <h3 className="font-heading text-lg font-bold mb-2 text-secondary leading-snug group-hover:text-accent transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-text leading-relaxed mb-4 line-clamp-3">
                      {desc}
                    </p>

                    {/* Tech Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-theme-5 border border-theme-9 text-text font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions with >= 44px touch targets for mobile accessibility */}
                  <div className="pt-3 border-t border-theme-9 flex items-center justify-between gap-2">
                    <Link
                      href={liveHref}
                      {...(isInternalDemo ? {} : { target: '_blank', rel: 'noreferrer' })}
                      className="inline-flex items-center justify-center min-h-[44px] gap-1.5 text-xs font-secondary font-bold text-secondary bg-theme-1 hover:bg-theme-2 px-4 py-2 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <span>{proj.demoBadge ? 'Abrir Demo' : 'Ver en Vivo'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={caseStudyHref}
                      className="inline-flex items-center justify-center min-h-[44px] px-3 gap-1 text-xs font-secondary font-bold text-secondary hover:text-accent opacity-80 hover:opacity-100 transition-colors"
                    >
                      <span>Caso</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA to Full Portfolio */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href={`${portfolioHref}#proyectos`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-theme-1 text-secondary hover:bg-theme-2 font-secondary font-bold text-sm shadow-lg transition-all hover:scale-105"
          >
            <span>{locale === 'en' ? 'Explore all in 3D Gallery' : 'Explorar galería 3D completa'}</span>
            <span aria-hidden>↗</span>
          </Link>
          <Link
            href={portfolioHref}
            className="inline-flex items-center gap-2 text-sm font-secondary font-bold text-secondary hover:text-accent transition-colors"
          >
            {r.viewAll}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RecentWork;
