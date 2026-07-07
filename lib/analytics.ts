// Analytics helper — provider-agnostic event tracking.
//
// Today the site has no analytics provider wired up (no GA, GTM, Plausible,
// etc.). This helper is designed so that we can call `track()` everywhere in
// the app NOW, and plug in the actual provider LATER without touching any
// call sites.
//
// What track() does, in order:
//   1. If a provider is installed (we detect via a global like `window.gtag`
//      or `window.dataLayer`), forward the event to it.
//   2. Dispatch a DOM `CustomEvent('analytics:event', { detail })` so any
//      future provider can `window.addEventListener('analytics:event', ...)`.
//   3. If we're in dev (NODE_ENV !== 'production'), `console.debug` so we
//      can see events in the browser console while developing.
//
// Usage:
//   import { track } from '@/lib/analytics';
//   track('brief_started');
//   track('brief_step_completed', { step: 2, step_name: 'The problem' });
//
// To plug in a provider later:
//   - For GA4:        add <Script src="...gtag.js"> + GA_MEASUREMENT_ID in layout
//   - For GTM:        add <Script src="...gtm.js"> and it exposes dataLayer
//   - For Plausible:  add <Script data-domain="..." src="...plausible.js">
//   - For Umami:      add <Script async src="...umami.js" data-website-id="...">
//
// At that point, no changes needed here — track() will detect the provider.

type AnalyticsEvent =
  | 'brief_started'
  | 'brief_step_completed'
  | 'brief_step_advanced' // clicked "Next"
  | 'brief_step_back'     // clicked "Back"
  | 'brief_submitted'
  | 'brief_submit_error'
  | 'brief_draft_cleared';

type Detail = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
    plausible?: (...args: unknown[]) => void;
    umami?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, detail?: Detail): void {
  if (typeof window === 'undefined') return;

  // 1. Plausible (no-op if not installed; safe to call)
  try {
    if (window.plausible) {
      window.plausible(event, { props: detail });
    }
    // 2. Umami
    if (window.umami) {
      window.umami(event, detail);
    }
    // 3. GA4 / GTM via gtag()
    if (window.gtag) {
      window.gtag('event', event, detail);
    } else if (window.dataLayer) {
      // GTM without explicit gtag() — push to dataLayer for the GTM
      // container to forward to whatever tags are configured.
      window.dataLayer.push({ event, ...detail });
    }
  } catch {
    // swallow — analytics should never break the app
  }

  // 4. Dispatch a custom event for first-party listeners (debugger
  // extensions, custom dashboards, future providers).
  try {
    window.dispatchEvent(
      new CustomEvent('analytics:event', { detail: { event, ...detail } }),
    );
  } catch {
    // swallow
  }

  // 5. dev log
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, detail || {});
  }
}
