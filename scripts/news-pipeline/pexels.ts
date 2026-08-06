// pexels.ts — Downloads a landscape photo from Pexels for a given query.
// Returns the relative path (under /public), the photographer credit, and
// a short alt text derived from the photo's description.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PEXELS_API = 'https://api.pexels.com/v1/search';

interface PexelsPhoto {
  id: number;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: {
    landscape: string;
    large2x: string;
    original: string;
  };
}

interface PexelsSearchResponse {
  photos?: PexelsPhoto[];
}

export interface CoverResult {
  path: string; // e.g. "/uploads/blog/2026/07/opinion-xyz.es.jpg"
  credit: string; // "Photo by John Doe on Pexels"
  alt: string; // "Abstract data visualization"
}

export async function fetchCoverForQuery(
  query: string,
  slug: string,
  lang: 'es' | 'en' | 'pt',
): Promise<CoverResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('[pexels] PEXELS_API_KEY not set. Skipping cover image.');
    return null;
  }

  // Translate query if needed. Pexels works best with English queries.
  const enQuery = query.trim().slice(0, 100);

  const url = `${PEXELS_API}?query=${encodeURIComponent(enQuery)}&per_page=5&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) {
    console.warn(`[pexels] API returned ${res.status}. Skipping cover.`);
    return null;
  }

  const data = (await res.json()) as PexelsSearchResponse;
  const photo = data.photos?.[0];
  if (!photo) {
    console.warn(`[pexels] No results for query "${enQuery}". Skipping cover.`);
    return null;
  }

  // Download the landscape variant (~1920w, ~100KB-300KB).
  const imgRes = await fetch(photo.src.landscape);
  if (!imgRes.ok) {
    console.warn(`[pexels] Image download failed: ${imgRes.status}.`);
    return null;
  }
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const relDir = join('uploads', 'blog', year, month);
  const absDir = join(process.cwd(), 'public', relDir);
  mkdirSync(absDir, { recursive: true });

  const fileName = `${slug}.${lang}.jpg`;
  const absPath = join(absDir, fileName);
  writeFileSync(absPath, buffer);

  const publicPath = `/${relDir.replace(/\\/g, '/')}/${fileName}`;
  return {
    path: publicPath,
    credit: `Photo by ${photo.photographer} on Pexels`,
    alt: photo.alt?.trim() || enQuery,
  };
}