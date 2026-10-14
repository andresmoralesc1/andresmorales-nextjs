import { LOCALES, isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd } from '@/lib/json-ld';
import PolaroidArtGallery from '@/components/ui/polaroid-art-gallery';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'es';

  const titles: Record<string, string> = {
    es: 'Bocetos de Piel — Galería de Arte | Andrés Morales',
    en: 'Skin Sketches (Bocetos de Piel) — Art Gallery | Andrés Morales',
    pt: 'Esboços de Pele (Bocetos de Piel) — Galeria de Arte | Andrés Morales',
  };

  const descriptions: Record<string, string> = {
    es: 'Explora la colección de 149 obras originales de Andrés Morales: series Yoga, Shibari, Anatomía Botánica, Maternidad y Figura Humana.',
    en: 'Explore the collection of 149 original artworks by Andrés Morales: Yoga, Shibari, Botanical Anatomy, Maternity, and Human Figure series.',
    pt: 'Explore a coleção de 149 obras de arte originais de Andrés Morales: séries Yoga, Shibari, Anatomia Botânica, Maternidade e Figura Humana.',
  };

  return pageMetadata({
    title: titles[safeLang] || titles.es,
    description: descriptions[safeLang] || descriptions.es,
    locale: safeLang,
    path: safeLang === 'en' ? '/art' : `/${safeLang}/art`,
    ogImage: '/art/bocetos-de-piel/boceto-001.jpg',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default function ArtGalleryPage() {
  const artGalleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ArtGallery',
    name: 'Bocetos de Piel — Andrés Morales Art Gallery',
    description:
      'Colección artística y bocetos de piel creados por Andrés Morales en una experiencia interactiva.',
    creator: {
      '@type': 'Person',
      name: 'Andrés Morales',
      url: 'https://andresmorales.com.co',
      sameAs: [
        'https://www.instagram.com/andres_morales_automation/',
        'https://amart.andresmorales.com.co',
      ],
    },
    url: 'https://amart.andresmorales.com.co',
    image: 'https://andresmorales.com.co/art/bocetos-de-piel/boceto-001.jpg',
  };

  return (
    <>
      <JsonLd data={artGalleryJsonLd} />
      <PolaroidArtGallery />
    </>
  );
}
