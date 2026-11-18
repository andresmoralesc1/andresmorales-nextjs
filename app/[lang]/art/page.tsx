import { LOCALES, isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd } from '@/lib/json-ld';
import PolaroidArtGallery from '@/components/ui/polaroid-art-gallery';
import { getGalleryData } from '@/lib/gallery-store';
import type { Metadata } from 'next';

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'es';
  const data = getGalleryData();

  const title = data.settings.title || 'Bocetos de Piel';
  const description =
    data.settings.description ||
    'Explora la colección de obras originales de Andrés Morales: series Yoga, Shibari, Anatomía Botánica, Maternidad y Figura Humana.';

  return pageMetadata({
    title: `${title} — Galería de Arte | Andrés Morales`,
    description,
    locale: safeLang,
    path: safeLang === 'en' ? '/art' : `/${safeLang}/art`,
    ogImage: 'https://andresmorales.com.co/art/bocetos-de-piel/boceto-056.jpg',
  });
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function ArtGalleryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'es';
  const data = getGalleryData();
  const title = data.settings.title || 'Bocetos de Piel';
  const description =
    data.settings.description ||
    'Colección artística y bocetos de piel creados por Andrés Morales en una experiencia interactiva.';

  const artGalleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ArtGallery',
    name: `${title} — Andrés Morales Art Gallery`,
    description,
    creator: {
      '@type': 'Person',
      name: data.settings.artist || 'Andrés Morales',
      url: 'https://andresmorales.com.co',
      sameAs: [
        data.settings.instagram || 'https://www.instagram.com/andres_morales_automation/',
        'https://amart.andresmorales.com.co',
      ],
    },
    url: 'https://amart.andresmorales.com.co',
    image: 'https://andresmorales.com.co/art/bocetos-de-piel/boceto-056.jpg',
  };

  return (
    <>
      <JsonLd data={artGalleryJsonLd} />
      <PolaroidArtGallery
        initialCards={data.artworks}
        initialSettings={data.settings}
        lang={safeLang}
      />
    </>
  );
}
