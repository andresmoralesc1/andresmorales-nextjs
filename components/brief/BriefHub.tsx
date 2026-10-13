'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BriefWizard from '@/components/brief/BriefWizard';
import BriefWebWizard from '@/components/brief/BriefWebWizard';
import { track } from '@/lib/analytics';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import { getLocalizedPath, type Dictionary, type Locale } from '@/lib/i18n';

export type BriefPath = 'web' | 'automation' | 'consulting';

export interface BriefHubProps {
  dict: Dictionary;
  lang: Locale;
  initialType?: BriefPath | null;
}

export default function BriefHub({ dict, lang, initialType = null }: BriefHubProps) {
  const searchParams = useSearchParams();
  const hubRef = useRef<HTMLDivElement>(null);

  // Read initial path from prop or URL query parameter (?type=... or ?path=...)
  const [activePath, setActivePath] = useState<BriefPath | null>(() => {
    if (initialType) return initialType;
    const q = searchParams.get('type') || searchParams.get('path');
    if (q === 'web' || q === 'automation' || q === 'consulting') {
      return q;
    }
    return null;
  });

  // Keep state in sync if URL query parameter changes
  useEffect(() => {
    const q = searchParams.get('type') || searchParams.get('path');
    if (q === 'web' || q === 'automation' || q === 'consulting') {
      setActivePath(q);
    }
  }, [searchParams]);

  function handleSelectPath(path: BriefPath | null) {
    setActivePath(path);
    if (path) {
      track('brief_hub_path_selected', { path });
      const newUrl = getLocalizedPath(`/brief?type=${path}`, lang);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', newUrl);
      }
    } else {
      track('brief_hub_path_changed');
      const resetUrl = getLocalizedPath('/brief', lang);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', resetUrl);
      }
    }

    setTimeout(() => {
      hubRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  }

  const h = dict.briefHub;

  // Active path badge label
  const activePathLabel =
    activePath === 'web'
      ? h.pathWeb
      : activePath === 'automation'
        ? h.pathAutomation
        : activePath === 'consulting'
          ? h.pathConsulting
          : '';

  return (
    <div ref={hubRef} className="w-full">
      <AnimatePresence mode="wait">
        {activePath ? (
          <motion.div
            key={activePath}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Top Navigation & Fast Path Switcher Bar */}
            <div className="rounded-xl bg-primary border border-theme-9 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSelectPath(null)}
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-wider font-secondary font-bold text-secondary/80 hover:text-theme-1 transition-all py-1.5 px-3 rounded-lg bg-theme-5/70 hover:bg-theme-1/10 border border-theme-9 hover:border-theme-1/30"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span>
                <span>{h.changePath}</span>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-secondary/60 hidden md:inline">
                  {h.activePath}:
                </span>

                {/* Quick switcher buttons */}
                <button
                  type="button"
                  onClick={() => handleSelectPath('web')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    activePath === 'web'
                      ? 'bg-theme-1 text-secondary shadow-sm ring-1 ring-theme-1/30 font-bold'
                      : 'bg-theme-5 text-secondary/70 hover:text-secondary hover:bg-theme-9/60'
                  }`}
                >
                  🌐 {h.pathWeb}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPath('automation')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    activePath === 'automation'
                      ? 'bg-theme-1 text-secondary shadow-sm ring-1 ring-theme-1/30 font-bold'
                      : 'bg-theme-5 text-secondary/70 hover:text-secondary hover:bg-theme-9/60'
                  }`}
                >
                  🤖 {h.pathAutomation}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPath('consulting')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    activePath === 'consulting'
                      ? 'bg-theme-1 text-secondary shadow-sm ring-1 ring-theme-1/30 font-bold'
                      : 'bg-theme-5 text-secondary/70 hover:text-secondary hover:bg-theme-9/60'
                  }`}
                >
                  💡 {h.pathConsulting}
                </button>
              </div>
            </div>

            {/* Active Wizard Component */}
            {activePath === 'web' && (
              <BriefWebWizard dict={dict} lang={lang} onBackToHub={() => handleSelectPath(null)} />
            )}

            {activePath === 'automation' && (
              <BriefWizard dict={dict} lang={lang} onBackToHub={() => handleSelectPath(null)} />
            )}

            {activePath === 'consulting' && (
              <div className="rounded-2xl bg-primary border border-theme-9 shadow-sm p-6 sm:p-8 md:p-10 max-w-3xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-theme-1/15 text-secondary border border-theme-1/30 mb-4">
                    <span className="w-2 h-2 rounded-full bg-theme-1 animate-pulse" />
                    {h.consultingCardBadge}
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl text-secondary mb-3">
                    {h.consultingCardTitle}
                  </h2>
                  <p className="text-secondary/80 text-sm sm:text-base leading-relaxed">
                    {h.consultingCardDesc}
                  </p>
                </div>

                <div className="bg-background rounded-2xl border border-theme-9 p-6 sm:p-8 max-w-lg mx-auto mb-8 shadow-sm">
                  <h3 className="font-heading text-lg text-secondary mb-4 flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-theme-1/10 text-theme-1">📞</span>
                    <span>{h.consultingCardSubtitle}</span>
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-secondary/90 mb-7">
                    {h.consultingCardBullets.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <span className="flex-none w-5 h-5 rounded-full bg-theme-1/15 text-theme-1 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={CALENDAR_BOOKING_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group w-full py-3.5 px-6 rounded-xl bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-all duration-200 text-center inline-flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base hover:shadow-md hover:scale-[1.01]"
                  >
                    <span>{h.consultingCardCta}</span>
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </a>
                </div>

                <div className="text-center pt-4 border-t border-theme-9">
                  <p className="text-xs sm:text-sm text-secondary/70">
                    {h.consultingAltText}{' '}
                    <a
                      href={getLocalizedPath('/contact', lang)}
                      className="text-secondary hover:text-theme-1 underline font-medium transition-colors"
                    >
                      {h.consultingAltCta}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="hub-selector"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="rounded-2xl bg-primary border border-theme-9 shadow-sm p-6 sm:p-8 md:p-10"
          >
            {/* Explainer Header */}
            <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl text-secondary mb-3 tracking-tight">
                {h.title}
              </h2>
              <p className="text-secondary/80 text-sm sm:text-base leading-relaxed">
                {h.subtitle}
              </p>
            </div>

            {/* 3 Interactive Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Card 1: Sitio Web o E-commerce */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelectPath('web')}
                className="group cursor-pointer flex flex-col justify-between rounded-2xl border-2 border-theme-9 hover:border-theme-1 bg-background hover:bg-theme-5/60 p-6 sm:p-7 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(249,110,3,0.12)] relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-theme-1/15 text-secondary border border-theme-1/30">
                      <span>🌐</span> {h.webCardBadge}
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-theme-9/80 text-secondary/70 group-hover:bg-theme-1 group-hover:text-secondary transition-colors">
                      01
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl text-secondary mb-2 group-hover:text-theme-1 transition-colors">
                    {h.webCardTitle}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-secondary font-secondary font-bold mb-3">
                    {h.webCardSubtitle}
                  </p>
                  <p className="text-sm text-secondary/80 leading-relaxed mb-6">
                    {h.webCardDesc}
                  </p>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-secondary/90 mb-8 border-t border-theme-9 pt-4">
                    {h.webCardBullets.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <span className="flex-none w-4 h-4 rounded-full bg-theme-1/15 text-theme-1 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPath('web');
                  }}
                  className="w-full py-3 px-5 rounded-xl bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-all duration-200 text-center inline-flex items-center justify-center gap-2 shadow-sm text-sm group-hover:shadow-md"
                >
                  <span>{h.webCardCta}</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
              </motion.div>

              {/* Card 2: Automatización e IA */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelectPath('automation')}
                className="group cursor-pointer flex flex-col justify-between rounded-2xl border-2 border-theme-9 hover:border-theme-1 bg-background hover:bg-theme-5/60 p-6 sm:p-7 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(249,110,3,0.12)] relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-theme-1/15 text-secondary border border-theme-1/30">
                      <span>🤖</span> {h.automationCardBadge}
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-theme-9/80 text-secondary/70 group-hover:bg-theme-1 group-hover:text-secondary transition-colors">
                      02
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl text-secondary mb-2 group-hover:text-theme-1 transition-colors">
                    {h.automationCardTitle}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-secondary font-secondary font-bold mb-3">
                    {h.automationCardSubtitle}
                  </p>
                  <p className="text-sm text-secondary/80 leading-relaxed mb-6">
                    {h.automationCardDesc}
                  </p>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-secondary/90 mb-8 border-t border-theme-9 pt-4">
                    {h.automationCardBullets.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <span className="flex-none w-4 h-4 rounded-full bg-theme-1/15 text-theme-1 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPath('automation');
                  }}
                  className="w-full py-3 px-5 rounded-xl bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-all duration-200 text-center inline-flex items-center justify-center gap-2 shadow-sm text-sm group-hover:shadow-md"
                >
                  <span>{h.automationCardCta}</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
              </motion.div>

              {/* Card 3: Consultoría / Llamada Directa */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleSelectPath('consulting')}
                className="group cursor-pointer flex flex-col justify-between rounded-2xl border-2 border-theme-9 hover:border-theme-1 bg-background hover:bg-theme-5/60 p-6 sm:p-7 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(249,110,3,0.12)] relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-theme-1/15 text-secondary border border-theme-1/30">
                      <span>💡</span> {h.consultingCardBadge}
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-theme-9/80 text-secondary/70 group-hover:bg-theme-1 group-hover:text-secondary transition-colors">
                      03
                    </span>
                  </div>

                  <h3 className="font-heading text-2xl text-secondary mb-2 group-hover:text-theme-1 transition-colors">
                    {h.consultingCardTitle}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-secondary font-secondary font-bold mb-3">
                    {h.consultingCardSubtitle}
                  </p>
                  <p className="text-sm text-secondary/80 leading-relaxed mb-6">
                    {h.consultingCardDesc}
                  </p>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-secondary/90 mb-8 border-t border-theme-9 pt-4">
                    {h.consultingCardBullets.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <span className="flex-none w-4 h-4 rounded-full bg-theme-1/15 text-theme-1 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={CALENDAR_BOOKING_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-3 px-5 rounded-xl border-2 border-secondary text-secondary font-bold hover:bg-secondary hover:text-primary transition-all duration-200 text-center inline-flex items-center justify-center gap-2 text-sm group-hover:shadow-md"
                >
                  <span>{h.consultingCardCta}</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
