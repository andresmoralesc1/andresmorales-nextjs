import { getCurrentDictionary, getCurrentLocale } from '@/lib/dictionary';
import { LOCALES, isLocale, getDictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd } from '@/lib/json-ld';
import { SneakerHeroShowcase } from '@/components/proposals/SneakerHeroShowcase';
import { SneakerProposalSections } from '@/components/proposals/SneakerProposalSections';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'en';
  const dict = await getDictionary(safeLang);
  const t = dict.sneakerProposal;

  return pageMetadata({
    title: t.metaTitle,
    description: t.metaDescription,
    locale: safeLang,
    path: safeLang === 'en' ? '/sneakers' : `/${safeLang}/sneakers`,
    ogImage: '/sneakers/sneaker-hero-orange.jpg',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function SneakerProposalPage({
  params,
}: {
  params?: Promise<{ lang: string }>;
} = {}) {
  const resolvedParams = params ? await params : null;
  const urlLang = resolvedParams?.lang;
  const currentLocale = await getCurrentLocale();
  const lang = urlLang && isLocale(urlLang) ? urlLang : currentLocale;
  const dict = await getDictionary(lang);
  const t = dict.sneakerProposal;

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

      <div className="min-h-screen bg-background text-secondary transition-colors">
        {/* HERO E-COMMERCE DE TENIS EN PRODUCCIÓN (FULL WIDTH EDGE-TO-EDGE) */}
        <SneakerHeroShowcase t={t.heroShowcase} lang={lang} />

        {/* TRANSICIÓN DIRECTA A LA PROPUESTA COMERCIAL */}
        <div className="container-page pt-16 sm:pt-20 pb-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-secondary font-bold tracking-widest uppercase bg-theme-1 text-secondary shadow-xs mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              {lang === 'es'
                ? 'PROPUESTA COMERCIAL // TU E-COMMERCE EN PRODUCCIÓN'
                : lang === 'pt'
                  ? 'PROPOSTA COMERCIAL // SUA LOJA EM PRODUÇÃO'
                  : 'COMMERCIAL PROPOSAL // YOUR STORE IN PRODUCTION'}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-secondary tracking-tight mb-4">
              {lang === 'es'
                ? '¿Listo para que tu marca de tenis venda con esta tecnología?'
                : lang === 'pt'
                  ? 'Pronto para sua marca de tênis vender com esta tecnologia?'
                  : 'Ready to scale your sneaker brand with this technology?'}
            </h2>
            <p className="text-base sm:text-lg text-secondary/80 leading-relaxed font-normal">
              {lang === 'es'
                ? 'Acabas de interactuar con la experiencia real que tendrán tus compradores: microinteracciones 3D fluidas, carga móvil en <0.8s y alta conversión. A continuación tienes el desglose de inversión: el desarrollo web base en Next.js y los planes mensuales opcionales de pauta publicitaria e inteligencia artificial.'
                : lang === 'pt'
                  ? 'Você acabou de interagir com a experiência real que seus clientes terão: microinterações 3D fluidas, carregamento móvel em <0.8s e alta conversão. A seguir veja a proposta de investimento: desenvolvimento em Next.js e planos opcionais de tráfego e inteligência artificial.'
                  : 'You just interacted with the real experience your shoppers will have: fluid 3D microinteractions, sub-0.8s mobile loading, and high-converting checkouts. Below is the full investment breakdown: base Next.js web development and optional monthly growth plans for ad campaigns and generative AI content.'}
            </p>
          </div>

          <SneakerProposalSections
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
