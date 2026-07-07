import { wpImage } from '@/lib/theme';
import { Cta } from '@/components/sections/cta';
import { YoutubeEmbed } from '@/components/YoutubeEmbed';

// Featured Client Work — 10 proyectos en grid 2x5
const FEATURED_PROJECTS = [
  {
    title: 'Superllantas by Socelautos',
    subtitle: 'Tire & wheel retailer — full e-commerce',
    metric: 'Live · 4×4 catalog',
    desc: 'Storefront + product system for an off-road tire retailer, with synced inventory and visual filters by width, profile, and rim.',
    image: '/sites/superllantas_co.png',
    href: 'https://superllantas.co/',
  },
  {
    title: 'Juan Becerra',
    subtitle: 'Heritage menswear e-commerce',
    metric: 'Live · premium brand',
    desc: 'Editorial store for a Colombian menswear label — mood-driven hero, classic typography, and full catalog flow.',
    image: '/sites/juanbecerra_co.png',
    href: 'https://www.juanbecerra.co/',
  },
  {
    title: 'Hostal Kambelleh',
    subtitle: 'PMS — Property Management System',
    metric: 'Live · demo access',
    desc: 'Full booking platform for a hostel chain: reservations, channels, housekeeping, analytics — built to manage multi-property operations from one dashboard.',
    image: '/sites/dash_andresmorales_com_co_login.png',
    href: 'https://dash.andresmorales.com.co/login',
    access: {
      email: 'admin@kambelleh.com',
      password: 'Kambelleh2026!',
    },
  },
  {
    title: 'HubIAgency',
    subtitle: 'AI Agency — full brand + web',
    metric: 'Live · AI services',
    desc: 'Brand identity, site, and tools for an AI automation agency.',
    image: '/sites/hubiagency_vercel_app.png',
    href: 'https://hubiagency.com/',
  },
  {
    title: 'BarrioTech — GPS Street Sellers',
    subtitle: 'GPS marketplace for street vendors',
    metric: 'Live · 7 cities',
    desc: 'AI-driven GPS platform connecting informal sellers with nearby customers.',
    image: '/sites/gps_andresmorales_com_co.png',
    href: 'https://gps.andresmorales.com.co/',
  },
  {
    title: 'SoapArtesana',
    subtitle: 'Artisan soap e-commerce',
    metric: 'Live · botanical catalog',
    desc: 'Full e-commerce platform for handcrafted natural soaps.',
    image: '/sites/soapartesana_vercel_app.png',
    href: 'https://soapartesana.vercel.app/',
  },
  {
    title: 'Carmen Job Search',
    subtitle: 'AI-powered job search tool',
    metric: 'Live · AI assistant',
    desc: 'SaaS that matches candidates to roles using an AI agent.',
    image: '/sites/carmen-job-search_vercel_app.png',
    href: 'https://carmen-job-search.vercel.app/',
  },
  {
    title: 'Sama Sculpt',
    subtitle: 'Facial sculpting brand + booking',
    metric: 'Live · booking flow',
    desc: 'Brand identity, site, and appointment booking for a sculpting studio.',
    image: '/sites/sama-sculpt_vercel_app.png',
    href: 'https://sama-sculpt.vercel.app/',
  },
  {
    title: 'Talobot',
    subtitle: 'Telegram bot service',
    metric: 'Live · ES/EN',
    desc: 'Marketing site for a Telegram automation product.',
    image: '/sites/talobot_vercel_app_es.png',
    href: 'https://talobot.vercel.app/es',
  },
  {
    title: 'Tory Skateshop',
    subtitle: 'Skate and streetwear retail',
    metric: 'Live · 64 products',
    desc: 'Streetwear and skate shop with branded catalog, brand filters (Adidas, Bape, DC), and integrated chatbot for support.',
    image: '/sites/toryskateshop_com.png',
    href: 'https://toryskateshop.com/',
  },
];

// Smart Automation — 4 cases with correct images (do NOT use Superllantas image)
const AUTOMATION_CASES = [
  {
    title: 'From 90 Minutes to 15 Minutes',
    subtitle: 'Complete Product Automation for E-commerce',
    metric: '6× faster',
    desc: 'AI agents that bulk-upload products, write SEO copy, and ship to marketplaces — what used to be a 90-minute manual task now finishes in 15.',
    image: wpImage('/wp-content/uploads/2025/09/Untitled-design-1.gif'),
    badge: 'Featured',
  },
  {
    title: 'Copy That Sells + SEO Optimized',
    subtitle: 'AI-generated product descriptions',
    metric: 'CTR +47%',
    desc: 'From phone snapshot to e-commerce ready, optimized for both conversion and organic search.',
    image: wpImage('/wp-content/uploads/2025/09/Untitled-design.gif'),
    badge: 'Case study',
  },
  {
    title: 'Professional Photos in Seconds',
    subtitle: 'AI product photography + retouching',
    metric: '12 hrs → 12 min',
    desc: 'Replaces studio shoots — clean white background, lighting, and color correction done by AI in batch.',
    image: '/uploads/2025/06/pexels-photos-scaled.jpg',
    badge: 'Live',
  },
  {
    title: 'Multi-Platform Auto-Upload',
    subtitle: 'One click. Five platforms. Zero manual work.',
    metric: '5 channels in 1 action',
    desc: 'Publish a product once — it ships to Shopify, Mercado Libre, Falabella, Linio, and the brand\'s own site automatically.',
    image: '/uploads/2025/06/pexels-multi-scaled.jpg',
    badge: 'Workflow',
  },
];

// AI Creative in Action — videos migrated from the legacy WP portfolio.
// Shorts are 9:16 (portrait); landscape videos are 16:9.
const CREATIVE_VIDEOS = [
  {
    id: 'fRkb3zK9k-o',
    title: 'AI or Real Explosions Await',
    orientation: 'landscape' as const,
    caption: 'Full cinematic ad built with AI video tools',
  },
  {
    id: 'mL5cogF4oAw',
    title: 'Video Ready Surreal Ad',
    orientation: 'landscape' as const,
    caption: 'Surreal commercial generated end-to-end with generative AI',
  },
  {
    id: '3_fOS-UILJ8',
    title: 'Quick Product Demo',
    orientation: 'portrait' as const,
    caption: 'Vertical ad creative for social media automation flows',
  },
  {
    id: '6fcPRr3VVTc',
    title: 'WhatsApp Creative Walkthrough',
    orientation: 'portrait' as const,
    caption: 'Behind-the-scenes of turning a WhatsApp clip into ad-ready',
  },
  {
    id: 'ml5SfgmmDbw',
    title: 'Short-form AI Visual',
    orientation: 'portrait' as const,
    caption: 'Vertical short created entirely in AI',
  },
  {
    id: 'ZfxnA1rrcd4',
    title: 'AI Video Experiment',
    orientation: 'portrait' as const,
    caption: 'Concept-to-frame generation pipeline',
  },
];

const SERVICE_CATEGORIES = [
  {
    title: 'Personalized Dashboards',
    desc: 'Custom internal tools that turn raw data into decisions — built for the way your team actually works.',
    images: [
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-112222.png'),
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-122124.png'),
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-122107.png'),
    ],
  },
  {
    title: 'AI Automations',
    desc: 'Workflows that replace manual, repetitive work — uploads, processing, routing, follow-ups.',
    images: [
      wpImage('/wp-content/uploads/2023/04/5.png'),
      wpImage('/wp-content/uploads/2023/04/11.png'),
    ],
  },
  {
    title: 'Social Media Automation',
    desc: 'Scheduling, generation, and analytics on autopilot. Less ops, more content shipping.',
    images: [
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-11-205339.png'),
      wpImage('/wp-content/uploads/2023/04/13.png'),
      wpImage('/wp-content/uploads/2023/04/15.png'),
      wpImage('/wp-content/uploads/2023/04/17.png'),
    ],
  },
];

export const metadata = {
  title: 'Portfolio',
  description:
    'Recent client work: e-commerce, booking systems, dashboards and automations for clients across LATAM. Plus AI-generated creative experiments. Some include demo access so you can poke around.',
};

export default function PortfolioPage() {
  return (
    <>
      {/* Hero — pitch + dual CTA */}
      <section className="section bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-theme-1 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-theme-4 blur-3xl" />
        </div>
        <div className="container-page text-center max-w-3xl relative z-10">
          <p className="text-xs uppercase tracking-widest text-theme-1 mb-3 font-secondary font-bold">
            Portfolio
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4">
            Real sites, real systems, real outcomes.
          </h1>
          <p className="text-text text-lg md:text-xl mb-8">
            E-commerce, marketplaces, and AI-powered automations shipped for
            clients who want to ship faster and sell more.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://calendar.app.google/W8BViMH3wNwoP7ZD9"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme-1 hover:bg-theme-2 text-primary font-secondary font-bold rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Start a project
              <span aria-hidden>→</span>
            </a>
            <a
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary border border-theme-9 hover:border-theme-1 text-secondary font-secondary font-bold rounded-lg transition-all"
            >
              See services
            </a>
          </div>
        </div>
      </section>

      {/* Featured Client Work — grid 2x5 con screenshots reales */}
      <section className="section bg-theme-5">
        <div className="container-page">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-theme-1 mb-2 font-secondary font-bold">
              Featured Client Work
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              Sites and platforms in production
            </h2>
            <p className="text-text">
              Ten live projects. Click any card to open the site and see it in
              the wild.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {FEATURED_PROJECTS.map((p) => (
              <a
                key={p.title}
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="group block bg-primary rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-theme-9">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-primary font-secondary font-bold px-2.5 py-1 rounded-full bg-theme-1 shadow-md">
                    Live
                  </span>
                </div>
                <div className="p-5">
                  <span className="inline-block text-[10px] uppercase tracking-widest text-theme-1 font-secondary font-bold mb-2">
                    {p.subtitle}
                  </span>
                  <h3 className="font-heading text-xl md:text-2xl mb-2 text-secondary">
                    {p.title}
                  </h3>
                  <p className="text-sm text-text leading-relaxed mb-3">
                    {p.desc}
                  </p>
                  {p.access && (
                    <div className="border-t border-theme-8 mt-3 pt-3 space-y-2">
                      <div className="text-[10px] uppercase tracking-widest text-theme-1 font-secondary font-bold">
                        Demo Credentials
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-secondary font-bold text-text/60 uppercase tracking-wider w-14">
                          Email
                        </span>
                        <code className="font-mono text-secondary bg-theme-8/40 px-2 py-1 rounded flex-1 break-all">
                          {p.access.email}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-secondary font-bold text-text/60 uppercase tracking-wider w-14">
                          Pass
                        </span>
                        <code className="font-mono text-secondary bg-theme-8/40 px-2 py-1 rounded flex-1 break-all">
                          {p.access.password}
                        </code>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-secondary font-bold text-theme-1 uppercase tracking-wider">
                      {p.metric}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-secondary font-bold text-theme-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                      Visit live ↗
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Automation in Action — 2x2 grid */}
      <section className="section bg-primary">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-theme-1 mb-2 font-secondary font-bold">
              Smart Automation in Action
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              What gets automated, ships faster
            </h2>
            <p className="text-text max-w-2xl mx-auto">
              Real workflows I shipped for clients who needed to do more in
              less time — measured by outcomes, not features.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {AUTOMATION_CASES.map((c, idx) => (
              <article
                key={c.title}
                className="bg-background rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-video bg-theme-9 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-primary font-secondary font-bold px-2.5 py-1 rounded-full bg-theme-1 shadow-md">
                    {c.badge}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-secondary font-bold text-theme-1 uppercase tracking-wider">
                      Case #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-text">·</span>
                    <span className="text-xs text-text">{c.subtitle}</span>
                  </div>
                  <h3 className="font-heading text-xl md:text-2xl mb-2">
                    {c.title}
                  </h3>
                  <p className="text-sm text-text leading-relaxed mb-3">
                    {c.desc}
                  </p>
                  <div className="text-sm font-secondary font-bold text-theme-1">
                    {c.metric}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AI Creative in Action — videos migrated from the legacy WP portfolio */}
      <section className="section bg-theme-5">
        <div className="container-page">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-theme-1 mb-2 font-secondary font-bold">
              AI Creative in Action
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              Video ads generated with the same AI pipelines I ship for clients
            </h2>
            <p className="text-text">
              Real ad samples built with generative video tools. The same
              workflow goes behind every client project — from concept to
              render to publish-ready cut.
            </p>
          </div>

          {/* Landscape videos — full-width 16:9 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {CREATIVE_VIDEOS.filter((v) => v.orientation === 'landscape').map(
              (v) => (
                <div key={v.id}>
                  <YoutubeEmbed
                    id={v.id}
                    title={v.title}
                    orientation="landscape"
                  />
                  <div className="mt-3">
                    <h3 className="font-heading text-lg md:text-xl mb-1">
                      {v.title}
                    </h3>
                    <p className="text-sm text-text">{v.caption}</p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Portrait / Shorts — 9:16 grid centered */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {CREATIVE_VIDEOS.filter((v) => v.orientation === 'portrait').map(
              (v) => (
                <div key={v.id}>
                  <YoutubeEmbed
                    id={v.id}
                    title={v.title}
                    orientation="portrait"
                  />
                  <div className="mt-2">
                    <h3 className="font-heading text-sm md:text-base leading-tight mb-1">
                      {v.title}
                    </h3>
                    <p className="text-xs text-text leading-snug">
                      {v.caption}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Service Categories — 3 categories with descriptions */}
      <section className="section bg-primary">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-theme-1 mb-2 font-secondary font-bold">
              Behind the Work
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              Categories I ship in
            </h2>
            <p className="text-text max-w-2xl mx-auto">
              The kind of systems I build over and over for clients who want
              to automate the repetitive work.
            </p>
          </div>
          <div className="space-y-12">
            {SERVICE_CATEGORIES.map((cat) => (
              <div key={cat.title}>
                <div className="mb-5">
                  <h3 className="font-heading text-xl md:text-2xl mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-text text-sm max-w-3xl">{cat.desc}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {cat.images.map((src, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden bg-theme-9 hover:scale-[1.03] hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <img
                        src={src}
                        alt={`${cat.title} example ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}
