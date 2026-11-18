import { requireServerAmArtAdmin } from '@/lib/amart-auth-server';
import { getGalleryData } from '@/lib/gallery-store';
import ArtAdminClient from '@/app/[lang]/admin/art/art-admin-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel Curador | Bocetos de Piel — AmArt',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AmArtAdminPage() {
  const session = await requireServerAmArtAdmin('/admin');
  const data = getGalleryData();

  return (
    <ArtAdminClient
      initialSettings={data.settings}
      initialCollections={data.collections}
      initialArtworks={data.artworks}
      username={session.username}
      locale="es"
      isAmArtStandalone={true}
    />
  );
}
