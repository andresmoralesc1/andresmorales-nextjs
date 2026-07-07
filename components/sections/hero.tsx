import Link from 'next/link';
import { wpImage } from '@/lib/theme';
import { ParticlesBackground } from '@/components/particles-background';

type Props = {
  portrait?: string;
  ctaHref?: string;
};

// Section 1 of home — exact replica of the WordPress hero:
// flat cream background (no dots pattern) + dynamic orange particles,
// dark text, circular photo with thick orange border, large serif typography
export function Hero({
  portrait = wpImage('/wp-content/uploads/2023/04/19.png'),
  ctaHref = 'https://calendar.app.google/NHF1ScCWjh4WJaey6',
}: Props) {
  return (
    <section
      id="hero-particles"
      className="relative bg-background overflow-hidden min-h-[90vh] flex items-center"
    >
      {/* Dynamic particles (no static background pattern) */}
      <ParticlesBackground id="hero-particles-canvas" variant="cream" />

      <div className="container-page relative z-10 grid md:grid-cols-2 gap-12 items-center py-24">
        <div>
          <p className="text-xs uppercase tracking-widest text-theme-1 mb-3 font-secondary font-bold">
            Hello, my name is
          </p>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl mb-5 text-secondary leading-[1.05] tracking-tight">
            Andrés Morales
          </h1>
          <p className="text-2xl md:text-3xl font-secondary text-secondary mb-2">
            AI Automation Consultant
          </p>
          <p className="text-2xl md:text-3xl font-secondary text-theme-1 mb-8 italic">
            Helping businesses scale
          </p>
          <ul className="space-y-3 mb-10">
            <li>
              <a
                href="mailto:info@andresmorales.com.co"
                className="text-secondary hover:text-theme-1 flex items-center gap-3 text-base"
              >
                <span className="text-theme-1 text-lg">✉</span> info@andresmorales.com.co
              </a>
            </li>
            <li>
              <a
                href="tel:+573245425387"
                className="text-secondary hover:text-theme-1 flex items-center gap-3 text-base"
              >
                <span className="text-theme-1 text-lg">☎</span> +57 324 5425387
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/andresmoralesc1/"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:text-theme-1 flex items-center gap-3 text-base"
              >
                <span className="text-theme-1 text-lg">in</span> LinkedIn ›
              </a>
            </li>
          </ul>
          <Link
            href={ctaHref}
            target="_blank"
            rel="noreferrer"
            className="btn-theme shadow-md hover:shadow-lg text-base px-8 py-4"
          >
            Unlock a Free Automation Strategy Call
          </Link>
        </div>
        <div className="relative flex justify-center">
          {/* Foto circular con borde naranja grueso — replica exacta del WP */}
          <div className="relative w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full overflow-hidden border-[6px] border-theme-1 shadow-xl bg-theme-9">
            <img
              src={portrait}
              alt="Andrés Morales portrait"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}