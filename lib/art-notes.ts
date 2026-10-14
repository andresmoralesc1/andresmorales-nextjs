import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface ArtNote {
  id: string;
  artworkId: string; // e.g. "001", "042", or "general"
  artworkTitle?: string;
  name: string;
  note: string;
  createdAt: string; // ISO 8601
}

const DATA_DIR = join(process.cwd(), 'data');
const NOTES_FILE = join(DATA_DIR, 'art-notes.json');

// Initial curated visitor notes
const SEED_NOTES: ArtNote[] = [
  {
    id: 'note-seed-1',
    artworkId: '001',
    artworkTitle: 'Respiración de Alba',
    name: 'Valentina M.',
    note: 'La sutileza de las sombras y la delicadeza del trazo es conmovedora. Transmite una paz infinita.',
    createdAt: '2026-10-12T14:20:00Z',
  },
  {
    id: 'note-seed-2',
    artworkId: '042',
    artworkTitle: 'Loto en Suspensión',
    name: 'Lucas Gómez',
    note: 'Increíble cómo logras tanta tensión y belleza anatómica con una sola línea continua. Fascinante.',
    createdAt: '2026-10-13T09:45:00Z',
  },
  {
    id: 'note-seed-3',
    artworkId: '108',
    artworkTitle: 'Vértice de Sombra',
    name: 'Elena Silva',
    note: 'Una de mis piezas preferidas de toda la serie. El claroscuro le da una vida impresionante.',
    createdAt: '2026-10-13T18:10:00Z',
  },
  {
    id: 'note-seed-4',
    artworkId: 'general',
    artworkTitle: 'Bocetos de Piel',
    name: 'Andrés & Visitantes',
    note: 'Bienvenidos al taller. Gracias por detenerse a mirar y conectar con estas piezas de papel y tinta.',
    createdAt: '2026-10-11T12:00:00Z',
  },
];

function ensureFileExists(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(NOTES_FILE)) {
    writeFileSync(NOTES_FILE, JSON.stringify(SEED_NOTES, null, 2), 'utf-8');
  }
}

export function getAllArtNotes(): ArtNote[] {
  try {
    ensureFileExists();
    const raw = readFileSync(NOTES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return SEED_NOTES;
  } catch (err) {
    console.error('[art-notes] Error reading notes file:', err);
    return SEED_NOTES;
  }
}

export function getArtNotesByArtwork(artworkId?: string): ArtNote[] {
  const all = getAllArtNotes();
  if (!artworkId || artworkId === 'all') return all;
  return all.filter((n) => n.artworkId === artworkId);
}

export function getArtNotesCounts(): { total: number; perArtwork: Record<string, number> } {
  const all = getAllArtNotes();
  const perArtwork: Record<string, number> = {};
  all.forEach((n) => {
    if (n.artworkId) {
      perArtwork[n.artworkId] = (perArtwork[n.artworkId] || 0) + 1;
    }
  });
  return { total: all.length, perArtwork };
}

export async function createArtNote(data: {
  artworkId: string;
  artworkTitle?: string;
  name: string;
  note: string;
}): Promise<ArtNote> {
  ensureFileExists();
  const all = getAllArtNotes();

  const newNote: ArtNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    artworkId: data.artworkId || 'general',
    artworkTitle: data.artworkTitle || '',
    name: data.name.trim().slice(0, 60),
    note: data.note.trim().slice(0, 600),
    createdAt: new Date().toISOString(),
  };

  all.unshift(newNote);

  try {
    writeFileSync(NOTES_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('[art-notes] Failed to write notes to disk:', err);
    throw err;
  }

  // Fire-and-forget Telegram notification to Andrés
  notifyTelegramNewNote(newNote).catch((e) =>
    console.warn('[art-notes] Telegram notify error:', e)
  );

  return newNote;
}

async function notifyTelegramNewNote(note: ArtNote): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const artworkInfo =
    note.artworkId !== 'general'
      ? `🖼️ *Obra:* #${note.artworkId} ${note.artworkTitle ? `(${note.artworkTitle})` : ''}\n`
      : '🖼️ *Galería General*\n';

  const text =
    `🎨 *Nueva Nota en Bocetos de Piel*\n\n` +
    artworkInfo +
    `👤 *De:* ${note.name}\n` +
    `💬 *Mensaje:*\n"${note.note}"\n\n` +
    `🔗 https://amart.andresmorales.com.co`;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.warn('[art-notes] Telegram fetch failed:', err);
  }
}
