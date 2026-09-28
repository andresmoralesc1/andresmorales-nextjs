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
                className="text-secondary hover:text-secondary flex items-center gap-3 text-base"
              >
                <span className="text-secondary text-lg">{dict.homeHero.labelEmail}</span> info@andresmorales.com.co
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/573161482507"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-secondary flex items-center gap-3 text-base"
              >
                <span className="text-secondary text-lg">{dict.homeHero.labelWhatsapp}</span> +57 316 148 2507
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/andresmoralesc1/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-secondary flex items-center gap-3 text-base"
              >
                <span className="text-secondary text-lg">{dict.homeHero.labelLinkedin}</span> {dict.homeHero.linkedinLabel}
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/andres_morales_automation/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-secondary flex items-center gap-3 text-base"
              >
                <span className="text-secondary text-lg">{dict.homeHero.labelInstagram}</span> {dict.homeHero.instagramLabel}
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/andresmoralesautomation/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-secondary flex items-center gap-3 text-base"
              >
                <span className="text-secondary text-lg">{dict.homeHero.labelFacebook}</span> {dict.homeHero.facebookLabel}
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