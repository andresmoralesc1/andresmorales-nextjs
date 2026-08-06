// POST /api/posts/[lang]/[slug]
//
// Action:
//   - update: replace the published post body + title/description/tags for
//             the requested locale. Preserves all other frontmatter fields
//             (coverImage, coverImageAlt, source, etc.) — same pattern as
//             /api/drafts/[lang]/[slug].
//
// Multi-locale edits: the editor posts one request per locale in parallel
// (EN, ES, PT). Each request touches only its own file.
//
// Auth: admin session cookie (`am_admin`).

import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { requireAdmin } from '@/lib/admin-auth';

const CONTENT_DIR = join(process.cwd(), 'content', 'blog');

type Lang = 'en' | 'es' | 'pt';

function authorized(req: Request): boolean {
  // Backwards-compat: kept for the GET endpoint below. POST/DELETE go
  // through requireAdmin() instead (cookie-based session).
  return false;
}

interface RouteParams {
  params: Promise<{ lang: string; slug: string }>;
}

async function resolveParams(p: RouteParams['params']): Promise<{ lang: Lang; slug: string } | NextResponse> {
  const { lang, slug } = await p;
  if (!['en', 'es', 'pt'].includes(lang)) {
    return NextResponse.json({ error: 'Invalid lang' }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  return { lang: lang as Lang, slug };
}

export async function POST(req: Request, { params }: RouteParams) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const resolved = await resolveParams(params);
  if (resolved instanceof NextResponse) return resolved;
  const { lang, slug } = resolved;

  let body: { body?: string; title?: string; description?: string; tags?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const postFile = join(CONTENT_DIR, `${slug}.${lang}.md`);
  if (!existsSync(postFile)) {
    return NextResponse.json({ error: `Published post ${slug}.${lang}.md not found` }, { status: 404 });
  }

  if (typeof body.body !== 'string' || body.body.length === 0) {
    return NextResponse.json({ error: 'Body required' }, { status: 400 });
  }

  const raw = readFileSync(postFile, 'utf-8');
  const fmMatch = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!fmMatch) {
    return NextResponse.json({ error: 'Post has no frontmatter' }, { status: 500 });
  }
  const [, fmBlock] = fmMatch;

  // Parse every key in the existing frontmatter into a map so we don't drop
  // any field (coverImage, coverImageAlt, source, sourceTitle, generatedBy,
  // draft, etc.). Same Map-based pattern as /api/drafts/[lang]/[slug].
  const lines = fmBlock.split('\n');
  const fields = new Map<string, string>();
  for (const line of lines) {
    const m = /^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/.exec(line);
    if (!m) continue;
    fields.set(m[1], m[2]);
  }

  if (typeof body.title === 'string' && body.title.length > 0) {
    fields.set('title', JSON.stringify(body.title));
  }
  if (typeof body.description === 'string' && body.description.length > 0) {
    fields.set('description', JSON.stringify(body.description));
  }
  if (Array.isArray(body.tags)) {
    const tagsJson = `[${body.tags.map((t) => JSON.stringify(t)).join(', ')}]`;
    fields.set('tags', tagsJson);
  }

  // Stable field order: keep original ordering, append any new keys.
  const seenKeys = new Set<string>();
  const orderedKeys: string[] = [];
  for (const line of lines) {
    const m = /^([a-zA-Z_][a-zA-Z0-9_]*):/.exec(line);
    const k = m?.[1];
    if (k && fields.has(k) && !seenKeys.has(k)) {
      seenKeys.add(k);
      orderedKeys.push(k);
    }
  }
  for (const k of Array.from(fields.keys())) {
    if (!seenKeys.has(k)) orderedKeys.push(k);
  }
  const newFmBlock = orderedKeys.map((k) => `${k}: ${fields.get(k)}`).join('\n');

  const next = `---\n${newFmBlock}\n---\n\n${body.body.trim()}\n`;
  writeFileSync(postFile, next, 'utf-8');

  return NextResponse.json({
    ok: true,
    action: 'update',
    message: `Post ${slug}.${lang}.md updated. Run \`npm run build\` to make it live.`,
    path: `content/blog/${slug}.${lang}.md`,
  });
}

// GET returns the current body + frontmatter for the editor to load.
// Same shape as the drafts preview endpoint so the client can share logic.
export async function GET(_req: Request, { params }: RouteParams) {
  const resolved = await resolveParams(params);
  if (resolved instanceof NextResponse) return resolved;
  const { lang, slug } = resolved;

  const postFile = join(CONTENT_DIR, `${slug}.${lang}.md`);
  if (!existsSync(postFile)) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const raw = readFileSync(postFile, 'utf-8');
  const fmMatch = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!fmMatch) {
    return NextResponse.json({ error: 'No frontmatter' }, { status: 500 });
  }
  const [, fmBlock, bodyMd] = fmMatch;
  const meta: Record<string, string> = {};
  for (const line of fmBlock.split('\n')) {
    const m = /^([a-zA-Z_]+):\s*(.*)$/.exec(line);
    if (m) meta[m[1]] = m[2];
  }

  return NextResponse.json({
    title: meta.title?.replace(/^["']|["']$/g, '') ?? '',
    description: meta.description?.replace(/^["']|["']$/g, '') ?? '',
    tags: (meta.tags ?? '[]')
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean),
    coverImage: meta.coverImage,
    bodyMarkdown: bodyMd.trim(),
  });
}