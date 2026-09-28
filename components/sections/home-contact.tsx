import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { getLocalizedPath } from '@/lib/i18n';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { SocialRow } from '@/components/social';
import { TrackCta, TrackLink } from '@/components/track';
import { Reveal } from '@/components/reveal';

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
            {/* Left: copy + primary CTA */}
            <div className="p-8 md:p-10 lg:p-12">
              <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
                {dict.homeContact.eyebrow}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl mb-4 text-secondary">
                {dict.homeContact.title}
              </h2>
              <p className="text-text text-base md:text-lg leading-relaxed mb-6">
                {dict.homeContact.subtitle}
              </p>

              <TrackCta
                href={getLocalizedPath('/contact', locale)}
                label="home-contact-cta"
                className="btn-theme text-base px-7 py-3.5 w-full sm:w-auto justify-center"
              >
                {dict.homeContact.cta}
                <span aria-hidden="true">→</span>
              </TrackCta>

              {/* Secondary escape hatch — calendar link as a subtle ghost button */}
              <div className="mt-4 pt-4 border-t border-theme-9">
                <p className="text-xs uppercase tracking-widest text-secondary/70 font-secondary font-bold mb-2">
                  {dict.homeContact.altBookingLabel ?? 'Or prefer a call?'}
                </p>
                <TrackLink
                  href={CALENDAR_BOOKING_URL}
                  event="cta_clicked"
                  label="home-calendar"
                  className="inline-flex items-center gap-1.5 text-secondary hover:text-accent font-semibold text-sm"
                >
                  {dict.homeContact.altBookingCta}
                  <span aria-hidden="true">↗</span>
                </TrackLink>
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