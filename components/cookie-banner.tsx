'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// ConsentScripts
//
// Conditionally loads Google Analytics 4 based on the visitor's cookie
// consent (localStorage `andresmorales-consent`). Until consent is
// granted, gtag.js is NOT loaded — strict GDPR posture.
//
// This replaces the static <Script id="ga4-loader"> in app/layout.tsx
// (formerly loaded unconditionally with consent mode default 'denied').
//
// Why a client component rather than the static default:
//   1. localStorage is not available server-side, so the consent check
//      must happen after hydration.
//   2. Loading gtag.js based on a stored preference avoids any network
//      request to googletagmanager.com for visitors who decline.

type ConsentState = {
  essential: boolean; // always true
  analytics: boolean;
  decidedAt: number;
};

const STORAGE_KEY = 'andresmorales-consent';
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (!parsed || typeof parsed.decidedAt !== 'number') return null;
    if (Date.now() - parsed.decidedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(next: Omit<ConsentState, 'decidedAt'>): void {
  if (typeof window === 'undefined') return;
  const state: ConsentState = { ...next, decidedAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Dispatch a CustomEvent so other client components (e.g. the banner
    // itself, or analytics helpers in lib/analytics.ts) can react without
    // re-reading storage. Mirrors the analytics:event pattern.
    window.dispatchEvent(new CustomEvent('consent:updated', { detail: state }));
  } catch {
    // localStorage may throw under quota / privacy modes — fail silently
    // rather than break the page. The banner will re-prompt on next visit.
  }
}

export function ConsentScripts() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
    const onUpdate = (e: Event) => setConsent((e as CustomEvent<ConsentState>).detail);
    window.addEventListener('consent:updated', onUpdate);
    return () => window.removeEventListener('consent:updated', onUpdate);
  }, []);

  const GA_MEASUREMENT_ID =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) ||
    'G-XF0Q2FGR95';

  if (!ready || !consent?.analytics) {
    // Either we haven't decided yet (banner will decide) or analytics
    // is denied — load nothing. Returning null from a server component
    // context would still trigger re-render, so we render an empty
    // fragment here.
    return null;
  }

  return (
    <>
      <Script
        id="ga4-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script
        id="ga4-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              anonymize_ip: true,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}

// CookieBanner — first-party banner shown until consent is recorded.
//
// Renders nothing once a valid decision exists in localStorage. The
// `consent:updated` event re-paints the banner if the visitor clears
// their decision via browser settings.

export function CookieBanner({
  t,
  privacyHref = '/privacy',
}: {
  t: {
    title: string;
    body: string;
    accept: string;
    reject: string;
    preferences: string;
    preferencesTitle: string;
    analyticsLabel: string;
    analyticsHelp: string;
    essentialLabel: string;
    essentialHelp: string;
    save: string;
    close: string;
    policyLink: string;
  };
  privacyHref?: string;
}) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [tempAnalytics, setTempAnalytics] = useState(true);
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setReady(true);
    const c = readConsent();
    setConsent(c);
    setTempAnalytics(c?.analytics ?? true);
    const onUpdate = (e: Event) => {
      const next = (e as CustomEvent<ConsentState>).detail;
      setConsent(next);
      setShowPrefs(false);
    };
    window.addEventListener('consent:updated', onUpdate);

    // Defer the banner so it doesn't cover the hero CTA on first paint.
    // Show after 1.5s of inactivity, or immediately on first scroll —
    // whichever happens first. Visitors who scroll fast get the prompt
    // without waiting; those who linger on the hero get it after a beat.
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setShow(true);
    };
    const onScroll = () => reveal();
    window.addEventListener('scroll', onScroll, { passive: true, once: true });
    const t1 = window.setTimeout(reveal, 1500);

    return () => {
      window.removeEventListener('consent:updated', onUpdate);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(t1);
    };
  }, []);

  if (!ready || consent || !show) return null;

  function accept() {
    writeConsent({ essential: true, analytics: true });
  }
  function reject() {
    writeConsent({ essential: true, analytics: false });
  }
  function savePrefs() {
    writeConsent({ essential: true, analytics: tempAnalytics });
  }

  return (
    <>
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-banner-title"
        className="fixed bottom-0 right-0 z-50 p-3 md:p-5 max-w-full"
      >
        <div className="ml-auto max-w-md rounded-lg border border-theme-9 bg-background shadow-lg p-4 md:p-6">
          <h2 id="cookie-banner-title" className="font-heading text-lg md:text-xl font-bold text-secondary mb-2">
            {t.title}
          </h2>
          <p className="text-sm text-secondary/85 mb-4 leading-relaxed">{t.body}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={accept}
              className="btn-theme text-sm"
            >
              {t.accept}
            </button>
            <button
              type="button"
              onClick={reject}
              className="px-4 py-2 min-h-[44px] text-sm rounded-md border border-theme-9 bg-background text-secondary hover:bg-theme-5 focus:outline-none focus:ring-2 focus:ring-theme-1"
            >
              {t.reject}
            </button>
            <button
              type="button"
              onClick={() => setShowPrefs(true)}
              className="px-4 py-2 min-h-[44px] text-sm rounded-md border border-transparent bg-transparent text-secondary underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-theme-1"
            >
              {t.preferences}
            </button>
            <a
              href={privacyHref}
              className="ml-auto text-xs text-secondary/70 underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-theme-1"
            >
              {t.policyLink}
            </a>
          </div>
        </div>
      </div>

      {showPrefs && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-prefs-title"
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-3 md:p-6 bg-black/40"
        >
          <div className="w-full max-w-md rounded-lg border border-theme-9 bg-background p-5 md:p-6">
            <h3 id="cookie-prefs-title" className="font-heading text-lg font-bold text-secondary mb-3">
              {t.preferencesTitle}
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-secondary">{t.essentialLabel}</p>
                <p className="text-secondary/75 text-xs mt-1">{t.essentialHelp}</p>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempAnalytics}
                  onChange={(e) => setTempAnalytics(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium text-secondary">{t.analyticsLabel}</span>
                  <span className="block text-secondary/75 text-xs mt-1">{t.analyticsHelp}</span>
                </span>
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-5">
              <button type="button" onClick={savePrefs} className="btn-theme text-sm">
                {t.save}
              </button>
              <button
                type="button"
                onClick={() => setShowPrefs(false)}
                className="px-4 py-2 min-h-[44px] text-sm rounded-md border border-transparent bg-transparent text-secondary underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-theme-1"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}