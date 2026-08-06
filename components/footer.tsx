import Link from 'next/link';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import { LocaleSwitcherWrapper } from '@/components/LocaleSwitcherWrapper';
import { TrackLink } from '@/components/track';

// Footer — server component. Reads dictionary + locale via `x-locale`
// header. 3 columns: Brand + CTA | Social + locale switcher | Services.
// The decorative circles + copyright bar at the bottom match the
// WordPress original layout.
//
// `variant="warm"` renders a 2-column compact footer for personal
// campaigns (cumple-2025, invest-in-people) — hides the Explore column
// of B2B services and shortens the brand block. Default is `"default"`
// which renders the full B2B footer.
export async function Footer({ variant = 'default' }: { variant?: 'default' | 'warm' }) {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  return (
    <footer
      aria-label={dict.footer.ariaNavLabel}
      className="bg-theme-3 text-primary relative overflow-hidden"
    >
      {/* Decorative circles */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-[10%] w-10 h-10 rounded-full bg-theme-1 opacity-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-20 right-[15%] w-[70px] h-[70px] rounded-full bg-theme-2 opacity-[0.08]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[60px] right-[25%] w-[30px] h-[30px] rounded-full bg-theme-1 opacity-[0.06]"
      />

      <div className={`container-page py-16 grid gap-10 relative z-10 ${variant === 'warm' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {/* Column 1: Brand + reach me + tagline */}
        <div>
          <h2 className="font-heading text-xl font-semibold mb-6 text-primary">
            {dict.footer.tagline}
          </h2>

          <div
            className="rounded-md"
            style={{
              color: '#111',
              padding: '30px 20px',
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            <h3 className="text-[20px] mb-2.5 text-accent tracking-wide uppercase">
              {dict.footer.reachMe}
            </h3>
            <p className="mb-4 text-[15px] leading-relaxed max-w-[500px] text-primary/90">
              <span className="block">{dict.footer.email}</span>
              <span className="block text-primary/70 text-sm mt-1">{dict.footer.hours}</span>
            </p>
            <a
              href={`mailto:${dict.footer.email}`}
              className="inline-block text-[15px] font-semibold px-5 py-2.5 rounded-md text-white no-underline transition-transform duration-300 shadow-[0_0_8px_rgba(255,102,0,0.4)] hover:-translate-y-0.5 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(255,102,0,0.5)]"
              style={{
                background: 'linear-gradient(90deg, #ff6600, #ff9900)',
              }}
            >
              <span aria-hidden>✉️</span> {dict.footer.email}
            </a>
          </div>
        </div>

        {/* Column 2: Social + locale switcher */}
        <div>
          <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
            {dict.footer.social}
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="https://www.linkedin.com/in/andresmoralesc1/"
                target="_blank"
                rel="noreferrer"
                aria-label={dict.footer.linkedinLabel}
                className="text-primary/80 hover:text-accent link-underline transition-colors inline-flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com/andresmoralesc1/"
                target="_blank"
                rel="noreferrer"
                aria-label={dict.footer.githubLabel}
                className="text-primary/80 hover:text-accent link-underline transition-colors inline-flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                  />
                </svg>
                GitHub
              </a>
            </li>
          </ul>

          {/* Locale switcher — also lives in the footer so visitors can
              switch language without scrolling back up. */}
          <div className="mt-8">
            <h3 className="font-heading text-base font-semibold mb-3 text-primary">
              {dict.locale.switchTo}
            </h3>
            <LocaleSwitcherWrapper
              dict={{ locale: dict.locale }}
              locale={locale}
            />
          </div>
        </div>

        {/* Column 3: Explore (services) — only in default B2B variant.
            Personal campaigns hide this column to preserve warm tone. */}
        {variant !== 'warm' && (
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
              {dict.footer.explore}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <TrackLink href={getLocalizedPath('/services', locale)} event="nav_link_clicked" label="footer-services" className="text-primary/80 hover:text-accent link-underline transition-colors">
                  {dict.nav.services}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/ai-automation', locale)} event="service_card_clicked" label="ai-automation" className="text-primary/80 hover:text-accent link-underline transition-colors">
                  {dict.services.track1}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/ui-ux-design', locale)} event="service_card_clicked" label="ui-ux-design" className="text-primary/80 hover:text-accent link-underline transition-colors">
                  {dict.services.track2}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/web-development', locale)} event="service_card_clicked" label="web-development" className="text-primary/80 hover:text-accent link-underline transition-colors">
                  {dict.services.track3}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/portfolio', locale)} event="nav_link_clicked" label="footer-portfolio" className="text-primary/80 hover:text-accent link-underline transition-colors">
                  {dict.nav.portfolio}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/blog', locale)} event="nav_link_clicked" label="footer-blog" className="text-primary/80 hover:text-accent link-underline transition-colors">
                  {dict.nav.blog}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/brief', locale)} event="cta_clicked" label="footer-cta" className="text-primary/80 hover:text-accent link-underline transition-colors">
                  {dict.nav.brief}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/contact', locale)} event="nav_link_clicked" label="footer-contact" className="text-primary/80 hover:text-accent link-underline transition-colors">
                  {dict.nav.contact}
                </TrackLink>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Copyright bar */}
      <div className="border-t border-theme-8 relative z-10">
        <div className="container-page py-4 text-xs text-primary/60 flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
          <span>
            {dict.footer.copyright.replace('{year}', String(new Date().getFullYear()))}
          </span>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link
              href={getLocalizedPath('/privacy', locale)}
              className="hover:text-accent link-underline transition-colors"
            >
              {dict.legal.footerLinks.privacy}
            </Link>
            <span aria-hidden="true" className="text-primary/30">·</span>
            <Link
              href={getLocalizedPath('/terms', locale)}
              className="hover:text-accent link-underline transition-colors"
            >
              {dict.legal.footerLinks.terms}
            </Link>
            <span aria-hidden="true" className="text-primary/30">·</span>
            <Link
              href={getLocalizedPath('/drafts', locale)}
              className="hover:text-accent link-underline transition-colors"
            >
              Drafts
            </Link>
          </nav>
          <span
            dangerouslySetInnerHTML={{
              __html: dict.footer.builtWith.replace(
                '{heart}',
                '<span class="text-accent">♥</span>'
              ),
            }}
          />
        </div>
      </div>
    </footer>
  );
}
