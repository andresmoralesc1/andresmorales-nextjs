'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUp, Calendar, FileText, Terminal } from 'lucide-react';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';

type Props = {
  lang: string;
  labels: {
    status: string;
    bookCall: string;
    sendBrief: string;
    scrollTop: string;
  };
};

export function PortfolioFloatingDock({ lang, labels }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past the hero (> 400px)
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  const briefHref = lang === 'en' ? '/brief-web' : `/${lang}/brief-web`;

  return (
    <aside
      aria-label="Acciones rápidas de portafolio"
      className="flex items-center gap-2 sm:gap-3 fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-secondary/95 text-primary backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-white/15 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 max-w-[calc(100vw-1.5rem)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] sm:pb-2.5"
    >
      {/* Live Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono pr-1.5 sm:pr-2 border-r border-white/20 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-1" />
        </span>
        <span className="text-primary/90 text-[11px] whitespace-nowrap hidden sm:inline">
          {labels.status}
        </span>
      </div>

      {/* Primary Action Button */}
      <a
        href={CALENDAR_BOOKING_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full bg-theme-1 hover:bg-theme-2 text-secondary font-secondary font-bold text-xs shadow-xs hover:scale-102 active:scale-95 transition-all shrink-0"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>{labels.bookCall}</span>
      </a>

      {/* Secondary Action */}
      <Link
        href={briefHref}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-primary font-secondary font-medium text-xs transition-colors shrink-0"
      >
        <FileText className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">{labels.sendBrief}</span>
        <span className="xs:hidden">Brief</span>
      </Link>

      {/* Terminal CLI Trigger (Desktop only) */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event('open-dev-terminal'))}
        className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-amber-400 font-mono text-xs border border-amber-400/30 transition-all cursor-pointer shrink-0"
        title="Open Developer Terminal (~)"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span className="hidden lg:inline text-[10px] font-bold">CLI</span>
      </button>

      {/* Scroll Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className="p-2 sm:p-1.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-primary transition-colors cursor-pointer shrink-0"
        title={labels.scrollTop}
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
