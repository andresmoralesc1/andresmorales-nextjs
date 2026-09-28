/**
 * FAQ content for the 4 service pages.
 *
 * Hardcoded in English by design: AI / web / UX buying intent in LATAM
 * is overwhelmingly English-searched (the buyer's vocabulary lives in
 * English even when the user navigates in Spanish). Mirrors the precedent
 * already set by `app/[lang]/services/ai-automation/page.tsx`, which has
 * kept FAQs in English since launch.
 *
 * Schema wiring: every FAQ item here is consumed by both
 *  - the visible <details> accordion (UX)
 *  - the `faqSchema()` JSON-LD injected in <head> (SEO + rich results)
 *
 * Google rejects the rich-result eligibility if the visible page does
 * not contain the same Q&A, so the source of truth is THIS file and
 * the visible UI mirrors it verbatim.
 */

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export type ServiceFAQSet = Record<string, ServiceFAQ[]>;

export const SERVICE_FAQS: ServiceFAQSet = {
  // /services hub — generic questions across all 3 service lines.
  services: [
    {
      question: 'How do I know which service my project actually needs?',
      answer:
        'Start with a 30-minute call. We walk through your current stack, the manual work that is costing you the most, and the systems that already hold the data. Most projects turn out to need 2 of the 3 service lines (for example, web-development + ai-automation), but the answer is yours, not mine. The call is free and the recommendation is honest even when the recommendation is "you do not need me yet".',
    },
    {
      question: 'Do you work with companies outside Colombia and LATAM?',
      answer:
        'Yes. About a third of active clients are in the US, Mexico, or Spain. Engagement is fully remote; payments work over Wise, Stripe, or bank transfer. The only Colombia-specific thing is that the calendar booking is in Bogotá time, which I flex around for non-LATAM clients.',
    },
    {
      question: 'What if I only need one deliverable (a site, an automation, a UX audit)?',
      answer:
        'Most engagements start with exactly that — a single deliverable — and grow from there. Pricing is per deliverable, not per retainer. You are not signing up for a long-term contract; you are commissioning a piece of work and I am committing to deliver it on time and on scope.',
    },
    {
      question: 'How do you handle source code, IP, and handover?',
      answer:
        'You own everything I produce for you from day one. Source code lives in your GitHub repo (or a new one I create for you under your account), design files are in your Figma, automation flows are exported as JSON you can re-import anywhere, and credentials are stored in your password manager — not mine. If we part ways after the engagement, nothing of yours lives in my accounts.',
    },
    {
      question: 'How is pricing structured?',
      answer:
        'Fixed price per deliverable after a short scoping call. No retainer for the sake of a retainer. You see the line items, you see the hours estimate, you sign off before work starts. If scope changes mid-project, I flag it before doing the extra work and quote it separately.',
    },
    {
      question: 'What happens after the engagement ends?',
      answer:
        'Most clients keep a small monthly retainer for ongoing tweaks and monitoring. Some hand the keys back to their in-house team with documentation and a handover session. Either is fine — the engagement ends when you say it ends, and the work I produce is yours to operate, modify, or hand to anyone you choose.',
    },
  ],

  // /services/web-development
  'web-development': [
    {
      question: 'How long does a typical web development project take?',
      answer:
        'A marketing site ships in 2 to 4 weeks. An e-commerce build runs 4 to 8 weeks. A custom platform with integrations runs 8 to 16 weeks. These are realistic ranges for a single developer shipping end-to-end; the timeline extends when the design phase is still in flight or when there are multiple stakeholders reviewing the same surface.',
    },
    {
      question: 'What stack do you work with?',
      answer:
        'Next.js for the app layer, Postgres for the data layer, Vercel for the deployment layer, Stripe or Wompi for payments, and a headless CMS (Sanity, Contentful, or Strapi) when content is editor-owned. For e-commerce on LATAM, the storefront is usually Next.js + Medusa or a custom Next.js + Shopify Storefront. I pick the boring tool that fits the constraint, not the shiny one that fits the demo.',
    },
    {
      question: 'Do you only ship new sites, or do you also maintain existing ones?',
      answer:
        'Both. About 60% of the work is new builds; the rest is taking over an existing codebase, fixing performance, paying down technical debt, or adding a feature that the original team did not have time for. I do not take over a codebase I cannot read — if the existing code is too tangled to extend sensibly, the honest answer is a rewrite, not a band-aid.',
    },
    {
      question: 'How do you handle SEO and performance?',
      answer:
        'Both are non-negotiable defaults. Every site I ship lands at PageSpeed 100 across the board on desktop (and in the 90s on mobile) and ships with structured data, hreflang tags, sitemap, and the metadata a content editor actually needs. Performance is built in at the architecture level (Next.js App Router, image optimization, font subsetting) rather than bolted on later.',
    },
    {
      question: 'What does a typical e-commerce build cost?',
      answer:
        'A single-region Shopify or Medusa storefront with 1 to 50 SKUs and one payment gateway lands between $2,000 and $8,000 USD. Multi-region with multiple currencies and gateways lands between $8,000 and $20,000. Custom checkout, loyalty, or subscription logic adds another layer. The scoping call locks the line items before work starts.',
    },
    {
      question: 'Do you build the design too, or do you take Figma files from a designer?',
      answer:
        'Both. About half the projects I take a Figma from a designer the client hired separately; about half I design myself, either from scratch or from a rough sketch in Miro. When I design, you get a Figma file you own and can hand to anyone; when I take a Figma, I push back early on anything I think will break in code.',
    },
  ],

  // /services/ui-ux-design
  'ui-ux-design': [
    {
      question: 'What is the difference between a UX audit and a UX redesign?',
      answer:
        'A UX audit is a written report: what is wrong, why it is wrong, what to change, and in what order. You hand it to your dev team (or to me) and they implement. A UX redesign is the same analysis plus a fully designed replacement in Figma that gets implemented directly. Most clients start with the audit, see the value, then move to the redesign.',
    },
    {
      question: 'How long does a UX redesign take?',
      answer:
        'A focused landing page redesign ships in 1 to 2 weeks. A full app redesign (5 to 20 key screens, design system, prototype, handoff) ships in 3 to 6 weeks. The audit before the redesign adds another 1 to 2 weeks. Rushing past those numbers is how you get redesigns that look pretty but do not actually move the metrics you said you cared about.',
    },
    {
      question: 'Do you do user research, or just design from best practices?',
      answer:
        'Both, depending on the budget. For most projects, a research round (5 to 8 user interviews + a synthesis) doubles the cost but also doubles the chance the redesign actually changes behavior. For smaller projects, I skip the interviews and design from analytics + session recordings + heuristic best practice. The call is yours; I will recommend the option that fits the risk.',
    },
    {
      question: 'What tools do you work in?',
      answer:
        'Figma for design, FigJam for whiteboarding, Maze or Useberry for unmoderated usability tests, Hotjar or PostHog for session recordings and heatmaps, Notion for written reports and design systems documentation. I do not use Sketch, Adobe XD, or any tool that locks your design files into a vendor format.',
    },
    {
      question: 'Can you hand off the design to my existing development team?',
      answer:
        'Yes. The handoff includes a Figma file with auto-layout, a documented design system (colors, type, spacing, components), a prototype for the flows that need to feel right before build, and a recorded walkthrough. I stay available during the build for clarifications but am not the developer on your side.',
    },
    {
      question: 'What if I already have a design and just need it implemented well?',
      answer:
        'That is the simpler version of the same engagement. I push back on the Figma early — anywhere the design will not survive code, I flag it before build so we do not discover the problem mid-sprint. Then I implement against the approved Figma with weekly demos and a final QA pass.',
    },
  ],
};
