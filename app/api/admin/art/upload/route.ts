import { NextResponse } from 'next/server';
import { requireAmArtAdmin } from '@/lib/amart-auth';
import { getGalleryData, upsertArtwork } from '@/lib/gallery-store';
import type { ArtworkCard, CollectionKey } from '@/lib/artworks-data';
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

export async function POST(req: Request) {
  const authErr = requireAmArtAdmin(req);
  if (authErr) return authErr;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return NextResponse.json({ error: 'Form data inválido' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
  }

  const title = (formData.get('title') as string) || '';
  const description = (formData.get('description') as string) || '';
  const technique = (formData.get('technique') as string) || 'Tinta y carboncillo sobre papel';
  const collection = ((formData.get('collection') as string) || 'figura-humana') as CollectionKey;

  const data = getGalleryData();

  // Find highest numeric ID
  let maxId = 0;
  for (const art of data.artworks) {
    const n = parseInt(art.id, 10);
    if (!isNaN(n) && n > maxId) {
      maxId = n;
    }
  }
  const nextId = maxId + 1;
  const paddedId = String(nextId).padStart(3, '0');
  const finalTitle = title.trim() || `Boceto de Piel #${paddedId}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const thumbDir = path.join(process.cwd(), 'public', 'art', 'bocetos-de-piel');
  const fullDir = path.join(thumbDir, 'full');

  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
  if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });

  const thumbWebpName = `boceto-${paddedId}.webp`;
  const thumbJpgName = `boceto-${paddedId}.jpg`;
  const fullWebpName = `boceto-${paddedId}.webp`;
  const fullJpgName = `boceto-${paddedId}.jpg`;

  const thumbWebpPath = path.join(thumbDir, thumbWebpName);
  const thumbJpgPath = path.join(thumbDir, thumbJpgName);
  const fullWebpPath = path.join(fullDir, fullWebpName);
  const fullJpgPath = path.join(fullDir, fullJpgName);

  // Read metadata
  const meta = await sharp(buffer).metadata();
  const origWidth = meta.width || 600;
  const origHeight = meta.height || 800;

  // Generate Full (max 1920)
  await sharp(buffer)
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(fullWebpPath);

  await sharp(buffer)
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(fullJpgPath);

  // Generate Thumbnail (max 600 width, aspect ratio preserved)
  await sharp(buffer)
    .resize(600, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(thumbWebpPath);

  await sharp(buffer)
    .resize(600, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(thumbJpgPath);

  const collectionLabel =
    data.collections[collection]?.shortName || data.collections[collection]?.name || 'Figura Humana';

  const newArtwork: ArtworkCard = {
    id: String(nextId),
    title: finalTitle,
    description: description.trim(),
    technique: technique.trim(),
    alt: `${finalTitle} — Obra original de Andrés Morales`,
    imageUrl: `/art/bocetos-de-piel/${thumbWebpName}`,
    downloadUrl: `/art/bocetos-de-piel/full/${fullWebpName}`,
    collection,
    collectionLabel,
    filename: file.name,
    width: origWidth,
    height: origHeight,
  };

  upsertArtwork(newArtwork);

  return NextResponse.json({
    ok: true,
    artwork: newArtwork,
    message: `Obra #${nextId} "${finalTitle}" subida y optimizada exitosamente.`,
  });
}
