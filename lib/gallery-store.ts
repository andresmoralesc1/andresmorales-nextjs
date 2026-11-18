// Server-side helper to read and persist gallery data (settings & artworks)
// Used by Server Components (app/[lang]/art/page.tsx) and Admin API routes.

import fs from 'node:fs';
import path from 'node:path';
import type { ArtworkCard, CollectionKey, CollectionMeta } from './artworks-data';

export interface GallerySettings {
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  artist: string;
  instagram: string;
  updatedAt?: string;
}

export interface GalleryData {
  settings: GallerySettings;
  collections: Record<string, CollectionMeta>;
  artworks: ArtworkCard[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'art-gallery.json');

export function getGalleryData(): GalleryData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.settings && Array.isArray(data.artworks)) {
        return data;
      }
    }
  } catch (err) {
    console.error('[gallery-store] Error reading art-gallery.json:', err);
  }

  // Fallback defaults
  return {
    settings: {
      title: 'Bocetos de Piel',
      subtitle: 'Andrés Morales • Taller de Arte',
      tagline: 'Colección de Arte & Bocetos Originales',
      description:
        'Explora la colección de obras originales de Andrés Morales: series Yoga, Shibari, Anatomía Botánica, Maternidad y Figura Humana.',
      artist: 'Andrés Morales',
      instagram: 'https://www.instagram.com/andres_morales_automation/',
    },
    collections: {},
    artworks: [],
  };
}

export function saveGalleryData(data: GalleryData): void {
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DATA_FILE);
}

export function updateGallerySettings(settings: Partial<GallerySettings>): GallerySettings {
  const current = getGalleryData();
  current.settings = {
    ...current.settings,
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  saveGalleryData(current);
  return current.settings;
}

export function upsertArtwork(artwork: ArtworkCard): ArtworkCard {
  const current = getGalleryData();
  const index = current.artworks.findIndex((a) => a.id === artwork.id);

  if (index >= 0) {
    current.artworks[index] = { ...current.artworks[index], ...artwork };
  } else {
    // New artwork goes to the beginning
    current.artworks.unshift(artwork);
  }

  current.settings.updatedAt = new Date().toISOString();
  saveGalleryData(current);
  return artwork;
}

export function deleteArtwork(id: string): boolean {
  const current = getGalleryData();
  const initialLen = current.artworks.length;
  current.artworks = current.artworks.filter((a) => a.id !== id);

  if (current.artworks.length !== initialLen) {
    current.settings.updatedAt = new Date().toISOString();
    saveGalleryData(current);
    return true;
  }
  return false;
}
