import { NextRequest, NextResponse } from 'next/server';
import {
  getAllReactions,
  getReactionsForArtwork,
  addReaction,
  type ReactionType,
} from '@/lib/art-reactions';
import { checkRateLimit, bumpRateLimit, clientIp } from '@/lib/rate-limit';

const VALID_REACTIONS: ReactionType[] = ['heart', 'sparkles', 'leaf', 'fire'];
const RATE_LIMIT_ROUTE = 'art-reactions';
const RATE_LIMIT_MAX = 50; // max 50 reactions / hour / IP

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const artworkId = searchParams.get('artworkId');

    if (artworkId) {
      const reactions = getReactionsForArtwork(artworkId);
      return NextResponse.json({ success: true, reactions });
    }

    const all = getAllReactions();
    return NextResponse.json({ success: true, reactions: all });
  } catch (err) {
    console.error('[api/art-reactions GET] Error:', err);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar las reacciones.' },
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
        { success: false, error: 'Límite de reacciones alcanzado por ahora.' },
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

    const artworkId = String(body.artworkId || '').trim();
    const reaction = String(body.reaction || '').trim() as ReactionType;

    if (!artworkId) {
      return NextResponse.json(
        { success: false, error: 'artworkId requerido.' },
        { status: 400 }
      );
    }

    if (!VALID_REACTIONS.includes(reaction)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de reacción no válido.' },
        { status: 400 }
      );
    }

    const updated = await addReaction(artworkId, reaction);
    bumpRateLimit(RATE_LIMIT_ROUTE, ip);

    return NextResponse.json({
      success: true,
      artworkId,
      reactions: updated,
    });
  } catch (err) {
    console.error('[api/art-reactions POST] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Error al registrar reacción.' },
      { status: 500 }
    );
  }
}
