import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export type ReactionType = 'heart' | 'sparkles' | 'leaf' | 'fire';

export type ArtworkReactions = {
  heart: number;
  sparkles: number;
  leaf: number;
  fire: number;
};

export type ReactionsMap = Record<string, ArtworkReactions>;

const DATA_DIR = join(process.cwd(), 'data');
const REACTIONS_FILE = join(DATA_DIR, 'art-reactions.json');

// Initial charming reaction seeds for drawings
const DEFAULT_REACTIONS: ArtworkReactions = {
  heart: 0,
  sparkles: 0,
  leaf: 0,
  fire: 0,
};

function generateSeedReactions(): ReactionsMap {
  const map: ReactionsMap = {};
  // Give popular drawings some warm initial engagement
  const highlights: Record<string, ArtworkReactions> = {
    '001': { heart: 18, sparkles: 12, leaf: 7, fire: 5 },
    '015': { heart: 24, sparkles: 15, leaf: 9, fire: 14 },
    '042': { heart: 32, sparkles: 21, leaf: 16, fire: 8 },
    '056': { heart: 45, sparkles: 28, leaf: 19, fire: 11 },
    '108': { heart: 27, sparkles: 19, leaf: 11, fire: 16 },
    '149': { heart: 35, sparkles: 22, leaf: 14, fire: 12 },
  };

  for (let i = 1; i <= 149; i++) {
    const id = i < 10 ? `00${i}` : i < 100 ? `0${i}` : `${i}`;
    const shortId = String(i);
    const existing = highlights[id];
    if (existing) {
      map[id] = existing;
      map[shortId] = existing;
    } else {
      // Deterministic slight variations so every piece has 1-6 reactions
      const seedVal = (i * 37) % 7;
      const r = {
        heart: (seedVal % 4) + 1,
        sparkles: (seedVal % 3) + 1,
        leaf: seedVal % 2,
        fire: seedVal % 3,
      };
      map[id] = r;
      map[shortId] = r;
    }
  }
  return map;
}

function ensureReactionsFile(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(REACTIONS_FILE)) {
    const initial = generateSeedReactions();
    writeFileSync(REACTIONS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

export function getAllReactions(): ReactionsMap {
  try {
    ensureReactionsFile();
    const raw = readFileSync(REACTIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : generateSeedReactions();
  } catch (err) {
    console.error('[art-reactions] Error reading reactions:', err);
    return generateSeedReactions();
  }
}

export function getReactionsForArtwork(artworkId: string): ArtworkReactions {
  const all = getAllReactions();
  return all[artworkId] || { ...DEFAULT_REACTIONS };
}

export async function addReaction(
  artworkId: string,
  reaction: ReactionType
): Promise<ArtworkReactions> {
  ensureReactionsFile();
  const all = getAllReactions();

  const current = all[artworkId] || { ...DEFAULT_REACTIONS };
  current[reaction] = (current[reaction] || 0) + 1;
  all[artworkId] = current;

  // Also keep both padded and unpadded versions in sync if numeric
  const num = parseInt(artworkId, 10);
  if (!isNaN(num)) {
    const altPadded = num < 10 ? `00${num}` : num < 100 ? `0${num}` : `${num}`;
    const altShort = String(num);
    all[altPadded] = current;
    all[altShort] = current;
  }

  try {
    writeFileSync(REACTIONS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('[art-reactions] Error writing reactions:', err);
  }

  return current;
}
