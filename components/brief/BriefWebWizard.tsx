'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { track } from '@/lib/analytics';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import type { Dictionary, Locale } from '@/lib/i18n';

export type BriefWebMode = 'express' | 'detailed';

export type BriefWebData = {
  // Mode
  mode: BriefWebMode | null;

  // Step 1 — Contact & Basics
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  currentSite: string;

  // Web type & Goal
  webType: 'landing' | 'corporate' | 'ecommerce' | 'webapp' | 'redesign' | 'other' | '';
  webTypeOther: string;
  goal: 'leads' | 'sales' | 'credibility' | 'automation' | 'launch' | 'other' | '';
  goalOther: string;
  references: string;
  referencesNotes: string;

  // Detailed: Brand & Identity
  brandSummary: string;
  brandValues: string;
  logoStatus: 'vector' | 'image' | 'need_design' | 'partial' | '';
  colors: string;
  vibes: string[];

  // Detailed: Audience
  audience: string;
  mainCta: string;

  // Detailed: Pages & Features
  pagesNeeded: string[];
  featuresNeeded: string[];

  // Detailed: Content & Resources
  contentOrigin: 'client' | 'need_copywriting' | 'mix' | 'existing' | '';
  mediaStatus: 'yes' | 'partial' | 'need_help' | '';
  languages: string;
  domainHosting: 'both' | 'domain_only' | 'none' | 'not_sure' | '';

  // Logistics & Budget
  budget: 'under2k' | '2to5k' | '5to15k' | '15to50k' | 'flexible' | '';
  timeline: 'asap' | '1month' | '1to2months' | 'flexible' | '';
  notes: string;
};

type WebTypeValue = Exclude<BriefWebData['webType'], ''>;
type GoalValue = Exclude<BriefWebData['goal'], ''>;
type BudgetValue = Exclude<BriefWebData['budget'], ''>;
type TimelineValue = Exclude<BriefWebData['timeline'], ''>;
type LogoValue = Exclude<BriefWebData['logoStatus'], ''>;
type ContentValue = Exclude<BriefWebData['contentOrigin'], ''>;
type MediaValue = Exclude<BriefWebData['mediaStatus'], ''>;
type DomainValue = Exclude<BriefWebData['domainHosting'], ''>;

const WEB_TYPE_ICONS: Record<WebTypeValue, string> = {
  landing: '🚀',
  corporate: '🏢',
  ecommerce: '🛍️',
  webapp: '💻',
  redesign: '✨',
  other: '🔧',
};

const WEB_TYPE_VALUES: WebTypeValue[] = ['landing', 'corporate', 'ecommerce', 'webapp', 'redesign', 'other'];
const GOAL_VALUES: GoalValue[] = ['leads', 'sales', 'credibility', 'automation', 'launch', 'other'];
const BUDGET_VALUES: BudgetValue[] = ['under2k', '2to5k', '5to15k', '15to50k', 'flexible'];
const TIMELINE_VALUES: TimelineValue[] = ['asap', '1month', '1to2months', 'flexible'];
const LOGO_VALUES: LogoValue[] = ['vector', 'image', 'need_design', 'partial'];
const CONTENT_VALUES: ContentValue[] = ['client', 'need_copywriting', 'mix', 'existing'];
const MEDIA_VALUES: MediaValue[] = ['yes', 'partial', 'need_help'];
const DOMAIN_VALUES: DomainValue[] = ['both', 'domain_only', 'none', 'not_sure'];

const INITIAL: BriefWebData = {
  mode: null,
  name: '',
  email: '',
  company: '',
  role: '',
  phone: '',
  currentSite: '',
  webType: '',
  webTypeOther: '',
  goal: '',
  goalOther: '',
  references: '',
  referencesNotes: '',
  brandSummary: '',
  brandValues: '',
  logoStatus: '',
  colors: '',
  vibes: [],
  audience: '',
  mainCta: '',
  pagesNeeded: [],
  featuresNeeded: [],
  contentOrigin: '',
  mediaStatus: '',
  languages: '',
  domainHosting: '',
  budget: '',
  timeline: '',
  notes: '',
};

const STORAGE_KEY = 'portfolio-brief-web-draft-v1';
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type DraftEnvelope = { savedAt: number; data: Partial<BriefWebData>; step: number };

function loadDraft(): { data: BriefWebData; step: number } {
  if (typeof window === 'undefined') return { data: INITIAL, step: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: INITIAL, step: 0 };
    const parsed = JSON.parse(raw) as DraftEnvelope;
    if (parsed && typeof parsed === 'object' && 'savedAt' in parsed && 'data' in parsed) {
      if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
        window.localStorage.removeItem(STORAGE_KEY);
        return { data: INITIAL, step: 0 };
      }
      return {
        data: { ...INITIAL, ...parsed.data },
        step: typeof parsed.step === 'number' ? parsed.step : 0,
      };
    }
    return { data: INITIAL, step: 0 };
  } catch {
    return { data: INITIAL, step: 0 };
  }
}

function saveDraft(d: BriefWebData, step: number) {
  try {
    const envelope: DraftEnvelope = { savedAt: Date.now(), data: d, step };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Ignore quota errors
  }
}

function isStepValid(mode: BriefWebMode, step: number, d: BriefWebData): boolean {
  const emailValid = d.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim());

  if (mode === 'express') {
    switch (step) {
      case 0:
        return emailValid;
      case 1:
        if (!d.webType) return false;
        if (d.webType === 'other' && !d.webTypeOther.trim()) return false;
        if (!d.goal) return false;
        if (d.goal === 'other' && !d.goalOther.trim()) return false;
        return true;
      case 2:
        return Boolean(d.budget) && Boolean(d.timeline);
      default:
        return false;
    }
  }

  // Detailed mode (6 steps)
  switch (step) {
    case 0:
      return emailValid;
    case 1:
      return Boolean(d.logoStatus);
    case 2:
      return d.audience.trim().length >= 5 || d.mainCta.trim().length >= 5;
    case 3:
      return d.pagesNeeded.length > 0 || d.featuresNeeded.length > 0;
    case 4:
      return Boolean(d.contentOrigin) && Boolean(d.mediaStatus);
    case 5:
      return Boolean(d.budget) && Boolean(d.timeline);
    default:
      return false;
  }
}

function filledFieldCount(d: BriefWebData): number {
  let n = 0;
  for (const [k, v] of Object.entries(d)) {
    if (k === 'mode') continue;
    if (Array.isArray(v) ? v.length > 0 : Boolean(v)) n++;
  }
  return n;
}

export default function BriefWebWizard({
  dict,
  lang,
  onBackToHub,
}: {
  dict: Dictionary;
  lang: Locale;
  onBackToHub?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wizardRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<BriefWebData>(INITIAL);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [mountedAt, setMountedAt] = useState(0);

  useEffect(() => {
    setMountedAt(Date.now());
  }, []);

  // Hydrate draft from localStorage on mount
  useEffect(() => {
    const loaded = loadDraft();
    const urlMode = searchParams.get('mode');
    const validUrlMode = urlMode === 'express' || urlMode === 'detailed' ? (urlMode as BriefWebMode) : null;

    if (validUrlMode) {
      setData({ ...loaded.data, mode: validUrlMode });
      setStep(loaded.step);
    } else {
      setData(loaded.data);
      setStep(loaded.step);
    }
    setHydrated(true);
  }, [searchParams]);

  // Save draft on every change
  useEffect(() => {
    if (!hydrated) return;
    saveDraft(data, step);
  }, [data, step, hydrated]);

  function update<K extends keyof BriefWebData>(key: K, value: BriefWebData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleArrayItem(key: 'vibes' | 'pagesNeeded' | 'featuresNeeded', item: string) {
    setData((d) => {
      const current = d[key] as string[];
      const next = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
      return { ...d, [key]: next };
    });
  }

  function handleSelectMode(m: BriefWebMode) {
    track('brief_web_mode_selected', { mode: m });
    setData((d) => ({ ...d, mode: m }));
    setStep(0);
    setTimeout(() => {
      wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function handleSwitchMode() {
    if (filledFieldCount(data) > 0) {
      if (typeof window !== 'undefined' && !window.confirm(dict.briefWeb.switchModeConfirm)) {
        return;
      }
    }
    setData((d) => ({ ...d, mode: null }));
    setStep(0);
  }

  function clearDraft() {
    if (typeof window !== 'undefined' && !window.confirm(dict.briefWeb.wizardStartOverConfirm)) {
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    track('brief_web_draft_cleared');
    setData(INITIAL);
    setStep(0);
  }

  const mode = data.mode;
  const stepCount = mode === 'express' ? 3 : 6;
  const isLastStep = mode ? step === stepCount - 1 : false;
  const stepValid = mode ? isStepValid(mode, step, data) : false;
  const filled = filledFieldCount(data);

  const stepLabels = useMemo(() => {
    if (mode === 'express') {
      return [
        dict.briefWeb.expressStep1Title,
        dict.briefWeb.expressStep2Title,
        dict.briefWeb.expressStep3Title,
      ];
    }
    return [
      dict.briefWeb.detailedStep1Title,
      dict.briefWeb.detailedStep2Title,
      dict.briefWeb.detailedStep3Title,
      dict.briefWeb.detailedStep4Title,
      dict.briefWeb.detailedStep5Title,
      dict.briefWeb.detailedStep6Title,
    ];
  }, [mode, dict]);

  const wizardStep = dict.briefWeb.wizardStep
    .replace('{current}', String(step + 1))
    .replace('{total}', String(stepCount));

  const draftSavedLabel = (filled === 1 ? dict.briefWeb.wizardDraftSaved : dict.briefWeb.wizardDraftSavedPlural)
    .replace('{count}', String(filled));

  async function handleSubmit() {
    if (!mode) return;
    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/brief-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          mode,
          lang,
          _t: Date.now() - mountedAt,
        }),
      });

      const json: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json && typeof json === 'object' && 'error' in json && typeof (json as { error: unknown }).error === 'string'
            ? (json as { error: string }).error
            : `Server returned ${res.status}`;
        track('brief_web_submit_error', { status: res.status, message: msg });
        setServerError(msg);
        setSubmitting(false);
        return;
      }

      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      track('brief_web_submitted', {
        mode,
        webType: data.webType,
        budget: data.budget,
        timeline: data.timeline,
      });

      setSubmitted(true);
      const thanksPath = lang === 'en' ? '/brief/thanks' : `/${lang}/brief/thanks`;
      router.push(thanksPath);
    } catch (err) {
      track('brief_web_submit_error', {
        message: err instanceof Error ? err.message : 'Network error',
      });
      setServerError(err instanceof Error ? err.message : 'Network error');
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (!stepValid || !mode) return;
    const fromStep = step;
    if (isLastStep) {
      handleSubmit();
    } else {
      track('brief_web_step_advanced', {
        mode,
        from_step: fromStep + 1,
        from_label: stepLabels[fromStep],
      });
      setStep((s) => Math.min(s + 1, stepCount - 1));
      setTimeout(() => {
        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  function handleBack() {
    if (step === 0) return;
    setStep((s) => Math.max(s - 1, 0));
    setTimeout(() => {
      wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // ── Render Mode Selector if no mode is active ──
  if (!mode) {
    return (
      <div ref={wizardRef} className="rounded-2xl bg-primary border border-theme-9 shadow-sm p-6 sm:p-8 md:p-10">
        {onBackToHub && (
          <div className="mb-6">
            <button
              type="button"
              onClick={onBackToHub}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-secondary font-bold text-secondary/70 hover:text-accent transition-colors py-1.5 px-3 rounded-lg bg-theme-5/50 border border-theme-9"
            >
              <span aria-hidden="true">←</span> {dict.briefHub?.changePath || 'Cambiar tipo de proyecto'}
            </button>
          </div>
        )}
        <div className="text-center max-w-xl mx-auto mb-8 md:mb-10">
          <h2 className="font-heading text-2xl sm:text-3xl text-secondary mb-3">
            {dict.briefWeb.selectorTitle}
          </h2>
          <p className="text-secondary/80 text-sm sm:text-base leading-relaxed">
            {dict.briefWeb.selectorSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card Option 1: Express (3-5 min) */}
          <div
            onClick={() => handleSelectMode('express')}
            className="group cursor-pointer flex flex-col justify-between rounded-2xl border-2 border-theme-9 hover:border-theme-1 bg-background hover:bg-theme-5/50 p-6 md:p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-theme-1/15 text-secondary border border-theme-1/30">
                  {dict.briefWeb.modeExpressBadge}
                </span>
                <span className="text-xs uppercase tracking-wider text-secondary/60 font-secondary font-bold">
                  3 {lang === 'en' ? 'steps' : 'pasos'}
                </span>
              </div>
              <h3 className="font-heading text-2xl text-secondary mb-2 group-hover:text-theme-1 transition-colors">
                {dict.briefWeb.modeExpressTitle}
              </h3>
              <p className="text-xs uppercase tracking-wider text-secondary font-secondary font-bold mb-3">
                {dict.briefWeb.modeExpressSubtitle}
              </p>
              <p className="text-sm text-secondary/80 leading-relaxed mb-6">
                {dict.briefWeb.modeExpressDesc}
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-secondary/90 mb-8 border-t border-theme-9 pt-4">
                <li className="flex items-center gap-2.5">
                  <span className="text-theme-1 font-bold">✓</span>
                  <span>{dict.briefWeb.modeExpressBullet1}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-theme-1 font-bold">✓</span>
                  <span>{dict.briefWeb.modeExpressBullet2}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-theme-1 font-bold">✓</span>
                  <span>{dict.briefWeb.modeExpressBullet3}</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMode('express');
              }}
              className="w-full py-3 px-5 rounded-lg bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-colors text-center inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{dict.briefWeb.modeExpressCta}</span>
            </button>
          </div>

          {/* Card Option 2: Detailed (15-20 min) */}
          <div
            onClick={() => handleSelectMode('detailed')}
            className="group cursor-pointer flex flex-col justify-between rounded-2xl border-2 border-theme-9 hover:border-theme-1 bg-background hover:bg-theme-5/50 p-6 md:p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-theme-1/15 text-secondary border border-theme-1/30">
                  {dict.briefWeb.modeDetailedBadge}
                </span>
                <span className="text-xs uppercase tracking-wider text-secondary/60 font-secondary font-bold">
                  6 {lang === 'en' ? 'steps' : 'pasos'}
                </span>
              </div>
              <h3 className="font-heading text-2xl text-secondary mb-2 group-hover:text-theme-1 transition-colors">
                {dict.briefWeb.modeDetailedTitle}
              </h3>
              <p className="text-xs uppercase tracking-wider text-secondary font-secondary font-bold mb-3">
                {dict.briefWeb.modeDetailedSubtitle}
              </p>
              <p className="text-sm text-secondary/80 leading-relaxed mb-6">
                {dict.briefWeb.modeDetailedDesc}
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-secondary/90 mb-8 border-t border-theme-9 pt-4">
                <li className="flex items-center gap-2.5">
                  <span className="text-theme-1 font-bold">✓</span>
                  <span>{dict.briefWeb.modeDetailedBullet1}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-theme-1 font-bold">✓</span>
                  <span>{dict.briefWeb.modeDetailedBullet2}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-theme-1 font-bold">✓</span>
                  <span>{dict.briefWeb.modeDetailedBullet3}</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMode('detailed');
              }}
              className="w-full py-3 px-5 rounded-lg bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-colors text-center inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{dict.briefWeb.modeDetailedCta}</span>
            </button>
          </div>
        </div>

        {/* Escape hatch on selector */}
        <div className="mt-8 pt-6 border-t border-theme-9 text-center">
          <p className="text-xs sm:text-sm text-secondary/70">
            {dict.briefWeb.wizardEscapeHatch}{' '}
            <a
              href={CALENDAR_BOOKING_URL}
              target="_blank"
              rel="noreferrer"
              className="text-secondary hover:underline font-medium"
            >
              {dict.briefWeb.wizardEscapeHatchCta}
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Render Wizard for Selected Mode ──
  return (
    <div ref={wizardRef} className="rounded-2xl bg-primary border border-theme-9 shadow-sm overflow-hidden">
      {/* Top Header & Progress */}
      <div className="px-6 pt-6 pb-4 border-b border-theme-9 bg-background">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-secondary uppercase tracking-wider text-secondary font-bold">
              {wizardStep}
            </span>
            <span className="text-secondary/40">·</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-theme-1/10 text-secondary border border-theme-1/20">
              {mode === 'express' ? dict.briefWeb.modeExpressBadge : dict.briefWeb.modeDetailedBadge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="text-xs text-text hover:text-accent underline transition-colors"
              >
                {dict.briefHub?.changePath || 'Cambiar tipo de proyecto'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSwitchMode}
              className="text-xs text-text hover:text-accent underline transition-colors"
            >
              {dict.briefWeb.switchModeButton}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-theme-9 overflow-hidden">
          <div
            className="h-full bg-theme-1 transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / stepCount) * 100}%` }}
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={stepCount}
          />
        </div>

        {/* Desktop Step Nav */}
        <div className="hidden md:flex justify-between mt-3 text-xs text-text">
          {stepLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-label={
                i < step
                  ? `Go back to step ${i + 1}: ${label}`
                  : i === step
                    ? `Current step: ${label}`
                    : `Step ${i + 1}: ${label}`
              }
              className={`transition-colors ${
                i === step
                  ? 'text-secondary font-medium'
                  : i < step
                    ? 'text-text hover:text-accent cursor-pointer'
                    : 'text-text/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form
        className="p-6 md:p-8"
        onSubmit={(e) => e.preventDefault()}
        data-webmcp-form-id="brief-web"
        data-webmcp-name="Web project brief wizard"
      >
        {mode === 'express' ? (
          <>
            {step === 0 && <StepContact data={data} update={update} dict={dict} isDetailed={false} />}
            {step === 1 && <StepWebBasics data={data} update={update} dict={dict} />}
            {step === 2 && <StepLogistics data={data} update={update} dict={dict} mode="express" />}
          </>
        ) : (
          <>
            {step === 0 && <StepContact data={data} update={update} dict={dict} isDetailed={true} />}
            {step === 1 && (
              <StepVisualIdentity
                data={data}
                update={update}
                toggleVibe={(v) => toggleArrayItem('vibes', v)}
                dict={dict}
              />
            )}
            {step === 2 && <StepAudience data={data} update={update} dict={dict} />}
            {step === 3 && (
              <StepStructure
                data={data}
                togglePage={(p) => toggleArrayItem('pagesNeeded', p)}
                toggleFeature={(f) => toggleArrayItem('featuresNeeded', f)}
                dict={dict}
              />
            )}
            {step === 4 && <StepContent data={data} update={update} dict={dict} />}
            {step === 5 && <StepLogistics data={data} update={update} dict={dict} mode="detailed" />}
          </>
        )}

        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {serverError}
          </div>
        )}

        {/* Escape hatch inside wizard */}
        {(step === 0 || step === 1) && (
          <div className="mt-8 pt-5 border-t border-theme-9 text-center">
            <p className="text-xs text-secondary/70">
              {dict.briefWeb.wizardEscapeHatch}{' '}
              <a
                href={CALENDAR_BOOKING_URL}
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:underline font-medium"
              >
                {dict.briefWeb.wizardEscapeHatchCta}
              </a>
            </p>
          </div>
        )}
      </form>

      {/* Footer Nav Controls */}
      <div className="px-6 md:px-8 py-4 bg-background border-t border-theme-9 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium text-secondary hover:text-accent transition-colors disabled:opacity-50"
            >
              {dict.briefWeb.wizardBack}
            </button>
          ) : (
            <button
              type="button"
              onClick={clearDraft}
              className="px-3 py-2 min-h-[44px] text-xs text-text hover:text-text underline"
              title={dict.briefWeb.wizardStartOverConfirm}
            >
              {dict.briefWeb.wizardStartOver}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {hydrated && filled > 0 && (
            <span
              className="text-xs text-text inline-flex items-center gap-1"
              title={dict.briefWeb.wizardDraftTitle}
            >
              {draftSavedLabel}
            </span>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!stepValid || submitting}
            aria-busy={submitting}
            aria-disabled={!stepValid}
            title={!stepValid ? dict.briefWeb.wizardDisabledTitle : undefined}
            className="px-6 py-2.5 rounded-lg bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner /> {dict.briefWeb.wizardSending}
              </>
            ) : isLastStep ? (
              dict.briefWeb.wizardSubmit
            ) : (
              dict.briefWeb.wizardNext
            )}
          </button>
        </div>
      </div>

      {submitted && (
        <div className="px-6 py-4 bg-green-50 text-green-700 text-sm text-center">
          {dict.briefWeb.wizardRedirecting}
        </div>
      )}
    </div>
  );
}

// ── Step Subcomponents ──────────────────────────────────────────────────

function StepContact({
  data,
  update,
  dict,
  isDetailed,
}: {
  data: BriefWebData;
  update: <K extends keyof BriefWebData>(k: K, v: BriefWebData[K]) => void;
  dict: Dictionary;
  isDetailed: boolean;
}) {
  const emailShape = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">
        {isDetailed ? dict.briefWeb.detailedStep1Title : dict.briefWeb.expressStep1Title}
      </h2>

      {/* Honey-pot for bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        onChange={() => {}}
      />

      <Field label={dict.briefWeb.fieldName} required>
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          autoFocus
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder={dict.briefWeb.fieldNamePlaceholder}
          className="input"
        />
      </Field>

      <Field label={dict.briefWeb.fieldEmail} required error={!emailShape ? dict.briefWeb.fieldEmailError : null}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder={dict.briefWeb.fieldEmailPlaceholder}
          className="input"
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-5">
        <Field label={dict.briefWeb.fieldCompany} optional>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            value={data.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder={dict.briefWeb.fieldCompanyPlaceholder}
            className="input"
          />
        </Field>
        <Field label={dict.briefWeb.fieldRole} optional>
          <input
            type="text"
            name="role"
            autoComplete="organization-title"
            value={data.role}
            onChange={(e) => update('role', e.target.value)}
            placeholder={dict.briefWeb.fieldRolePlaceholder}
            className="input"
          />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Field label={dict.briefWeb.fieldPhone} optional>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder={dict.briefWeb.fieldPhonePlaceholder}
            className="input"
          />
        </Field>
        <Field label={dict.briefWeb.fieldCurrentSite} optional>
          <input
            type="url"
            name="currentSite"
            value={data.currentSite}
            onChange={(e) => update('currentSite', e.target.value)}
            placeholder={dict.briefWeb.fieldCurrentSitePlaceholder}
            className="input"
          />
        </Field>
      </div>

      {isDetailed && (
        <>
          <Field label={dict.briefWeb.fieldBrandSummary} optional>
            <textarea
              name="brandSummary"
              rows={3}
              value={data.brandSummary}
              onChange={(e) => update('brandSummary', e.target.value)}
              placeholder={dict.briefWeb.fieldBrandSummaryPlaceholder}
              className="input resize-y"
            />
          </Field>
          <Field label={dict.briefWeb.fieldBrandValues} optional>
            <input
              type="text"
              name="brandValues"
              value={data.brandValues}
              onChange={(e) => update('brandValues', e.target.value)}
              placeholder={dict.briefWeb.fieldBrandValuesPlaceholder}
              className="input"
            />
          </Field>
        </>
      )}
    </div>
  );
}

function StepWebBasics({
  data,
  update,
  dict,
}: {
  data: BriefWebData;
  update: <K extends keyof BriefWebData>(k: K, v: BriefWebData[K]) => void;
  dict: Dictionary;
}) {
  const webTypeOptions = WEB_TYPE_VALUES.map((val) => ({
    value: val,
    label: dict.briefWeb.webTypes[val],
    icon: WEB_TYPE_ICONS[val],
  }));

  const goalOptions = GOAL_VALUES.map((val) => ({
    value: val,
    label: dict.briefWeb.goals[val],
  }));

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl">{dict.briefWeb.expressStep2Title}</h2>

      <RadioGroup
        name="webType"
        legend={dict.briefWeb.fieldWebTypeLegend}
        required
        value={data.webType}
        onChange={(v) => update('webType', v)}
        options={webTypeOptions}
        layout="grid-2"
      />

      {data.webType === 'other' && (
        <Field label={dict.briefWeb.fieldWebTypeOther} required>
          <input
            type="text"
            value={data.webTypeOther}
            onChange={(e) => update('webTypeOther', e.target.value)}
            placeholder={dict.briefWeb.fieldWebTypeOtherPlaceholder}
            className="input"
          />
        </Field>
      )}

      <RadioGroup
        name="goal"
        legend={dict.briefWeb.fieldGoalLegend}
        required
        value={data.goal}
        onChange={(v) => update('goal', v)}
        options={goalOptions}
        layout="grid-2"
      />

      {data.goal === 'other' && (
        <Field label={dict.briefWeb.fieldGoalOther} required>
          <input
            type="text"
            value={data.goalOther}
            onChange={(e) => update('goalOther', e.target.value)}
            placeholder={dict.briefWeb.fieldGoalOtherPlaceholder}
            className="input"
          />
        </Field>
      )}

      <Field label={dict.briefWeb.fieldReferences} optional>
        <textarea
          name="references"
          rows={3}
          value={data.references}
          onChange={(e) => update('references', e.target.value)}
          placeholder={dict.briefWeb.fieldReferencesPlaceholder}
          className="input resize-y"
        />
      </Field>
    </div>
  );
}

function StepVisualIdentity({
  data,
  update,
  toggleVibe,
  dict,
}: {
  data: BriefWebData;
  update: <K extends keyof BriefWebData>(k: K, v: BriefWebData[K]) => void;
  toggleVibe: (vibe: string) => void;
  dict: Dictionary;
}) {
  const logoOptions = LOGO_VALUES.map((val) => ({
    value: val,
    label: dict.briefWeb.logoOptions[val],
  }));

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl">{dict.briefWeb.detailedStep2Title}</h2>

      <RadioGroup
        name="logoStatus"
        legend={dict.briefWeb.fieldLogoLegend}
        required
        value={data.logoStatus}
        onChange={(v) => update('logoStatus', v)}
        options={logoOptions}
        layout="grid-2"
      />

      <Field label={dict.briefWeb.fieldColors} optional>
        <input
          type="text"
          name="colors"
          value={data.colors}
          onChange={(e) => update('colors', e.target.value)}
          placeholder={dict.briefWeb.fieldColorsPlaceholder}
          className="input"
        />
      </Field>

      <fieldset>
        <legend className="block text-sm font-medium text-secondary mb-2">
          {dict.briefWeb.fieldVibeLegend}
        </legend>
        <div className="flex flex-wrap gap-2">
          {dict.briefWeb.vibes.map((vibe) => {
            const selected = data.vibes.includes(vibe);
            return (
              <button
                type="button"
                key={vibe}
                aria-pressed={selected}
                onClick={() => toggleVibe(vibe)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm border transition-all duration-200 inline-flex items-center gap-1.5 ${
                  selected
                    ? 'border-theme-1 bg-theme-1/10 text-secondary font-bold ring-1 ring-theme-1/30 shadow-sm scale-[1.02]'
                    : 'border-theme-9 text-text hover:border-theme-1/40 hover:bg-theme-5/50 hover:text-secondary bg-primary'
                }`}
              >
                <span className={selected ? 'text-theme-1 font-bold' : 'text-secondary/40'}>
                  {selected ? '✓' : '+'}
                </span>
                <span>{vibe}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label={dict.briefWeb.fieldReferences} optional>
        <textarea
          name="references"
          rows={3}
          value={data.references}
          onChange={(e) => update('references', e.target.value)}
          placeholder={dict.briefWeb.fieldReferencesPlaceholder}
          className="input resize-y"
        />
      </Field>

      <Field label={dict.briefWeb.fieldReferencesNotes} optional>
        <input
          type="text"
          name="referencesNotes"
          value={data.referencesNotes}
          onChange={(e) => update('referencesNotes', e.target.value)}
          placeholder={dict.briefWeb.fieldReferencesNotesPlaceholder}
          className="input"
        />
      </Field>
    </div>
  );
}

function StepAudience({
  data,
  update,
  dict,
}: {
  data: BriefWebData;
  update: <K extends keyof BriefWebData>(k: K, v: BriefWebData[K]) => void;
  dict: Dictionary;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl">{dict.briefWeb.detailedStep3Title}</h2>

      <Field label={dict.briefWeb.fieldAudience} required>
        <textarea
          name="audience"
          rows={4}
          value={data.audience}
          onChange={(e) => update('audience', e.target.value)}
          placeholder={dict.briefWeb.fieldAudiencePlaceholder}
          className="input resize-y"
        />
      </Field>

      <Field label={dict.briefWeb.fieldMainCta} optional>
        <input
          type="text"
          name="mainCta"
          value={data.mainCta}
          onChange={(e) => update('mainCta', e.target.value)}
          placeholder={dict.briefWeb.fieldMainCtaPlaceholder}
          className="input"
        />
      </Field>
    </div>
  );
}

function StepStructure({
  data,
  togglePage,
  toggleFeature,
  dict,
}: {
  data: BriefWebData;
  togglePage: (page: string) => void;
  toggleFeature: (feature: string) => void;
  dict: Dictionary;
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl">{dict.briefWeb.detailedStep4Title}</h2>

      <fieldset>
        <legend className="block text-sm font-medium text-secondary mb-2">
          {dict.briefWeb.fieldPagesLegend}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {dict.briefWeb.pageOptions.map((page) => {
            const selected = data.pagesNeeded.includes(page);
            return (
              <label
                key={page}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-xs sm:text-sm font-medium flex items-center justify-between gap-2 ${
                  selected
                    ? 'border-theme-1 bg-theme-1/10 text-secondary font-bold shadow-sm ring-1 ring-theme-1/30 scale-[1.01]'
                    : 'border-theme-9 bg-primary text-text hover:border-theme-1/40 hover:bg-theme-5/50 hover:text-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => togglePage(page)}
                    className="sr-only"
                  />
                  <span>{page}</span>
                </div>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] flex-none transition-colors ${
                    selected
                      ? 'border-theme-1 bg-theme-1 text-secondary font-bold'
                      : 'border-theme-9 bg-background text-secondary/40'
                  }`}
                >
                  {selected ? '✓' : '+'}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-sm font-medium text-secondary mb-2">
          {dict.briefWeb.fieldFeaturesLegend}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dict.briefWeb.featureOptions.map((feature) => {
            const selected = data.featuresNeeded.includes(feature);
            return (
              <label
                key={feature}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-xs sm:text-sm font-medium flex items-center justify-between gap-2 ${
                  selected
                    ? 'border-theme-1 bg-theme-1/10 text-secondary font-bold shadow-sm ring-1 ring-theme-1/30 scale-[1.01]'
                    : 'border-theme-9 bg-primary text-text hover:border-theme-1/40 hover:bg-theme-5/50 hover:text-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleFeature(feature)}
                    className="sr-only"
                  />
                  <span>{feature}</span>
                </div>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] flex-none transition-colors ${
                    selected
                      ? 'border-theme-1 bg-theme-1 text-secondary font-bold'
                      : 'border-theme-9 bg-background text-secondary/40'
                  }`}
                >
                  {selected ? '✓' : '+'}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function StepContent({
  data,
  update,
  dict,
}: {
  data: BriefWebData;
  update: <K extends keyof BriefWebData>(k: K, v: BriefWebData[K]) => void;
  dict: Dictionary;
}) {
  const contentOptions = CONTENT_VALUES.map((val) => ({
    value: val,
    label: dict.briefWeb.contentOrigins[val],
  }));

  const mediaOptions = MEDIA_VALUES.map((val) => ({
    value: val,
    label: dict.briefWeb.mediaOptions[val],
  }));

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl">{dict.briefWeb.detailedStep5Title}</h2>

      <RadioGroup
        name="contentOrigin"
        legend={dict.briefWeb.fieldContentOriginLegend}
        required
        value={data.contentOrigin}
        onChange={(v) => update('contentOrigin', v)}
        options={contentOptions}
        layout="grid-2"
      />

      <RadioGroup
        name="mediaStatus"
        legend={dict.briefWeb.fieldMediaLegend}
        required
        value={data.mediaStatus}
        onChange={(v) => update('mediaStatus', v)}
        options={mediaOptions}
        layout="grid-2"
      />

      <Field label={dict.briefWeb.fieldLanguages} optional>
        <input
          type="text"
          name="languages"
          value={data.languages}
          onChange={(e) => update('languages', e.target.value)}
          placeholder={dict.briefWeb.fieldLanguagesPlaceholder}
          className="input"
        />
      </Field>
    </div>
  );
}

function StepLogistics({
  data,
  update,
  dict,
  mode,
}: {
  data: BriefWebData;
  update: <K extends keyof BriefWebData>(k: K, v: BriefWebData[K]) => void;
  dict: Dictionary;
  mode: BriefWebMode;
}) {
  const budgetOptions = BUDGET_VALUES.map((val) => ({
    value: val,
    label: dict.briefWeb.budgets[val],
  }));

  const timelineOptions = TIMELINE_VALUES.map((val) => ({
    value: val,
    label: dict.briefWeb.timelines[val],
  }));

  const domainOptions = DOMAIN_VALUES.map((val) => ({
    value: val,
    label: dict.briefWeb.domainHostingOptions[val],
  }));

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl">
        {mode === 'express' ? dict.briefWeb.expressStep3Title : dict.briefWeb.detailedStep6Title}
      </h2>

      {mode === 'detailed' && (
        <RadioGroup
          name="domainHosting"
          legend={dict.briefWeb.fieldDomainHostingLegend}
          optional
          value={data.domainHosting}
          onChange={(v) => update('domainHosting', v)}
          options={domainOptions}
          layout="grid-2"
        />
      )}

      <RadioGroup
        name="budget"
        legend={dict.briefWeb.fieldBudgetLegend}
        required
        value={data.budget}
        onChange={(v) => update('budget', v)}
        options={budgetOptions}
      />

      <RadioGroup
        name="timeline"
        legend={dict.briefWeb.fieldTimelineLegend}
        required
        value={data.timeline}
        onChange={(v) => update('timeline', v)}
        options={timelineOptions}
      />

      <Field label={dict.briefWeb.fieldNotes} optional>
        <textarea
          name="notes"
          rows={3}
          value={data.notes}
          onChange={(e) => update('notes', e.target.value)}
          placeholder={dict.briefWeb.fieldNotesPlaceholder}
          className="input resize-y"
        />
      </Field>

      <SummaryWeb data={data} dict={dict} mode={mode} />
    </div>
  );
}

function SummaryWeb({
  data,
  dict,
  mode,
}: {
  data: BriefWebData;
  dict: Dictionary;
  mode: BriefWebMode;
}) {
  const webTypeLabel = data.webType === 'other'
    ? `Otro: ${data.webTypeOther || '—'}`
    : data.webType
      ? dict.briefWeb.webTypes[data.webType]
      : '—';

  const goalLabel = data.goal === 'other'
    ? `Otro: ${data.goalOther || '—'}`
    : data.goal
      ? dict.briefWeb.goals[data.goal]
      : '—';

  const budgetLabel = data.budget ? dict.briefWeb.budgets[data.budget] : '—';
  const timelineLabel = data.timeline ? dict.briefWeb.timelines[data.timeline] : '—';

  return (
    <details open className="mt-6 rounded-lg bg-background border border-theme-9 p-4">
      <summary className="cursor-pointer text-sm font-medium text-text hover:text-accent">
        {dict.briefWeb.summaryToggle}
      </summary>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Row k={dict.briefWeb.summaryMode} v={mode === 'express' ? `${dict.briefWeb.modeExpressTitle} (${dict.briefWeb.modeExpressBadge})` : `${dict.briefWeb.modeDetailedTitle} (${dict.briefWeb.modeDetailedBadge})`} />
        <Row k={dict.briefWeb.fieldName} v={data.name} />
        <Row k={dict.briefWeb.fieldEmail} v={data.email} />
        {data.company && <Row k={dict.briefWeb.fieldCompany} v={data.company} />}
        {data.phone && <Row k={dict.briefWeb.fieldPhone} v={data.phone} />}
        {data.currentSite && <Row k={dict.briefWeb.fieldCurrentSite} v={data.currentSite} />}
        <Row k={dict.briefWeb.summaryWebType} v={webTypeLabel} />
        <Row k={dict.briefWeb.summaryGoal} v={goalLabel} />
        {data.references && <Row k={dict.briefWeb.fieldReferences} v={data.references} />}
        {mode === 'detailed' && data.pagesNeeded.length > 0 && (
          <Row k={dict.briefWeb.fieldPagesLegend} v={data.pagesNeeded.join(', ')} />
        )}
        {mode === 'detailed' && data.featuresNeeded.length > 0 && (
          <Row k={dict.briefWeb.fieldFeaturesLegend} v={data.featuresNeeded.join(', ')} />
        )}
        <Row k={dict.briefWeb.summaryBudget} v={budgetLabel} />
        <Row k={dict.briefWeb.summaryTimeline} v={timelineLabel} />
        {data.notes && <Row k={dict.briefWeb.fieldNotes} v={data.notes} />}
      </dl>
    </details>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <dt className="font-medium text-text min-w-[140px]">{k}:</dt>
      <dd className="text-secondary whitespace-pre-wrap break-words">{v || '—'}</dd>
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-secondary mb-1.5">
        {label}{' '}
        {required && <span className="text-accent">*</span>}
        {!required && optional && (
          <span className="text-secondary/50 font-normal"> (opcional)</span>
        )}
      </span>
      {children}
      {error && (
        <span className="block text-xs text-red-600 mt-1" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

type RadioOption<V extends string> = { value: V; label: string; icon?: string };

function RadioGroup<V extends string>(props: {
  name: string;
  legend: string;
  required?: boolean;
  value: V | '';
  onChange: (v: V) => void;
  options: RadioOption<V>[];
  layout?: 'grid-2' | 'grid-3';
  optional?: boolean;
}) {
  const { name, legend, required, value, onChange, options, layout = 'grid-3', optional } = props;
  const gridClass = layout === 'grid-2' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <fieldset>
      <legend className="block text-sm font-medium text-secondary mb-1.5">
        {legend} {required && <span className="text-accent">*</span>}
        {!required && optional && (
          <span className="text-secondary/50 font-normal"> (opcional)</span>
        )}
      </legend>
      <div className={`grid ${gridClass} gap-2`}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={`p-3.5 sm:p-4 min-h-[48px] rounded-xl border-2 cursor-pointer transition-all duration-200 text-sm font-medium flex items-center justify-between gap-3 ${
                selected
                  ? 'border-theme-1 bg-theme-1/10 text-secondary font-bold shadow-sm ring-1 ring-theme-1/30 scale-[1.01]'
                  : 'border-theme-9 bg-primary text-text hover:border-theme-1/40 hover:bg-theme-5/50 hover:text-secondary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  id={id}
                  name={name}
                  value={opt.value}
                  checked={selected}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                {opt.icon && <span className="text-base" aria-hidden="true">{opt.icon}</span>}
                <span className="leading-snug">{opt.label}</span>
              </div>
              <span
                className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] flex-none transition-colors ${
                  selected
                    ? 'border-theme-1 bg-theme-1 text-secondary font-bold'
                    : 'border-theme-9 bg-background'
                }`}
              >
                {selected && '✓'}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
      aria-hidden="true"
    />
  );
}
