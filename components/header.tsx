'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { MENU } from '@/lib/menu';

// Header — exact replica from WP original:
// - white background, NO shadow, NO border-bottom
// - logo PNG (same from WP) on left
// - uppercase menu on right, active item in orange
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="container-page flex items-center justify-between h-20">
        {/* Logo real del WP — 196x94 PNG */}
        <Link href="/" className="block" aria-label="Andrés Morales — Home">
          <Image
            src="/logo-wp.png"
            alt="Andrés Morales"
            width={147}
            height={70}
            className="h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-10">
          {MENU.map((m) => {
            const isActive =
              m.href === '/'
                ? pathname === '/'
                : pathname === m.href || pathname?.startsWith(m.href + '/');
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`text-sm font-secondary font-bold uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'text-theme-1'
                    : 'text-secondary hover:text-theme-1'
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* Hamburger mobile */}
        <button
          aria-label="Toggle menu"
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
        >
          <span className="block w-6 h-0.5 bg-secondary mb-1" />
          <span className="block w-6 h-0.5 bg-secondary mb-1" />
          <span className="block w-6 h-0.5 bg-secondary" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-theme-9 bg-background">
          <div className="container-page py-4 flex flex-col gap-4">
            {MENU.map((m) => {
              const isActive =
                m.href === '/'
                  ? pathname === '/'
                  : pathname === m.href || pathname?.startsWith(m.href + '/');
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-secondary font-bold uppercase tracking-widest ${
                    isActive
                      ? 'text-theme-1'
                      : 'text-secondary hover:text-theme-1'
                  }`}
                >
                  {m.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}