import { NextRequest, NextResponse } from 'next/server';
import {
  getAllArtNotes,
  getArtNotesByArtwork,
  getArtNotesCounts,
  createArtNote,
} from '@/lib/art-notes';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';

const RATE_LIMIT_MAX = 10; // max 10 notes per hour per IP
const RATE_LIMIT_ROUTE = 'art-notes';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const artworkId = searchParams.get('artworkId');

    const notes = getArtNotesByArtwork(artworkId || undefined);
    const { total, perArtwork } = getArtNotesCounts();

    return NextResponse.json({
      success: true,
      notes,
      total,
      counts: perArtwork,
    });
  } catch (err) {
    console.error('[api/art-notes GET] Error:', err);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar las notas.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const limit = checkRateLimit(RATE_LIMIT_ROUTE, ip, RATE_LIMIT_MAX);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Has enviado muchas notas. Intenta de nuevo en ${limit.retryInSec || 60} segundos.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Datos no válidos.' },
        { status: 400 }
      );
    }

    const name = String(body.name || '').trim();
    const note = String(body.note || '').trim();
    const artworkId = String(body.artworkId || 'general').trim();
    const artworkTitle = body.artworkTitle ? String(body.artworkTitle).trim() : undefined;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa tu nombre (mínimo 2 caracteres).' },
        { status: 400 }
      );
    }

    if (name.length > 60) {
      return NextResponse.json(
        { success: false, error: 'El nombre es muy largo (máximo 60 caracteres).' },
        { status: 400 }
      );
    }

    if (!note || note.length < 3) {
      return NextResponse.json(
        { success: false, error: 'La nota debe tener al menos 3 caracteres.' },
        { status: 400 }
      );
    }

    if (note.length > 600) {
      return NextResponse.json(
        { success: false, error: 'La nota no puede exceder 600 caracteres.' },
        { status: 400 }
      );
    }

    const created = await createArtNote({
      artworkId,
      artworkTitle,
      name,
      note,
    });

    bumpRateLimit(RATE_LIMIT_ROUTE, ip);

    return NextResponse.json({
      success: true,
      note: created,
    });
  } catch (err) {
    console.error('[api/art-notes POST] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno al guardar la nota.' },
      { status: 500 }
    );
  }
}
