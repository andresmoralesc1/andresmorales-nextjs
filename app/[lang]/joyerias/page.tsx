import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd } from '@/lib/json-ld';
import { JewelryHeroShowcase } from '@/components/proposals/JewelryHeroShowcase';
import { JewelryProposalSections } from '@/components/proposals/JewelryProposalSections';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  const t = dict.jewelryProposal;

  return pageMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/joyerias' : `/${safeLang}/joyerias`,
    ogImage: '/jewelry/diamond-solitaire-ring.png',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function JewelryProposalPage({
  params,
}: {
  params?: Promise<{ lang: string }>;
} = {}) {
  const resolvedParams = params ? await params : null;
  const urlLang = resolvedParams?.lang;
  const currentLocale = await getCurrentLocale();
  const lang = urlLang && isLocale(urlLang) ? urlLang : currentLocale;
  const dict = await getDictionary(lang);
  const t = dict.jewelryProposal;

  const proposalJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t.clientTitle,
    description: t.clientSubtitle,
    provider: {
      '@type': 'Person',
      name: 'Andrés Morales',
      jobTitle: 'Senior Web Architect & Fullstack Engineer',
      url: 'https://andresmorales.com.co',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'COP',
      lowPrice: '119998',
      highPrice: '500000',
      offerCount: '4',
    },
  };

  return (
    <>
      <JsonLd data={proposalJsonLd} />

      <div className="min-h-screen bg-[#0a0908] text-[#FAF7F2] transition-colors selection:bg-amber-400 selection:text-stone-950 relative overflow-hidden">
        {/* Dynamic Luxury Ambient Background Glows */}
        <div className="absolute top-[600px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[1400px] right-1/4 translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-[2600px] left-1/3 w-[800px] h-[800px] bg-amber-400/8 rounded-full blur-[180px] pointer-events-none" />

        {/* HERO E-COMMERCE DE ALTA JOYERÍA EN PRODUCCIÓN (FULL WIDTH EDGE-TO-EDGE) */}
        <JewelryHeroShowcase t={t.heroShowcase} lang={lang} />

        {/* TRANSICIÓN DIRECTA A LA PROPUESTA COMERCIAL */}
        <div className="container-page pt-16 sm:pt-20 pb-28 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-xs mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {lang === 'es'
                ? 'PROPUESTA COMERCIAL // TU BOUTIQUE DE JOYERÍA EN PRODUCCIÓN'
                : lang === 'pt'
                  ? 'PROPOSTA COMERCIAL // SUA JOALHERIA EM PRODUÇÃO'
                  : 'COMMERCIAL PROPOSAL // YOUR JEWELRY BOUTIQUE IN PRODUCTION'}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-[#FAF7F2] tracking-tight mb-4">
              {lang === 'es'
                ? '¿Listo para que tu marca de joyería venda con esta tecnología?'
                : lang === 'pt'
                  ? 'Pronto para sua joalheria vender com esta tecnologia de luxo?'
                  : 'Ready to elevate your fine jewelry brand with this technology?'}
            </h2>
            <p className="text-base sm:text-lg text-[#E2DDD5]/80 leading-relaxed font-normal">
              {lang === 'es'
                ? 'Acabas de interactuar con la experiencia real que tendrán tus compradores: brillo y destello de gemas en macro 4K, medidor digital de tallas de anillo, carga móvil en <0.8s y checkout de alta seguridad. A continuación tienes el desglose de inversión: el desarrollo web base en Next.js y los planes mensuales opcionales de pauta publicitaria e inteligencia artificial.'
                : lang === 'pt'
                  ? 'Você acabou de interagir com a experiência real que seus clientes terão: brilho e refração de gemas em macro 4K, medidor de aros, carregamento móvel em <0.8s e checkout seguro. A seguir veja a proposta de investimento: desenvolvimento em Next.js e planos opcionais de tráfego e inteligência artificial.'
                  : 'You just interacted with the real experience your shoppers will have: 4K macro gem brilliance, dynamic ring sizing engine, sub-0.8s mobile loading, and secured insured checkouts. Below is the full investment breakdown: base Next.js web development and optional monthly growth plans for ad campaigns and luxury generative AI content.'}
            </p>
          </div>

          <JewelryProposalSections
            baseOffer={t.baseOffer}
            diagnostic={t.diagnostic}
            features={t.features}
            roadmap={t.roadmap}
            pricing={t.pricing}
            guarantees={t.guarantees}
            cta={t.cta}
            lang={lang}
          />
        </div>
      </div>
    </>
  );
}
