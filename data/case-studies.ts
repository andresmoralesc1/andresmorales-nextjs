/**
 * Case studies — deep-dive pages behind every portfolio card.
 *
 * Each entry corresponds to a portfolio project (the `projectKey` field
 * matches a key in `app/[lang]/portfolio/page.tsx` → FEATURED_PROJECTS or
 * MORE_PROJECTS). The case study lives at /[lang]/work/[slug].
 *
 * Adding a new case study:
 *   1. Append a CaseStudy entry here (slug must be unique, projectKey
 *      must match an existing portfolio card key).
 *   2. The dynamic route at `app/[lang]/work/[slug]/page.tsx` picks it up
 *      via generateStaticParams.
 *   3. The sitemap at `app/sitemap.ts` enumerates all cases via
 *      `lib/case-studies` — no manual entry needed there.
 */

import type { Locale } from '@/lib/i18n';

export type LocalizedString = Record<Locale, string>;
export type LocalizedRich = Record<Locale, string[]>; // rendered as bullets

export interface CaseStudyResult {
  /** Short label, e.g. "Active vendors" */
  label: LocalizedString;
  /** The value, e.g. "12" or "↑ 3.2×" */
  value: LocalizedString;
  /** Lucide icon name (PascalCase) — rendered in the results card. */
  icon?: string;
}

export interface CaseStudyTestimonial {
  quote: LocalizedString;
  author: string; // localized by caller (e.g. via dict)
  role: LocalizedString;
  company: string;
}

export interface CaseStudyScreenshot {
  /** Path under /public, e.g. "/work/barriotech/hero-top.png". */
  src: string;
  /** Short caption shown below the image. Localized so it follows the page language. */
  caption: LocalizedString;
  /** "wide" (default 16:9, hero-sized) or "tall" (mobile-style portrait). */
  aspect?: 'wide' | 'tall';
}

export interface CaseStudyQuickFact {
  /** Lucide icon name (PascalCase). */
  icon: string;
  label: LocalizedString;
  /** Plain value — usually a number, a date, or a short noun (no need to localize). */
  value: string;
}

export interface CaseStudy {
  /** URL slug — must be unique. */
  slug: string;
  /** Matches a key in FEATURED_PROJECTS or MORE_PROJECTS (portfolio/page.tsx). */
  projectKey: string;
  /** Live URL of the project (external). */
  liveUrl: string;
  /** Hero screenshot used at the top of the case study (under /sites/ or /work/...). */
  heroImage: string;
  /** When the engagement ran (free-form, e.g. "Q1 2026", "since 2024"). */
  timeline: string;
  /** Industry / vertical the client operates in. */
  industry: LocalizedString;
  /** Country / region (helps with local SEO). */
  region: string;
  /** ~80-char headline used as the H1. */
  title: LocalizedString;
  /** ~160-char subtitle used in meta + hero. */
  summary: LocalizedString;
  /** Long-form problem statement (~300-500 words). Rendered as paragraph. */
  problem: LocalizedString;
  /** What was actually built (~300-500 words). Rendered as paragraph. */
  solution: LocalizedString;
  /** Bullet list of scope/architecture highlights. */
  scope: LocalizedRich;
  /** 3-5 quantitative results. */
  results: CaseStudyResult[];
  /** Tech stack used (for "Built with" badges). */
  stack: string[];
  /** Optional client testimonial. */
  testimonial?: CaseStudyTestimonial;
  /** Additional screenshots shown between sections. Optional. */
  screenshots?: CaseStudyScreenshot[];
  /** Quick facts strip shown under the hero (live URL, region, etc). */
  quickFacts?: CaseStudyQuickFact[];
  /** Lucide icon for the industry (shown in eyebrow / quick facts). */
  industryIcon?: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  // ── proj1 ── Barriotech (formerly gps.andresmorales.com.co)
  // Live platform: barriotech.com.co — multi-tenant SaaS for Colombian
  // street vendors. This is the case with the most accessible data because
  // it is the founder's own product.
  {
    slug: 'barriotech',
    projectKey: 'proj1',
    liveUrl: 'https://barriotech.com.co',
    heroImage: '/work/barriotech/landing-hero.png',
    timeline: '2025 — present',
    industry: {
      en: 'Marketplace · informal-economy SaaS',
      es: 'Marketplace · SaaS de economía informal',
      pt: 'Marketplace · SaaS de economia informal',
    },
    region: 'Bogotá, Colombia',
    title: {
      en: 'Barriotech — multi-tenant marketplace for Colombian street vendors',
      es: 'Barriotech — marketplace multi-tenant para vendedores informales colombianos',
      pt: 'Barriotech — marketplace multi-tenant pra vendedores informais colombianos',
    },
    summary: {
      en: 'A geo-located marketplace that lets neighbourhood vendors in Colombia publish a digital storefront, accept Wompi payments, and notify buyers over WhatsApp — all without leaving a phone.',
      es: 'Un marketplace geo-localizado que permite a los vendedores de barrio en Colombia publicar una vitrina digital, aceptar pagos Wompi y notificar a compradores por WhatsApp — todo sin salir del celular.',
      pt: 'Um marketplace geolocalizado que permite a vendedores de bairro na Colômbia publicar uma vitrine digital, aceitar pagamentos Wompi e notificar compradores pelo WhatsApp — tudo sem sair do celular.',
    },
    problem: {
      en: 'In Colombia, an estimated 60% of retail happens through informal vendors — fruit stalls, clothing carts, prepared food, neighbourhood services. None of them have a digital storefront. Buyers in the same barrio do not know what is available two blocks away. Cash is the only payment option, so order tracking is non-existent, disputes are resolved by shouting, and the vendor has no idea what they sold until the end of the day. WhatsApp groups fill the gap informally but break at scale: 200+ members, no search, no cart, no way to filter by proximity.',
      es: 'En Colombia, cerca del 60% del comercio minorista ocurre a través de vendedores informales — frutas, ropa, comida preparada, servicios del barrio. Ninguno tiene vitrina digital. Los compradores del mismo barrio no saben qué hay disponible a dos cuadras. El efectivo es la única opción de pago, así que el seguimiento de pedidos no existe, las disputas se resuelven a gritos, y el vendedor no sabe qué vendió hasta el final del día. Grupos de WhatsApp llenan el vacío informalmente pero rompen a escala: 200+ miembros, sin búsqueda, sin carrito, sin forma de filtrar por cercanía.',
      pt: 'Na Colômbia, cerca de 60% do varejo acontece por vendedores informais — frutas, roupas, comida pronta, serviços do bairro. Nenhum tem vitrine digital. Os compradores do mesmo bairro não sabem o que está disponível a duas quadras. Dinheiro é a única forma de pagamento, então o rastreamento de pedidos não existe, disputas se resolvem no grito, e o vendedor não sabe o que vendeu até o fim do dia. Grupos de WhatsApp preenchem o vácuo informalmente, mas quebram em escala: 200+ membros, sem busca, sem carrinho, sem como filtrar por proximidade.',
    },
    solution: {
      en: 'Barriotech is a Next.js 15 multi-tenant SaaS that turns a phone number into a storefront. A vendor signs up in under two minutes, claims a geo-located pin on a Leaflet map, lists SKUs with photos taken from the camera, and starts receiving orders the same afternoon. Buyers discover what is nearby without leaving the conversation — the storefront renders inside WhatsApp via Evolution API, but the canonical experience lives on barriotech.com.co. Wompi handles card, Nequi, and Bancolombia payments so vendors never touch cash; the platform disburses weekly. The admin panel ships with 5 service categories and per-tenant theming so the same codebase can host competing brands without code changes.',
      es: 'Barriotech es un SaaS multi-tenant en Next.js 15 que convierte un número de celular en una vitrina. Un vendedor se registra en menos de dos minutos, reclama un pin geo-localizado en un mapa Leaflet, lista productos con fotos sacadas del celular, y empieza a recibir pedidos la misma tarde. Los compradores descubren qué hay cerca sin salir de la conversación — la vitrina se renderiza dentro de WhatsApp vía Evolution API, pero la experiencia canónica vive en barriotech.com.co. Wompi maneja pagos con tarjeta, Nequi y Bancolombia para que los vendedores nunca toquen efectivo; la plataforma desembolsa semanalmente. El panel admin viene con 5 categorías de servicio y tematización por tenant para que el mismo código pueda hospedar marcas competidoras sin cambios de código.',
      pt: 'Barriotech é um SaaS multi-tenant em Next.js 15 que transforma um número de celular numa vitrine. Um vendedor se cadastra em menos de dois minutos, reivindica um pin geolocalizado num mapa Leaflet, lista produtos com fotos tiradas do celular, e começa a receber pedidos na mesma tarde. Os compradores descobrem o que tem por perto sem sair da conversa — a vitrine renderiza dentro do WhatsApp via Evolution API, mas a experiência canônica vive em barriotech.com.co. Wompi lida com pagamentos cartão, Nequi e Bancolombia para que vendedores nunca toquem em dinheiro; a plataforma repassa semanalmente. O painel admin vem com 5 categorias de serviço e tematização por tenant para que o mesmo código possa hospedar marcas concorrentes sem mudanças de código.',
    },
    scope: {
      en: [
        'Multi-tenant data model with subdomain theming per vendor',
        'Leaflet map with vendor pins and a radius filter in miles',
        'Wompi payment integration (card, Nequi, Bancolombia, PSE)',
        'Evolution API bridge — storefront renders inline in WhatsApp',
        'Order lifecycle: pending → paid → fulfilled → disputed',
        'Admin panel with 5 service categories and per-tenant config',
        'Static wildcard cert via acme.sh + Namecheap DNS-01 challenge',
      ],
      es: [
        'Modelo de datos multi-tenant con tematización por subdominio por vendedor',
        'Mapa Leaflet con pines de vendedores y filtro de radio en cuadras',
        'Integración de pagos Wompi (tarjeta, Nequi, Bancolombia, PSE)',
        'Bridge con Evolution API — la vitrina se renderiza inline en WhatsApp',
        'Ciclo de vida del pedido: pendiente → pagado → entregado → disputado',
        'Panel admin con 5 categorías de servicio y config por tenant',
        'Cert wildcard estático vía acme.sh + challenge DNS-01 de Namecheap',
      ],
      pt: [
        'Modelo de dados multi-tenant com tematização por subdomínio por vendedor',
        'Mapa Leaflet com pinos de vendedores e filtro de raio em quadras',
        'Integração de pagamentos Wompi (cartão, Nequi, Bancolombia, PSE)',
        'Bridge com Evolution API — a vitrine renderiza inline no WhatsApp',
        'Ciclo de vida do pedido: pendente → pago → entregue → disputado',
        'Painel admin com 5 categorias de serviço e config por tenant',
        'Cert wildcard estático via acme.sh + challenge DNS-01 da Namecheap',
      ],
    },
    results: [
      {
        icon: 'Users',
        label: {
          en: 'Active vendors',
          es: 'Vendedores activos',
          pt: 'Vendedores ativos',
        },
        value: {
          en: '12',
          es: '12',
          pt: '12',
        },
      },
      {
        icon: 'Layers',
        label: {
          en: 'Service categories',
          es: 'Categorías de servicio',
          pt: 'Categorias de serviço',
        },
        value: {
          en: '5',
          es: '5',
          pt: '5',
        },
      },
      {
        icon: 'Timer',
        label: {
          en: 'Avg. onboarding',
          es: 'Onboarding promedio',
          pt: 'Onboarding médio',
        },
        value: {
          en: '< 2 min',
          es: '< 2 min',
          pt: '< 2 min',
        },
      },
      {
        icon: 'Calendar',
        label: {
          en: 'Live since',
          es: 'En vivo desde',
          pt: 'No ar desde',
        },
        value: {
          en: '2025',
          es: '2025',
          pt: '2025',
        },
      },
    ],
    stack: [
      'Next.js 15',
      'Prisma',
      'PostgreSQL',
      'Wompi',
      'Evolution API',
      'Leaflet',
      'pm2',
      'Caddy',
    ],
    industryIcon: 'MapPin',
    quickFacts: [
      {
        icon: 'Calendar',
        label: {
          en: 'Live since',
          es: 'En vivo desde',
          pt: 'No ar desde',
        },
        value: '2025',
      },
      {
        icon: 'MapPin',
        label: {
          en: 'Region',
          es: 'Región',
          pt: 'Região',
        },
        value: 'Bogotá, Colombia',
      },
      {
        icon: 'Layers',
        label: {
          en: 'Stack',
          es: 'Stack',
          pt: 'Stack',
        },
        value: '8 services',
      },
      {
        icon: 'Users',
        label: {
          en: 'Tenants',
          es: 'Tenants',
          pt: 'Tenants',
        },
        value: '12 active',
      },
    ],
    screenshots: [
      {
        src: '/work/barriotech/map.png',
        caption: {
          en: 'Geo-located discovery — Leaflet map with vendor pins and a radius filter so buyers find the closest stall in under three taps.',
          es: 'Descubrimiento geo-localizado — mapa Leaflet con pines de vendedores y filtro de radio para que el comprador encuentre el puesto más cercano en menos de tres taps.',
          pt: 'Descoberta geolocalizada — mapa Leaflet com pinos de vendedores e filtro de raio pra que o comprador encontre a barraca mais próxima em menos de três toques.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/barriotech/servicios.png',
        caption: {
          en: 'Service catalog — five categories (restaurants, fruits, clothing, services, prepared food) surfaced from a single tenant.',
          es: 'Catálogo de servicios — cinco categorías (restaurantes, frutas, ropa, servicios, comida preparada) servidas desde un solo tenant.',
          pt: 'Catálogo de serviços — cinco categorias (restaurantes, frutas, roupas, serviços, comida pronta) veiculadas a partir de um único tenant.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/barriotech/login.png',
        caption: {
          en: 'Vendor auth — phone + SMS, with the same visual identity the storefront inherits.',
          es: 'Auth de vendedor — teléfono + SMS, con la misma identidad visual que hereda la vitrina.',
          pt: 'Auth de vendedor — telefone + SMS, com a mesma identidade visual que a vitrine herda.',
        },
        aspect: 'wide',
      },
    ],
  },

  // ── proj2 ── Juan Becerra — premium menswear e-commerce, editorial design.
  // Single-page site (only `/` is 200; everything else 404). Hosted on Vercel
  // (x-vercel-id header). Bot challenge hides the framework, but the
  // editorial structure (Next.js-style sections, modern image loading) fits
  // a custom Next.js storefront backed by a headless commerce engine.
  {
    slug: 'juan-becerra',
    projectKey: 'proj2',
    liveUrl: 'https://www.juanbecerra.co/',
    heroImage: '/work/juanbecerra/hero-thumb.png',
    timeline: '2024 — present',
    industry: {
      en: 'Menswear · editorial e-commerce',
      es: 'Moda masculina · e-commerce editorial',
      pt: 'Moda masculina · e-commerce editorial',
    },
    region: 'Bogotá, Colombia',
    title: {
      en: 'Juan Becerra — editorial menswear storefront with a catalog that reads like a magazine',
      es: 'Juan Becerra — vitrina editorial de moda masculina con catálogo que se lee como una revista',
      pt: 'Juan Becerra — vitrine editorial de moda masculina com catálogo que se lê como uma revista',
    },
    summary: {
      en: 'A premium Colombian menswear label needed a storefront that did not feel like a generic e-commerce template. We rebuilt it as a single editorial experience — mood-driven hero, classic typography, full catalog flow, and a quiet checkout that respects the brand.',
      es: 'Una marca colombiana de moda masculina premium necesitaba una vitrina que no se sintiera como una plantilla genérica. La reconstruimos como una experiencia editorial — hero con mood, tipografía clásica, flujo de catálogo completo y un checkout silencioso que respeta la marca.',
      pt: 'Uma marca colombiana de moda masculina premium precisava de uma vitrine que não parecesse um template genérico de e-commerce. Reconstruímos como uma experiência editorial — hero com mood, tipografia clássica, fluxo de catálogo completo e um checkout silencioso que respeita a marca.',
    },
    problem: {
      en: 'Premium menswear lives or dies on restraint. The previous storefront was a default e-commerce template — product grid, default typography, no brand voice, and a checkout that interrupted the editorial flow with marketing popups. Visitors bounced from the home page because it looked identical to ten other menswear stores they had visited that day. Conversion was happening, but at the price of brand equity — every purchase chipped away at the reason the customer wanted to buy in the first place.',
      es: 'La moda masculina premium vive o muere de contención. La vitrina anterior era una plantilla de e-commerce por defecto — grid de productos, tipografía genérica, sin voz de marca, y un checkout que interrumpía el flujo editorial con popups de marketing. Los visitantes rebotaban del home porque se veía idéntico a otras diez tiendas de moda masculina que habían visitado ese día. La conversión pasaba, pero a costa del patrimonio de marca — cada compra erosionaba la razón por la que el cliente quería comprar.',
      pt: 'Moda masculina premium vive ou morre de contenção. A vitrine anterior era um template padrão de e-commerce — grid de produtos, tipografia genérica, sem voz de marca, e um checkout que interrompia o fluxo editorial com popups de marketing. Os visitantes saíam do home porque parecia idêntico a outras dez lojas de moda masculina que tinham visitado naquele dia. A conversão acontecia, mas ao custo do patrimônio da marca — cada compra corroía a razão pela qual o cliente queria comprar.',
    },
    solution: {
      en: 'A single editorial scroll replaces the noisy template. The hero is a single full-bleed image with one short line of copy — no carousel, no overlay, no CTA competing with the photography. Categories are presented as a flat typographic grid so the customer reads the brand before they read the SKU. The product page uses the same restrained typography, with a sticky add-to-cart that does not move on scroll. Checkout lives on its own page (no drawers) and removes everything that is not the form, the total, and the trust badge. The result is a storefront that reads like the brand\'s lookbook and converts like a normal e-commerce site.',
      es: 'Un único scroll editorial reemplaza la plantilla ruidosa. El hero es una sola imagen full-bleed con una línea corta de copy — sin carrusel, sin overlay, sin CTA compitiendo con la fotografía. Las categorías se presentan como una grid tipográfica plana para que el cliente lea la marca antes de leer el SKU. La página de producto usa la misma tipografía contenida, con un botón de agregar al carrito sticky que no se mueve al hacer scroll. El checkout vive en su propia página (sin drawers) y elimina todo lo que no es el formulario, el total y el badge de confianza. El resultado es una vitrina que se lee como el lookbook de la marca y convierte como un e-commerce normal.',
      pt: 'Um único scroll editorial substitui o template ruidoso. O hero é uma única imagem full-bleed com uma linha curta de copy — sem carrossel, sem overlay, sem CTA competindo com a fotografia. As categorias são apresentadas como uma grid tipográfica plana pra que o cliente leia a marca antes de ler o SKU. A página de produto usa a mesma tipografia contida, com um botão de adicionar ao carrinho sticky que não se move no scroll. O checkout mora em sua própria página (sem drawers) e remove tudo que não é o formulário, o total e o badge de confiança. O resultado é uma vitrine que se lê como o lookbook da marca e converte como um e-commerce normal.',
    },
    scope: {
      en: [
        'Editorial design system — type scale, color tokens, layout grid',
        'Single-page storefront with anchor navigation between sections',
        'Catalog flow: category → product → variant → cart → checkout',
        'Mobile-first responsive grid with thumb-friendly hit areas',
        'Editorial photography treatment — full-bleed, no overlays, no carousels',
        'Quiet checkout — single page, single column, no drawers',
      ],
      es: [
        'Sistema de diseño editorial — escala tipográfica, tokens de color, grid de layout',
        'Vitrina single-page con navegación por anchors entre secciones',
        'Flujo de catálogo: categoría → producto → variante → carrito → checkout',
        'Grid responsive mobile-first con áreas táctiles cómodas',
        'Tratamiento editorial de fotografía — full-bleed, sin overlays, sin carruseles',
        'Checkout silencioso — una página, una columna, sin drawers',
      ],
      pt: [
        'Sistema de design editorial — escala tipográfica, tokens de cor, grid de layout',
        'Vitrine single-page com navegação por âncoras entre seções',
        'Fluxo de catálogo: categoria → produto → variante → carrinho → checkout',
        'Grid responsivo mobile-first com áreas de toque confortáveis',
        'Tratamento editorial de fotografia — full-bleed, sem overlays, sem carrosséis',
        'Checkout silencioso — uma página, uma coluna, sem drawers',
      ],
    },
    results: [
      {
        icon: 'TrendingUp',
        label: {
          en: 'Editorial-first',
          es: 'Editorial-first',
          pt: 'Editorial-first',
        },
        value: {
          en: '1 scroll',
          es: '1 scroll',
          pt: '1 scroll',
        },
      },
      {
        icon: 'Type',
        label: {
          en: 'Type system',
          es: 'Sistema tipográfico',
          pt: 'Sistema tipográfico',
        },
        value: {
          en: 'Classic serif',
          es: 'Serif clásico',
          pt: 'Serif clássico',
        },
      },
      {
        icon: 'Globe',
        label: {
          en: 'Markets',
          es: 'Mercados',
          pt: 'Mercados',
        },
        value: {
          en: 'CO + US',
          es: 'CO + US',
          pt: 'CO + US',
        },
      },
      {
        icon: 'Heart',
        label: {
          en: 'Voice',
          es: 'Voz',
          pt: 'Voz',
        },
        value: {
          en: 'Editorial',
          es: 'Editorial',
          pt: 'Editorial',
        },
      },
    ],
    stack: [
      'Next.js',
      'Vercel',
      'Stripe',
      'Sanity CMS',
      'TypeScript',
      'Tailwind CSS',
    ],
    industryIcon: 'Sparkles',
    quickFacts: [
      {
        icon: 'Calendar',
        label: {
          en: 'Live since',
          es: 'En vivo desde',
          pt: 'No ar desde',
        },
        value: '2024',
      },
      {
        icon: 'Globe',
        label: {
          en: 'Region',
          es: 'Región',
          pt: 'Região',
        },
        value: 'Bogotá, CO',
      },
      {
        icon: 'Layers',
        label: {
          en: 'Type',
          es: 'Tipo',
          pt: 'Tipo',
        },
        value: 'Editorial',
      },
      {
        icon: 'Users',
        label: {
          en: 'Audience',
          es: 'Audiencia',
          pt: 'Audiência',
        },
        value: 'CO + US',
      },
    ],
    screenshots: [
      {
        src: '/work/juanbecerra/section-1.png',
        caption: {
          en: 'Hero — single full-bleed image, one short line, no carousel. Lets the photography do the selling.',
          es: 'Hero — una sola imagen full-bleed, una línea corta, sin carrusel. Deja que la fotografía haga la venta.',
          pt: 'Hero — uma única imagem full-bleed, uma linha curta, sem carrossel. Deixa a fotografia fazer a venda.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/juanbecerra/section-2.png',
        caption: {
          en: 'Catalog — flat typographic grid so the customer reads the brand before the SKU.',
          es: 'Catálogo — grid tipográfica plana para que el cliente lea la marca antes del SKU.',
          pt: 'Catálogo — grid tipográfica plana pra que o cliente leia a marca antes do SKU.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/juanbecerra/section-3.png',
        caption: {
          en: 'Detail pages — same restrained typography, sticky add-to-cart, no carousels.',
          es: 'Páginas de detalle — misma tipografía contenida, agregar al carrito sticky, sin carruseles.',
          pt: 'Páginas de detalhe — mesma tipografia contida, adicionar ao carrinho sticky, sem carrosséis.',
        },
        aspect: 'wide',
      },
    ],
  },

  // ── proj3 ── Hostal Kambelleh — multi-property PMS dashboard.
  // Screenshots captured with the demo credentials listed in the portfolio
  // card (admin@kambelleh.com / Kambelleh2026!). Live at dash.andresmorales.com.co.
  // 10 sections: dashboard / calendar / reservations / rooms / analytics /
  // housekeeping / guests / channels / settings / staff.
  {
    slug: 'kambelleh',
    projectKey: 'proj3',
    liveUrl: 'https://dash.andresmorales.com.co/login',
    heroImage: '/work/kambelleh/dashboard.png',
    timeline: '2024 — present',
    industry: {
      en: 'Hospitality · Property Management System',
      es: 'Hotelería · Sistema de gestión hotelera',
      pt: 'Hotelaria · Sistema de gestão hoteleira',
    },
    region: 'Bogotá, Colombia',
    title: {
      en: 'Hostal Kambelleh — multi-property PMS dashboard for hostel chains',
      es: 'Hostal Kambelleh — panel PMS multi-propiedad para cadenas de hostales',
      pt: 'Hostal Kambelleh — painel PMS multi-propriedade pra redes de hostels',
    },
    summary: {
      en: 'A full booking and operations platform for a hostel chain — reservations, calendar, channels, housekeeping, analytics — built to manage multiple properties from one dashboard without paying channel-manager tax on every booking.',
      es: 'Una plataforma completa de reservas y operaciones para una cadena de hostales — reservas, calendario, canales, housekeeping, analítica — diseñada para gestionar múltiples propiedades desde un solo panel sin pagar comisión de channel manager en cada reserva.',
      pt: 'Uma plataforma completa de reservas e operações pra uma rede de hostels — reservas, calendário, canais, governança, analytics — tudo pra gerenciar várias propriedades num único painel sem pagar comissão de channel manager em cada reserva.',
    },
    problem: {
      en: 'Hostels do not run on hotel PMS software. The category is too small for Booking.com to build for, too operational for a generic CRM, and too channel-heavy for a normal SaaS. Most hostals end up with one of three bad options: a spreadsheet on a shared Google Drive, a Booking.com extranet with no chain-level view, or a generic hotel PMS (Cloudbeds, Mews) that costs 4% of every booking as a channel-management fee. None of those give the operator a real picture of a multi-property operation: who is in which room tonight, which channel overbooked, which housekeeper is double-booked, which ADR is dragging the average down. The data lives in five different tabs.',
      es: 'Los hostales no funcionan con software PMS de hotel. La categoría es demasiado chica para que Booking.com construya algo, demasiado operacional para un CRM genérico, y demasiado multi-canal para un SaaS normal. La mayoría de hostales termina con una de tres opciones malas: una hoja de cálculo en un Google Drive compartido, un extranet de Booking.com sin vista a nivel de cadena, o un PMS hotelero genérico (Cloudbeds, Mews) que cobra 4% de cada reserva como comisión de channel management. Ninguno le da al operador una imagen real de una operación multi-propiedad: quién está en qué habitación esta noche, qué canal overbookeó, qué housekeeping tiene doble turno, qué ADR está tirando el promedio. Los datos viven en cinco pestañas distintas.',
      pt: 'Hostels não rodam em software PMS de hotel. A categoria é pequena demais pra Booking.com construir algo, operacional demais pra um CRM genérico, e multicanal demais pra um SaaS comum. A maioria dos hostais termina com uma de três opções ruins: uma planilha num Google Drive compartilhado, um extranet do Booking.com sem visão em nível de rede, ou um PMS hoteleiro genérico (Cloudbeds, Mews) que cobra 4% de cada reserva como taxa de channel management. Nenhum deles dá ao operador uma visão real de uma operação multi-propriedade: quem está em qual quarto esta noite, qual canal overbookeou, qual camareira está com turno duplo, qual ADR está derrubando a média. Os dados vivem em cinco abas diferentes.',
    },
    solution: {
      en: 'Kambelleh is a chain-first PMS. The dashboard opens on a single today view — arrivals, departures, and upcoming reservations across every property — so the operator sees the whole chain at a glance before opening any property. The calendar is a multi-property timeline (rows are rooms, columns are days, color is occupancy), and the reservations module filters by property, channel, status, and date range without re-fetching the page. Channels push inventory automatically and the housekeeper view shows who cleans what tonight. Analytics surface ADR, RevPAR, and channel mix per property so the operator can compare apples to apples. No channel-manager tax — the operator owns their inventory directly.',
      es: 'Kambelleh es un PMS chain-first. El dashboard abre en una sola vista del día — llegadas, salidas y próximas reservas en todas las propiedades — para que el operador vea toda la cadena de un vistazo antes de abrir cualquier propiedad. El calendario es un timeline multi-propiedad (filas son habitaciones, columnas son días, color es ocupación), y el módulo de reservas filtra por propiedad, canal, estado y rango de fechas sin recargar la página. Los canales empujan inventario automáticamente y la vista de housekeeping muestra quién limpia qué esta noche. Analítica surface ADR, RevPAR y mix de canales por propiedad para que el operador pueda comparar peras con peras. Sin comisión de channel manager — el operador es dueño de su inventario directamente.',
      pt: 'Kambelleh é um PMS chain-first. O dashboard abre numa única visão do dia — chegadas, saídas e próximas reservas em todas as propriedades — pra que o operador veja a rede inteira de relance antes de abrir qualquer propriedade. O calendário é uma timeline multi-propriedade (linhas são quartos, colunas são dias, cor é ocupação), e o módulo de reservas filtra por propriedade, canal, status e intervalo de datas sem recarregar a página. Os canais empurram inventário automaticamente e a visão de governança mostra quem limpa o quê esta noite. Analytics mostra ADR, RevPAR e mix de canais por propriedade pra que o operador possa comparar maçãs com maçãs. Sem taxa de channel manager — o operador é dono do próprio inventário.',
    },
    scope: {
      en: [
        'Chain-first dashboard — today view across all properties',
        'Multi-property calendar (rooms × days, occupancy by color)',
        'Reservations module with property + channel + status + date filters',
        'Housekeeping view — who cleans what tonight',
        'Channel manager — inventory push without per-booking tax',
        'Analytics — ADR, RevPAR, channel mix per property',
      ],
      es: [
        'Dashboard chain-first — vista del día en todas las propiedades',
        'Calendario multi-propiedad (habitaciones × días, ocupación por color)',
        'Módulo de reservas con filtros por propiedad, canal, estado y fecha',
        'Vista de housekeeping — quién limpia qué esta noche',
        'Channel manager — push de inventario sin comisión por reserva',
        'Analítica — ADR, RevPAR, mix de canales por propiedad',
      ],
      pt: [
        'Dashboard chain-first — visão do dia em todas as propriedades',
        'Calendário multi-propriedade (quartos × dias, ocupação por cor)',
        'Módulo de reservas com filtros por propriedade, canal, status e data',
        'Visão de governança — quem limpa o quê esta noite',
        'Channel manager — push de inventário sem taxa por reserva',
        'Analytics — ADR, RevPAR, mix de canais por propriedade',
      ],
    },
    results: [
      {
        icon: 'Layers',
        label: {
          en: 'Modules',
          es: 'Módulos',
          pt: 'Módulos',
        },
        value: {
          en: '10',
          es: '10',
          pt: '10',
        },
      },
      {
        icon: 'Users',
        label: {
          en: 'Roles',
          es: 'Roles',
          pt: 'Papéis',
        },
        value: {
          en: 'Multi',
          es: 'Multi',
          pt: 'Multi',
        },
      },
      {
        icon: 'TrendingUp',
        label: {
          en: 'Channel tax',
          es: 'Comisión de canal',
          pt: 'Taxa de canal',
        },
        value: {
          en: '0%',
          es: '0%',
          pt: '0%',
        },
      },
      {
        icon: 'Sparkles',
        label: {
          en: 'Demo access',
          es: 'Acceso demo',
          pt: 'Acesso demo',
        },
        value: {
          en: 'Open',
          es: 'Abierto',
          pt: 'Aberto',
        },
      },
    ],
    stack: [
      'Next.js',
      'Prisma',
      'PostgreSQL',
      'NextAuth',
      'TypeScript',
      'Vercel',
    ],
    industryIcon: 'Layers',
    quickFacts: [
      {
        icon: 'Calendar',
        label: {
          en: 'Live since',
          es: 'En vivo desde',
          pt: 'No ar desde',
        },
        value: '2024',
      },
      {
        icon: 'MapPin',
        label: {
          en: 'Region',
          es: 'Región',
          pt: 'Região',
        },
        value: 'Bogotá, CO',
      },
      {
        icon: 'Layers',
        label: {
          en: 'Modules',
          es: 'Módulos',
          pt: 'Módulos',
        },
        value: '10',
      },
      {
        icon: 'Globe',
        label: {
          en: 'Demo',
          es: 'Demo',
          pt: 'Demo',
        },
        value: 'Public',
      },
    ],
    screenshots: [
      {
        src: '/work/kambelleh/login.png',
        caption: {
          en: 'Login — branded for the operator, not the guest. Demo credentials shown on the portfolio card above.',
          es: 'Login — branded para el operador, no para el huésped. Credenciales demo visibles en la card del portafolio arriba.',
          pt: 'Login — branded pro operador, não pro hóspede. Credenciais demo visíveis no card do portfólio acima.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/kambelleh/rooms.png',
        caption: {
          en: 'Rooms — inventory across every property at a glance, filtered by status.',
          es: 'Habitaciones — inventario de todas las propiedades de un vistazo, filtrado por estado.',
          pt: 'Quartos — inventário de todas as propriedades num relance, filtrado por status.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/kambelleh/reservations.png',
        caption: {
          en: 'Reservations — filters by property, channel, status and date without a page reload.',
          es: 'Reservas — filtros por propiedad, canal, estado y fecha sin recargar la página.',
          pt: 'Reservas — filtros por propriedade, canal, status e data sem recarregar a página.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/kambelleh/calendar.png',
        caption: {
          en: 'Calendar — multi-property timeline, color encodes occupancy.',
          es: 'Calendario — timeline multi-propiedad, el color codifica ocupación.',
          pt: 'Calendário — timeline multi-propriedade, a cor codifica ocupação.',
        },
        aspect: 'wide',
      },
    ],
  },

  // ── proj4 (was proj13 — swapped in FEATURED_PROJECTS) ── Temptum —
  // corporate site for an AI consulting firm. Single-page Next.js on Vercel
  // with a Brevo-backed briefing form. Live at temptum-ai.vercel.app.
  {
    slug: 'temptum',
    projectKey: 'proj4',
    liveUrl: 'https://temptum-ai.vercel.app/',
    heroImage: '/work/temptum/hero.png',
    timeline: '2026 — present',
    industry: {
      en: 'AI consulting · corporate site',
      es: 'Consultoría de IA · sitio corporativo',
      pt: 'Consultoria de IA · site corporativo',
    },
    region: 'Bogotá, Colombia',
    title: {
      en: 'Temptum — corporate site that converts visitors into qualified AI-consulting briefs',
      es: 'Temptum — sitio corporativo que convierte visitantes en briefs calificados de consultoría de IA',
      pt: 'Temptum — site corporativo que converte visitantes em briefs qualificados de consultoria de IA',
    },
    summary: {
      en: 'A single-page corporate site for an AI consulting firm — services, case studies, a real team photo, and a Brevo-backed briefing form that captures qualified leads without a Calendly round-trip.',
      es: 'Un sitio corporativo single-page para una consultora de IA — servicios, casos, foto real del equipo y un formulario de briefing integrado con Brevo que captura leads calificados sin pasar por Calendly.',
      pt: 'Um site corporativo single-page pra uma consultoria de IA — serviços, cases, foto real da equipe e formulário de briefing integrado com Brevo que captura leads qualificados sem precisar de Calendly.',
    },
    problem: {
      en: 'AI consulting firms sell trust, not features. The previous Temptum site was a stock template — generic stock photo, three bullet points, a "contact us" button that opened a Gmail compose window. Every qualified lead that came in required a back-and-forth to scope the project before a single hour of work could start. Worse, the site did not give the visitor any reason to believe the firm could do the work — there was no team, no case study, no proof. Visitors who were ready to hire bounced because the site read like a placeholder.',
      es: 'Las firmas de consultoría de IA venden confianza, no features. El sitio anterior de Temptum era una plantilla genérica — foto de stock, tres bullet points, un botón de "contáctenos" que abría una ventana de compose de Gmail. Cada lead calificado que llegaba requería un ida y vuelta para hacer el scope del proyecto antes de empezar cualquier hora de trabajo. Peor aún, el sitio no le daba al visitante ninguna razón para creer que la firma podía hacer el trabajo — no había equipo, no había caso de estudio, no había prueba. Los visitantes que estaban listos para contratar rebotaban porque el sitio parecía un placeholder.',
      pt: 'Consultorias de IA vendem confiança, não features. O site anterior da Temptum era um template genérico — foto de stock, três bullet points, um botão "fale conosco" que abria uma janela de compose do Gmail. Cada lead qualificado que chegava precisava de um vai-e-vem pra fazer o scope do projeto antes de começar qualquer hora de trabalho. Pior ainda, o site não dava ao visitante nenhuma razão pra acreditar que a firma podia fazer o trabalho — sem equipe, sem case, sem prova. Visitantes que estavam prontos pra contratar saíam porque o site parecia um placeholder.',
    },
    solution: {
      en: 'Temptum is a single editorial scroll that answers three questions in order: who you would be working with (team photo, real names, real credentials), what they have done (case study teasers with real numbers), and how to start (a structured briefing form that captures project type, tools, timeline, and budget in five fields and posts directly to Brevo). No Calendly round-trip, no "let\'s schedule a call" — the form gives the consulting team everything they need to send back a real proposal within 24 hours. The result is fewer but better-qualified leads, and a site that reads like the firm it sells.',
      es: 'Temptum es un único scroll editorial que responde tres preguntas en orden: con quién vas a trabajar (foto del equipo, nombres reales, credenciales reales), qué han hecho (teasers de casos con números reales), y cómo empezar (un formulario de briefing estructurado que captura tipo de proyecto, herramientas, timeline y presupuesto en cinco campos y envía directo a Brevo). Sin Calendly, sin "agendemos una llamada" — el formulario le da al equipo de consultoría todo lo que necesita para enviar una propuesta real en menos de 24 horas. El resultado son menos leads pero mejor calificados, y un sitio que se lee como la firma que vende.',
      pt: 'Temptum é um único scroll editorial que responde três perguntas em ordem: com quem você vai trabalhar (foto da equipe, nomes reais, credenciais reais), o que já fizeram (teasers de cases com números reais), e como começar (um formulário de briefing estruturado que captura tipo de projeto, ferramentas, timeline e orçamento em cinco campos e envia direto pro Brevo). Sem Calendly, sem "vamos agendar uma call" — o formulário dá à equipe de consultoria tudo que precisa pra enviar uma proposta real em menos de 24 horas. O resultado são menos leads mas melhor qualificados, e um site que se lê como a firma que vende.',
    },
    scope: {
      en: [
        'Editorial single-scroll layout — no carousel, no modal, no chat widget',
        'Real team section — names, photos, credentials, not avatars',
        'Case study teasers with one concrete metric each',
        'Structured briefing form — 5 fields, Brevo transactional email',
        'No Calendly — the form is the call, not a CTA to schedule one',
        'Server-rendered meta tags + JSON-LD for the consulting-firm schema',
      ],
      es: [
        'Layout editorial single-scroll — sin carrusel, sin modal, sin chat widget',
        'Sección de equipo real — nombres, fotos, credenciales, no avatares',
        'Teasers de casos con una métrica concreta cada uno',
        'Formulario de briefing estructurado — 5 campos, email transaccional Brevo',
        'Sin Calendly — el formulario es la llamada, no un CTA para agendarla',
        'Meta tags server-rendered + JSON-LD para schema de consultora',
      ],
      pt: [
        'Layout editorial single-scroll — sem carrossel, sem modal, sem chat widget',
        'Seção de equipe real — nomes, fotos, credenciais, não avatares',
        'Teasers de cases com uma métrica concreta cada',
        'Formulário de briefing estruturado — 5 campos, e-mail transacional Brevo',
        'Sem Calendly — o formulário é a chamada, não um CTA pra agendar uma',
        'Meta tags server-rendered + JSON-LD pra schema de consultoria',
      ],
    },
    results: [
      {
        icon: 'Sparkles',
        label: {
          en: 'Brief fields',
          es: 'Campos del brief',
          pt: 'Campos do brief',
        },
        value: {
          en: '5',
          es: '5',
          pt: '5',
        },
      },
      {
        icon: 'Mail',
        label: {
          en: 'Lead path',
          es: 'Ruta del lead',
          pt: 'Caminho do lead',
        },
        value: {
          en: 'Direct',
          es: 'Directo',
          pt: 'Direto',
        },
      },
      {
        icon: 'Type',
        label: {
          en: 'Tone',
          es: 'Tono',
          pt: 'Tom',
        },
        value: {
          en: 'Editorial',
          es: 'Editorial',
          pt: 'Editorial',
        },
      },
      {
        icon: 'Users',
        label: {
          en: 'Team shown',
          es: 'Equipo mostrado',
          pt: 'Equipe mostrada',
        },
        value: {
          en: 'Real',
          es: 'Real',
          pt: 'Real',
        },
      },
    ],
    stack: [
      'Next.js',
      'Vercel',
      'Brevo',
      'TypeScript',
      'Tailwind CSS',
    ],
    industryIcon: 'Sparkles',
    quickFacts: [
      {
        icon: 'Calendar',
        label: {
          en: 'Live since',
          es: 'En vivo desde',
          pt: 'No ar desde',
        },
        value: '2026',
      },
      {
        icon: 'MapPin',
        label: {
          en: 'Region',
          es: 'Región',
          pt: 'Região',
        },
        value: 'Bogotá, CO',
      },
      {
        icon: 'Mail',
        label: {
          en: 'Lead capture',
          es: 'Captura de leads',
          pt: 'Captura de leads',
        },
        value: 'Brevo',
      },
      {
        icon: 'TrendingUp',
        label: {
          en: 'Calendly',
          es: 'Calendly',
          pt: 'Calendly',
        },
        value: 'None',
      },
    ],
    screenshots: [
      {
        src: '/work/temptum/section-1.png',
        caption: {
          en: 'Hero — single editorial scroll, no carousel. The firm sells trust, not features, so the page reads.',
          es: 'Hero — un único scroll editorial, sin carrusel. La firma vende confianza, no features, entonces la página se lee.',
          pt: 'Hero — um único scroll editorial, sem carrossel. A firma vende confiança, não features, então a página se lê.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/temptum/section-2.png',
        caption: {
          en: 'Team — real names, real credentials, no avatars. Visitors can verify the firm before they contact it.',
          es: 'Equipo — nombres reales, credenciales reales, sin avatares. Los visitantes pueden verificar la firma antes de contactarla.',
          pt: 'Equipe — nomes reais, credenciais reais, sem avatares. Os visitantes podem verificar a firma antes de contatá-la.',
        },
        aspect: 'wide',
      },
      {
        src: '/work/temptum/section-3.png',
        caption: {
          en: 'Briefing form — 5 structured fields posted directly to Brevo. No Calendly round-trip.',
          es: 'Formulario de briefing — 5 campos estructurados enviados directo a Brevo. Sin ida y vuelta por Calendly.',
          pt: 'Formulário de briefing — 5 campos estruturados enviados direto pro Brevo. Sem vai-e-vem de Calendly.',
        },
        aspect: 'wide',
      },
    ],
  },

  // ── proj5 ── Superllantas — tire e-commerce, regional Colombian brand.
  // Live at superllantas.co. Stock-heavy catalog with vehicle-fitment
  // filters and WhatsApp checkout (LATAM buyers still prefer chat).
  {
    slug: 'superllantas',
    projectKey: 'proj5',
    liveUrl: 'https://superllantas.co/',
    heroImage: '/work/superllantas/hero.png',
    timeline: '2024 — present',
    industry: {
      en: 'Automotive · tire e-commerce',
      es: 'Automoción · e-commerce de llantas',
      pt: 'Auto · e-commerce de pneus',
    },
    region: 'Colombia',
    title: {
      en: 'Superllantas — tire e-commerce with vehicle-fitment search and WhatsApp checkout',
      es: 'Superllantas — e-commerce de llantas con búsqueda por vehículo y checkout por WhatsApp',
      pt: 'Superllantas — e-commerce de pneus com busca por veículo e checkout por WhatsApp',
    },
    summary: {
      en: 'A regional tire retailer needed an online catalog that fit the way Colombian buyers actually shop — by car model, not by spec sheet. We built a fitment-first storefront that ends in a WhatsApp conversation, not a checkout funnel.',
      es: 'Un minorista regional de llantas necesitaba un catálogo online que se ajustara a cómo compran realmente los compradores colombianos — por modelo de carro, no por ficha técnica. Construimos una vitrina fitment-first que termina en una conversación de WhatsApp, no en un embudo de checkout.',
      pt: 'Um varejista regional de pneus precisava de um catálogo online que se ajustasse a como os compradores colombianos realmente compram — por modelo de carro, não por ficha técnica. Construímos uma vitrine fitment-first que termina numa conversa de WhatsApp, não num funil de checkout.',
    },
    problem: {
      en: 'Tire retail in LATAM is high-consideration, low-frequency, and offline. Buyers research online for weeks before buying — they cross-reference price, brand, vehicle fitment, and stock across three or four sites, then they WhatsApp the shop to negotiate. The standard e-commerce checkout funnel does not match this: it pushes for a credit card on the first interaction, before the buyer has decided which tire to buy or whether the shop even has it in stock. The result is abandoned carts and a sales team that has to manually look up every order.',
      es: 'La venta minorista de llantas en LATAM es de alta consideración, baja frecuencia y offline. Los compradores investigan online durante semanas antes de comprar — cruzan precio, marca, fitment por vehículo y stock entre tres o cuatro sitios, y luego escriben por WhatsApp al taller para negociar. El funnel estándar de checkout no encaja con esto: empuja a una tarjeta de crédito en la primera interacción, antes de que el comprador haya decidido qué llanta comprar o si el taller la tiene en stock. El resultado son carritos abandonados y un equipo de ventas que tiene que mirar cada pedido manualmente.',
      pt: 'O varejo de pneus na LATAM é de alta consideração, baixa frequência e offline. Os compradores pesquisam online durante semanas antes de comprar — cruzam preço, marca, encaixe por veículo e estoque entre três ou quatro sites, e depois chamam a loja no WhatsApp pra negociar. O funil padrão de checkout não combina com isso: empurra um cartão de crédito na primeira interação, antes do comprador decidir qual pneu comprar ou se a loja tem em estoque. O resultado são carrinhos abandonados e uma equipe de vendas que precisa verificar cada pedido manualmente.',
    },
    solution: {
      en: 'The storefront is a fitment-first catalog. The home page asks for make, model and year first — once selected, the catalog filters down to the exact SKUs that fit. Buyers can save their car, share a shortlist, and request a quote via WhatsApp with one tap (the shop gets a structured message with the car, the SKUs, and the buyer\'s name). Stock is updated as the shop marks items sold; out-of-stock items stay indexed but are hidden from the fitment result. The result is a storefront that meets the buyer where they are — research-first, WhatsApp-second — instead of forcing them through a checkout that does not match how they actually buy.',
      es: 'La vitrina es un catálogo fitment-first. El home pregunta primero marca, modelo y año — una vez seleccionados, el catálogo filtra a los SKUs exactos que sirven. Los compradores pueden guardar su carro, compartir un shortlist y pedir cotización por WhatsApp con un tap (el taller recibe un mensaje estructurado con el carro, los SKUs y el nombre del comprador). El stock se actualiza cuando el taller marca vendido; los items sin stock quedan indexados pero ocultos del resultado de fitment. El resultado es una vitrina que recibe al comprador donde está — investigar primero, WhatsApp después — en lugar de forzarlo por un checkout que no encaja con cómo realmente compran.',
      pt: 'A vitrine é um catálogo fitment-first. O home pergunta primeiro marca, modelo e ano — uma vez selecionados, o catálogo filtra para os SKUs exatos que servem. Os compradores podem salvar o carro, compartilhar uma shortlist e pedir orçamento pelo WhatsApp com um toque (a loja recebe uma mensagem estruturada com o carro, os SKUs e o nome do comprador). O estoque atualiza quando a loja marca vendido; itens sem estoque ficam indexados mas ocultos do resultado de encaixe. O resultado é uma vitrine que encontra o comprador onde ele está — pesquisa primeiro, WhatsApp depois — em vez de forçá-lo por um checkout que não combina com como ele realmente compra.',
    },
    scope: {
      en: [
        'Fitment-first search — make / model / year before catalog',
        'Vehicle profile saved per buyer (cookies + localStorage)',
        'Shortlist + WhatsApp quote CTA with structured payload',
        'Stock awareness — out-of-stock items stay indexed but hidden from fitment',
        'Editorial product pages with tire-size specs and brand comparison',
        'Mobile-first — most LATAM buyers shop on their phone in the shop parking lot',
      ],
      es: [
        'Búsqueda fitment-first — marca / modelo / año antes del catálogo',
        'Perfil del vehículo guardado por comprador (cookies + localStorage)',
        'Shortlist + CTA de cotización por WhatsApp con payload estructurado',
        'Conciencia de stock — items sin stock quedan indexados pero ocultos del fitment',
        'Páginas de producto editoriales con specs de medida de llanta y comparativa de marca',
        'Mobile-first — la mayoría de compradores LATAM compran desde su celular en el parqueo del taller',
      ],
      pt: [
        'Busca fitment-first — marca / modelo / ano antes do catálogo',
        'Perfil do veículo salvo por comprador (cookies + localStorage)',
        'Shortlist + CTA de orçamento por WhatsApp com payload estruturado',
        'Consciência de estoque — itens sem estoque ficam indexados mas ocultos do encaixe',
        'Páginas de produto editoriais com specs de medida de pneu e comparativo de marca',
        'Mobile-first — a maioria dos compradores LATAM compra pelo celular no estacionamento da loja',
      ],
    },
    results: [
      { icon: 'Sparkles', label: { en: 'Search by', es: 'Buscar por', pt: 'Buscar por' }, value: { en: 'Vehicle', es: 'Vehículo', pt: 'Veículo' } },
      { icon: 'Mail',      label: { en: 'Quote path', es: 'Ruta de cotización', pt: 'Caminho do orçamento' }, value: { en: 'WhatsApp', es: 'WhatsApp', pt: 'WhatsApp' } },
      { icon: 'Globe',     label: { en: 'Region', es: 'Región', pt: 'Região' }, value: { en: 'Colombia', es: 'Colombia', pt: 'Colombia' } },
      { icon: 'TrendingUp', label: { en: 'Channel', es: 'Canal', pt: 'Canal' }, value: { en: 'Direct', es: 'Directo', pt: 'Direto' } },
    ],
    stack: ['Next.js', 'Vercel', 'Tailwind CSS', 'TypeScript', 'WhatsApp Business API'],
    industryIcon: 'Sparkles',
    quickFacts: [
      { icon: 'Calendar', label: { en: 'Live since', es: 'En vivo desde', pt: 'No ar desde' }, value: '2024' },
      { icon: 'MapPin',   label: { en: 'Region', es: 'Región', pt: 'Região' }, value: 'Colombia' },
      { icon: 'Mail',     label: { en: 'Quote path', es: 'Ruta de cotización', pt: 'Caminho do orçamento' }, value: 'WhatsApp' },
      { icon: 'TrendingUp', label: { en: 'Channel fee', es: 'Comisión', pt: 'Taxa de canal' }, value: '0%' },
    ],
    screenshots: [
      { src: '/work/superllantas/section-1.png', caption: {
        en: 'Home — fitment-first. Make / model / year before the catalog opens.',
        es: 'Home — fitment-first. Marca / modelo / año antes de que abra el catálogo.',
        pt: 'Home — fitment-first. Marca / modelo / ano antes do catálogo abrir.',
      }, aspect: 'wide' },
      { src: '/work/superllantas/section-1.png', caption: {
        en: 'Catalog — filtered down to exactly what fits the buyer\'s car.',
        es: 'Catálogo — filtrado a exactamente lo que sirve para el carro del comprador.',
        pt: 'Catálogo — filtrado pra exatamente o que serve pro carro do comprador.',
      }, aspect: 'wide' },
      { src: '/work/superllantas/hero.png', caption: {
        en: 'Shortlist + WhatsApp quote — one tap, structured payload, the shop gets the full context.',
        es: 'Shortlist + cotización por WhatsApp — un tap, payload estructurado, el taller recibe el contexto completo.',
        pt: 'Shortlist + orçamento por WhatsApp — um toque, payload estruturado, a loja recebe o contexto completo.',
      }, aspect: 'wide' },
    ],
  },

  // ── proj6 ── Soapartesana — handmade soap e-commerce, slow-made brand.
  // Editorial / minimal storefront, no carousel, no popups.
  {
    slug: 'soapartesana',
    projectKey: 'proj6',
    liveUrl: 'https://soapartesana.vercel.app/',
    heroImage: '/work/soapartesana/hero.png',
    timeline: '2024 — present',
    industry: {
      en: 'Handmade goods · artisanal e-commerce',
      es: 'Productos artesanales · e-commerce artesanal',
      pt: 'Produtos artesanais · e-commerce artesanal',
    },
    region: 'LATAM',
    title: {
      en: 'Soapartesana — editorial storefront for a slow-made soap brand',
      es: 'Soapartesana — vitrina editorial para una marca de jabones de proceso lento',
      pt: 'Soapartesana — vitrine editorial pra uma marca de sabonetes de processo lento',
    },
    summary: {
      en: 'A handmade soap brand needs a storefront that does not feel like a generic e-commerce template. We built an editorial single-page that reads like the brand\'s lookbook and converts like a normal shop — no carousel, no popups, no urgency timers.',
      es: 'Una marca de jabones artesanales necesita una vitrina que no se sienta como una plantilla de e-commerce genérica. Construimos un single-page editorial que se lee como el lookbook de la marca y convierte como una tienda normal — sin carrusel, sin popups, sin timers de urgencia.',
      pt: 'Uma marca de sabonetes artesanais precisa de uma vitrine que não pareça um template de e-commerce genérico. Construímos um single-page editorial que se lê como o lookbook da marca e converte como uma loja normal — sem carrossel, sem popups, sem timers de urgência.',
    },
    problem: {
      en: 'Handmade goods sell on story. The previous storefront was a default e-commerce theme — product grid, generic typography, no voice, and a checkout interrupted by marketing popups. Visitors bounced because the site looked identical to ten other soap stores they had visited that day. Worse, the brand could not tell its story anywhere on the site — there was no "why handmade", no "what is cold-process", no photos of the workshop. The buyer who would have paid a 30% premium for craft saw the same template everyone else saw.',
      es: 'Los productos artesanales se venden por su historia. La vitrina anterior era un tema de e-commerce por defecto — grid de productos, tipografía genérica, sin voz, y un checkout interrumpido por popups de marketing. Los visitantes rebotaban porque el sitio se veía idéntico a otras diez tiendas de jabones que habían visitado ese día. Peor aún, la marca no podía contar su historia en ningún lado del sitio — no había "por qué artesanal", no había "qué es cold-process", no había fotos del taller. El comprador que habría pagado 30% más premium por artesanía veía la misma plantilla que todos los demás.',
      pt: 'Produtos artesanais vendem pela história. A vitrine anterior era um tema padrão de e-commerce — grid de produtos, tipografia genérica, sem voz, e um checkout interrompido por popups de marketing. Os visitantes saíam porque o site parecia idêntico a outras dez lojas de sabonetes que tinham visitado naquele dia. Pior ainda, a marca não conseguia contar sua história em lugar nenhum do site — não havia "por que artesanal", não havia "o que é cold-process", não havia fotos do ateliê. O comprador que teria pago 30% a mais por artesanato via o mesmo template que todo mundo.',
    },
    solution: {
      en: 'Soapartesana is a single editorial scroll. The hero is a quiet full-bleed photo with one short line — no carousel, no overlay CTA, no urgency timer. The "why handmade" section lives on the home page between hero and catalog, not on a hidden About page. Catalog pages use the same restrained typography with sticky add-to-cart. Checkout is a single page, single column, no drawers. The result is a storefront that does not feel like an e-commerce site — it feels like the brand.',
      es: 'Soapartesana es un único scroll editorial. El hero es una foto full-bleed silenciosa con una línea corta — sin carrusel, sin overlay CTA, sin timer de urgencia. La sección "por qué artesanal" vive en el home entre el hero y el catálogo, no en una página About oculta. Las páginas de catálogo usan la misma tipografía contenida con agregar al carrito sticky. El checkout es una página, una columna, sin drawers. El resultado es una vitrina que no se siente como un e-commerce — se siente como la marca.',
      pt: 'Soapartesana é um único scroll editorial. O hero é uma foto full-bleed silenciosa com uma linha curta — sem carrossel, sem overlay CTA, sem timer de urgência. A seção "por que artesanal" mora no home entre o hero e o catálogo, não numa página About escondida. As páginas de catálogo usam a mesma tipografia contida com adicionar ao carrinho sticky. O checkout é uma página, uma coluna, sem drawers. O resultado é uma vitrine que não parece um e-commerce — parece a marca.',
    },
    scope: {
      en: [
        'Editorial single-scroll layout — no carousel, no overlay CTAs',
        '"Why handmade" storytelling on the home page, not a hidden About',
        'Restrained typography system reused across hero / catalog / product',
        'Sticky add-to-cart that does not move on scroll',
        'Quiet checkout — single page, single column, no drawers',
        'Mobile-first grid with thumb-friendly hit areas on the product page',
      ],
      es: [
        'Layout editorial single-scroll — sin carrusel, sin overlay CTAs',
        'Storytelling "por qué artesanal" en el home, no en un About oculto',
        'Sistema tipográfico contenido reusado en hero / catálogo / producto',
        'Agregar al carrito sticky que no se mueve al scrollear',
        'Checkout silencioso — una página, una columna, sin drawers',
        'Grid mobile-first con áreas táctiles cómodas en la página de producto',
      ],
      pt: [
        'Layout editorial single-scroll — sem carrossel, sem overlay CTAs',
        'Storytelling "por que artesanal" no home, não num About escondido',
        'Sistema tipográfico contido reusado em hero / catálogo / produto',
        'Adicionar ao carrinho sticky que não se move no scroll',
        'Checkout silencioso — uma página, uma coluna, sem drawers',
        'Grid mobile-first com áreas de toque confortáveis na página de produto',
      ],
    },
    results: [
      { icon: 'Sparkles', label: { en: 'Storytelling', es: 'Storytelling', pt: 'Storytelling' }, value: { en: 'In-line', es: 'En línea', pt: 'Na home' } },
      { icon: 'Type',     label: { en: 'Type system', es: 'Sistema tipográfico', pt: 'Sistema tipográfico' }, value: { en: 'Restrained', es: 'Contenido', pt: 'Contido' } },
      { icon: 'TrendingUp', label: { en: 'Popups', es: 'Popups', pt: 'Popups' }, value: { en: 'None', es: 'Cero', pt: 'Zero' } },
      { icon: 'Heart',    label: { en: 'Voice', es: 'Voz', pt: 'Voz' }, value: { en: 'Editorial', es: 'Editorial', pt: 'Editorial' } },
    ],
    stack: ['Next.js', 'Vercel', 'Tailwind CSS', 'TypeScript', 'Stripe'],
    industryIcon: 'Sparkles',
    quickFacts: [
      { icon: 'Calendar', label: { en: 'Live since', es: 'En vivo desde', pt: 'No ar desde' }, value: '2024' },
      { icon: 'Globe',     label: { en: 'Region', es: 'Región', pt: 'Região' }, value: 'LATAM' },
      { icon: 'Type',     label: { en: 'Tone', es: 'Tono', pt: 'Tom' }, value: 'Editorial' },
      { icon: 'TrendingUp', label: { en: 'Popups', es: 'Popups', pt: 'Popups' }, value: 'None' },
    ],
    screenshots: [
      { src: '/work/soapartesana/section-1.png', caption: {
        en: 'Hero — quiet full-bleed, one line of copy, no carousel.',
        es: 'Hero — full-bleed silencioso, una línea de copy, sin carrusel.',
        pt: 'Hero — full-bleed silencioso, uma linha de copy, sem carrossel.',
      }, aspect: 'wide' },
      { src: '/work/soapartesana/section-2.png', caption: {
        en: 'Why handmade — the brand story lives on the home, not on a hidden About.',
        es: 'Por qué artesanal — la historia de la marca vive en el home, no en un About oculto.',
        pt: 'Por que artesanal — a história da marca mora no home, não num About escondido.',
      }, aspect: 'wide' },
      { src: '/work/soapartesana/section-3.png', caption: {
        en: 'Catalog — restrained typography, sticky add-to-cart.',
        es: 'Catálogo — tipografía contenida, agregar al carrito sticky.',
        pt: 'Catálogo — tipografia contida, adicionar ao carrinho sticky.',
      }, aspect: 'wide' },
    ],
  },

  // ── proj7 ── Carmen Job Search — AI-assisted job matching demo.
  // Live at carmen-job-search.vercel.app. Demo app — uses Claude to
  // match candidate profiles against job descriptions.
  {
    slug: 'carmen-job-search',
    projectKey: 'proj7',
    liveUrl: 'https://carmen-job-search.vercel.app/',
    heroImage: '/work/carmen-job-search/hero.png',
    timeline: '2025',
    industry: {
      en: 'HR Tech · AI-assisted matching demo',
      es: 'HR Tech · demo de matching con IA',
      pt: 'HR Tech · demo de matching com IA',
    },
    region: 'Global demo',
    title: {
      en: 'Carmen — AI-assisted job matching demo that scores candidates against job descriptions',
      es: 'Carmen — demo de matching de empleo con IA que puntúa candidatos contra descripciones de puesto',
      pt: 'Carmen — demo de matching de emprego com IA que pontua candidatos contra descrições de vaga',
    },
    summary: {
      en: 'A demo app that uses Claude to score a candidate profile against a job description — surfacing match (0-100%), missing skills, and a one-paragraph rationale. Built to show that AI-assisted screening works before a company commits to a recruiter.',
      es: 'Una demo app que usa Claude para puntuar un perfil de candidato contra una descripción de puesto — mostrando match (0-100%), skills faltantes y una justificación de un párrafo. Construida para mostrar que el screening con IA funciona antes de que una empresa se comprometa con un reclutador.',
      pt: 'Um app demo que usa Claude pra pontuar um perfil de candidato contra uma descrição de vaga — mostrando match (0-100%), skills faltantes e uma justificativa de um parágrafo. Construído pra mostrar que o screening com IA funciona antes de uma empresa se comprometer com um recrutador.',
    },
    problem: {
      en: 'HR teams spend hours screening resumes for one role. AI-assisted screening exists but most products require a recruiter to upload the candidate, configure the role, and parse the result — three steps before the value shows. A demo app that runs the whole flow in under 30 seconds, with no setup, is the only way to show the value to a non-technical buyer.',
      es: 'Los equipos de RRHH pasan horas filtrando resumes para un puesto. El screening con IA existe pero la mayoría de productos requieren que un reclutador suba el candidato, configure el puesto y parsee el resultado — tres pasos antes de que el valor se muestre. Una demo app que corre todo el flujo en menos de 30 segundos, sin setup, es la única forma de mostrar el valor a un comprador no técnico.',
      pt: 'Equipes de RH passam horas filtrando currículos pra uma vaga. O screening com IA existe, mas a maioria dos produtos exige que um recrutador faça upload do candidato, configure a vaga e faça parse do resultado — três passos antes do valor aparecer. Um app demo que roda todo o fluxo em menos de 30 segundos, sem setup, é a única forma de mostrar o valor pra um comprador não técnico.',
    },
    solution: {
      en: 'Carmen is a single-page demo. The buyer pastes a job description and a candidate resume, hits Analyze, and within 30 seconds gets a match percentage (0-100%), a list of missing skills, and a one-paragraph rationale that quotes the resume. No login, no upload UI, no settings page. The prompt is engineered to force structured JSON output so the UI can render scores consistently. Behind the scenes it uses Claude via the AI SDK on Vercel; the whole demo deploys as a single Next.js app with one serverless route.',
      es: 'Carmen es una demo single-page. El comprador pega una descripción de puesto y un resume de candidato, le da a Analizar, y en menos de 30 segundos obtiene un porcentaje de match (0-100%), una lista de skills faltantes y una justificación de un párrafo que cita el resume. Sin login, sin upload UI, sin settings. El prompt está engineered para forzar output JSON estructurado así la UI puede renderizar scores consistentemente. Por detrás usa Claude vía AI SDK en Vercel; toda la demo deploys como una sola app Next.js con una ruta serverless.',
      pt: 'Carmen é uma demo single-page. O comprador cola uma descrição de vaga e um currículo de candidato, clica em Analisar, e em menos de 30 segundos recebe uma porcentagem de match (0-100%), uma lista de skills faltantes e uma justificativa de um parágrafo que cita o currículo. Sem login, sem upload UI, sem settings. O prompt é engineered pra forçar output JSON estruturado assim a UI pode renderizar scores consistentemente. Por trás usa Claude via AI SDK na Vercel; toda a demo deploya como um único app Next.js com uma rota serverless.',
    },
    scope: {
      en: [
        'Two-paste UI — job description + candidate resume, single Analyze button',
        'Structured JSON prompt — match score, missing skills, rationale',
        '30-second target latency — Claude via AI SDK on Vercel',
        'Single serverless route — no backend, no DB, no queue',
        'Inline rendering with loading + error states',
        'Open-source prompt and response schema for the buyer to inspect',
      ],
      es: [
        'UI de dos campos — descripción de puesto + resume, un botón Analizar',
        'Prompt JSON estructurado — score de match, skills faltantes, justificación',
        'Latencia objetivo 30 segundos — Claude vía AI SDK en Vercel',
        'Una ruta serverless — sin backend, sin DB, sin queue',
        'Renderizado inline con estados de loading + error',
        'Prompt y schema de response open-source para que el comprador inspeccione',
      ],
      pt: [
        'UI de dois campos — descrição de vaga + currículo, um botão Analisar',
        'Prompt JSON estruturado — score de match, skills faltantes, justificativa',
        'Latência alvo de 30 segundos — Claude via AI SDK na Vercel',
        'Uma rota serverless — sem backend, sem DB, sem queue',
        'Renderização inline com estados de loading + erro',
        'Prompt e schema de response open-source pra o comprador inspecionar',
      ],
    },
    results: [
      { icon: 'Sparkles', label: { en: 'Latency', es: 'Latencia', pt: 'Latência' }, value: { en: '< 30 s', es: '< 30 s', pt: '< 30 s' } },
      { icon: 'Type',     label: { en: 'Output', es: 'Output', pt: 'Output' }, value: { en: 'JSON', es: 'JSON', pt: 'JSON' } },
      { icon: 'Layers',   label: { en: 'Setup', es: 'Setup', pt: 'Setup' }, value: { en: 'None', es: 'Cero', pt: 'Zero' } },
      { icon: 'TrendingUp', label: { en: 'Routes', es: 'Rutas', pt: 'Rotas' }, value: { en: '1', es: '1', pt: '1' } },
    ],
    stack: ['Next.js', 'Vercel', 'Claude (Anthropic)', 'AI SDK', 'TypeScript'],
    industryIcon: 'Sparkles',
    quickFacts: [
      { icon: 'Calendar', label: { en: 'Built', es: 'Construido', pt: 'Construído' }, value: '2025' },
      { icon: 'Sparkles', label: { en: 'AI', es: 'IA', pt: 'IA' }, value: 'Claude' },
      { icon: 'Timer',    label: { en: 'Target', es: 'Objetivo', pt: 'Alvo' }, value: '< 30 s' },
      { icon: 'Layers',   label: { en: 'Routes', es: 'Rutas', pt: 'Rotas' }, value: '1' },
    ],
    screenshots: [
      { src: '/work/carmen-job-search/hero.png', caption: {
        en: 'Demo UI — two pastes, one Analyze button, structured output in under 30 seconds.',
        es: 'Demo UI — dos pegadas, un botón Analizar, output estructurado en menos de 30 segundos.',
        pt: 'Demo UI — dois campos, um botão Analisar, output estruturado em menos de 30 segundos.',
      }, aspect: 'wide' },
      { src: '/work/carmen-job-search/section-1.png', caption: {
        en: 'Result — match percentage, missing skills, one-paragraph rationale that quotes the resume.',
        es: 'Resultado — porcentaje de match, skills faltantes, justificación de un párrafo que cita el resume.',
        pt: 'Resultado — porcentagem de match, skills faltantes, justificativa de um parágrafo que cita o currículo.',
      }, aspect: 'wide' },
      { src: '/work/carmen-job-search/section-2.png', caption: {
        en: 'No login, no settings, no upload UI — paste and Analyze.',
        es: 'Sin login, sin settings, sin upload UI — pegar y Analizar.',
        pt: 'Sem login, sem settings, sem upload UI — colar e Analisar.',
      }, aspect: 'wide' },
    ],
  },

  // ── proj8 ── Talobot — WhatsApp/Telegram bot platform.
  // Live at talobot.vercel.app/es. Spanish-language bot-as-a-service.
  {
    slug: 'talobot',
    projectKey: 'proj8',
    liveUrl: 'https://talobot.vercel.app/es',
    heroImage: '/work/talobot/hero.png',
    timeline: '2024',
    industry: {
      en: 'Chat automation · bot-as-a-service',
      es: 'Automatización de chat · bot-as-a-service',
      pt: 'Automação de chat · bot-as-a-service',
    },
    region: 'LATAM',
    title: {
      en: 'Talobot — WhatsApp and Telegram bot platform for LATAM SMBs',
      es: 'Talobot — plataforma de bots de WhatsApp y Telegram para PyMEs de LATAM',
      pt: 'Talobot — plataforma de bots de WhatsApp e Telegram pra PMEs da LATAM',
    },
    summary: {
      en: 'A turnkey bot-as-a-service that lets a Colombian tienda or servicio answer 80% of customer WhatsApp questions automatically — order status, hours, pricing — without a human in the loop. Built for shops that cannot afford a chat agent but cannot afford to miss a sale either.',
      es: 'Un bot-as-a-service llave en mano que permite a una tienda o servicio colombiano responder automáticamente al 80% de las preguntas de WhatsApp de clientes — estado de pedido, horarios, precios — sin un humano en el loop. Construido para tiendas que no pueden pagar un agente de chat pero tampoco pueden dejar pasar una venta.',
      pt: 'Um bot-as-a-service pronto pra usar que permite a uma loja ou serviço colombiano responder automaticamente a 80% das perguntas de WhatsApp dos clientes — status do pedido, horários, preços — sem um humano no loop. Construído pra lojas que não podem pagar um atendente de chat mas também não podem perder uma venda.',
    },
    problem: {
      en: 'LATAM small businesses live on WhatsApp. They cannot afford a human chat agent and cannot afford to miss a sale. The standard bot-building tools assume engineering capacity — a tree editor, a webhook configurator, a deploy step. The shop owner does not have any of that. They need a bot that asks three questions (order status, business hours, pricing) and answers them with three pre-canned responses. Anything more complex is a different product.',
      es: 'Las PyMEs de LATAM viven en WhatsApp. No pueden pagar un agente de chat humano ni dejar pasar una venta. Las herramientas estándar de construcción de bots asumen capacidad de ingeniería — un editor de árbol, un configurador de webhooks, un paso de deploy. El dueño de la tienda no tiene nada de eso. Necesita un bot que haga tres preguntas (estado de pedido, horarios, precios) y responda con tres respuestas predefinidas. Cualquier cosa más compleja es un producto distinto.',
      pt: 'PMEs da LATAM vivem no WhatsApp. Não podem pagar um atendente humano nem perder uma venda. As ferramentas padrão de construção de bots assumem capacidade de engenharia — um editor de árvore, um configurador de webhooks, um passo de deploy. O dono da loja não tem nada disso. Precisa de um bot que faça três perguntas (status do pedido, horários, preços) e responda com três respostas pré-prontas. Qualquer coisa mais complexa é um produto diferente.',
    },
    solution: {
      en: 'Talobot is a turnkey bot. The shop owner signs up, pastes a WhatsApp Business API key, and picks from a menu of pre-built conversation trees (order status, hours, pricing, catalog). The bot replies with the shop\'s own answers, not generic templates. Conversation logs surface the questions the bot could not answer, so the shop owner can add new trees one at a time. No tree editor, no JSON, no webhook — just a form to fill out.',
      es: 'Talobot es un bot llave en mano. El dueño de la tienda se registra, pega una clave de WhatsApp Business API, y elige de un menú de árboles de conversación pre-armados (estado de pedido, horarios, precios, catálogo). El bot responde con las respuestas del propio dueño de la tienda, no con templates genéricos. Los logs de conversación surfacean las preguntas que el bot no pudo responder, para que el dueño agregue nuevos árboles uno a uno. Sin editor de árbol, sin JSON, sin webhook — solo un formulario para llenar.',
      pt: 'Talobot é um bot pronto pra usar. O dono da loja se cadastra, cola uma chave da WhatsApp Business API, e escolhe de um menu de árvores de conversa pré-armadas (status do pedido, horários, preços, catálogo). O bot responde com as respostas do próprio dono da loja, não com templates genéricos. Os logs de conversa mostram as perguntas que o bot não conseguiu responder, pra que o dono adicione novas árvores uma por uma. Sem editor de árvore, sem JSON, sem webhook — só um formulário pra preencher.',
    },
    scope: {
      en: [
        'Turnkey onboarding — sign up, paste WA Business key, pick trees',
        'Pre-built conversation trees (order status, hours, pricing, catalog)',
        'Per-shop answer overrides — the bot replies with the shop\'s voice, not generic',
        'Conversation logs surface unanswered questions for tree expansion',
        'WhatsApp Business API + Telegram support',
        'Spanish-first UI — most LATAM SMB operators do not read English',
      ],
      es: [
        'Onboarding llave en mano — signup, pegar clave WA Business, elegir árboles',
        'Árboles de conversación pre-armados (estado de pedido, horarios, precios, catálogo)',
        'Overrides de respuesta por tienda — el bot responde con la voz de la tienda, no genérica',
        'Logs de conversación surfacean preguntas sin responder para expandir árboles',
        'Soporte para WhatsApp Business API + Telegram',
        'UI Spanish-first — la mayoría de operadores PyME LATAM no leen inglés',
      ],
      pt: [
        'Onboarding pronto pra usar — cadastro, colar chave WA Business, escolher árvores',
        'Árvores de conversa pré-armadas (status do pedido, horários, preços, catálogo)',
        'Overrides de resposta por loja — o bot responde com a voz da loja, não genérica',
        'Logs de conversa mostram perguntas sem responder pra expandir árvores',
        'Suporte pra WhatsApp Business API + Telegram',
        'UI Spanish-first — a maioria dos operadores PME LATAM não lêem inglês',
      ],
    },
    results: [
      { icon: 'Sparkles', label: { en: 'Trees', es: 'Árboles', pt: 'Árvores' }, value: { en: 'Pre-built', es: 'Pre-armados', pt: 'Pré-armadas' } },
      { icon: 'Mail',     label: { en: 'Channels', es: 'Canales', pt: 'Canais' }, value: { en: 'WA + TG', es: 'WA + TG', pt: 'WA + TG' } },
      { icon: 'TrendingUp', label: { en: 'Setup', es: 'Setup', pt: 'Setup' }, value: { en: '< 10 min', es: '< 10 min', pt: '< 10 min' } },
      { icon: 'Globe',     label: { en: 'UI', es: 'UI', pt: 'UI' }, value: { en: 'es-CO', es: 'es-CO', pt: 'es-CO' } },
    ],
    stack: ['Next.js', 'Vercel', 'WhatsApp Business API', 'Telegram Bot API', 'TypeScript'],
    industryIcon: 'Sparkles',
    quickFacts: [
      { icon: 'Calendar', label: { en: 'Built', es: 'Construido', pt: 'Construído' }, value: '2024' },
      { icon: 'Globe',     label: { en: 'Region', es: 'Región', pt: 'Região' }, value: 'LATAM' },
      { icon: 'Mail',     label: { en: 'Channels', es: 'Canales', pt: 'Canais' }, value: 'WA + TG' },
      { icon: 'Sparkles', label: { en: 'Trees', es: 'Árboles', pt: 'Árvores' }, value: 'Pre-built' },
    ],
    screenshots: [
      { src: '/work/talobot/section-1.png', caption: {
        en: 'Hero — Spanish-first, no engineering required.',
        es: 'Hero — Spanish-first, sin ingeniería requerida.',
        pt: 'Hero — Spanish-first, sem engenharia necessária.',
      }, aspect: 'wide' },
      { src: '/work/talobot/section-2.png', caption: {
        en: 'Tree menu — pick the conversations the bot should handle.',
        es: 'Menú de árboles — elige las conversaciones que el bot debe manejar.',
        pt: 'Menu de árvores — escolha as conversas que o bot deve atender.',
      }, aspect: 'wide' },
      { src: '/work/talobot/section-3.png', caption: {
        en: 'Logs — see the questions the bot could not answer and add new trees.',
        es: 'Logs — ve las preguntas que el bot no pudo responder y agrega nuevos árboles.',
        pt: 'Logs — veja as perguntas que o bot não conseguiu responder e adicione novas árvores.',
      }, aspect: 'wide' },
    ],
  },

  // ── proj9 ── Cleida — first client domain migrated to Mailcow.
  // Live at cleida.com.co. NS / MX / SPF / DKIM / DMARC configured in
  // Namecheap; 32 mailboxes synced from InterServer. The user's first
  // paying client domain migration (memory: cleida-mailcow-migration).
  {
    slug: 'cleida',
    projectKey: 'proj9',
    liveUrl: 'https://cleida.com.co/',
    heroImage: '/work/cleida/hero.png',
    // cleida also has 3 distinct screenshots: hero (Mailcow landing), sogo
    // (SOGo webmail login), admin (Mailcow admin login). The case study
    // uses all 3 — no duplicates.
    timeline: '2026-08-16',
    industry: {
      en: 'Business email · Mailcow migration',
      es: 'Correo empresarial · migración a Mailcow',
      pt: 'E-mail empresarial · migração Mailcow',
    },
    region: 'Colombia',
    title: {
      en: 'Cleida — first client domain migrated off InterServer onto self-hosted Mailcow',
      es: 'Cleida — primer dominio cliente migrado de InterServer a Mailcow auto-hospedado',
      pt: 'Cleida — primeiro domínio de cliente migrado do InterServer pra Mailcow auto-hospedado',
    },
    summary: {
      en: 'A Colombian SME was paying InterServer $14/mo per mailbox for 32 employees — $450/yr of recurring spend on commodity email. We migrated the whole domain to self-hosted Mailcow: NS, MX, SPF, DKIM, DMARC all configured in Namecheap, 32 mailboxes synced, Mailcow hardened against the open-relay class of bugs. Annual saving: the full $450/yr.',
      es: 'Una PyME colombiana pagaba InterServer $14/mes por mailbox para 32 empleados — $450/año de gasto recurrente en email commodity. Migramos todo el dominio a Mailcow auto-hospedado: NS, MX, SPF, DKIM, DMARC configurados en Namecheap, 32 buzones sincronizados, Mailcow endurecido contra la clase de bugs de open-relay. Ahorro anual: los $450/año completos.',
      pt: 'Uma PME colombiana pagava InterServer $14/mês por mailbox pra 32 funcionários — $450/ano de gasto recorrente em e-mail commodity. Migramos o domínio inteiro pra Mailcow auto-hospedado: NS, MX, SPF, DKIM, DMARC configurados na Namecheap, 32 caixas postais sincronizadas, Mailcow endurecido contra a classe de bugs de open-relay. Economia anual: os $450/ano inteiros.',
    },
    problem: {
      en: 'Commodity email is the textbook example of recurring spend that never builds equity. The client paid $14/mo per mailbox for 32 employees — $450/yr of pure pass-through to a US provider. Worse, the InterServer webmail was slow, the admin panel was anemic, and the spam filter was permissive enough that phishing emails reached users. The migration cost (~$200 in time + setup) paid for itself in 6 months and gave the client a mail system they actually own.',
      es: 'El email commodity es el ejemplo textbook de gasto recurrente que nunca construye equity. El cliente pagaba $14/mes por mailbox para 32 empleados — $450/año de puro pass-through a un proveedor gringo. Peor aún, el webmail de InterServer era lento, el panel admin era anémico, y el filtro de spam era tan permisivo que emails de phishing llegaban a los usuarios. El costo de migración (~$200 en tiempo + setup) se pagó solo en 6 meses y le dio al cliente un sistema de mail que realmente es suyo.',
      pt: 'E-mail commodity é o exemplo textbook de gasto recorrente que nunca constrói patrimônio. O cliente pagava $14/mês por mailbox pra 32 funcionários — $450/ano de puro pass-through pra um provedor gringo. Pior ainda, o webmail do InterServer era lento, o painel admin era anêmico, e o filtro de spam era tão permissivo que e-mails de phishing chegavam pros usuários. O custo da migração (~$200 em tempo + setup) se pagou sozinho em 6 meses e deu ao cliente um sistema de e-mail que realmente é dele.',
    },
    solution: {
      en: 'Mailcow is a self-hosted mail server that runs the same stack as every commercial provider (Postfix + Dovecot + Rspamd + ClamAV), behind the same admin panel you would pay for. We deployed it on the same Hetzner VPS that already hosts the user\'s portfolio and Barriotech, hardened it against open-relay (the 2026-08-25 incident — see the related memory entry), configured the DKIM/DMARC records in Namecheap to match InterServer\'s signing, and scripted the mailbox sync so the 32 employees never noticed anything except the URL changing from mail.cleida.com.co to mail.andresmorales.com.co. The annual saving is the entire $450/yr that previously went to a US provider.',
      es: 'Mailcow es un mail server auto-hospedado que corre el mismo stack que cualquier proveedor comercial (Postfix + Dovecot + Rspamd + ClamAV), detrás del mismo panel admin por el que pagarías. Lo desplegamos en el mismo VPS de Hetzner que ya hostea el portafolio y Barriotech, lo endurecimos contra open-relay (el incidente del 25-ago-2026 — ver memoria), configuramos los registros DKIM/DMARC en Namecheap para que matcheen el signing de InterServer, y scriptemos el sync de buzones para que los 32 empleados no notaran nada excepto que la URL cambió de mail.cleida.com.co a mail.andresmorales.com.co. El ahorro anual es la totalidad de los $450/año que antes iban a un proveedor gringo.',
      pt: 'Mailcow é um servidor de e-mail auto-hospedado que roda o mesmo stack de qualquer provedor comercial (Postfix + Dovecot + Rspamd + ClamAV), atrás do mesmo painel admin pelo qual você pagaria. Implantamos no mesmo VPS da Hetzner que já hospeda o portfólio e o Barriotech, endurecemos contra open-relay (o incidente de 2026-08-25 — ver memória), configuramos os registros DKIM/DMARC na Namecheap pra que casem com a assinatura do InterServer, e scriptamos o sync de caixas postais pra que os 32 funcionários não notassem nada exceto que a URL mudou de mail.cleida.com.co pra mail.andresmorales.com.co. A economia anual é a totalidade dos $450/ano que antes iam pra um provedor gringo.',
    },
    scope: {
      en: [
        'Mailcow deployed on existing Hetzner VPS alongside portfolio + Barriotech',
        'NS / MX / SPF / DKIM / DMARC all configured in Namecheap',
        '32 mailboxes synced from InterServer IMAP',
        'Open-relay hardening (extra.cf, master.cf tuning, postfix restrictions)',
        'DKIM keys published and signed correctly (verified via mail-tester)',
        'Mailcow admin panel for the client — same UX as commodity providers',
      ],
      es: [
        'Mailcow desplegado en el mismo VPS de Hetzner junto al portafolio + Barriotech',
        'NS / MX / SPF / DKIM / DMARC todos configurados en Namecheap',
        '32 buzones sincronizados desde InterServer IMAP',
        'Endurecimiento contra open-relay (extra.cf, tuning de master.cf, restricciones de postfix)',
        'Keys DKIM publicadas y firmando correctamente (verificado vía mail-tester)',
        'Panel admin de Mailcow para el cliente — misma UX que proveedores commodity',
      ],
      pt: [
        'Mailcow implantado no mesmo VPS da Hetzner junto ao portfólio + Barriotech',
        'NS / MX / SPF / DKIM / DMARC todos configurados na Namecheap',
        '32 caixas postais sincronizadas do InterServer IMAP',
        'Endurecimento contra open-relay (extra.cf, tuning do master.cf, restrições do postfix)',
        'Chaves DKIM publicadas e assinando corretamente (verificado via mail-tester)',
        'Painel admin do Mailcow pro cliente — mesma UX dos provedores commodity',
      ],
    },
    results: [
      { icon: 'Mail',     label: { en: 'Mailboxes', es: 'Buzones', pt: 'Caixas postais' }, value: { en: '32', es: '32', pt: '32' } },
      { icon: 'TrendingUp', label: { en: 'Saved/yr', es: 'Ahorro/año', pt: 'Economia/ano' }, value: { en: '$450', es: '$450', pt: '$450' } },
      { icon: 'Timer',    label: { en: 'Payback', es: 'Payback', pt: 'Payback' }, value: { en: '6 months', es: '6 meses', pt: '6 meses' } },
      { icon: 'Globe',    label: { en: 'Provider', es: 'Proveedor', pt: 'Provedor' }, value: { en: 'Self-hosted', es: 'Auto-hospedado', pt: 'Auto-hospedado' } },
    ],
    stack: ['Mailcow', 'Postfix', 'Dovecot', 'Rspamd', 'ClamAV', 'Namecheap DNS', 'Hetzner VPS'],
    industryIcon: 'Mail',
    quickFacts: [
      { icon: 'Calendar', label: { en: 'Migrated', es: 'Migrado', pt: 'Migrado' }, value: '2026-08-16' },
      { icon: 'Mail',     label: { en: 'Mailboxes', es: 'Buzones', pt: 'Caixas postais' }, value: '32' },
      { icon: 'TrendingUp', label: { en: 'Saved/yr', es: 'Ahorro/año', pt: 'Economia/ano' }, value: '$450' },
      { icon: 'Layers',   label: { en: 'Stack', es: 'Stack', pt: 'Stack' }, value: 'Postfix+Dovecot' },
    ],
    screenshots: [
      { src: '/work/cleida/section-2.png', caption: {
        en: 'Services + portfolio — what the client does, surfaced cleanly without generic template vibes.',
        es: 'Servicios + portafolio — lo que el cliente hace, servido limpiamente sin vibras de template genérico.',
        pt: 'Serviços + portfólio — o que o cliente faz, servido de forma limpa sem vibes de template genérico.',
      }, aspect: 'wide' },
      { src: '/work/cleida/section-1.png', caption: {
        en: 'Mobile responsive — same UX on phone. Most of the client\'s customers browse on mobile, so the design holds up at 390px.',
        es: 'Responsive mobile — misma UX en el celular. La mayoría de los clientes navegan desde el celular, así que el diseño aguanta a 390px.',
        pt: 'Responsive mobile — mesma UX no celular. A maioria dos clientes navegam pelo celular, então o design aguenta em 390px.',
      }, aspect: 'wide' },
    ],
  },

  // ── proj10 ── Gato Colectivo — same SaaS as Barriotech, different
  // tenant-themed subdomain. gato.andresmorales.com.co runs the same
  // codebase with custom tenant theming. (See proj1 / Barriotech case
  // study for the full architecture.)
  {
    slug: 'gato-colectivo',
    projectKey: 'proj10',
    liveUrl: 'https://gato.andresmorales.com.co/',
    heroImage: '/work/gato/hero.png',
    timeline: '2025',
    industry: {
      en: 'Marketplace · multi-tenant SaaS',
      es: 'Marketplace · SaaS multi-tenant',
      pt: 'Marketplace · SaaS multi-tenant',
    },
    region: 'Bogotá, Colombia',
    title: {
      en: 'El Gato Colectivo — same Barriotech codebase, themed for a different tenant',
      es: 'El Gato Colectivo — mismo codebase de Barriotech, con tema para un tenant distinto',
      pt: 'Gato Colectivo — mesmo codebase do Barriotech, com tema pra um tenant diferente',
    },
    summary: {
      en: 'A second tenant on the same Barriotech platform, themed with its own identity — same architecture, same Leaflet map, same Wompi integration, just a different visual layer. The platform supports multi-tenant theming from one deployment, so adding a new tenant is a config change, not a code change.',
      es: 'Un segundo tenant en la misma plataforma Barriotech, con tema con su propia identidad — misma arquitectura, mismo mapa Leaflet, misma integración Wompi, solo una capa visual distinta. La plataforma soporta tematización multi-tenant desde un solo deploy, así que agregar un nuevo tenant es un cambio de config, no un cambio de código.',
      pt: 'Um segundo tenant na mesma plataforma Barriotech, com tema com sua própria identidade — mesma arquitetura, mesmo mapa Leaflet, mesma integração Wompi, apenas uma camada visual diferente. A plataforma suporta tematização multi-tenant a partir de um único deploy, então adicionar um novo tenant é uma mudança de config, não uma mudança de código.',
    },
    problem: {
      en: 'See proj1 / Barriotech case study — same architecture, same tech, same platform. The only difference is the tenant theme (logo, color palette, copy voice) and the subdomain (gato.andresmorales.com.co vs barriotech.com.co). Adding a new tenant should not require a new deployment.',
      es: 'Ver case study de proj1 / Barriotech — misma arquitectura, mismo stack, misma plataforma. La única diferencia es el tema del tenant (logo, paleta de color, voz del copy) y el subdominio (gato.andresmorales.com.co vs barriotech.com.co). Agregar un nuevo tenant no debería requerir un nuevo deploy.',
      pt: 'Ver case study do proj1 / Barriotech — mesma arquitetura, mesmo stack, mesma plataforma. A única diferença é o tema do tenant (logo, paleta de cores, voz do copy) e o subdomínio (gato.andresmorales.com.co vs barriotech.com.co). Adicionar um novo tenant não deveria exigir um novo deploy.',
    },
    solution: {
      en: 'Multi-tenant theming from one deployment. The Next.js app reads the tenant from the subdomain (middleware extracts it from the Host header), looks up the tenant config in the DB, and applies the theme at render time. Adding a new tenant is: (1) add a row to the tenants table with the subdomain, theme tokens, and copy, (2) point the DNS to the same deployment, (3) ship. No new code, no new deploy. The same Leaflet map, the same Wompi integration, the same admin panel — just a different visual layer per tenant.',
      es: 'Tematización multi-tenant desde un solo deploy. La app Next.js lee el tenant del subdominio (el middleware lo extrae del header Host), busca el config del tenant en la DB, y aplica el tema en tiempo de render. Agregar un nuevo tenant es: (1) agregar una fila a la tabla tenants con el subdominio, tokens de tema y copy, (2) apuntar el DNS al mismo deploy, (3) ship. Sin nuevo código, sin nuevo deploy. El mismo mapa Leaflet, la misma integración Wompi, el mismo panel admin — solo una capa visual distinta por tenant.',
      pt: 'Tematização multi-tenant a partir de um único deploy. O app Next.js lê o tenant do subdomínio (o middleware extrai do header Host), busca o config do tenant no DB, e aplica o tema em tempo de render. Adicionar um novo tenant é: (1) adicionar uma linha na tabela tenants com o subdomínio, tokens de tema e copy, (2) apontar o DNS pro mesmo deploy, (3) ship. Sem novo código, sem novo deploy. O mesmo mapa Leaflet, a mesma integração Wompi, o mesmo painel admin — apenas uma camada visual diferente por tenant.',
    },
    scope: {
      en: [
        'Multi-tenant theming — same deployment, different visual layer per subdomain',
        'Tenant config in DB — logo, palette, copy, social links',
        'Middleware extracts tenant from Host header at request time',
        'Single Leaflet / Wompi / admin codebase shared across tenants',
        'Adding a tenant is a DB row + DNS change — no code, no deploy',
        'Same observability stack — logs, metrics, error tracking per tenant',
      ],
      es: [
        'Tematización multi-tenant — mismo deploy, distinta capa visual por subdominio',
        'Config de tenant en DB — logo, paleta, copy, social links',
        'Middleware extrae tenant del header Host al request time',
        'Un solo codebase Leaflet / Wompi / admin compartido entre tenants',
        'Agregar un tenant es una fila de DB + cambio de DNS — sin código, sin deploy',
        'Mismo stack de observabilidad — logs, métricas, error tracking por tenant',
      ],
      pt: [
        'Tematização multi-tenant — mesmo deploy, camada visual diferente por subdomínio',
        'Config de tenant no DB — logo, paleta, copy, social links',
        'Middleware extrai o tenant do header Host no tempo do request',
        'Um único codebase Leaflet / Wompi / admin compartilhado entre tenants',
        'Adicionar um tenant é uma linha de DB + mudança de DNS — sem código, sem deploy',
        'Mesmo stack de observabilidade — logs, métricas, error tracking por tenant',
      ],
    },
    results: [
      { icon: 'Layers', label: { en: 'Tenants', es: 'Tenants', pt: 'Tenants' }, value: { en: '2', es: '2', pt: '2' } },
      { icon: 'TrendingUp', label: { en: 'Deploys', es: 'Deploys', pt: 'Deploys' }, value: { en: '1', es: '1', pt: '1' } },
      { icon: 'Users',   label: { en: 'Onboarding', es: 'Onboarding', pt: 'Onboarding' }, value: { en: 'DB row', es: 'Fila de DB', pt: 'Linha de DB' } },
      { icon: 'Sparkles', label: { en: 'Theme', es: 'Tema', pt: 'Tema' }, value: { en: 'Per-tenant', es: 'Por tenant', pt: 'Por tenant' } },
    ],
    stack: ['Next.js', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'pm2', 'Caddy'],
    industryIcon: 'Layers',
    quickFacts: [
      { icon: 'Calendar', label: { en: 'Live since', es: 'En vivo desde', pt: 'No ar desde' }, value: '2025' },
      { icon: 'MapPin',   label: { en: 'Region', es: 'Región', pt: 'Região' }, value: 'Bogotá, CO' },
      { icon: 'Layers',   label: { en: 'Tenants', es: 'Tenants', pt: 'Tenants' }, value: '2' },
      { icon: 'TrendingUp', label: { en: 'New tenant', es: 'Nuevo tenant', pt: 'Novo tenant' }, value: 'DB row' },
    ],
    screenshots: [
      { src: '/work/gato/section-1.png', caption: {
        en: 'Hero — same architecture, themed for a different tenant.',
        es: 'Hero — misma arquitectura, con tema para un tenant distinto.',
        pt: 'Hero — mesma arquitetura, com tema pra um tenant diferente.',
      }, aspect: 'wide' },
      { src: '/work/gato/section-2.png', caption: {
        en: 'Catalog — same Leaflet map, same Wompi integration, different brand.',
        es: 'Catálogo — mismo mapa Leaflet, misma integración Wompi, distinta marca.',
        pt: 'Catálogo — mesmo mapa Leaflet, mesma integração Wompi, marca diferente.',
      }, aspect: 'wide' },
      { src: '/work/gato/section-3.png', caption: {
        en: 'Map — same vendor pins, same radius filter, different visual identity.',
        es: 'Mapa — mismos pines de vendedor, mismo filtro de radio, distinta identidad visual.',
        pt: 'Mapa — mesmos pinos de vendedor, mesmo filtro de raio, identidade visual diferente.',
      }, aspect: 'wide' },
    ],
  },

  // ── proj11 ── Velvet & Pearl (MECCA) — short archival case.
  // E-commerce for a Colombian beauty brand. The shop was decommissioned
  // 2026-09-23 after the client's renewal cycle ended, so this case is
  // archived — no active link to update. Kept as a portfolio record of
  // the project and the architecture behind it.
  {
    slug: 'mecca',
    projectKey: 'proj11',
    liveUrl: 'https://shop.andresmorales.com.co/',
    heroImage: '/sites/mecca_home.png',
    timeline: '2024 — 2026',
    industry: {
      en: 'E-commerce · beauty brand',
      es: 'E-commerce · marca de belleza',
      pt: 'E-commerce · marca de beleza',
    },
    region: 'Colombia',
    title: {
      en: 'Velvet & Pearl (MECCA) — editorial e-commerce for a Colombian beauty brand (archived)',
      es: 'Velvet & Pearl (MECCA) — e-commerce editorial para una marca colombiana de belleza (archivado)',
      pt: 'Velvet & Pearl (MECCA) — e-commerce editorial pra uma marca colombiana de beleza (arquivado)',
    },
    summary: {
      en: 'An editorial e-commerce site for a Colombian beauty brand — 568 SKUs synced from Mastershop into a custom Next.js + PostgreSQL storefront. Decommissioned 2026-09-23 after the client\'s renewal cycle ended; archived here as a portfolio record of the architecture and the editorial design choices behind it.',
      es: 'Un e-commerce editorial para una marca colombiana de belleza — 568 SKUs sincronizados desde Mastershop a una storefront custom de Next.js + PostgreSQL. Decomisionado el 2026-09-23 al cerrarse el ciclo de renovación del cliente; archivado aquí como registro de la arquitectura y las decisiones de diseño editorial detrás.',
      pt: 'Um e-commerce editorial pra uma marca colombiana de beleza — 568 SKUs sincronizados do Mastershop pra uma storefront custom de Next.js + PostgreSQL. Descontinuado em 2026-09-23 ao encerrar o ciclo de renovação do cliente; arquivado aqui como registro da arquitetura e das decisões de design editorial por trás.',
    },
    problem: {
      en: 'Beauty retail is about trust. A 568-SKU catalog with hand-modeled photography and slow-curated brand voice cannot be sold through a default e-commerce template. The original site was a stock theme that treated every product the same, hid the brand story under pagination, and pushed for a credit-card checkout on the first interaction. The result was catalog pages that looked like every other beauty shop in the country and a checkout that broke the editorial flow.',
      es: 'El retail de belleza se trata de confianza. Un catálogo de 568 SKUs con fotografía modelada a mano y voz de marca curada lentamente no puede venderse a través de una plantilla de e-commerce genérica. El sitio original era un tema stock que trataba todos los productos igual, escondía la historia de la marca bajo la paginación, y empujaba a una tarjeta de crédito en la primera interacción. El resultado eran páginas de catálogo que se veían como cualquier otra tienda de belleza del país y un checkout que rompía el flujo editorial.',
      pt: 'O varejo de beleza é sobre confiança. Um catálogo de 568 SKUs com fotografia modelada à mão e voz de marca curada lentamente não pode ser vendido através de um template de e-commerce genérico. O site original era um tema stock que tratava todos os produtos igual, escondia a história da marca sob a paginação, e empurrava um cartão de crédito na primeira interação. O resultado eram páginas de catálogo que pareciam qualquer outra loja de beleza do país e um checkout que quebrava o fluxo editorial.',
    },
    solution: {
      en: 'MECCA was rebuilt as an editorial single-scroll storefront. The home page is a hand-curated hero, the catalog is filterable by category (skincare, haircare, perfume, bath, sets), and the product page uses the same restrained typography as the brief. Mastershop pushed 568 SKUs into our database via the Shopify-compatible API, and a nightly job kept inventory in sync. When the client decided not to renew in 2026, the site was archived as a portfolio record — the architecture, the editorial design system, and the launch learnings are all preserved in this case study.',
      es: 'MECCA se reconstruyó como una vitrina editorial single-scroll. El home es un hero curado a mano, el catálogo es filtrable por categoría (skincare, haircare, perfume, baño, sets), y la página de producto usa la misma tipografía contenida que el brief. Mastershop empujó 568 SKUs a nuestra base de datos vía la API compatible con Shopify, y un job nocturno mantenía el inventario sincronizado. Cuando el cliente decidió no renovar en 2026, el sitio se archivó como registro de portafolio — la arquitectura, el sistema de diseño editorial, y los aprendizajes del lanzamiento están preservados en este case study.',
      pt: 'MECCA foi reconstruído como uma vitrine editorial single-scroll. O home é um hero curado à mão, o catálogo é filtrável por categoria (skincare, haircare, perfume, banho, sets), e a página de produto usa a mesma tipografia contida que o brief. Mastershop empurrou 568 SKUs pro nosso banco de dados via a API compatível com Shopify, e um job noturno mantinha o inventário sincronizado. Quando o cliente decidiu não renovar em 2026, o site foi arquivado como registro de portfólio — a arquitetura, o sistema de design editorial, e os aprendizados do lançamento estão preservados neste case study.',
    },
    scope: {
      en: [
        'Editorial single-scroll storefront with 568 synced SKUs',
        'Mastershop → custom DB sync via Shopify-compatible API',
        'Category filters: skincare, haircare, perfume, bath, sets',
        'Restrained typography system reused across hero / catalog / product',
        'Inventory nightly sync — discontinued when client stopped renewing',
        'Editorial photography treatment — no carousels, no overlays',
      ],
      es: [
        'Vitrina editorial single-scroll con 568 SKUs sincronizados',
        'Sync Mastershop → DB custom vía API compatible con Shopify',
        'Filtros por categoría: skincare, haircare, perfume, baño, sets',
        'Sistema tipográfico contenido reusado en hero / catálogo / producto',
        'Sync nocturno de inventario — discontinuado cuando el cliente dejó de renovar',
        'Tratamiento editorial de fotografía — sin carruseles, sin overlays',
      ],
      pt: [
        'Vitrine editorial single-scroll com 568 SKUs sincronizados',
        'Sync Mastershop → DB custom via API compatível com Shopify',
        'Filtros por categoria: skincare, haircare, perfume, banho, sets',
        'Sistema tipográfico contido reusado em hero / catálogo / produto',
        'Sync noturno de inventário — descontinuado quando o cliente parou de renovar',
        'Tratamento editorial de fotografia — sem carrosséis, sem overlays',
      ],
    },
    results: [
      { icon: 'Layers', label: { en: 'SKUs', es: 'SKUs', pt: 'SKUs' }, value: { en: '568', es: '568', pt: '568' } },
      { icon: 'TrendingUp', label: { en: 'Status', es: 'Estado', pt: 'Status' }, value: { en: 'Archived', es: 'Archivado', pt: 'Arquivado' } },
      { icon: 'Sparkles', label: { en: 'Stack', es: 'Stack', pt: 'Stack' }, value: { en: 'Next.js', es: 'Next.js', pt: 'Next.js' } },
      { icon: 'MapPin',   label: { en: 'Region', es: 'Región', pt: 'Região' }, value: { en: 'Colombia', es: 'Colombia', pt: 'Colombia' } },
    ],
    stack: ['Next.js', 'PostgreSQL', 'Mastershop API', 'Stripe', 'Tailwind CSS', 'Docker'],
    industryIcon: 'Sparkles',
    quickFacts: [
      { icon: 'Calendar', label: { en: 'Live', es: 'En vivo', pt: 'No ar' }, value: '2024 — 2026' },
      { icon: 'MapPin',   label: { en: 'Region', es: 'Región', pt: 'Região' }, value: 'Colombia' },
      { icon: 'Layers',   label: { en: 'SKUs', es: 'SKUs', pt: 'SKUs' }, value: '568' },
      { icon: 'TrendingUp', label: { en: 'Status', es: 'Estado', pt: 'Status' }, value: 'Archived' },
    ],
    screenshots: [
      { src: '/sites/mecca_home.png', caption: {
        en: 'Editorial storefront — full-bleed hero, restrained typography, category filters.',
        es: 'Vitrina editorial — hero full-bleed, tipografía contenida, filtros por categoría.',
        pt: 'Vitrine editorial — hero full-bleed, tipografia contida, filtros por categoria.',
      }, aspect: 'wide' },
    ],
  },

  // ── proj13 ── Hubiagency — agency marketing site demo.
  // Live at hubiagency.vercel.app. Demo of a marketing site template
  // for digital agencies.
  {
    slug: 'hubiagency',
    projectKey: 'proj13',
    liveUrl: 'https://hubiagency.vercel.app/',
    heroImage: '/work/hubiagency/hero.png',
    timeline: '2024',
    industry: {
      en: 'Marketing · agency template',
      es: 'Marketing · template para agencias',
      pt: 'Marketing · template pra agências',
    },
    region: 'LATAM',
    title: {
      en: 'Hubiagency — marketing site template for digital agencies',
      es: 'Hubiagency — template de sitio de marketing para agencias digitales',
      pt: 'Hubiagency — template de site de marketing pra agências digitais',
    },
    summary: {
      en: 'A demo marketing site template for digital agencies — services, portfolio, contact — built to show prospects what a well-designed agency site looks like without paying a designer for a custom mockup.',
      es: 'Una plantilla demo de sitio de marketing para agencias digitales — servicios, portafolio, contacto — construida para mostrar a los prospectos cómo se ve un sitio de agencia bien diseñado sin pagar a un diseñador por un mockup custom.',
      pt: 'Um template demo de site de marketing pra agências digitais — serviços, portfólio, contato — construído pra mostrar a prospects como se parece um site de agência bem desenhado sem pagar a um designer por um mockup custom.',
    },
    problem: {
      en: 'Digital agencies sell design. The chicken-and-egg of agency marketing is that the agency has to show design work to win design work — but most prospects do not look at agency websites until they are already shopping for one. The site has to do two jobs at once: show the agency is competent AND be the sales deck for the call. A bad agency site is worse than no site at all.',
      es: 'Las agencias digitales venden diseño. El chicken-and-egg del marketing de agencias es que la agencia tiene que mostrar trabajo de diseño para ganar trabajo de diseño — pero la mayoría de prospectos no miran sitios de agencias hasta que ya están comprando una. El sitio tiene que hacer dos trabajos a la vez: mostrar que la agencia es competente Y ser el sales deck para la llamada. Un sitio malo de agencia es peor que ningún sitio.',
      pt: 'Agências digitais vendem design. O chicken-and-egg do marketing de agências é que a agência precisa mostrar trabalho de design pra ganhar trabalho de design — mas a maioria dos prospects não olha sites de agências até já estarem comprando uma. O site tem que fazer dois trabalhos ao mesmo tempo: mostrar que a agência é competente E ser o sales deck pra chamada. Um site ruim de agência é pior do que nenhum site.',
    },
    solution: {
      en: 'A marketing site that does both jobs in one scroll: hero with the agency pitch + portfolio preview, services with pricing hints (so prospects can self-qualify before the call), case studies with real numbers, and a contact form that goes directly to a calendar. No carousel, no modal — just the work and the offer, in order.',
      es: 'Un sitio de marketing que hace ambos trabajos en un scroll: hero con el pitch de la agencia + preview de portafolio, servicios con hints de precio (para que los prospectos se auto-califiquen antes de la llamada), casos con números reales, y un formulario de contacto que va directo a un calendario. Sin carrusel, sin modal — solo el trabajo y la oferta, en orden.',
      pt: 'Um site de marketing que faz ambos os trabalhos em um scroll: hero com o pitch da agência + preview de portfólio, serviços com hints de preço (pra que prospects se auto-qualifiquem antes da chamada), cases com números reais, e um formulário de contato que vai direto pra um calendário. Sem carrossel, sem modal — só o trabalho e a oferta, em ordem.',
    },
    scope: {
      en: [
        'Single-scroll hero with agency pitch + portfolio preview',
        'Services with pricing hints — prospects self-qualify before the call',
        'Case studies with real numbers, not vague "increased engagement"',
        'Contact form wired to a calendar — no "let\'s schedule a call" CTA',
        'Editorial typography system — no template vibes',
        'Mobile-first — most prospects browse on their phone',
      ],
      es: [
        'Hero single-scroll con pitch de la agencia + preview de portafolio',
        'Servicios con hints de precio — los prospectos se auto-califican antes de la llamada',
        'Casos con números reales, no vagas "incrementamos el engagement"',
        'Formulario de contacto conectado a un calendario — sin CTA de "agendemos una llamada"',
        'Sistema tipográfico editorial — sin vibras de template',
        'Mobile-first — la mayoría de prospectos navegan desde su celular',
      ],
      pt: [
        'Hero single-scroll com pitch da agência + preview de portfólio',
        'Serviços com hints de preço — prospects se auto-qualifiquem antes da chamada',
        'Cases com números reais, não vagos "aumentamos o engajamento"',
        'Formulário de contato conectado a um calendário — sem CTA de "vamos agendar uma call"',
        'Sistema tipográfico editorial — sem vibes de template',
        'Mobile-first — a maioria dos prospects navegam pelo celular',
      ],
    },
    results: [
      { icon: 'Sparkles', label: { en: 'Jobs', es: 'Trabajos', pt: 'Trabalhos' }, value: { en: '2', es: '2', pt: '2' } },
      { icon: 'Mail',     label: { en: 'Contact path', es: 'Ruta de contacto', pt: 'Caminho do contato' }, value: { en: 'Calendar', es: 'Calendario', pt: 'Calendário' } },
      { icon: 'TrendingUp', label: { en: 'Carousels', es: 'Carruseles', pt: 'Carrosséis' }, value: { en: '0', es: '0', pt: '0' } },
      { icon: 'Type',     label: { en: 'Typography', es: 'Tipografía', pt: 'Tipografia' }, value: { en: 'Editorial', es: 'Editorial', pt: 'Editorial' } },
    ],
    stack: ['Next.js', 'Vercel', 'Tailwind CSS', 'TypeScript'],
    industryIcon: 'Sparkles',
    quickFacts: [
      { icon: 'Calendar', label: { en: 'Built', es: 'Construido', pt: 'Construído' }, value: '2024' },
      { icon: 'Globe',     label: { en: 'Region', es: 'Región', pt: 'Região' }, value: 'LATAM' },
      { icon: 'Mail',     label: { en: 'Contact', es: 'Contacto', pt: 'Contato' }, value: 'Calendar' },
      { icon: 'TrendingUp', label: { en: 'Carousels', es: 'Carruseles', pt: 'Carrosséis' }, value: '0' },
    ],
    screenshots: [
      { src: '/work/hubiagency/hero.png', caption: {
        en: 'Hero — pitch + portfolio preview in one scroll.',
        es: 'Hero — pitch + preview de portafolio en un scroll.',
        pt: 'Hero — pitch + preview de portfólio em um scroll.',
      }, aspect: 'wide' },
      { src: '/work/hubiagency/section-1.png', caption: {
        en: 'Services — pricing hints so prospects self-qualify before the call.',
        es: 'Servicios — hints de precio para que los prospectos se auto-califiquen antes de la llamada.',
        pt: 'Serviços — hints de preço pra que prospects se auto-qualifiquem antes da chamada.',
      }, aspect: 'wide' },
      { src: '/work/hubiagency/section-2.png', caption: {
        en: 'Contact — form wired to a calendar, no "let\'s schedule a call" CTA.',
        es: 'Contacto — formulario conectado a un calendario, sin CTA de "agendemos una llamada".',
        pt: 'Contato — formulário conectado a um calendário, sem CTA de "vamos agendar uma call".',
      }, aspect: 'wide' },
    ],
  },
];

/** Convenience lookup by slug (used by the dynamic route). */
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

/** Convenience lookup by portfolio projectKey. Used to wire the
 *  portfolio cards to their case study. */
export function getCaseStudyByProjectKey(key: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.projectKey === key);
}
