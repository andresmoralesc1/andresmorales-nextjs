'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gauge, ArrowRight, Zap, ShieldCheck, Sparkles, Smartphone, Layout, Bot } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  locale?: string;
  t: Dictionary['speedAudit'];
}

export function SpeedAuditTeaser({ locale = 'es', t }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = url.trim();
    if (!clean) return;

    setIsSubmitting(true);
    const targetPath = `/${locale}/audit`;
    router.push(`${targetPath}?url=${encodeURIComponent(clean)}`);
  };

  return (
    <section id="speed-audit" className="relative z-20 -mt-8 sm:-mt-12 mb-16 sm:mb-20 scroll-mt-24">
      <div className="container-page">
        {/* Glossy Transparent Glass Container */}
        <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 p-6 sm:p-10 md:p-12 shadow-[0_12px_40px_rgba(30,24,16,0.06)] text-[#1E1810]">
          {/* Top reflection line */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Ambient subtle warm & blue glass glows */}
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#f96e03]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Copy & Value Proposition */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-stone-200/80 shadow-sm text-xs font-semibold text-stone-700">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                  <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                  <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
                  <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                </span>
                <span>{t.badge}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#1E1810] leading-tight font-heading">
                {t.teaserTitle}
              </h2>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl">
                {t.teaserDesc}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-stone-700 font-medium">
                <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200/60 shadow-xs">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  {t.badge4G}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200/60 shadow-xs">
                  <Layout className="w-4 h-4 text-[#f96e03]" />
                  {t.badgeVitals}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200/60 shadow-xs">
                  <Bot className="w-4 h-4 text-blue-600" />
                  {t.badgeConfidential}
                </span>
              </div>
            </div>

            {/* Right Column: Glossy Interactive Audit Input Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white/80 border border-white/95 p-5 sm:p-6 backdrop-blur-md shadow-[0_8px_24px_rgba(30,24,16,0.04)]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#f96e03] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.inputLabel}
                </p>
                <p className="text-sm text-stone-800 mb-3.5 font-semibold">
                  {t.inputPrompt}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={t.inputPlaceholder}
                      inputMode="url"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-stone-200/90 text-stone-900 placeholder:text-stone-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#f96e03] focus:border-transparent shadow-inner transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !url.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#f96e03] hover:bg-[#e05f00] text-white font-bold text-sm transition-all shadow-md shadow-[#f96e03]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Gauge className="w-4 h-4" />
                    <span>{isSubmitting ? t.btnScanning : t.btnSubmit}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-[11px] text-stone-500 text-center mt-3">
                  {t.trustNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
