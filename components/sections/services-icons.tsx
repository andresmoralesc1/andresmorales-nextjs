import Link from 'next/link';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { getLocalizedPath } from '@/lib/i18n';
import { Reveal } from '@/components/reveal';
import { ArrowRight } from 'lucide-react';

// "What I do" — 3 interactive service cards. Server component.
// Linked to deep-dive service pages, with tech badges and hover polish.
export async function ServicesIcons() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  const services = [
    {
      title: dict.homeServicesIcons.aiTitle,
      desc: dict.homeServicesIcons.aiDesc,
      href: '/services/ai-automation',
      tags: ['n8n', 'Make', 'OpenAI', 'Claude'],
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
          aria-hidden="true"
        >
          <path d="M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z" />
          <path d="M19 4 L19.6 6 L21.6 6.6 L19.6 7.2 L19 9.2 L18.4 7.2 L16.4 6.6 L18.4 6 Z" />
        </svg>
      ),
    },
    {
      title: dict.homeServicesIcons.uiTitle,
      desc: dict.homeServicesIcons.uiDesc,
      href: '/services/ui-ux-design',
      tags: ['Figma', 'Design Systems', 'Microcopy', 'Conversión'],
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      ),
    },
    {
      title: dict.homeServicesIcons.webTitle,
      desc: dict.homeServicesIcons.webDesc,
      href: '/services/web-development',
      tags: ['Next.js 16', 'TypeScript', 'PostgreSQL', 'Tailwind'],
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
          aria-hidden="true"
        >
          <path d="M8 7 L3 12 L8 17" />
          <path d="M16 7 L21 12 L16 17" />
          <path d="M14 5 L10 19" />
        </svg>
      ),
    },
  ];

  return (
    <section className="section bg-background border-t border-theme-9/50">
      <Reveal className="container-page">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-secondary font-bold">
            {dict.homeServicesIcons.eyebrow}
          </p>
          <h2 className="font-heading text-3xl md:text-5xl mb-3 text-secondary leading-tight">
            {dict.homeServicesIcons.title}
          </h2>
          <p className="text-text leading-relaxed text-sm sm:text-base">
            {dict.homeServicesIcons.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link
              key={s.title}
              href={getLocalizedPath(s.href, locale)}
              className="group p-6 sm:p-7 rounded-3xl border border-theme-9 hover:border-theme-1 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 bg-primary flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-theme-1/15 border border-theme-1/30 text-accent flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-theme-1/25 transition-all">
                  {s.icon}
                </div>

                <h3 className="font-heading text-xl mb-2 text-secondary group-hover:text-accent transition-colors">
                  {s.title}
                </h3>

                <p className="text-sm text-text leading-relaxed mb-5">
                  {s.desc}
                </p>
              </div>

              <div>
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-theme-9/60 mb-4">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-theme-5 text-secondary/80 border border-theme-9"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Explore link */}
                <span className="inline-flex items-center gap-1.5 text-xs font-secondary font-bold text-secondary group-hover:text-accent transition-colors">
                  <span>
                    {locale === 'en'
                      ? 'Explore service'
                      : locale === 'pt'
                      ? 'Explorar serviço'
                      : 'Ver detalles del servicio'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}