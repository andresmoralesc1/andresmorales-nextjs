import { NextResponse } from 'next/server';
import { requireAmArtAdmin } from '@/lib/amart-auth';
import { upsertArtwork, deleteArtwork, getGalleryData } from '@/lib/gallery-store';
import type { ArtworkCard, CollectionKey } from '@/lib/artworks-data';

export async function POST(req: Request) {
  const authErr = requireAmArtAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { id, title, description, technique, collection, collectionLabel, alt, imageUrl, downloadUrl } = body;
  if (!id || !title) {
    return NextResponse.json({ error: 'id y title son requeridos' }, { status: 400 });
  }

  const data = getGalleryData();
  const existing = data.artworks.find((a) => a.id === String(id));

  const artwork: ArtworkCard = {
    id: String(id),
    title: String(title).trim(),
    description: description ? String(description).trim() : existing?.description || '',
    technique: technique ? String(technique).trim() : existing?.technique || 'Tinta y carboncillo sobre papel',
    collection: (collection as CollectionKey) || existing?.collection || 'figura-humana',
    collectionLabel: collectionLabel || data.collections[collection]?.shortName || existing?.collectionLabel || 'Figura Humana',
    alt: alt ? String(alt).trim() : `${title} — Andrés Morales`,
    imageUrl: imageUrl || existing?.imageUrl || `/art/bocetos-de-piel/boceto-${String(id).padStart(3, '0')}.webp`,
    downloadUrl: downloadUrl || existing?.downloadUrl || `/art/bocetos-de-piel/full/boceto-${String(id).padStart(3, '0')}.webp`,
    width: existing?.width || 600,
    height: existing?.height || 800,
  };

  const saved = upsertArtwork(artwork);
  return NextResponse.json({ ok: true, artwork: saved });
}

export async function DELETE(req: Request) {
  const authErr = requireAmArtAdmin(req);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Parámetro id requerido' }, { status: 400 });
  }

  const success = deleteArtwork(id);
  if (!success) {
    return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deletedId: id });
}
