import Link from 'next/link';

/**
 * Footer — replica of the WordPress site footer structure
 *
 * 3 columns: Brand + CTA | Social | Services
 * + decorative cream/orange circles
 * + copyright bar at the bottom
 *
 * Strings: English-only for now. When i18n lands, wrap each literal
 * in the helper from lib/i18n and move to messages/en.json + messages/es.json.
 */
export function Footer() {
  return (
    <footer className="bg-theme-3 text-primary relative overflow-hidden mt-16">
      {/* Decorative circles — same vibe as WordPress version */}
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

      <div className="container-page py-16 grid gap-10 md:grid-cols-3 relative z-10">
        {/* Column 1: Brand + CTA */}
        <div>
          <h2 className="font-heading text-xl font-semibold mb-6 text-primary">
            Based in Colombia, working worldwide.
          </h2>

          <div
            className="rounded-md"
            style={{
              color: '#111',
              padding: '30px 20px',
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            <h3 className="text-[20px] mb-2.5 text-theme-1 tracking-wide uppercase">
              Let’s connect
            </h3>
            <p className="mb-4 text-[15px] leading-relaxed max-w-[500px] text-primary/90">
              Want to discover how AI can grow your business? Send me a message —
              I’ll personally get back to you.
            </p>
            <a
              href="mailto:info@andresmorales.com.co"
              className="inline-block text-[15px] font-semibold px-5 py-2.5 rounded-md text-white no-underline transition-transform duration-300 shadow-[0_0_8px_rgba(255,102,0,0.4)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(255,102,0,0.5)]"
              style={{
                background: 'linear-gradient(90deg, #ff6600, #ff9900)',
              }}
            >
              <span aria-hidden>✉️</span> info@andresmorales.com.co
            </a>
          </div>
        </div>

        {/* Column 2: Social */}
        <div>
          <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
            Social
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a
                href="https://www.linkedin.com/in/andresmoralesc1/"
                target="_blank"
                rel="noreferrer"
                className="text-primary/80 hover:text-theme-1 transition-colors"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/andresmorales_c1/"
                target="_blank"
                rel="noreferrer"
                className="text-primary/80 hover:text-theme-1 transition-colors"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Services */}
        <div>
          <h3 className="font-heading text-lg font-semibold mb-4 text-primary">
            Services
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/services" className="text-primary/80 hover:text-theme-1 transition-colors">
                My Work
              </Link>
            </li>
            <li>
              <Link href="/services/ai-automation" className="text-primary/80 hover:text-theme-1 transition-colors">
                AI Automation
              </Link>
            </li>
            <li>
              <Link href="/services/ui-ux-design" className="text-primary/80 hover:text-theme-1 transition-colors">
                UI/UX Design
              </Link>
            </li>
            <li>
              <Link href="/services/web-development" className="text-primary/80 hover:text-theme-1 transition-colors">
                Web Development
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="text-primary/80 hover:text-theme-1 transition-colors">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/brief" className="text-primary/80 hover:text-theme-1 transition-colors">
                Project Brief
              </Link>
            </li>
            <li>
              <Link href="/invest-in-people-inspire-the-future" className="text-primary/80 hover:text-theme-1 transition-colors">
                Invest in People, Inspire the Future
              </Link>
            </li>
            <li>
              <Link href="/unsubscribe" className="text-primary/80 hover:text-theme-1 transition-colors">
                Unsubscribe
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-theme-8 relative z-10">
        <div className="container-page py-4 text-xs text-primary/60 flex justify-between items-center">
          <span>Copyright © {new Date().getFullYear()} Andrés Morales</span>
          <span>
            Built with <span className="text-theme-1">♥</span> using Next.js
          </span>
        </div>
      </div>
    </footer>
  );
}
