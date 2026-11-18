import { NextResponse } from 'next/server';
import { requireAmArtAdmin } from '@/lib/amart-auth';
import { getGalleryData, updateGallerySettings } from '@/lib/gallery-store';

export async function GET(req: Request) {
  const authErr = requireAmArtAdmin(req);
  if (authErr) return authErr;

  const data = getGalleryData();
  return NextResponse.json({
    ok: true,
    settings: data.settings,
    collections: data.collections,
    artworksCount: data.artworks.length,
    artworks: data.artworks,
  });
}

export async function PUT(req: Request) {
  const authErr = requireAmArtAdmin(req);
  if (authErr) return authErr;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { title, subtitle, tagline, description, artist, instagram } = body;
  const updated = updateGallerySettings({
    ...(typeof title === 'string' && { title }),
    ...(typeof subtitle === 'string' && { subtitle }),
    ...(typeof tagline === 'string' && { tagline }),
    ...(typeof description === 'string' && { description }),
    ...(typeof artist === 'string' && { artist }),
    ...(typeof instagram === 'string' && { instagram }),
  });

  return NextResponse.json({ ok: true, settings: updated });
}
