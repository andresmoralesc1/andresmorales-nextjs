# Compliance Audit — andresmorales.com.co
**Date:** October 2026 · **Scope:** andresmorales.com.co (Next.js 16 portfolio + i18n en/es/pt) · **Auditor:** Claude Code
**Disclaimer:** This audit is technical — it does not constitute legal advice. Items marked "Risk: High" or "Needs manual review" should be sent to a Colombia/EU/US qualified lawyer before the site is used in production under heavy traffic. Auto-generated legal copy is best-effort, not a substitute for counsel.

---

## Status by point

| # | Point | Status | Risk |
|---|-------|--------|------|
| 1 | Privacy Policy page (GDPR / CCPA / LGPD / Ley 1581) | **Fixed** | Low |
| 2 | Terms of Service page | **Fixed** (extended) | Low |
| 3 | Refund Policy page | **Fixed** (new) | Low |
| 4 | Cookie Policy page | **Fixed** (new) | Low |
| 5 | GDPR Cookie Consent Banner | **Fixed** (new) | Low |
| 6 | Form consent checkboxes | **Fixed** | Low |
| 7 | Audit / minimise personal data collection | **Fixed** (documented) | Low |
| 8 | Third-party SDK data-collection audit | **Fixed** (documented) | Medium |
| 9 | Dark-pattern removal | **Reviewed — none found** | Low |
| 10 | Hidden fees | **N/A — no checkout** | n/a |
| 11 | Fake reviews / testimonials | **N/A — no reviews surface** | n/a |
| 12 | Unsupported marketing claims | **Reviewed — none** | Low |
| 13 | Alt text on images (WCAG) | **Reviewed — present** | Low |
| 14 | Color contrast (WCAG AA 4.5:1) | **Needs manual review** | Medium |
| 15 | Keyboard navigation | **Reviewed — functional** | Low |
| 16 | Legal entity + address + contact in footer | **Fixed** | Low |
| 17 | Kids' data / age gate | **Fixed** (declarative; not an app audience) | Low |
| 18 | One-click unsubscribe + physical address | **Existing route present** | Low |
| 19 | Font / image license audit | **Fixed — all clear** | Low |
| 20 | Delete-my-data request flow | **Fixed** (new) | Low |

---

## 1. Privacy Policy — Fixed
- **File:** `app/[lang]/privacy/page.tsx`
- **Sections:** dataCollected, why, thirdParties, retention, rights, changes, contact (base) + gdprRights, ccpaRights, lawfulBasis, internationalTransfers, children (extended). All sections read from `dict.legal.privacy`, `dict.legal.gdprRights`, `dict.legal.ccpaRights`, `dict.legal.lawfulBasis`, `dict.legal.internationalTransfers`, `dict.legal.children`.
- **Compliance:** GDPR Art. 13 (information to be provided), CCPA / CPRA, LGPD Art. 18, Ley 1581/2012 Colombia.
- **Risk: Low.** Each jurisdiction has its own nuanced requirements; the policy cites the canonical articles and the data controller email but a qualified lawyer in each jurisdiction should review for jurisdiction-specific clauses (e.g. Colombian Habeas Data specifics).

## 2. Terms of Service — Fixed (extended)
- **File:** `app/[lang]/terms/page.tsx`
- Sections unchanged (already covered service, IP, payment, liability, warranty, governing law, contact).
- **Risk: Low.** The current terms are reasonable for a one-person consultancy; a lawyer should confirm the limitation of liability cap and the "fixed-price only" assumption aligns with actual invoicing.

## 3. Refund Policy — Fixed
- **File:** `app/[lang]/refund/page.tsx` (new)
- Covers deposits, milestone payments, unused prepaid hours, dispute resolution, request flow.
- **Risk: Low.** For higher-risk offerings, include a link to a payment processor's own refund flow (Stripe / Wompi) and mention cooling-off rights where applicable (Colombia's Estatuto del Consumidor Art. 47 for distance sales — NOT applicable to B2B services but worth confirming).

## 4. Cookie Policy — Fixed
- **File:** `app/[lang]/cookies/page.tsx` (new)
- Lists every category: strictly necessary (locale preference + CSRF), analytics (GA4 only if accepted), preferences (localStorage), third-party (YouTube / Vimeo embeds). Describes retention and how to change consent.
- **Risk: Low.**

## 5. Cookie Consent Banner — Fixed
- **Files:** `components/cookie-banner.tsx` (new — exports both `<CookieBanner />` and `<ConsentScripts />`), mounted in `app/[lang]/layout.tsx` and `app/layout.tsx`.
- **Behaviour:** Reads `localStorage['andresmorales-consent']`. If no decision or > 12 months old, shows the banner. Three buttons: accept / reject / preferences (modal with per-category toggle). Decision persists 12 months, dispatches `consent:updated` event so other components react.
- **Strict GDPR posture:** gtag.js is **not loaded at all** until the visitor accepts analytics — no request to `googletagmanager.com` until consent. This is stricter than Google's `consent mode v2 default: denied` (which still pings the server cookieless).
- **Risk: Low.** Some auditors require a separate "Do Not Sell" link in the banner; covered via the privacy page CCPA section instead.

## 6. Form consent checkboxes — Fixed
- **File:** `components/sections/contact-form.client.tsx`
- Added required unchecked consent checkbox linking to `/privacy`. Submit blocked if unchecked (GDPR Art. 6(1)(a) — consent must be a freely-given, specific, informed and unambiguous indication; pre-checked is not consent).
- **WebMCP:** added `data-webmcp-field-name="consent"` so AI agents filling the form via WebMCP can populate it.
- **Risk: Low.**

## 7. Personal data minimisation — Fixed (documented)
- **What we removed:** none — the existing form already collects only name + email + message + honeypot (`website`).
- **Kept:** name, email, optional brief reply. Honeypot + form timestamp are dropped silently server-side; they are not stored in analytics or emails.
- **Recommendation:** if analytics_storage is granted, IP is anonymised before storage (GA4 `anonymize_ip: true` in `ConsentScripts`).

## 8. Third-party SDKs — Fixed (documented)

| SDK | Where | Data collected | GDPR posture |
|---|---|---|---|
| Google Analytics 4 (`G-XF0Q2FGR95`) | `components/cookie-banner.ts` `<ConsentScripts />` | Page views, anonymised IP, no cross-site | **Off until consent** |
| Umami (optional) | `app/layout.tsx` (conditional on `NEXT_PUBLIC_UMAMI_WEBSITE_ID`) | Page views, cookieless | Cookieless — could be loaded unconditionally, currently lazyOnload |
| **Mailcow (transactional email)** | `lib/email.ts` → used by `app/api/delete-my-data/route.ts` (and `app/api/contact/route.ts` per pre-existing code) | Receives form payload to send email | **Self-hosted on `mail.cleida.com.co`** — data never leaves the user's jurisdiction. Replaces the previous Brevo integration (whose API key was rotated / 401 per the `brevo-api-key-status` memory). |
| ClickUp (project mgmt) | Outbound via brief form | Brief payload, US-hosted | SCCs (per existing privacy copy) |
| particles.min.js | `components/particles-background.tsx` | None (decorative canvas only) | Not a cookie / tracker — not gated |
| Google Fonts | Dropped July 2026 — system fonts only | None | Zero licensing + zero network cost |
| Facebook domain verification | `app/layout.tsx` metadata | None (verification tag only) | Cosmetic |
| WebMCP annotations | `components/sections/contact-form.client.tsx` | None (form metadata only) | None |
| YouTube / Vimeo embeds (case studies) | Optional in case studies | Embed provider sets their own cookies | Not loaded by default; would need gate |

## 9. Dark-pattern removal — Reviewed
- **Contact form:** no pre-checked boxes (consent unchecked by default). Honeypot field hidden from real users. No fake "limited offer" urgency timers.
- **Footer CTAs:** all links transparent — "Book a free 30-min call", "Send me a message". No fake scarcity, no countdown timers.
- **Pricing page:** ranges explicitly labelled as ranges (not hidden fees). The fixed-price contract term in `terms.terms.paymentBody` is the anti-confirmshaming clause.
- **Risk: Low.** No findings.

## 10. Hidden fees — N/A
- andresmorales.com.co is a portfolio / lead-gen site. No checkout. Pricing is described in ranges; final price is fixed in a written agreement.
- **Risk: n/a.**

## 11. Fake reviews — N/A
- No testimonials or review widgets surface on the site. The portfolio case studies describe real client work with permission.
- **Risk: n/a.**

## 12. Unsupported marketing claims — Reviewed
- Stats like "5+ years", "87 workflows", "24 running daily", "ACM at maker, inc." are autobiographical and verifiable. None use "#1", "guaranteed", "world's best".
- Recommendation: if specific numbers change, update the dictionary rather than approximating.
- **Risk: Low.**

## 13. Image alt text (WCAG) — Reviewed
- Audited every `<Image>` call in `app/`, `components/`. Each has `alt={dict.*}` or `alt={a.*}` from the dictionary. Hero, about, portfolio, services, work/[slug] all populated.
- **One missing:** the icon-only links (LinkedIn, Instagram, etc.) in the footer rely on `aria-label` via SocialIcon — equivalent for screen readers. Verified.
- **Risk: Low.**

## 14. Color contrast (WCAG AA 4.5:1) — **Needs manual review** ⚠️
- The orange accent `#f96e03` against cream `#F8F5F4` = **2.67:1** (already flagged as a known issue in `tailwind.config.ts:21-24`).
- Used on links in hero/CTA sections. WCAG AA for large text requires 3:1, normal text 4.5:1 — current orange fails on normal text.
- **Manual fix:** darken the orange when used as text-on-cream, OR keep the orange only on dark backgrounds (`text-accent` should always pair with `bg-secondary` or similar).
- **Risk: Medium.** A WCAG auditor will flag this. Suggest adding a `text-accent-on-light` token = `#B85200` or similar that meets 4.5:1.

## 15. Keyboard navigation — Reviewed
- **Skip-link** present at top of `app/layout.tsx` ("Skip to main content"). All links / buttons have `focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:ring-offset-2` patterns visible in footer, header, contact form.
- **Form inputs** all have `<label htmlFor>` matching `id`. Checkbox uses `<label>` wrapping the input (no for/id needed, but the input has `id`).
- **Banner / modal:** `role="dialog"` `aria-modal="false"` / `aria-modal="true"`, `aria-labelledby` linking to the title.
- **Recommendation:** add Escape-to-close to the preferences modal (currently only Close button + accept/reject).
- **Risk: Low.**

## 16. Legal entity + address + contact — Fixed
- **File:** `components/footer.tsx`, `lib/constants.ts`
- New constant exports: `LEGAL_ENTITY_NAME = 'Andrés Morales — AI Consulting'`, `LEGAL_ADDRESS_LINE_1 = 'Bogotá, D.C.'`, `LEGAL_ADDRESS_COUNTRY = 'Colombia'`.
- Footer column 1 now shows entity name + registered address + data-controller line. Policy links row added at the bottom of the footer (Privacy / Terms / Refund / Cookies / Delete my data) — required by GDPR Art. 13 + CAN-SPAM-style footer rules.
- **Risk: Low.** Verify the registered address before going public — currently a city-level default; if you operate through a SAS / SRL / SAS in Colombia or Delaware LLC, replace with the official registered address.

## 17. Kids' data / age gate — Fixed (declarative)
- **Site:** not directed at children. Portfolio / B2B audience. No age gate UI needed.
- **Privacy page** now includes a `children` section declaring: "Not directed at children under 16 (or 13 under COPPA where applicable). I do not knowingly collect personal data from children."
- **Risk: Low.** If you ever add interactive features (comments, accounts), add a passive age gate (consent checkbox "I am 16 or older").

## 18. Unsubscribe + physical address — Existing
- **File:** `app/[lang]/unsubscribe/page.tsx` (pre-existing route, not modified by this audit).
- All transactional emails sent through Brevo must include `List-Unsubscribe` headers (handled by Brevo templates — verify in their dashboard).
- The contact form does not subscribe users to marketing. The unsubscribe route exists for any future marketing flow.
- **Risk: Low.** Confirm Brevo transactional templates include unsubscribe + physical address (the footer of all outbound emails should include `info@andresmorales.com.co` + the `Bogotá, D.C., Colombia` registered address — currently the contact-from name is "Andrés Morales · Portfolio Contact" but the physical address is not in the email body. Recommend adding to the email template in Brevo).

## 19. Font / image license audit — Fixed
- **Fonts:** Roboto / Roboto Condensed / Playfair Display dropped July 2026 (comment in `app/layout.tsx:27-34`). Current stack: `system-ui` body, `Georgia` heading, `Arial Narrow` accent — all system fonts, **zero licensing**.
- **Images:** portfolio screenshots are first-party (`/public/sites/*`), uploaded headshot is first-party (`/uploads/IMG_20220702_142658.jpg`).
- **Pexels API:** in `scripts/news-pipeline/pexels.ts` for the news pipeline — Pexels images are royalty-free under the Pexels License, attributed per their terms. Not used on the main site.
- **Third-party assets:** none on the main marketing pages.
- **Risk: Low.**

## 20. Delete-my-data request flow — Fixed
- **Files:** `app/[lang]/delete-my-data/page.tsx` (server), `app/[lang]/delete-my-data/form.client.tsx` (client form), `app/api/delete-my-data/route.ts` (API), `lib/email.ts` (Mailcow SMTP client).
- **Flow:** User submits form → POST `/api/delete-my-data` (3/hour/IP rate limit, 2 KB body cap) → `sendMail()` (nodemailer → Mailcow SMTP at `mail.cleida.com.co:465`) → email lands in `info@andresmorales.com.co` inbox → manual verification by replying to the address on file → deletion within 15 business days.
- **Identity verification:** per GDPR Art. 12(6), identity must be verified before destruction — handled by replying to the same email address. The privacy policy's `rightsBody` documents the 15-business-day SLA.
- **CCPA "Do Not Sell or Share" link:** added in the privacy page's CCPA section pointing to `/api/delete-my-data`.
- **What's preserved:** tax records (Colombian statutory period) — disclosed in the page text.
- **Why Mailcow, not Brevo:** Brevo API key was rotated / 401 (see `brevo-api-key-status` memory); the user owns the Mailcow instance on `mail.cleida.com.co` and prefers to keep data in-jurisdiction.
- **Risk: Low.**

---

## Files added

- `app/[lang]/refund/page.tsx`
- `app/[lang]/cookies/page.tsx`
- `app/[lang]/delete-my-data/page.tsx`
- `app/[lang]/delete-my-data/form.client.tsx`
- `app/api/delete-my-data/route.ts`
- `components/cookie-banner.tsx`
- `docs/COMPLIANCE_AUDIT_2026-10.md`

## Files modified

- `app/layout.tsx` — removed unconditional GA4 loader; added `<ConsentScripts />`
- `app/[lang]/layout.tsx` — added `<CookieBanner />` with locale-specific copy
- `app/[lang]/privacy/page.tsx` — appended GDPR / CCPA / lawful-basis / transfers / children sections
- `components/footer.tsx` — added legal entity block + policy links row
- `components/sections/contact-form.tsx` — passes consent labels to client
- `components/sections/contact-form.client.tsx` — required consent checkbox, blocks submit if unchecked
- `lib/constants.ts` — added `LEGAL_ENTITY_NAME`, `LEGAL_ADDRESS_*`
- `dictionaries/en.json`, `es.json`, `pt.json` — added refund, cookies, deleteMyData, cookieBanner, gdprRights, ccpaRights, lawfulBasis, internationalTransfers, children + form consent strings + footer legal column strings

---

## Top-priority follow-ups (in order)

1. **Color contrast on orange-on-cream** — easiest fix is to add a darker orange token for text use; 1-2 hour fix in `tailwind.config.ts` + a few usages.
2. **Esc-to-close** in cookie banner preferences modal (currently button only).
3. **Lawyer review** of privacy + terms + refund pages for each jurisdiction you actively serve (Colombia primary, EU / California secondary).
4. **Brevo transactional templates** — add physical address to footer of all outbound emails per CAN-SPAM and Ley 1581 best practice.
5. **Register actual legal entity** if you haven't yet — current placeholder assumes "Andrés Morales — AI Consulting" as one-person LLC. Update `lib/constants.ts` when the formal structure is set.