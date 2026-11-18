'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Gauge,
  Zap,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  Search,
  Check,
  Layout,
  Bot,
} from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';

interface Props {
  locale: string;
  t: Dictionary['speedAudit'];
}

const LOCALIZED_COUNTRIES: Record<string, { name: string; label: string; flag: string }[]> = {
  en: [
    { name: 'United States', label: 'United States', flag: '🇺🇸' },
    { name: 'Colombia', label: 'Colombia', flag: '🇨🇴' },
    { name: 'United Kingdom', label: 'United Kingdom', flag: '🇬🇧' },
    { name: 'Canada', label: 'Canada', flag: '🇨🇦' },
    { name: 'Australia', label: 'Australia', flag: '🇦🇺' },
    { name: 'Brazil', label: 'Brazil', flag: '🇧🇷' },
    { name: 'Mexico', label: 'Mexico', flag: '🇲🇽' },
    { name: 'Spain', label: 'Spain', flag: '🇪🇸' },
  ],
  pt: [
    { name: 'Brasil', label: 'Brasil', flag: '🇧🇷' },
    { name: 'Portugal', label: 'Portugal', flag: '🇵🇹' },
    { name: 'Colômbia', label: 'Colômbia', flag: '🇨🇴' },
    { name: 'Estados Unidos', label: 'Estados Unidos', flag: '🇺🇸' },
    { name: 'México', label: 'México', flag: '🇲🇽' },
    { name: 'Chile', label: 'Chile', flag: '🇨🇱' },
    { name: 'Argentina', label: 'Argentina', flag: '🇦🇷' },
  ],
  es: [
    { name: 'Colombia', label: 'Colombia', flag: '🇨🇴' },
    { name: 'Estados Unidos', label: 'Estados Unidos', flag: '🇺🇸' },
    { name: 'México', label: 'México', flag: '🇲🇽' },
    { name: 'Brasil', label: 'Brasil', flag: '🇧🇷' },
    { name: 'Chile', label: 'Chile', flag: '🇨🇱' },
    { name: 'Perú', label: 'Perú', flag: '🇵🇪' },
    { name: 'Argentina', label: 'Argentina', flag: '🇦🇷' },
    { name: 'España', label: 'España', flag: '🇪🇸' },
  ],
};

export function AuditLandingClient({ locale, t }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultCountry = locale === 'en' ? 'United States' : locale === 'pt' ? 'Brasil' : 'Colombia';
  const countryList = LOCALIZED_COUNTRIES[locale] || LOCALIZED_COUNTRIES.es;
  const phonePlaceholder = locale === 'en' ? '+1 (555) 234-5678' : locale === 'pt' ? '+55 11 98765-4321' : '+57 300 123 4567';
  const emailPlaceholder = locale === 'en' ? 'contact@company.com' : locale === 'pt' ? 'contato@empresa.com.br' : 'contacto@empresa.com';

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState(defaultCountry);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const scanSteps = t.steps && t.steps.length > 0 ? t.steps : [
    'Conectando con Google Cloud PageSpeed Insights API...',
    'Emulando dispositivo móvil 4G (390 × 844 px)...',
    'Midiendo Core Web Vitals: LCP, FCP, TBT y CLS...',
    'Analizando scripts síncronos y bloqueo del hilo principal...',
    'Generando dictamen técnico de arquitectura y reporte confidencial...',
  ];

  // Prepopulate URL from query parameter if present
  useEffect(() => {
    const queryUrl = searchParams.get('url');
    if (queryUrl) {
      setUrl(queryUrl);
    }
    const queryCountry = searchParams.get('country');
    if (queryCountry) {
      setCountry(queryCountry);
    }
  }, [searchParams]);

  // Handle Scan Step animation
  useEffect(() => {
    if (status !== 'scanning') return;

    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < scanSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [status, scanSteps.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    setStatus('scanning');
    setCurrentStepIdx(0);
    setErrorMessage('');

    try {
      const res = await fetch('/api/audit/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          name: name.trim(),
          country,
          phone: phone.trim(),
          email: email.trim(),
          lang: locale,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || (locale === 'en' ? 'Audit request failed' : locale === 'pt' ? 'Falha na auditoria' : 'Error al ejecutar la auditoría'));
      }

      setStatus('success');

      // Auto redirect to confidential report in client's native language after 1.5s
      setTimeout(() => {
        const targetUrl = data.url || `/${locale}/audit/${data.slug}`;
        router.push(targetUrl);
      }, 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err.message ||
        (locale === 'en'
          ? 'Could not analyze website. Please check the URL and try again.'
          : locale === 'pt'
          ? 'Não foi possível analisar o site. Verifique a URL e tente novamente.'
          : 'No fue posible completar la auditoría. Por favor revisa la URL e intenta de nuevo.')
      );
    }
  };

  return (
    <div className="min-h-screen py-12 md:py-20 relative">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#f96e03]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page max-w-4xl mx-auto px-4 relative z-10">
        {/* Header Badge */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-sm text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
              <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
              <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
              <span className="w-2 h-2 rounded-full bg-[#34A853]" />
            </span>
            <span>{t.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1E1810] leading-tight font-heading">
            {t.pageTitle}
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {t.pageDesc}
          </p>
        </div>

        {/* Main Content Area: Glossy Frosted Glass Form */}
        {status === 'idle' && (
          <div className="bg-white/65 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_12px_40px_rgba(30,24,16,0.06)] overflow-hidden p-6 sm:p-10 transition-all">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Input (Highlighted) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-800 mb-2">
                  {t.urlLabel} <span className="text-[#f96e03]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/90 border border-stone-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f96e03] focus:border-transparent text-base sm:text-lg font-medium text-stone-900 transition-all placeholder:text-stone-400 shadow-inner"
                  />
                </div>
                <p className="text-xs text-stone-500 mt-2 font-medium">
                  {t.urlHint}
                </p>
              </div>

              {/* Grid: Name, Country, WhatsApp, Email */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-stone-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f96e03] text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    {t.countryLabel}
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-stone-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f96e03] text-sm text-stone-900"
                  >
                    {countryList.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={phonePlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-stone-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f96e03] text-sm text-stone-900"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    {t.phoneHint}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={emailPlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-stone-200/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f96e03] text-sm text-stone-900"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    {t.emailHint}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!url.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#f96e03] hover:bg-[#e05f00] text-white font-bold text-base transition-all shadow-lg shadow-[#f96e03]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Gauge className="w-5 h-5" />
                  <span>{t.btnStart}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-stone-600 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  {t.trustPrivate}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#f96e03]" />
                  {t.trustQuick}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  {t.trustNoSpam}
                </span>
              </div>
            </form>
          </div>
        )}

        {/* Scanning State: Glossy Dark Frosted Glass */}
        {status === 'scanning' && (
          <div className="bg-[#0A0D14]/90 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.25)] p-8 sm:p-12 text-white text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Animated Radar Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#f96e03]/30 animate-ping duration-1000" />
              <div className="absolute inset-2 rounded-full border border-blue-500/40 animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                <Gauge className="w-8 h-8 text-[#f96e03] animate-spin duration-3000" />
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[#f96e03] font-bold mb-2">
                {t.scanningBadge}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                {t.analyzingPrefix} <span className="text-[#f96e03]">{url}</span>
              </h2>
              <p className="text-stone-400 text-sm max-w-md mx-auto">
                {t.scanningSub}
              </p>
            </div>

            {/* Checklist of steps */}
            <div className="max-w-md mx-auto space-y-3 text-left">
              {scanSteps.map((step, idx) => {
                const isDone = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : isCurrent
                        ? 'bg-white/10 border-white/25 text-white font-medium shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-stone-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#f96e03] border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-stone-600 shrink-0" />
                    )}
                    <span className="text-xs sm:text-sm">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-[#0A0D14]/90 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.25)] p-8 sm:p-12 text-white text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              {t.successTitle}
            </h2>
            <p className="text-stone-300 text-sm max-w-md mx-auto">
              {t.successDesc}
            </p>
            <div className="w-6 h-6 rounded-full border-2 border-[#f96e03] border-t-transparent animate-spin mx-auto" />
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-rose-200 shadow-xl p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">{t.errorTitle}</h2>
              <p className="text-sm text-stone-600 max-w-md mx-auto">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-colors cursor-pointer"
            >
              <span>{t.btnRetry}</span>
            </button>
          </div>
        )}

        {/* Glossy 360 Pillars below Form */}
        <div className="grid sm:grid-cols-3 gap-6 mt-12 text-center sm:text-left">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1E1810]">{t.pillar1Title}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.pillar1Desc}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#f96e03]/10 text-[#f96e03] flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1E1810]">{t.pillar2Title}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.pillar2Desc}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/80 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1E1810]">{t.pillar3Title}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.pillar3Desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
