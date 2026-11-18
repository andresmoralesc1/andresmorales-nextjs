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

            {/* WhatsApp Quick Alternative Banner — Brand-aligned warm theme */}
            <div className="rounded-2xl bg-primary border border-theme-9 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-theme-1/15 text-theme-1 flex items-center justify-center shrink-0 border border-theme-1/25">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366]" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-secondary">
                    {lang === 'es' ? '¿Prefieres responder por WhatsApp?' : lang === 'pt' ? 'Prefere responder pelo WhatsApp?' : 'Prefer chatting on WhatsApp?'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-secondary/70">
                    {lang === 'es'
                      ? 'Si prefieres contármelo por chat o notas de voz, escríbeme y estructuramos tu proyecto juntos.'
                      : lang === 'pt'
                      ? 'Se preferir contar por chat ou áudio direto, me escreva e estruturamos seu projeto juntos.'
                      : 'If you prefer direct messaging or voice notes, chat with me directly and we will structure it together.'}
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/573161482507?text=${encodeURIComponent(
                  lang === 'es'
                    ? `Hola Andrés, prefiero contarte sobre mi proyecto web/automatización directamente por WhatsApp.`
                    : lang === 'pt'
                    ? `Olá Andrés, prefiro falar sobre meu projeto web/automação diretamente pelo WhatsApp.`
                    : `Hi Andrés, I prefer telling you about my web/automation project directly via WhatsApp.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-theme-1 hover:bg-theme-2 text-secondary font-secondary font-bold text-xs transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
              >
                <span>{lang === 'es' ? 'Escribir por WhatsApp' : lang === 'pt' ? 'Escrever no WhatsApp' : 'Open WhatsApp'}</span>
                <span>→</span>
              </a>
            </div>

            {/* Active Wizard Component */}
            {activePath === 'web' && (
              <BriefWebWizard dict={dict} lang={lang} />
            )}

            {activePath === 'automation' && (
              <BriefWizard dict={dict} lang={lang} />
            )}

            {activePath === 'consulting' && (
              <div className="rounded-2xl bg-primary border border-theme-9 shadow-sm p-5 sm:p-8 md:p-10 max-w-3xl mx-auto">
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
            className="rounded-2xl bg-primary border border-theme-9 shadow-sm p-4 sm:p-8 md:p-10"
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
                className="group cursor-pointer flex flex-col justify-between rounded-2xl border-2 border-theme-9 hover:border-theme-1 bg-background hover:bg-theme-5/60 p-5 sm:p-7 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(249,110,3,0.12)] relative"
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
                className="group cursor-pointer flex flex-col justify-between rounded-2xl border-2 border-theme-9 hover:border-theme-1 bg-background hover:bg-theme-5/60 p-5 sm:p-7 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(249,110,3,0.12)] relative"
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
                className="group cursor-pointer flex flex-col justify-between rounded-2xl border-2 border-theme-9 hover:border-theme-1 bg-background hover:bg-theme-5/60 p-5 sm:p-7 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(249,110,3,0.12)] relative"
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

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPath('consulting');
                  }}
                  className="w-full py-3 px-5 rounded-xl bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-all duration-200 text-center inline-flex items-center justify-center gap-2 shadow-sm text-sm group-hover:shadow-md"
                >
                  <span>{h.consultingCardCta}</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
