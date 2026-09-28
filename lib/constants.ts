/**
 * Site-wide constants — single source of truth for URLs, contact info,
 * and anything else hardcoded across multiple components/pages.
 *
 * Keep this file tiny. Anything that's used in only 1-2 places belongs
 * next to the code that uses it, not here.
 */

/** Google Calendar scheduling link for the "free strategy call" CTAs.
 *  Single source of truth — every CTA (hero, cta, brief, contact, services,
 *  portfolio, cumple-2025, wizard) reads from here. Update this and every
 *  page follows. 2026-09-23: consolidated all hardcoded duplicates here.
 */
export const CALENDAR_BOOKING_URL = 'https://calendar.app.google/QvUUb5xu4927P95a8';

/** Primary contact email used site-wide. */
export const CONTACT_EMAIL = 'info@andresmorales.com.co';

/** Brand-color hex (used by PWA theme-color meta + manifest). */
export const BRAND_COLOR_HEX = '#f96e03';

/** Canonical public domain — used by SEO metadata, sitemap, JSON-LD. */
export const CANONICAL_DOMAIN = 'https://andresmorales.com.co';
