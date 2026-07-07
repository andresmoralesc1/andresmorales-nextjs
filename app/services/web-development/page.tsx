import type { Metadata } from 'next';
import { Cta } from '@/components/sections/cta';
import { wpImage } from '@/lib/theme';
import { ParticlesBackground } from '@/components/particles-background';

export const metadata: Metadata = {
  title: 'Web Development',
  description:
    'Next.js + React websites built for speed, SEO and conversions. From marketing landing pages to dashboards and SaaS front-ends.',
};

const CAPABILITIES = [
  {
    title: 'Next.js & React',
    desc: 'Server-rendered React with the App Router, React Server Components, route handlers and edge functions. Production-grade performance, not just demos.',
  },
  {
    title: 'Landing Pages',
    desc: 'High-converting marketing pages with fast first paint, sharp copy, and CTAs wired to your CRM, email tool, or analytics stack.',
  },
  {
    title: 'Dashboards & Web Apps',
    desc: 'Authenticated admin tools and dashboards with role-based access, tables, charts, and CSV/PDF exports. Built to scale beyond the first 100 users.',
  },
  {
    title: 'AI-Powered Features',
    desc: 'Chat interfaces, agents, and tool-calling flows wired to OpenAI, Claude, or open-source models via streaming APIs.',
  },
  {
    title: 'Headless CMS Integration',
    desc: 'Decoupled WordPress + Next.js, Sanity, Strapi, or Notion as your back office. Editors keep working; the front end stays fast.',
  },
  {
    title: 'Performance & SEO',
    desc: 'Core Web Vitals in the green, structured data, sitemap, robots.txt and hreflang — the work that makes the site findable and fast on real networks.',
  },
];

const APPROACH = [
  'I treat websites like products, not brochures. Performance, accessibility and SEO are baked in from the first commit — bolted on later is expensive.',
  'Type-safe end to end: TypeScript on the front end, validated payloads on every API route. Fewer runtime surprises, faster refactors.',
  'Ship in small, reversible PRs. Staging URLs on every push, analytics on every page, and rollback strategy before there’s a problem.',
  'I design the data model first. Forms, API routes and types stay in sync, which means features move fast and bugs stay rare.',
  'When there’s existing code, I read it before I touch it. Refactors earn their place; rewrites don’t happen on a hunch.',
];

const STACK = [
  'Next.js 14 (App Router, Server Components, Route Handlers)',
  'React 18+',
  'TypeScript',
  'Tailwind CSS',
  'PostgreSQL + Prisma / Drizzle',
  'NextAuth / Clerk',
  'OpenAI / Anthropic / Ollama APIs',
  'Vercel / Docker / self-hosted VPS',
];

export default function WebDevelopmentPage() {
  return (
    <>
      {/* Hero */}
      <section className="section bg-primary relative overflow-hidden">
        <ParticlesBackground id="hero-particles-webdev" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl mb-4">
              Web Development
            </h1>
            <p className="text-text text-lg">
              Fast, accessible, type-safe web apps — from landing pages to
              AI-powered SaaS front-ends. Production-grade from day one.
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

      {/* Capabilities */}
      <section className="section bg-theme-5">
        <div className="container-page">
          <h2 className="font-heading text-3xl md:text-4xl mb-8">
            What I build
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CAPABILITIES.map((s) => (
              <div
                key={s.title}
                className="p-8 rounded-xl bg-primary border border-theme-9"
              >
                <h3 className="font-heading text-xl mb-3 text-theme-1">
                  {s.title}
                </h3>
                <p className="text-text leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="section">
        <div className="container-page max-w-3xl space-y-6 text-text leading-relaxed">
          <h2 className="font-heading text-3xl md:text-4xl mb-2">
            How I work
          </h2>
          {APPROACH.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="pt-4">
            <a href="mailto:info@andresmorales.com.co" className="btn-theme">
              Have a project? Let’s build it.
            </a>
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="section bg-theme-5">
        <div className="container-page max-w-3xl">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">
            My stack
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-text">
            {STACK.map((t) => (
              <li
                key={t}
                className="px-4 py-2 rounded-lg bg-primary border border-theme-9"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Cta />
    </>
  );
}
