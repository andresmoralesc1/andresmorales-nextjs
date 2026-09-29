import Link from 'next/link';
import Image from 'next/image';
import { SocialIcon } from '@/components/social-icon';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { getLocalizedPath, type Locale } from '@/lib/i18n';
import { LocaleSwitcherWrapper } from '@/components/LocaleSwitcherWrapper';
import { TrackLink } from '@/components/track';

// Footer — server component. Reads dictionary + locale via `x-locale`
// header. 4 columns: Brand + reach me | Social + locale | Explore
// | Compare. Decorative circles + copyright bar at the bottom match
// the WordPress original layout.
//
// `variant="warm"` renders a 2-column compact footer for personal
// campaigns (cumple-2025, invest-in-people) — hides the Explore and
// Compare columns to preserve warm tone. Default is `"default"`.
export async function Footer({ variant = 'default' }: { variant?: 'default' | 'warm' }) {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  // Social link data — the href + aria-label per brand. Centralized
  // here (not in the icon component) because the icon component is
  // reusable for non-link contexts (e.g. testimonial avatars) where
  // there is no href.
  const socials: Array<{
    name: 'linkedin' | 'instagram' | 'facebook' | 'whatsapp' | 'github';
    href: string;
    label: string;
  }> = [
    { name: 'linkedin',   href: 'https://www.linkedin.com/in/andresmoralesc1/',  label: dict.footer.linkedinLabel },
    { name: 'instagram',  href: 'https://www.instagram.com/andres_morales_automation/', label: 'Instagram profile' },
    { name: 'facebook',   href: 'https://www.facebook.com/andresmoralesautomation/',    label: 'Facebook page' },
    { name: 'whatsapp',   href: 'https://wa.me/573161482507',                              label: 'WhatsApp chat' },
    { name: 'github',     href: 'https://github.com/andresmoralesc1/',                  label: dict.footer.githubLabel },
  ];

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

          {/* Reach-me block — was previously inline-styled with random
              'Segoe UI' + '#111' leftover from the WP era. Replaced
              with theme-aware classes + the same SocialIcon used in
              the social column. */}
          <div className="rounded-md bg-theme-5/[0.06] p-5 border border-theme-5/[0.08]">
            <h3 className="text-lg mb-2 text-accent tracking-wide uppercase font-secondary font-bold">
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
              <SocialIcon name="email" size="w-4 h-4" />
              {dict.footer.email}
            </a>
          </div>
        </div>

        {/* Column 2: Social + locale switcher */}
        <div>
          <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
            {dict.footer.social}
          </h3>
          <ul className="space-y-2.5 text-sm">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="footer-link inline-flex items-center gap-2"
                >
                  <SocialIcon name={s.name} size="w-4 h-4" />
                  {s.label}
                </a>
              </li>
            ))}
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
                <TrackLink href={getLocalizedPath('/services', locale)} event="nav_link_clicked" label="footer-services" className="footer-link">
                  {dict.nav.services}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/ai-automation', locale)} event="service_card_clicked" label="ai-automation" className="footer-link">
                  {dict.services.track1}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/ui-ux-design', locale)} event="service_card_clicked" label="ui-ux-design" className="footer-link">
                  {dict.services.track2}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/services/web-development', locale)} event="service_card_clicked" label="web-development" className="footer-link">
                  {dict.services.track3}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/portfolio', locale)} event="nav_link_clicked" label="footer-portfolio" className="footer-link">
                  {dict.nav.portfolio}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/blog', locale)} event="nav_link_clicked" label="footer-blog" className="footer-link">
                  {dict.nav.blog}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/brief', locale)} event="cta_clicked" label="footer-cta" className="footer-link">
                  {dict.nav.brief}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/contact', locale)} event="nav_link_clicked" label="footer-contact" className="footer-link">
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
                <TrackLink href={getLocalizedPath('/vs/make-vs-n8n', locale)} event="nav_link_clicked" label="footer-compare-make-vs-n8n" className="footer-link">
                  {dict.footer.compareLink1Label}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/vs/ai-consultant-vs-agency', locale)} event="nav_link_clicked" label="footer-compare-ai-vs-agency" className="footer-link">
                  {dict.footer.compareLink2Label}
                </TrackLink>
              </li>
              <li>
                <TrackLink href={getLocalizedPath('/vs/vercel-vs-aws-amplify', locale)} event="nav_link_clicked" label="footer-compare-vercel-vs-amplify" className="footer-link">
                  {dict.footer.compareLink3Label}
                </TrackLink>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Copyright bar */}
      <div className="border-t border-primary/10 relative z-10">
        <div className="container-page py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary/60">
          <p>{dict.footer.copyright.replace('{year}', new Date().getFullYear().toString())}</p>
          <p>{dict.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
