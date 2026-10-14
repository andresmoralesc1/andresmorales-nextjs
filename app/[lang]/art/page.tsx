import { LOCALES, isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/metadata';
import { JsonLd } from '@/lib/json-ld';
import StellarCardGallerySingle from '@/components/ui/3d-image-gallery';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const safeLang = isLocale(lang) ? lang : 'es';

  const titles: Record<string, string> = {
    es: 'Bocetos de Piel — Galería 3D Estelar | Andrés Morales',
    en: 'Skin Sketches (Bocetos de Piel) — 3D Stellar Art Gallery | Andrés Morales',
    pt: 'Esboços de Pele (Bocetos de Piel) — Galeria 3D Estelar | Andrés Morales',
  };

  const descriptions: Record<string, string> = {
    es: 'Explora la colección original de obras y bocetos de piel de Andrés Morales en una galaxia tridimensional inmersiva con Three.js.',
    en: 'Explore the original skin sketches and artwork collection by Andrés Morales in an immersive 3D Three.js galaxy.',
    pt: 'Explore a coleção original de esboços de pele e obras de arte de Andrés Morales em uma galáxia tridimensional imersiva com Three.js.',
  };

  return pageMetadata({
    title: titles[safeLang] || titles.es,
    description: descriptions[safeLang] || descriptions.es,
    locale: safeLang,
    path: safeLang === 'en' ? '/art' : `/${safeLang}/art`,
    ogImage: '/art/bocetos-de-piel/boceto-01.jpg',
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
      'Colección artística y bocetos de piel creados por Andrés Morales en una experiencia interactiva 3D.',
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
    image: 'https://andresmorales.com.co/art/bocetos-de-piel/boceto-01.jpg',
  };

  return (
    <>
      <JsonLd data={artGalleryJsonLd} />
      <StellarCardGallerySingle />
    </>
  );
}
