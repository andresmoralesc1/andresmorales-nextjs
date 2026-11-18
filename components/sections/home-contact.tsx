import Link from 'next/link';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { getLocalizedPath } from '@/lib/i18n';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { SocialRow } from '@/components/social';
import { TrackLink } from '@/components/track';
import { Reveal } from '@/components/reveal';
import { Calendar, ArrowUpRight, FileText } from 'lucide-react';

// "Let's talk" section of the home page — server component.
// Reads dictionary via `x-locale` header set by middleware. Renders a
// centered card on the cream background so the section has its own visual
// weight (otherwise it blends into the surrounding bg-background sections).
export async function HomeContact() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);
  return (
    <section className="section bg-background">
      <Reveal className="container-page max-w-5xl mx-auto">
        <div className="rounded-3xl bg-primary border border-theme-9 shadow-xl shadow-secondary/5 overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left: copy + high-conversion Cal.com booking */}
            <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
                  {dict.homeContact.eyebrow}
                </p>
                <h2 className="font-heading text-3xl md:text-4xl mb-4 text-secondary leading-tight">
                  {dict.homeContact.title}
                </h2>
                <p className="text-text text-base md:text-lg leading-relaxed mb-6">
                  {dict.homeContact.subtitle}
                </p>

                {/* Direct High-Intent Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                  <a
                    href={CALENDAR_BOOKING_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-theme-1 hover:bg-[#ff7a18] text-secondary font-secondary font-bold text-sm tracking-tight shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer min-h-[44px]"
                  >
                    <Calendar className="w-4 h-4 text-secondary/80 shrink-0" />
                    <span>
                      {locale === 'en'
                        ? 'Book a 30-min call'
                        : locale === 'pt'
                        ? 'Agendar chamada de 30 min'
                        : 'Agendar videollamada de 30 min'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-secondary/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </a>

                  <Link
                    href={getLocalizedPath('/brief', locale)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-theme-5 hover:bg-white text-secondary font-secondary font-semibold text-xs border border-theme-9 hover:border-theme-1 transition-all min-h-[42px]"
                  >
                    <FileText className="w-3.5 h-3.5 text-secondary/70" />
                    <span>
                      {locale === 'en'
                        ? 'Or send a brief'
                        : locale === 'pt'
                        ? 'Ou envie um briefing'
                        : 'O enviar un brief'}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Trust statement */}
              <div className="pt-4 border-t border-theme-9/60 text-xs font-mono text-text">
                <span className="text-accent font-bold">⚡ </span>
                <span>
                  {locale === 'en'
                    ? '30 min · Technical scoping directly with Andrés · No sales pressure'
                    : locale === 'pt'
                    ? '30 min · Diagnóstico técnico direto com o Andrés · Sem vendas forçadas'
                    : '30 min · Diagnóstico técnico directo con Andrés · Sin presión de venta'}
                </span>
              </div>
            </div>

            {/* Right: contact details panel — dark background so the
                section has real contrast instead of two near-identical
                cream panels. White text + brand orange accents. */}
            <div className="bg-secondary p-8 md:p-10 lg:p-12 flex flex-col justify-between gap-6 border-t md:border-t-0 md:border-l border-theme-9">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/60 font-secondary font-bold mb-2">
                  Email
                </p>
                <TrackLink
                  href="mailto:info@andresmorales.com.co"
                  event="cta_clicked"
                  label="home-email"
                  className="inline-flex items-center gap-2 text-primary hover:text-theme-1 text-base md:text-lg font-secondary font-semibold break-all"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-theme-1" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  info@andresmorales.com.co
                </TrackLink>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-primary/60 font-secondary font-bold mb-2">
                  {dict.homeContact.asideHoursKicker ?? 'Working hours'}
                </p>
                <p className="text-primary text-sm md:text-base font-medium">
                  {dict.homeContact.asideHoursP ?? 'Mon–Fri · 8 a.m.–6 p.m. GMT-5'}
                </p>
                <p className="text-primary/60 text-xs md:text-sm mt-1">
                  {dict.homeContact.asideHoursHint ?? 'Replies usually under 24h'}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-primary/60 font-secondary font-bold mb-3">
                  {dict.homeContact.socialKicker ?? 'Find me on'}
                </p>
                <SocialRow inverted />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}