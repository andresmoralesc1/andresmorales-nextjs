import { pageMetadata } from '@/lib/metadata';
import { wpImage } from '@/lib/theme';
import { YoutubeEmbed } from '@/components/YoutubeEmbed';
import { LazyParticles } from '@/components/lazy-particles';
import { Cta } from '@/components/sections/cta';
import { PortfolioInteractiveGrid, type ProjectItem, type AutomationItem } from '@/components/sections/portfolio-interactive-grid';
import { PortfolioFloatingDock } from '@/components/sections/portfolio-floating-dock';
import { PortfolioRoiCalculator } from '@/components/sections/portfolio-roi-calculator';
import { PortfolioFaq } from '@/components/sections/portfolio-faq';
import { DeveloperTerminalModal } from '@/components/ui/developer-terminal-modal';
import Image from 'next/image';
import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { Reveal } from '@/components/reveal';
import { JsonLd, breadcrumbSchema } from '@/lib/json-ld';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import type { Metadata } from 'next';

type ProjectDefinition = {
  key: string;
  image: string;
  href: string;
  caseStudySlug?: string;
  category: 'saas' | 'ecommerce' | 'ai';
  tags: string[];
  status?: 'live' | 'archived';
  access?: {
    email: string;
    password: string;
  };
};

const FEATURED_PROJECTS: ProjectDefinition[] = [
  {
    key: 'proj1',
    image: '/sites/gps_andresmorales_com_co.png',
    href: 'https://barriotech.com.co/',
    caseStudySlug: 'barriotech',
    category: 'saas',
    tags: ['Next.js', 'PostgreSQL', 'Leaflet', 'Wompi'],
  },
  {
    key: 'proj2',
    image: '/sites/juanbecerra_co.png',
    href: 'https://www.juanbecerra.co/',
    caseStudySlug: 'juan-becerra',
    category: 'ecommerce',
    tags: ['Next.js', 'Shopify Storefront', 'TypeScript'],
  },
  {
    key: 'proj3',
    image: '/sites/dash_andresmorales_com_co_login.png',
    href: 'https://dash.andresmorales.com.co/login',
    caseStudySlug: 'kambelleh',
    category: 'saas',
    tags: ['Next.js', 'PostgreSQL', 'Prisma', 'Multi-tenant'],
    access: {
      email: 'admin@kambelleh.com',
      password: 'Kambelleh2026!',
    },
  },
  {
    key: 'proj4',
    image: '/sites/temptum_home.png',
    href: 'https://temptum.io/',
    caseStudySlug: 'temptum',
    category: 'ai',
    tags: ['Next.js 16', 'TypeScript', 'Brevo API'],
  },
  {
    key: 'proj5',
    image: '/sites/superllantas_co.png',
    href: 'https://superllantas.co/',
    caseStudySlug: 'superllantas',
    category: 'ecommerce',
    tags: ['Next.js', 'Catálogo 4x4', 'PostgreSQL'],
  },
  {
    key: 'proj6',
    image: '/sites/soapartesana_vercel_app.png',
    href: 'https://soapartesana.vercel.app/',
    caseStudySlug: 'soapartesana',
    category: 'ecommerce',
    tags: ['Next.js', 'Shopify Headless', 'Tailwind'],
  },
  {
    key: 'proj7',
    image: '/sites/carmen-job-search_vercel_app.png',
    href: 'https://carmen-job-search.vercel.app/',
    caseStudySlug: 'carmen-job-search',
    category: 'ai',
    tags: ['Next.js', 'OpenAI API', 'Agentes IA'],
  },
  {
    key: 'proj8',
    image: '/sites/talobot_vercel_app_es.png',
    href: 'https://talobot.vercel.app/es',
    caseStudySlug: 'talobot',
    category: 'ai',
    tags: ['Next.js', 'Claude API', 'Chatbot'],
  },
  {
    key: 'proj9',
    image: '/sites/cleida_home.png',
    href: 'https://cleida.com.co/',
    caseStudySlug: 'cleida',
    category: 'ai',
    tags: ['Next.js', 'Mailcow', 'Infraestructura'],
  },
];

const MORE_PROJECTS: ProjectDefinition[] = [
  {
    key: 'proj10',
    image: '/sites/gato_home.png',
    href: 'https://gatocolectivo.com/',
    caseStudySlug: 'gato-colectivo',
    category: 'saas',
    tags: ['Next.js', 'Marketplace', 'Wompi', 'Leaflet'],
  },
  {
    key: 'proj11',
    image: '/sites/mecca_home.png',
    href: 'https://shop.andresmorales.com.co/',
    caseStudySlug: 'mecca',
    category: 'ecommerce',
    tags: ['Next.js', 'Mastershop API', '568 SKUs'],
    status: 'archived',
  },
  {
    key: 'proj13',
    image: '/sites/hubiagency_vercel_app.png',
    href: 'https://hubiagency.vercel.app/',
    caseStudySlug: 'hubiagency',
    category: 'ai',
    tags: ['Next.js', 'Tailwind', 'Vercel'],
  },
  {
    key: 'proj14',
    image: '/sites/impresos_americana.png',
    href: 'https://impresos-americana.vercel.app',
    caseStudySlug: 'impresos-americana',
    category: 'ecommerce',
    tags: ['Next.js', 'Cotizador 3D', 'Tailwind', 'Material POP'],
  },
  {
    key: 'proj15',
    image: '/sites/embryoglass_home.png',
    href: 'https://github.com/andresmoralesc1/embryo-glass-dashboard',
    caseStudySlug: 'embryoglass',
    category: 'saas',
    tags: ['Next.js 16', 'TypeScript', 'White Glass', 'HealthTech'],
  },
  {
    key: 'proj16',
    image: '/sites/quenivel_home.png',
    href: 'https://quenivelmaribel.com',
    caseStudySlug: 'que-nivel-maribel',
    category: 'saas',
    tags: ['Next.js 15', 'Prisma', 'CRM Cultural', 'Eventos'],
  },
  {
    key: 'proj17',
    image: '/sites/liz_candelo.png',
    href: 'https://liz-candelo-poeta.vercel.app',
    caseStudySlug: 'liz-candelo',
    category: 'saas',
    tags: ['Next.js', 'TypeScript', 'Archivo Poético', 'Editorial'],
  },
  {
    key: 'proj18',
    image: '/sites/toryskateshop_com.png',
    href: 'https://github.com/andresmoralesc1/Tory_chatbot',
    category: 'ecommerce',
    tags: ['WooCommerce', 'Chatbot IA', 'Streetwear', 'E-commerce'],
  },
];

const AUTOMATION_CASES = ['case1', 'case2', 'case3', 'case4'] as const;

const AUTOMATION_TAGS: Record<(typeof AUTOMATION_CASES)[number], string[]> = {
  case1: ['n8n', 'OpenAI', 'E-commerce Bulk'],
  case2: ['PostgreSQL', 'Webhooks', 'CRON Sync'],
  case3: ['Python', 'Google Sheets API', 'Brevo'],
  case4: ['Next.js', 'Pexels API', 'Multicanal'],
};

const AUTOMATION_PIPELINES: Record<
  (typeof AUTOMATION_CASES)[number],
  { from: string; mid: string; to: string }
> = {
  case1: { from: 'CSV / ERP', mid: 'OpenAI + Vision', to: 'Marketplaces Sync' },
  case2: { from: 'Foto Celular', mid: 'SEO Copy Engine', to: 'Shopify Store' },
  case3: { from: 'Foto Cruda', mid: 'IA Fondo & Color', to: 'Assets 4K WebP' },
  case4: { from: '1 Clic Admin', mid: 'Orquestador n8n', to: '5 Canales' },
};

const PORTFOLIO_FAQS: Record<
  'en' | 'es' | 'pt',
  Array<{ question: string; answer: string }>
> = {
  es: [
    {
      question: '¿Qué tipo de proyectos y automatizaciones desarrollas?',
      answer:
        'Diseño y construyo soluciones digitales de alto impacto: desde plataformas web y aplicaciones SaaS en Next.js 16 y PostgreSQL, hasta arquitecturas de automatización con n8n, Make y agentes de IA autónomos que eliminan tareas operativas manuales en e-commerce, logística y servicios.',
    },
    {
      question: '¿Cuánto tiempo toma implementar un flujo de automatización o una web app?',
      answer:
        'Los flujos de automatización e integraciones de IA suelen completarse en 1 a 2 semanas. Plataformas web completas y aplicaciones SaaS a medida toman habitualmente entre 3 y 6 semanas con entregas funcionales semanales.',
    },
    {
      question: '¿Cómo se integran las automatizaciones con las herramientas que ya uso?',
      answer:
        'No necesitas cambiar tu software actual. Nos conectamos directamente mediante Webhooks, APIs REST y bases de datos a herramientas como Shopify, WooCommerce, Mercado Libre, Google Sheets, WhatsApp, CRM (HubSpot, Brevo) y ERPs existentes.',
    },
    {
      question: '¿Qué retorno de inversión (ROI) promedio tienen estos desarrollos?',
      answer:
        'Nuestros clientes logran recuperar más del 70% del tiempo operativo invertido en tareas repetitivas, ahorrando en promedio entre $1,000 y $3,500 USD al mes, además de reducir a cero las comisiones a plataformas intermediarias al contar con infraestructura propia.',
    },
    {
      question: '¿Quién es el dueño del código fuente y los accesos?',
      answer:
        'Tú eres el dueño al 100%. Todo el código fuente en GitHub, los contenedores, las bases de datos y las cuentas de despliegue se entregan documentados y bajo tu propiedad directa.',
    },
  ],
  en: [
    {
      question: 'What kind of systems and automations do you build?',
      answer:
        'I build full-stack web platforms and SaaS on Next.js 16 + PostgreSQL, alongside autonomous automation architectures using n8n, Make, and custom AI agents that eliminate operational bottlenecks in e-commerce, logistics, and private business workflows.',
    },
    {
      question: 'How long does implementation take?',
      answer:
        'Automation workflows and API integrations typically ship in 1 to 2 weeks. Full custom web apps and production platforms take 3 to 6 weeks with weekly working deployments.',
    },
    {
      question: 'How do you integrate with my existing tools?',
      answer:
        'You do not need to replace your stack. We connect seamlessly via Webhooks, REST APIs, and direct database sync with Shopify, WooCommerce, PostgreSQL, WhatsApp Business, CRMs, and custom ERPs.',
    },
    {
      question: 'What is the expected ROI of operational automation?',
      answer:
        'Clients typically reclaim over 70% of manual operating hours, saving between $1,000 and $3,500 USD monthly, while removing third-party fees through self-owned infrastructure.',
    },
    {
      question: 'Who owns the code and intellectual property?',
      answer:
        'You own 100% of the code, GitHub repositories, databases, and infrastructure accounts. Everything is handed over with zero lock-in.',
    },
  ],
  pt: [
    {
      question: 'Que tipos de projetos e automações você desenvolve?',
      answer:
        'Desenvolvo plataformas web completas e SaaS em Next.js 16 e PostgreSQL, além de arquiteturas de automação com n8n, Make e agentes de IA que eliminam tarefas repetitivas em e-commerce e operações empresariais.',
    },
    {
      question: 'Quanto tempo leva a implementação?',
      answer:
        'Fluxos de automação e integrações de IA levam de 1 a 2 semanas. Plataformas web completas e SaaS sob medida são entregues entre 3 e 6 semanas.',
    },
    {
      question: 'Como as automações se conectam às ferramentas que já uso?',
      answer:
        'Conectamos diretamente via APIs e Webhooks ao Shopify, WooCommerce, WhatsApp, Google Sheets, bancos de dados PostgreSQL e ERPs sem trocar seus sistemas atuais.',
    },
    {
      question: 'Qual é o ROI esperado dessas soluções?',
      answer:
        'Recuperação média de mais de 70% do tempo operacional manual, com economia média de $1.000 a $3.500 USD por mês e zero comissões para terceiros.',
    },
    {
      question: 'Quem é dono do código e da propriedade intelectual?',
      answer:
        'Você é o proprietário de 100% do código-fonte, repositórios GitHub e bancos de dados entregues.',
    },
  ],
};

// AI Creative in Action — videos migrated from the legacy WP portfolio.
// Shorts are 9:16 (portrait); landscape videos are 16:9.
const CREATIVE_VIDEOS = [
  { id: 'fRkb3zK9k-o', key: 'vid1', orientation: 'landscape' as const },
  { id: 'mL5cogF4oAw', key: 'vid2', orientation: 'landscape' as const },
  { id: '3_fOS-UILJ8', key: 'vid3', orientation: 'portrait' as const },
  { id: '6fcPRr3VVTc', key: 'vid4', orientation: 'portrait' as const },
  { id: 'ml5SfgmmDbw', key: 'vid5', orientation: 'portrait' as const },
  { id: 'ZfxnA1rrcd4', key: 'vid6', orientation: 'portrait' as const },
];

const SERVICE_CATEGORIES = [
  {
    key: 'cat1',
    images: [
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-112222.png'),
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-122124.png'),
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-12-122107.png'),
    ],
  },
  {
    key: 'cat3',
    images: [
      wpImage('/wp-content/uploads/2025/06/Captura-de-pantalla-2025-06-11-205339.png'),
      wpImage('/wp-content/uploads/2023/04/13.png'),
      wpImage('/wp-content/uploads/2023/04/15.png'),
      wpImage('/wp-content/uploads/2023/04/17.png'),
    ],
  },
];

const AUTOMATION_IMAGES: Record<(typeof AUTOMATION_CASES)[number], string> = {
  case1: wpImage('/wp-content/uploads/2025/09/Untitled-design-1.gif'),
  case2: wpImage('/wp-content/uploads/2025/09/Untitled-design.gif'),
  case3: '/uploads/2025/06/pexels-photos-scaled.jpg',
  case4: '/uploads/2025/06/pexels-multi-scaled.jpg',
};

type PortfolioDict = Record<string, string>;

export default async function PortfolioPage() {
  const [dict, lang] = await Promise.all([getCurrentDictionary(), getCurrentLocale()]);
  const p = dict.portfolio as unknown as PortfolioDict;

  // CollectionPage (portfolio) + ItemList of the 9 featured projects +
  // BreadcrumbList. Each project becomes a `ListItem` with a CreativeWork
  // body (provider = the Person entity in the root layout) so Google can
  // surface portfolio work as a structured list in branded searches.
  const portfolioUrl = `https://andresmorales.com.co${lang === 'en' ? '' : `/${lang}`}/portfolio`;

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dict.metadata.portfolioTitle,
    description: dict.metadata.portfolioDescription,
    url: portfolioUrl,
    inLanguage: lang === 'es' ? 'es-CO' : lang === 'pt' ? 'pt-BR' : 'en-US',
    publisher: { '@id': 'https://andresmorales.com.co/#person' },
    isPartOf: { '@id': 'https://andresmorales.com.co/#website' },
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: p.featuredTitle,
    description: p.featuredSubtitle,
    numberOfItems: FEATURED_PROJECTS.length,
    itemListElement: FEATURED_PROJECTS.map((proj, idx) => {
      const title = p[`${proj.key}Title`] || proj.key;
      const desc = p[`${proj.key}Desc`] || '';
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: title,
        description: desc,
        url: proj.href,
        item: {
          '@type': 'CreativeWork',
          name: title,
          description: desc,
          url: proj.href,
          creator: { '@id': 'https://andresmorales.com.co/#person' },
          provider: { '@id': 'https://andresmorales.com.co/#person' },
        },
      };
    }),
  };

  // Second ItemList — More work (additional live projects not in featured)
  const moreItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: p.moreTitle,
    description: p.moreSubtitle,
    numberOfItems: MORE_PROJECTS.length,
    itemListElement: MORE_PROJECTS.map((proj, idx) => {
      const title = p[`${proj.key}Title`] || proj.key;
      const desc = p[`${proj.key}Desc`] || '';
      return {
        '@type': 'ListItem',
        position: idx + 1,
        name: title,
        description: desc,
        url: proj.href,
        item: {
          '@type': 'CreativeWork',
          name: title,
          description: desc,
          url: proj.href,
          creator: { '@id': 'https://andresmorales.com.co/#person' },
          provider: { '@id': 'https://andresmorales.com.co/#person' },
        },
      };
    }),
  };

  const breadcrumbs = breadcrumbSchema([
    {
      name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home',
      path: lang === 'en' ? '/' : `/${lang}`,
    },
    { name: dict.metadata.portfolioTitle, path: lang === 'en' ? '/portfolio' : `/${lang}/portfolio` },
  ]);

  const allProjects: ProjectItem[] = [
    ...FEATURED_PROJECTS,
    ...MORE_PROJECTS,
  ].map((proj) => ({
    key: proj.key,
    image: proj.image,
    href: proj.href,
    caseStudySlug: proj.caseStudySlug,
    category: proj.category,
    tags: proj.tags,
    status: proj.status || 'live',
    access: proj.access,
    title: p[`${proj.key}Title`] || proj.key,
    subtitle: p[`${proj.key}Subtitle`] || '',
    metric: p[`${proj.key}Metric`] || '',
    desc: p[`${proj.key}Desc`] || '',
  }));

  const automationItems: AutomationItem[] = AUTOMATION_CASES.map((key) => ({
    key,
    image: AUTOMATION_IMAGES[key],
    title: p[`${key}Title`] || '',
    subtitle: p[`${key}Subtitle`] || '',
    metric: p[`${key}Metric`] || '',
    desc: p[`${key}Desc`] || '',
    badge: p[`${key}Badge`] || '',
    tags: AUTOMATION_TAGS[key] || [],
  }));

  const currentFaqs = PORTFOLIO_FAQS[lang as 'en' | 'es' | 'pt'] || PORTFOLIO_FAQS.es;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: currentFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={[collectionSchema, itemList, moreItemList, breadcrumbs, faqSchema]} />
      {/* Hero — pitch + triple CTA + Bento Intent Selector + Live Metric Strip */}
      <section className="pt-14 md:pt-20 pb-10 md:pb-14 bg-background relative overflow-hidden">
        <LazyParticles id="hero-particles-portfolio" variant="soft" />
        <div className="container-page text-center max-w-4xl relative z-10">
          <p className="text-xs uppercase tracking-widest text-secondary mb-3 font-secondary font-bold">
            {p.heroEyebrow}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-4 text-secondary">
            {dict.metadata.portfolioH1}
          </h1>
          <p className="text-secondary text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            {p.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
            <a
              href={lang === 'en' ? '/brief-web' : `/${lang}/brief-web`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-theme-1 hover:bg-theme-2 text-secondary font-secondary font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {p.heroCtaBrief}
              <span aria-hidden>→</span>
            </a>
            <a
              href={CALENDAR_BOOKING_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary font-secondary font-bold rounded-lg transition-all"
            >
              {p.heroCta1}
            </a>
          </div>

          {/* Bento Intent Selector — 3 Direct Focus Paths */}
          <div className="mb-8 max-w-3xl mx-auto">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text mb-3">
              {lang === 'en' ? 'What are you aiming to solve?' : lang === 'pt' ? 'O que você quer resolver hoje?' : '¿Qué buscas resolver hoy?'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <a
                href="#automatizaciones"
                className="group p-3.5 rounded-xl bg-primary border border-theme-9 hover:border-theme-1 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-lg mb-1 block">⚡</span>
                  <div className="text-xs font-secondary font-bold text-secondary group-hover:text-accent transition-colors">
                    {lang === 'en' ? 'Automate with AI' : lang === 'pt' ? 'Automatizar com IA' : 'Automatizar con IA'}
                  </div>
                  <p className="text-[11px] text-text mt-1 leading-snug">
                    {lang === 'en' ? 'n8n workflows, agents & zero manual tasks.' : lang === 'pt' ? 'Workflows n8n, agentes e zero tarefas manuais.' : 'Workflows n8n, agentes y cero tareas manuales.'}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-theme-1 font-bold mt-2 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {lang === 'en' ? 'View flows' : lang === 'pt' ? 'Ver fluxos' : 'Ver flujos'} ↓
                </span>
              </a>

              <a
                href="#proyectos"
                className="group p-3.5 rounded-xl bg-primary border border-theme-9 hover:border-theme-1 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-lg mb-1 block">🚀</span>
                  <div className="text-xs font-secondary font-bold text-secondary group-hover:text-accent transition-colors">
                    {lang === 'en' ? 'SaaS & Custom Apps' : lang === 'pt' ? 'SaaS e Apps sob Medida' : 'SaaS y Apps a Medida'}
                  </div>
                  <p className="text-[11px] text-text mt-1 leading-snug">
                    {lang === 'en' ? 'Next.js 16, PostgreSQL & scalable portals.' : lang === 'pt' ? 'Next.js 16, PostgreSQL e portais escaláveis.' : 'Next.js 16, PostgreSQL y portales escalables.'}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-theme-1 font-bold mt-2 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {lang === 'en' ? 'Explore 3D' : lang === 'pt' ? 'Explorar 3D' : 'Explorar 3D'} ↓
                </span>
              </a>

              <a
                href="#proyectos"
                className="group p-3.5 rounded-xl bg-primary border border-theme-9 hover:border-theme-1 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-lg mb-1 block">🛍️</span>
                  <div className="text-xs font-secondary font-bold text-secondary group-hover:text-accent transition-colors">
                    {lang === 'en' ? 'High-Impact E-commerce' : lang === 'pt' ? 'E-commerce de Alta Conversão' : 'E-commerce de Alta Conversión'}
                  </div>
                  <p className="text-[11px] text-text mt-1 leading-snug">
                    {lang === 'en' ? 'Headless Shopify, 3D viewers & speed.' : lang === 'pt' ? 'Shopify Headless, 3D e velocidade pura.' : 'Shopify Headless, 3D y velocidad pura.'}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-theme-1 font-bold mt-2 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {lang === 'en' ? 'See stores' : lang === 'pt' ? 'Ver lojas' : 'Ver tiendas'} ↓
                </span>
              </a>
            </div>
          </div>

          {/* Live Impact Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto pt-4 border-t border-theme-9/60">
            <div className="p-2.5 rounded-xl bg-primary/70 border border-theme-9/50 text-center">
              <span className="block font-heading text-lg sm:text-xl font-bold text-secondary">
                +500 hrs/m
              </span>
              <span className="text-[10px] text-text font-mono">
                {lang === 'en' ? 'Saved in manual tasks' : lang === 'pt' ? 'Economizadas / mês' : 'Ahorro en tareas manuales'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/70 border border-theme-9/50 text-center">
              <span className="block font-heading text-lg sm:text-xl font-bold text-secondary">
                17 Apps
              </span>
              <span className="text-[10px] text-text font-mono">
                {lang === 'en' ? 'Live in production' : lang === 'pt' ? 'Em produção ativa' : 'En producción activa'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/70 border border-theme-9/50 text-center">
              <span className="block font-heading text-lg sm:text-xl font-bold text-emerald-600">
                100 / 100
              </span>
              <span className="text-[10px] text-text font-mono">
                {lang === 'en' ? 'PageSpeed Score' : lang === 'pt' ? 'Pontuação PageSpeed' : 'Lighthouse PageSpeed'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/70 border border-theme-9/50 text-center">
              <span className="block font-heading text-lg sm:text-xl font-bold text-secondary">
                0% Fee
              </span>
              <span className="text-[10px] text-text font-mono">
                {lang === 'en' ? 'Third-party commissions' : lang === 'pt' ? 'Zero taxas de terceiros' : '0% comisiones a terceros'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Client Work & Automations with Interactive Category Filter */}
      <section id="proyectos" className="pt-6 md:pt-10 pb-16 md:pb-24 bg-theme-5 scroll-mt-20">
        <Reveal stagger className="container-page">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-secondary font-bold">
              {p.featuredEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.featuredTitle}
            </h2>
            <p className="text-text">
              {p.featuredSubtitle}
            </p>
          </div>

          <PortfolioInteractiveGrid
            projects={allProjects}
            automationCases={automationItems}
            lang={lang}
            labels={{
              filterAll: p.filterAll || 'Todos',
              filterSaas: p.filterSaas || 'SaaS & Marketplaces',
              filterEcommerce: p.filterEcommerce || 'E-commerce',
              filterAi: p.filterAi || 'Consultoría & IA',
              filterAutomation: p.filterAutomation || 'Automatización',
              badgeLive: p.cardBadgeLive || 'En vivo',
              badgeArchived: p.cardBadgeArchived || 'Caso Histórico',
              demoCreds: p.cardDemoCreds || 'Credenciales demo',
              email: p.cardEmail || 'Correo',
              pass: p.cardPass || 'Clave',
              viewCase: p.cardViewCase || 'Ver caso de estudio →',
              visitLive: p.cardVisitLive || 'En vivo ↗',
              autoCasePrefix: p.autoCasePrefix || 'Caso #{n}',
              view3d: p.view3d || (lang === 'en' ? '3D Gallery' : lang === 'pt' ? 'Galeria 3D' : 'Galería 3D'),
              viewGrid: p.viewGrid || (lang === 'en' ? 'Grid' : lang === 'pt' ? 'Grade' : 'Cuadrícula'),
              view3dTitle: p.view3dTitle || (lang === 'en' ? 'Interactive 3D Orbital View' : lang === 'pt' ? 'Visualização 3D Orbital Interativa' : 'Vista 3D Orbital Interactiva'),
              viewGridTitle: p.viewGridTitle || (lang === 'en' ? 'Classic Grid View' : lang === 'pt' ? 'Visualização em Grade Clássica' : 'Vista cuadrícula clásica'),
              showcase3dBadge: p.showcase3dBadge || (lang === 'en' ? '3D Interactive Showcase' : lang === 'pt' ? 'Showcase 3D Interativo' : 'Showcase 3D Interactivo'),
              showcase3dInstructions: p.showcase3dInstructions || (lang === 'en' ? 'Drag to rotate in 3D • Click any card to view case study' : lang === 'pt' ? 'Arraste para girar em 3D • Clique em qualquer cartão para ver o caso' : 'Arrastra para rotar en 3D • Clic en cualquier tarjeta para ver caso'),
              viewCaseShort: p.viewCaseShort || (lang === 'en' ? 'View case' : 'Ver caso'),
              rotateLeft: p.rotateLeft || (lang === 'en' ? 'Rotate left' : lang === 'pt' ? 'Girar para a esquerda' : 'Girar hacia la izquierda'),
              rotateRight: p.rotateRight || (lang === 'en' ? 'Rotate right' : lang === 'pt' ? 'Girar para a direita' : 'Girar hacia la derecha'),
              resetRotation: p.resetRotation || (lang === 'en' ? 'Reset rotation' : lang === 'pt' ? 'Redefinir rotação' : 'Reiniciar rotación'),
              metricLabel: p.metricLabel || (lang === 'en' ? 'Metric' : 'Métrica'),
              automationSubtitle: p.automationSubtitle || (lang === 'en' ? 'Workflows with n8n, Make, and AI agents deployed in production.' : lang === 'pt' ? 'Workflows de n8n, Make e agentes de IA implementados em produção.' : 'Workflows de n8n, Make y agentes de IA desplegados en producción.'),
            }}
          />
        </Reveal>
      </section>

      {/* Smart Automation in Action — 2x2 grid */}
      <section id="automatizaciones" className="section bg-primary scroll-mt-20">
        <Reveal stagger className="container-page">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-secondary font-bold">
              {p.autoEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-5xl mb-3 text-secondary">
              {p.autoTitle}
            </h2>
            <p className="text-text leading-relaxed">
              {p.autoSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {AUTOMATION_CASES.map((key, idx) => {
              const title = p[`${key}Title`];
              const subtitle = p[`${key}Subtitle`];
              const metric = p[`${key}Metric`];
              const desc = p[`${key}Desc`];
              const badge = p[`${key}Badge`];
              const tags = AUTOMATION_TAGS[key] || [];

              return (
                <article
                  key={key}
                  className="group bg-background rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[16/10] bg-theme-9 overflow-hidden">
                    <Image
                      src={AUTOMATION_IMAGES[key]}
                      alt={title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold px-2.5 py-1 rounded-full bg-theme-1 shadow-md">
                      {badge}
                    </span>
                    <span className="absolute top-3 right-3 text-xs font-mono font-bold text-white px-2.5 py-1 rounded-full bg-secondary/85 backdrop-blur-sm border border-white/10 shadow-md">
                      {metric}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs font-secondary font-bold text-secondary uppercase tracking-wider">
                          {p.autoCasePrefix.replace('{n}', String(idx + 1).padStart(2, '0'))}
                        </span>
                        <span className="text-xs text-text">·</span>
                        <span className="text-xs text-text">{subtitle}</span>
                      </div>

                      <h3 className="font-heading text-xl md:text-2xl mb-3 text-secondary group-hover:text-accent transition-colors">
                        {title}
                      </h3>

                      <p className="text-sm text-text leading-relaxed mb-3">
                        {desc}
                      </p>

                      {/* Interactive Architecture Pipeline Wire */}
                      {AUTOMATION_PIPELINES[key] && (
                        <div className="my-3 px-3 py-2 rounded-xl bg-theme-5/60 border border-theme-9/70 flex items-center justify-between text-[11px] font-mono gap-1.5 shadow-2xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                            <span className="truncate text-secondary font-bold text-[10px] sm:text-[11px]">
                              {AUTOMATION_PIPELINES[key].from}
                            </span>
                          </div>
                          <span className="text-theme-1 font-bold text-xs shrink-0 animate-pulse">
                            ──▶
                          </span>
                          <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-primary border border-theme-1/40 shrink-0">
                            <span className="w-1 h-1 rounded-full bg-accent animate-ping shrink-0" />
                            <span className="text-secondary font-bold text-[9px] sm:text-[10px]">
                              {AUTOMATION_PIPELINES[key].mid}
                            </span>
                          </div>
                          <span className="text-theme-1 font-bold text-xs shrink-0 animate-pulse">
                            ──▶
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate text-secondary font-bold text-[10px] sm:text-[11px]">
                              {AUTOMATION_PIPELINES[key].to}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-theme-9/50 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary text-secondary border border-theme-9"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href={lang === 'en' ? '/services/ai-automation' : `/${lang}/services/ai-automation`}
                        className="inline-flex items-center gap-1 text-xs font-secondary font-bold text-secondary group-hover:text-accent transition-colors"
                      >
                        <span>{lang === 'en' ? 'Explore automation' : lang === 'pt' ? 'Explorar automação' : 'Explorar flujo'}</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* Interactive Automation ROI & Hours Reclaimed Simulator */}
      <PortfolioRoiCalculator lang={lang} />

      {/* Performance — PageSpeed Insights scoreboard with 4 100/100 gauges */}
      <section className="section bg-background">
        <Reveal className="container-page text-center">
          <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-secondary font-bold">
            {p.perfEyebrow}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl mb-3">
            {p.perfTitle}
          </h2>
          <p className="text-text max-w-2xl mx-auto mb-8">
            {p.perfSubtitle}
          </p>

          {/* 4 Interactive Gauges with live metric highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {[
              {
                label: 'Performance',
                score: 100,
                desc: lang === 'en' ? 'TTFB <200ms • 0ms CLS' : 'TTFB <200ms • 0ms CLS',
              },
              {
                label: 'Accessibility',
                score: 100,
                desc: lang === 'en' ? 'WCAG 2.1 AA Compliant' : 'WCAG 2.1 AA Compliant',
              },
              {
                label: 'Best Practices',
                score: 100,
                desc: lang === 'en' ? 'Strict CSP & HTTPS' : lang === 'pt' ? 'Strict CSP e HTTPS' : 'Strict CSP y HTTPS',
              },
              {
                label: 'SEO',
                score: 100,
                desc: lang === 'en' ? 'Schema JSON-LD & OG' : lang === 'pt' ? 'Schema JSON-LD e OG' : 'Schema JSON-LD y OG',
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-primary rounded-2xl border border-theme-9 p-5 shadow-sm text-center flex flex-col items-center hover:border-theme-1 hover:shadow-md transition-all duration-300"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full border-4 border-emerald-500/30 bg-emerald-50/60 mb-3 shadow-inner">
                  <span className="font-heading text-2xl md:text-3xl font-bold text-emerald-600">
                    {metric.score}
                  </span>
                </div>
                <span className="text-xs font-secondary font-bold text-secondary uppercase tracking-wider mb-1">
                  {metric.label}
                </span>
                <span className="text-[11px] text-text font-mono">
                  {metric.desc}
                </span>
              </div>
            ))}
          </div>

          <div>
            <a
              href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fandresmorales.com.co"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary border border-theme-9 hover:border-theme-1 text-xs font-secondary font-bold text-secondary hover:text-accent shadow-sm transition-all"
            >
              <span>{p.perfVerify || 'Verificar reporte en Google PageSpeed Insights'}</span>
              <span>↗</span>
            </a>
          </div>
        </Reveal>
      </section>

      {/* AI Creative in Action — videos migrated from the legacy WP portfolio */}
      <section className="section bg-theme-5">
        <Reveal stagger className="container-page">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-secondary font-bold">
              {p.creativeEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.creativeTitle}
            </h2>
            <p className="text-text">
              {p.creativeSubtitle}
            </p>
          </div>

          {/* Landscape videos — full-width 16:9 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {CREATIVE_VIDEOS.filter((v) => v.orientation === 'landscape').map(
              (v) => {
                const title = p[`${v.key}Title`];
                const caption = p[`${v.key}Caption`];
                return (
                  <div key={v.id}>
                    <YoutubeEmbed
                      id={v.id}
                      title={title}
                      orientation="landscape"
                    />
                    <div className="mt-3">
                      <h3 className="font-heading text-lg md:text-xl mb-1">
                        {title}
                      </h3>
                      <p className="text-sm text-text">{caption}</p>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {/* Portrait / Shorts — 9:16 grid centered */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {CREATIVE_VIDEOS.filter((v) => v.orientation === 'portrait').map(
              (v) => {
                const title = p[`${v.key}Title`];
                const caption = p[`${v.key}Caption`];
                return (
                  <div key={v.id}>
                    <YoutubeEmbed
                      id={v.id}
                      title={title}
                      orientation="portrait"
                    />
                    <div className="mt-2">
                      <h3 className="font-heading text-sm md:text-base leading-tight mb-1">
                        {title}
                      </h3>
                      <p className="text-xs text-text leading-snug">
                        {caption}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </Reveal>
      </section>

      {/* Service Categories — 3 categories with descriptions */}
      <section className="section bg-primary">
        <Reveal stagger className="container-page">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-secondary mb-2 font-secondary font-bold">
              {p.catEyebrow}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-3">
              {p.catTitle}
            </h2>
            <p className="text-text max-w-2xl mx-auto">
              {p.catSubtitle}
            </p>
          </div>
          <div className="space-y-12">
            {SERVICE_CATEGORIES.map((cat) => {
              const title = p[`${cat.key}Title`];
              const desc = p[`${cat.key}Desc`];
              return (
                <div key={cat.key}>
                  <div className="mb-5">
                    <h3 className="font-heading text-xl md:text-2xl mb-1">
                      {title}
                    </h3>
                    <p className="text-text text-sm max-w-3xl">{desc}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {cat.images.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-xl overflow-hidden bg-theme-9 hover:scale-[1.03] hover:shadow-xl transition-all duration-300 cursor-pointer"
                      >
                        <Image
                          src={src}
                          alt={`${title} example ${i + 1}`}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* SEO Strategic FAQ Section with Rich Result Accordions */}
      <PortfolioFaq lang={lang} items={currentFaqs} />

      <Cta />

      {/* Floating Quick-Action Dock on Scroll */}
      <PortfolioFloatingDock
        lang={lang}
        labels={{
          status: lang === 'en' ? '17 Live Apps • 4 Flows' : lang === 'pt' ? '17 Apps • 4 Fluxos' : '17 Apps • 4 Flujos',
          bookCall: lang === 'en' ? 'Book 15 min call' : lang === 'pt' ? 'Agendar 15 min' : 'Agendar 15 min',
          sendBrief: lang === 'en' ? 'Quick brief' : lang === 'pt' ? 'Briefing rápido' : 'Brief rápido',
          scrollTop: lang === 'en' ? 'Scroll to top' : lang === 'pt' ? 'Voltar ao topo' : 'Volver arriba',
        }}
      />

      {/* Interactive Developer Terminal (~ shortcut or CLI dock button) */}
      <DeveloperTerminalModal />
    </>
  );
}
