import Link from 'next/link';
import Image from 'next/image';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LocaleSwitcherWrapper } from '@/components/LocaleSwitcherWrapper';
import { MobileMenu } from '@/components/MobileMenu';
import { NavItem } from '@/components/NavItem';
import { MENU } from '@/lib/menu';
import { TrackCta } from '@/components/track';
import { getLocalizedPath } from '@/lib/i18n';

// Header — server component. Reads dictionary + locale via the
// `x-locale` header set by middleware. Renders logo (left), desktop nav
// + locale switcher + start-project CTA (right), mobile menu button
// (right on small screens). Layout matches the WordPress original:
// cream background, uppercase menu, active item in orange.
export async function Header() {
  const [dict, locale] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="container-page flex items-center justify-between h-20">
        <Link href={getLocalizedPath('/', locale)} className="block transition-opacity hover:opacity-80" aria-label="Andrés Morales — Home">
          <Image
            src="/logo-wp.png"
            alt="Andrés Morales"
            width={147}
            height={70}
            className="h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav + CTA + locale switcher */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-10">
            {MENU.map((m) => (
              <NavItem
                key={m.href}
                href={getLocalizedPath(m.href, locale)}
                label={dict.nav[m.labelKey]}
              />
            ))}
          </nav>

          <LocaleSwitcherWrapper
            dict={{ locale: dict.locale }}
            locale={locale}
            className="ml-2"
          />

          <TrackCta
            href={getLocalizedPath('/brief', locale)}
            label="header-cta"
            className="inline-flex items-center gap-1.5 text-sm font-secondary font-bold uppercase tracking-widest bg-theme-1 text-secondary px-5 py-2.5 rounded-md shadow-[0_0_8px_rgba(255,102,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(255,102,0,0.4)] transition-all duration-300"
          >
            {dict.nav.brief}
            <span aria-hidden="true">→</span>
          </TrackCta>
        </div>

        {/* Mobile menu drawer */}
        <MobileMenu dict={dict} locale={locale} />
      </div>
    </header>
  );
}
