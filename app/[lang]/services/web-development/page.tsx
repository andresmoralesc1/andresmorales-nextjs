import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Cta } from '@/components/sections/cta';
import { wpImage } from '@/lib/theme';
import { ParticlesBackground } from '@/components/particles-background';
import { LOCALES, isLocale, getDictionary, getLocalizedPath } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd, serviceSchema, breadcrumbSchema } from '@/lib/json-ld';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { Reveal } from '@/components/reveal';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { headers } from 'next/headers';




export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  return pageMetadata({
    title: dict.metadata.webdevTitle,
    description: dict.metadata.webdevDescription,
    locale: safeLang,
    path: '/services/web-development',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

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
  {
    n: '01',
    title: 'Product, not brochure',
    desc: 'I treat websites like products, not brochures. Performance, accessibility and SEO are baked in from the first commit — bolted on later is expensive.',
  },
  {
    n: '02',
    title: 'Type-safe end-to-end',
    desc: 'Type-safe end to end: TypeScript on the front end, validated payloads on every API route. Fewer runtime surprises, faster refactors.',
  },
  {
    n: '03',
    title: 'Small reversible PRs',
    desc: 'Ship in small, reversible PRs. Staging URLs on every push, analytics on every page, and rollback strategy before there’s a problem.',
  },
  {
    n: '04',
    title: 'Data model first',
    desc: 'I design the data model first. Forms, API routes and types stay in sync, which means features move fast and bugs stay rare.',
  },
  {
    n: '05',
    title: 'Read before rewrite',
    desc: 'When there’s existing code, I read it before I touch it. Refactors earn their place; rewrites don’t happen on a hunch.',
  },
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

export default async function WebDevelopmentPage() {
  const h = await headers();
  const lang = (h.get('x-locale') as 'en' | 'es' | 'pt') || 'en';
  const dict = await getCurrentDictionary();
  const locale = await getCurrentLocale();
  const c = dict.common;
  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Web Development',
          description: 'Next.js + React websites built for speed, SEO and conversions. From marketing landing pages to dashboards and SaaS front-ends.',
          path: '/services/web-development',
          serviceType: 'Web Development',
          areaServed: ['CO', 'US', 'MX', 'AR', 'ES'],
          priceRange: '$$$',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'Web Development', path: '/services/web-development' },
        ])}
      />
      {/* Hero */}
      <section className="section bg-background relative overflow-hidden">
        <ParticlesBackground id="hero-particles-webdev" variant="soft" />
        <div className="container-page grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-black mb-3 font-secondary font-bold">
              Track 03 · Web Development
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-black leading-[1.05] tracking-tight">
              {dict.metadata.webdevH1}
            </h1>
            <p className="text-secondary text-lg md:text-xl max-w-xl">
              Fast, accessible, type-safe web apps — from landing pages to
              AI-powered SaaS front-ends. Production-grade from day one.
            </p>
          </div>
          <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-theme-9 ring-1 ring-theme-9/30 shadow-2xl">
            <Image
              src={wpImage('/wp-content/uploads/2026/07/gps_andresmorales_com_co.png')}
              alt="BarrioTech (gps.andresmorales.com.co): landing page for the GPS street sellers platform I built and operate"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={80}
              priority
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Breadcrumb — visible trail under the hero. Pairs with the
          breadcrumbSchema() JSON-LD above; the trail MUST agree or
          Google will reject the rich-result breadcrumbs. */}
      <div className="container-page pt-4">
        <Breadcrumbs
          lang={lang}
          items={[
            { name: c.breadcrumbServices, path: '/services' },
            { name: dict.metadata.webdevBreadcrumb, current: true },
          ]}
        />
      </div>

      {/* Stats + featured case */}
      <section className="bg-primary">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">9+</div>
              <p className="text-secondary text-sm md:text-base">
                production sites shipped for clients across LATAM and the US
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">95+</div>
              <p className="text-secondary text-sm md:text-base">
                average Lighthouse performance score across shipped projects
              </p>
            </div>
            <div>
              <div className="font-heading text-4xl md:text-5xl text-accent leading-none mb-2">&lt;200ms</div>
              <p className="text-secondary text-sm md:text-base">
                TTFB on Next.js apps deployed on edge runtimes
              </p>
            </div>
          </div>
        </div>
        <div className="container-page pb-12">
          <div className="bg-background rounded-2xl overflow-hidden border border-theme-9 grid md:grid-cols-2 items-center">
            <div className="aspect-[4/3] md:aspect-auto md:h-full bg-theme-9 relative">
              <Image
                src="/sites/gps_andresmorales_com_co.png"
                alt="BarrioTech (gps.andresmorales.com.co): live GPS street-sellers platform built with Next.js"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-black mb-3 font-secondary font-bold">
                Featured case
              </p>
              <h3 className="font-heading text-2xl md:text-3xl mb-3 text-black">
                BarrioTech · live in production
              </h3>
              <p className="text-secondary leading-relaxed mb-5">
                A live GPS platform for street sellers in Cali — geolocation,
                product catalog, and admin dashboard, built end to end with
                Next.js, PostgreSQL and Prisma.
              </p>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1 text-sm font-secondary font-bold text-secondary uppercase tracking-wider hover:gap-2 hover:text-accent transition-all"
              >
                See the full case study →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="section bg-theme-5">
        <Reveal stagger className="container-page">
          <h2 className="font-heading text-3xl md:text-4xl mb-8">
            What I build
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CAPABILITIES.map((s) => (
              <div
                key={s.title}
                className="p-8 rounded-xl bg-primary border border-theme-9"
              >
                <h3 className="font-heading text-xl mb-3 text-secondary">
                  {s.title}
                </h3>
                <p className="text-text leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Approach */}
      <section className="section">
        <Reveal className="container-page">
          <div className="max-w-3xl mb-12">
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              How I work
            </h2>
            <p className="text-text leading-relaxed">
              Five steps, every project. The same rhythm whether the
              deliverable is a landing page or a full SaaS front-end.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {APPROACH.map((p) => (
              <div key={p.n} className="relative">
                <div className="text-accent font-heading text-4xl md:text-5xl mb-3 leading-none">
                  {p.n}
                </div>
                <h3 className="font-heading text-lg md:text-xl mb-2 text-secondary">
                  {p.title}
                </h3>
                <p className="text-text leading-relaxed text-sm md:text-base">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="pt-12 flex flex-wrap items-center gap-3">
            <a
              href="https://calendar.app.google/NHF1ScCWjh4WJaey6"
              target="_blank"
              rel="noreferrer"
              className="btn-theme text-base px-8 py-4 shadow-lg"
            >
              Book a free scoping call →
            </a>
            <a
              href="/brief"
              className="inline-flex items-center justify-center px-8 py-4 rounded-md font-secondary font-bold uppercase tracking-wide text-sm border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary transition-colors"
            >
              Or send a brief
            </a>
          </div>
        </Reveal>
      </section>

      {/* Stack */}
      <section className="section bg-theme-5">
        <Reveal className="container-page max-w-3xl">
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
        </Reveal>
      </section>

      {/* Previous service */}
      <section className="section bg-background">
        <div className="container-page">
          <Link
            href="/services/ui-ux-design"
            className="group flex items-center gap-4 p-6 md:p-8 rounded-2xl bg-primary border border-theme-9 hover:border-theme-1 hover:shadow-xl transition-all w-full md:w-1/2"
          >
            <span aria-hidden className="text-3xl md:text-4xl text-accent group-hover:-translate-x-2 transition-transform">
              ←
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-secondary font-secondary font-bold mb-1">
                Previous service
              </p>
              <h3 className="font-heading text-lg md:text-xl text-black group-hover:text-accent transition-colors">
                UI/UX Design
              </h3>
            </div>
          </Link>
        </div>
      </section>

      <Cta />
    </>
  );
}
