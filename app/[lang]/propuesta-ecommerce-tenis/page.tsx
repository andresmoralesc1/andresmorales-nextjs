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
    path: safeLang === 'en' ? '/propuesta-ecommerce-tenis' : `/${safeLang}/propuesta-ecommerce-tenis`,
    ogImage: '/sneakers/sneaker-hero-orange.jpg',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function SneakerProposalPage() {
  const [dict, lang] = await Promise.all([
    getCurrentDictionary(),
    getCurrentLocale(),
  ]);
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
              PROPUESTA COMERCIAL // TU E-COMMERCE EN PRODUCCIÓN
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-secondary tracking-tight mb-4">
              ¿Listo para que tu marca de tenis venda con esta tecnología?
            </h2>
            <p className="text-base sm:text-lg text-secondary/80 leading-relaxed font-normal">
              Acabas de interactuar con la experiencia real que tendrán tus compradores: microinteracciones 3D fluidas, carga móvil en &lt;0.8s y alta conversión. A continuación tienes el desglose de inversión: el desarrollo web base en Next.js y los planes mensuales opcionales de pauta publicitaria e inteligencia artificial.
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
