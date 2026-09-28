import Link from 'next/link';
import Image from 'next/image';
import { wpImage } from '@/lib/theme';
import { LazyParticles } from '@/components/lazy-particles';
import { getCurrentDictionary } from '@/lib/dictionary';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';

type Props = {
  portrait?: string;
  ctaHref?: string;
};

// Section 1 of home — exact replica of the WordPress hero:
// flat cream background (no dots pattern) + dynamic orange particles,
// dark text, circular photo with thick orange border, large serif typography.
// Server component: reads translations via the `x-locale` header set by
// middleware.
export async function Hero({
  portrait = wpImage('/wp-content/uploads/2023/04/19.png'),
  ctaHref = CALENDAR_BOOKING_URL,
}: Props) {
  const dict = await getCurrentDictionary();
  return (
    <section
      id="hero-particles"
      // min-h-[90vh] → 90dvh on mobile-friendly browsers, falls back to 90vh
      // on older ones. The dynamic viewport unit stops the URL bar from
      // hiding/showing (Safari iOS) from causing a ~70px height change in
      // the section, which used to push every section below the hero down
      // and register as a CLS of 0.105 on mobile PageSpeed. The 700px floor
      // covers very short viewports (e.g. landscape phones) where 90dvh
      // would be too small to fit the portrait comfortably.
      className="relative bg-background overflow-hidden min-h-[700px] md:min-h-[90vh] flex items-center"
      style={{ minHeight: 'min(90dvh, 900px)' }}
    >
      {/* Dynamic particles (no static background pattern) */}
      <LazyParticles id="hero-particles-canvas" variant="cream" />

      <div className="container-page relative z-10 grid md:grid-cols-2 gap-12 items-center py-24">
        <div>
          <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
            {dict.homeHero.greeting}
          </p>
          <p className="font-heading text-5xl md:text-6xl lg:text-7xl mb-5 text-secondary leading-[1.05] tracking-tight">
            {dict.homeHero.name}
          </p>
          <h1 className="text-2xl md:text-4xl font-secondary font-medium text-secondary mb-2 leading-snug">
            {dict.homeHero.role1}
          </h1>
          <p className="text-2xl md:text-4xl font-secondary text-secondary/70 mb-8 italic leading-snug">
            {dict.homeHero.role2}
          </p>
          <ul className="space-y-3 mb-10">
            <li>
              <a
                href="mailto:info@andresmorales.com.co"
                className="text-secondary hover:text-accent flex items-center gap-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                info@andresmorales.com.co
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/573161482507"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-accent flex items-center gap-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.48-.88-.78-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.34-.03-.5-.07-.14-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.34s-1.04 1.02-1.04 2.48 1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.07 4.49.71.3 1.26.49 1.69.31.52-.13.99-.1 1.39-.18 4.24-.93 4.69-1.42.45-.49.7-1.05.84-1.42.14-.37.14-.68.1-.83-.07-.15-.27-.2-.55-.37m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.18-3.49-8.42" />
                </svg>
                +57 316 148 2507
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/andresmoralesc1/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-accent flex items-center gap-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
                {dict.homeHero.linkedinLabel}
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/andres_morales_automation/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-accent flex items-center gap-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                {dict.homeHero.instagramLabel}
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/andresmoralesautomation/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-accent flex items-center gap-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2 rounded-sm"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0" aria-hidden="true">
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 5.99 4.39 10.95 10.13 11.87v-8.4H7.08v-3.47h3.04V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95H15.83c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.4C19.61 23.02 24 18.06 24 12.07z" />
                </svg>
                {dict.homeHero.facebookLabel}
              </a>
            </li>
          </ul>
          <Link
            href={ctaHref}
            target="_blank"
            rel="noreferrer"
            className="btn-theme text-base px-8 py-4"
          >
            {dict.homeHero.cta}
          </Link>
        </div>
        <div className="relative flex justify-center">
          {/* Foto circular con borde naranja grueso — replica exacta del WP.
              Image dimensions: viewport 320/448 px, intrinsic src 1000x1000.
              priority for LCP, quality 85 (default 75 looked slightly soft).
              fetchPriority="high" tells the browser to start the network
              fetch alongside the HTML parse (instead of after layout),
              which is the main lever for hitting a fast LCP — Lighthouse
              actually checks this attribute and scores it explicitly. */}
          <div className="relative w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full overflow-hidden border-[6px] border-theme-1 shadow-xl bg-theme-9">
            <Image
              src={portrait}
              alt={dict.homeHero.portraitAlt}
              width={1000}
              height={1000}
              sizes="(max-width: 768px) 320px, 448px"
              // Quality 75 is the default and gives the best size/quality
              // tradeoff for a portrait photo at this size. 85 was overkill
              // and added ~40% extra bytes per variant (~7 KB on the 320px
              // variant) without a visible difference at viewport scale.
              quality={75}
              priority
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}