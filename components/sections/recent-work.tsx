import Image from 'next/image';
import Link from 'next/link';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { getLocalizedPath } from '@/lib/i18n';

// RecentWork — compact "Recent work" strip on the home page. Three
// featured projects from the portfolio with image + live badge + title
// + description. Links to the portfolio page (NOT external) so the
// visitor sees the case study before bouncing to the live site.
//
// Data is duplicated here rather than imported from portfolio/page.tsx
// because that file is a server component with localized arrays, and
// pulling only the home preview into a typed shared module is more
// code than this three-card block.

type RecentProj = {
  key: string;
  image: string;
  href: string;
  caseStudySlug: string;
};

const RECENT: RecentProj[] = [
  {
    key: 'proj1',
    image: '/sites/gps_andresmorales_com_co.png',
    href: 'https://barriotech.com.co/',
    caseStudySlug: 'barriotech',
  },
  {
    key: 'proj3',
    image: '/sites/dash_andresmorales_com_co_login.png',
    href: 'https://dash.andresmorales.com.co/login',
    caseStudySlug: 'kambelleh',
  },
  {
    key: 'proj9',
    image: '/sites/cleida_home.png',
    href: 'https://cleida.com.co/',
    caseStudySlug: 'cleida',
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
  const portfolioHref = getLocalizedPath('/portfolio', locale);

  return (
    <section className="section bg-theme-5">
      <div className="container-page">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-secondary font-bold">
            {r.eyebrow}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl mb-3 text-secondary">
            {r.title}
          </h2>
          <p className="text-text">{r.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {RECENT.map((proj) => {
            const p = dict.portfolio as unknown as Record<string, string>;
            const title = p[`${proj.key}Title`];
            const subtitle = p[`${proj.key}Subtitle`];
            const desc = p[`${proj.key}Desc`];
            // Internal route when the project has a case study, external
            // when it doesn't. Mirrors portfolio/page.tsx logic.
            const href = proj.caseStudySlug
              ? getLocalizedPath(`/work/${proj.caseStudySlug}`, locale)
              : proj.href;
            const external = !proj.caseStudySlug;
            return (
              <Link
                key={proj.key}
                href={href}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="group block bg-primary rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-theme-9">
                  <Image
                    src={proj.image}
                    alt={title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold px-2.5 py-1 rounded-full bg-theme-1 shadow-md">
                    {r.liveBadge}
                  </span>
                </div>
                <div className="p-5">
                  <span className="inline-block text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold mb-2">
                    {subtitle}
                  </span>
                  <h3 className="font-heading text-xl md:text-2xl mb-2 text-secondary">
                    {title}
                  </h3>
                  <p className="text-sm text-text leading-relaxed mb-3 line-clamp-3">
                    {desc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-secondary font-bold text-secondary group-hover:text-accent opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
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