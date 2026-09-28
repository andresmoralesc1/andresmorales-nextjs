import Link from 'next/link';
import Image from 'next/image';
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

      <div className={`container-page py-16 grid gap-10 relative z-10 ${variant === 'warm' ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Column 1: Brand + reach me + tagline */}
        <div>
          <Link
            href={getLocalizedPath('/', locale)}
            aria-label="Andrés Morales — Home"
            className="inline-block mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
          >
            <Image
              src="/logo-wp.png"
              alt="Andrés Morales"
              width={196}
              height={94}
              // logo-wp.png is a dark-on-transparent PNG. Footer bg is
              // theme-3 (#1E1810) — also dark. `invert` flips the logo
              // so the brand mark stays visible without baking a second
              // light-mode file into /public.
              className="h-10 w-auto invert"
            />
          </Link>

          <h3 className="font-heading text-xl font-semibold mb-6 text-primary">
            {dict.footer.tagline}
          </h3>

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
              className="btn-theme"
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
                className="text-primary/80 hover:text-accent link-underline transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
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
                href="https://www.instagram.com/andres_morales_automation/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram profile"
                className="text-primary/80 hover:text-accent link-underline transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/andresmoralesautomation/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook page"
                className="text-primary/80 hover:text-accent link-underline transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/573161482507"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp chat"
                className="text-primary/80 hover:text-accent link-underline transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="https://github.com/andresmoralesc1/"
                target="_blank"
                rel="noreferrer"
                aria-label={dict.footer.githubLabel}
                className="text-primary/80 hover:text-accent link-underline transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
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
                <TrackLink href={getLocalizedPath('/services', locale)} event="nav_link_clicked" label="footer-services" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.nav.services}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/ai-automation', locale)} event="service_card_clicked" label="ai-automation" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.services.track1}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/ui-ux-design', locale)} event="service_card_clicked" label="ui-ux-design" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.services.track2}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/web-development', locale)} event="service_card_clicked" label="web-development" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.services.track3}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/portfolio', locale)} event="nav_link_clicked" label="footer-portfolio" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.nav.portfolio}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/blog', locale)} event="nav_link_clicked" label="footer-blog" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.nav.blog}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/brief', locale)} event="cta_clicked" label="footer-cta" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.nav.brief}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/contact', locale)} event="nav_link_clicked" label="footer-contact" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.nav.contact}
                </TrackLink>
              </li>
            </ul>
          </div>
        )}

        {/* Column 4: Compare — only in default B2B variant.
            Personal campaigns hide this column to preserve warm tone. */}
        {variant !== 'warm' && (
          <div>
            <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
              {dict.footer.compareTitle}
            </h3>
            <p className="text-sm text-primary/70 mb-4">
              {dict.footer.compareDesc}
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <TrackLink href={getLocalizedPath('/vs/make-vs-n8n', locale)} event="nav_link_clicked" label="footer-compare-make-vs-n8n" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.footer.compareLink1Label}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/vs/ai-consultant-vs-agency', locale)} event="nav_link_clicked" label="footer-compare-ai-vs-agency" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.footer.compareLink2Label}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/vs/vercel-vs-aws-amplify', locale)} event="nav_link_clicked" label="footer-compare-vercel-vs-amplify" className="text-primary/80 hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm">
                  {dict.footer.compareLink3Label}
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
              className="hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
            >
              {dict.legal.footerLinks.privacy}
            </Link>
            <span aria-hidden="true" className="text-primary/30">·</span>
            <Link
              href={getLocalizedPath('/terms', locale)}
              className="hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
            >
              {dict.legal.footerLinks.terms}
            </Link>
            <span aria-hidden="true" className="text-primary/30">·</span>
            <Link
              href={getLocalizedPath('/drafts', locale)}
              className="hover:text-accent link-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-3 rounded-sm"
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
