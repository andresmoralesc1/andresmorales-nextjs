// POST /api/drafts/[lang]/[slug]
//
// Actions:
//   - approve: move content/blog/drafts/<slug>.<lang>.md → content/blog/<slug>.<lang>.md,
//              strip the `draft: true` line.
//   - discard: delete the draft .md and its cover image.
//   - update : replace the draft body with text posted in the request.
//
// Auth: admin session cookie (`am_admin`). Returns 401 if missing/invalid.

import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { requireAdmin } from '@/lib/admin-auth';

const CONTENT_DIR = join(process.cwd(), 'content', 'blog');
const DRAFTS_DIR = join(CONTENT_DIR, 'drafts');
const PUBLIC_DIR = join(process.cwd(), 'public');

type Lang = 'en' | 'es' | 'pt';

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

function readDraft(lang: Lang, slug: string): string | null {
  const file = join(DRAFTS_DIR, `${slug}.${lang}.md`);
  if (!existsSync(file)) return null;
  return readFileSync(file, 'utf-8');
}

function stripDraftFlag(raw: string): string {
  return raw.replace(/^draft:\s*true\s*\n/m, '');
}

function extractCoverPath(raw: string): string | null {
  const m = /^coverImage:\s*(.+)\s*$/m.exec(raw);
  return m ? m[1].trim() : null;
}

// Move the cover image (and credit string) from /uploads/blog/drafts/... to
// /uploads/blog/... when the draft is approved. We DO NOT move it on discard
// because it's getting deleted.
function promoteCover(coverRelPath: string): void {
  if (!coverRelPath.startsWith('/')) return;
  const abs = join(PUBLIC_DIR, coverRelPath);
  if (!existsSync(abs)) return;
  // We leave it where it is — Pexels images are immutable and Next caches
  // by hash, so moving it would invalidate the existing <Image> cache for
  // nothing. The cover is reachable either way.
}

export async function POST(req: Request, { params }: RouteParams) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const resolved = await resolveParams(params);
  if (resolved instanceof NextResponse) return resolved;
  const { lang, slug } = resolved;

  let body: { action?: string; body?: string; title?: string; description?: string; tags?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const draftFile = join(DRAFTS_DIR, `${slug}.${lang}.md`);
  if (!existsSync(draftFile)) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  switch (body.action) {
    case 'approve': {
      const raw = readFileSync(draftFile, 'utf-8');
      const promoted = stripDraftFlag(raw);
      const target = join(CONTENT_DIR, `${slug}.${lang}.md`);
      writeFileSync(target, promoted, 'utf-8');
      unlinkSync(draftFile);

      const coverRel = extractCoverPath(raw);
      if (coverRel) promoteCover(coverRel);

      // Note: the published post won't appear until the next `npm run build`.
      // We don't trigger a build from inside a request — that's slow and
      // would tie up the response. Instead, return success and let the user
      // (or the next deploy) pick it up.
      return NextResponse.json({
        ok: true,
        action: 'approve',
        message: `Draft ${slug}.${lang}.md published to ${slug}.${lang}.md. Run \`npm run build\` to make it live.`,
        publishedPath: `content/blog/${slug}.${lang}.md`,
      });
    }

    case 'discard': {
      const raw = readFileSync(draftFile, 'utf-8');
      const coverRel = extractCoverPath(raw);
      unlinkSync(draftFile);
      if (coverRel) {
        const abs = join(PUBLIC_DIR, coverRel);
        if (existsSync(abs)) {
          try {
            unlinkSync(abs);
          } catch {
            // best-effort; cover cleanup is not critical
          }
        }
      }
      return NextResponse.json({
        ok: true,
        action: 'discard',
        message: `Draft ${slug}.${lang}.md deleted.`,
      });
    }

    case 'update': {
      if (typeof body.body !== 'string' || body.body.length === 0) {
        return NextResponse.json({ error: 'Body required' }, { status: 400 });
      }
      const raw = readFileSync(draftFile, 'utf-8');
      const fmMatch = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
      if (!fmMatch) {
        return NextResponse.json({ error: 'Draft has no frontmatter' }, { status: 500 });
      }
      const [, fmBlock, _oldBody] = fmMatch;

      // Parse every key in the existing frontmatter into a map, preserving
      // the exact field set (coverImage, coverImageCredit, coverImageAlt,
      // slug, source, sourceTitle, generatedBy, draft, etc.) — the previous
      // implementation used targeted regex replaces that silently DROPPED
      // any field it didn't recognize, corrupting the draft on every save.
      const lines = fmBlock.split('\n');
      const fields = new Map<string, string>();
      for (const line of lines) {
        const m = /^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/.exec(line);
        if (!m) continue;
        fields.set(m[1], m[2]);
      }

      // Apply user-provided updates ONLY when the value is present and
      // non-empty. Empty strings / undefined are treated as "don't touch".
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

      // Stable field order so re-saves produce diffable output. We keep the
      // original order of the existing frontmatter, then append any new keys.
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
      writeFileSync(draftFile, next, 'utf-8');
      return NextResponse.json({ ok: true, action: 'update' });
    }

    default:
      return NextResponse.json(
        { error: 'Unknown action. Use "approve", "discard", or "update".' },
        { status: 400 },
      );
  }
}

// Reject GET — the GET endpoint is at /api/drafts/[lang]/[slug]/preview.json
// via a separate route. This keeps the file structure flat.
export async function GET() {
  return NextResponse.json({ error: 'Use /api/drafts/<lang>/<slug> for read; POST for actions.' }, { status: 405 });
}