import Link from 'next/link';
import { wpImage } from '@/lib/theme';
import { Cta } from '@/components/sections/cta';
import { ParticlesBackground } from '@/components/particles-background';
import { pageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';

/**
 * /services — overview hub linking to three sub-service pages.
 *
 * Structure:
 *   1. Hero (photo + soft particles, unchanged)
 *   2. Three tracks — three big cards, one per sub-service, with link
 *   3. How I work — 3-step shared process (Audit → Ship → Iterate)
 *   4. Why me — 4 short differentiators pulled from real background
 *   5. <Cta /> — final conversion banner
 *   6. Footer (auto)
 */

export const metadata: Metadata = pageMetadata({
  title: 'My Work',
  description:
    'Three service tracks: AI automations that save hours every week, UI/UX design that improves how people use your product, and web development that ships fast — for clients who want measurable outcomes.',
  path: '/services',
});

const TRACKS = [
  {
    eyebrow: 'Track 01',
    title: 'AI Automation',
    href: '/services/ai-automation',
    summary:
      'Repetitive work, off the team’s plate. AI agents, no-code flows, and custom integrations that pay for themselves — measured in hours, not hype.',
    capabilities: [
      'Workflow audits and ROI scoring',
      'AI agents and chatbots on streaming APIs',
      'n8n / Make automations and integrations',
      'E-commerce automation at scale',
      'Lead generation and personalized outreach',
    ],
    metric: 'Save hours every week',
  },
  {
    eyebrow: 'Track 02',
    title: 'UI/UX Design',
    href: '/services/ui-ux-design',
    summary:
      'Interfaces that feel obvious and convert. Research, design and iterate — until the user doesn’t have to think twice.',
    capabilities: [
      'UX research and usability testing',
      'User flows, wireframes, prototyping',
      'Production-ready Figma UI',
      'Conversion-focused iterations',
      'Design systems and documentation',
    ],
    metric: 'Make flows obvious',
  },
  {
    eyebrow: 'Track 03',
    title: 'Web Development',
    href: '/services/web-development',
    summary:
      'Fast, accessible, type-safe web apps — from landing pages to AI-powered SaaS front-ends. Production-grade from day one.',
    capabilities: [
      'Next.js + React with App Router and RSC',
      'High-converting landing pages',
      'Dashboards and authenticated web apps',
      'AI features wired to streaming APIs',
      'Core Web Vitals, SEO, structured data',
    ],
    metric: 'Ship fast, rank fast',
  },
];

const PROCESS = [
  {
    n: '01',
    title: 'Audit',
    desc:
      'Map the current state — workflows, screens, conversion paths. The cheapest step to skip, the most expensive one to skip.',
  },
  {
    n: '02',
    title: 'Ship in slices',
    desc:
      'Small, observable pieces. Every flow has a dashboard, every error has an alert, every retry has a story. No big-bang relaunches.',
  },
  {
    n: '03',
    title: 'Iterate from real data',
    desc:
      'Watch what real users do and tune. The first version is the start of the conversation, not the end of the project.',
  },
];

const DIFFERENTIATORS = [
  {
    title: 'A decade in sales',
    desc: 'I’ve closed deals across LATAM. Empathy for the customer, sharp eye for the numbers.',
  },
  {
    title: 'AI without the hype',
    desc: 'Prompts version-controlled like code. No black boxes, no vendor lock-in by stealth.',
  },
  {
    title: 'Design that ships',
    desc: 'Wireframes first, pixels second. I sit with engineering, review every PR, and tune live.',
  },
  {
    title: 'Type-safe end to end',
    desc: 'TypeScript on the front, validated payloads on every API. Bugs stay rare, features stay fast.',
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero — pitch + photo */}
      <section className="section bg-primary relative overflow-hidden">
        <ParticlesBackground id="hero-particles-services" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-theme-1 mb-3 font-secondary font-bold">
              My Work
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
              What I ship — and how I think about it.
            </h1>
            <p className="text-text text-lg md:text-xl max-w-xl">
              Three service tracks that compound on each other: AI automation to
              reclaim time, UI/UX to make flows obvious, web development to ship
              it fast.
            </p>
          </div>
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-theme-9">
            <img
              src={wpImage('/wp-content/uploads/2025/06/IMG-20160129-WA0001.jpg')}
              alt="Andrés at work"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Three Tracks — hub to the three sub-service pages */}
      <section className="section bg-theme-5">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-widest text-theme-1 mb-2 font-secondary font-bold">
              Three Tracks
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              Pick one track. Or stack them.
            </h2>
            <p className="text-text">
              Each track stands on its own. They get sharper when combined —
              an audit informs the build, the build informs the UX, the UX
              drives the next round of automation.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
            {TRACKS.map((t) => (
              <Link
                key={t.title}
                href={t.href}
                className="group block bg-primary rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-7 md:p-8">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-theme-1 font-secondary font-bold">
                      {t.eyebrow}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-text/60 font-secondary font-bold">
                      {t.metric}
                    </span>
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl mb-3 text-secondary group-hover:text-theme-1 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-text leading-relaxed mb-5 text-sm md:text-base">
                    {t.summary}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {t.capabilities.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-2 text-sm text-text"
                      >
                        <span
                          aria-hidden
                          className="text-theme-1 mt-0.5 font-secondary font-bold"
                        >
                          ✓
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t border-theme-9">
                    <span className="text-xs font-secondary font-bold text-theme-1 uppercase tracking-wider">
                      See full breakdown
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-secondary font-bold text-theme-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      Open →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How I work — 3-step shared process */}
      <section className="section bg-primary">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-widest text-theme-1 mb-2 font-secondary font-bold">
              How I Work
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              The same three steps, every project.
            </h2>
            <p className="text-text">
              Whether I’m building an automation flow, a design system, or a SaaS
              front end, the rhythm is the same.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
            {PROCESS.map((p, i) => (
              <div key={p.n} className="relative">
                <div className="text-theme-1 font-heading text-5xl md:text-6xl mb-3 leading-none">
                  {p.n}
                </div>
                <h3 className="font-heading text-xl md:text-2xl mb-2">
                  {p.title}
                </h3>
                <p className="text-text leading-relaxed text-sm md:text-base">
                  {p.desc}
                </p>
                {i < PROCESS.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden md:block absolute top-8 -right-4 w-8 text-theme-9"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why me — 4 differentiators (also from bio/skills section) */}
      <section className="section bg-theme-5">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-widest text-theme-1 mb-2 font-secondary font-bold">
              Why Me
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              Background that compounds on the brief.
            </h2>
            <p className="text-text">
              The four edges that show up in the work, not just the headline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {DIFFERENTIATORS.map((d) => (
              <div
                key={d.title}
                className="p-6 rounded-xl bg-primary border border-theme-9"
              >
                <h3 className="font-heading text-base md:text-lg mb-2 text-theme-1">
                  {d.title}
                </h3>
                <p className="text-text text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}
