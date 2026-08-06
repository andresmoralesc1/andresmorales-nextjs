// GET /api/drafts/[lang]/[slug]/preview
//
// Returns the parsed draft post as JSON for the preview UI. Drafts live
// at `content/blog/drafts/<slug>.<lang>.md` and are NOT served via the
// public blog routes — only via this endpoint, and only for preview.
//
// Read-only: this endpoint exposes a draft to anyone who knows its URL.
// The drafts UI itself is also unguarded for now (TODO: gate behind auth
// before exposing publicly).

import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';

type Lang = 'en' | 'es' | 'pt';

function parseFrontmatter(raw: string): Record<string, unknown> {
  const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!m) return {};
  const fm: Record<string, unknown> = {};
  for (const line of m[1].split('\n')) {
    const kv = /^([a-zA-Z_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, raw] = kv;
    let value: unknown = raw;
    if (raw.startsWith('[') && raw.endsWith(']')) {
      value = raw
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (/^["'].*["']$/.test(raw)) {
      value = raw.slice(1, -1);
    }
    fm[key] = value;
  }
  return fm;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lang: string; slug: string }> },
) {
  const { lang, slug } = await params;
  if (!['en', 'es', 'pt'].includes(lang)) {
    return NextResponse.json({ error: 'Invalid lang' }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  const file = join(
    process.cwd(),
    'content',
    'blog',
    'drafts',
    `${slug}.${lang}.md`,
  );
  if (!existsSync(file)) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  const raw = readFileSync(file, 'utf-8');
  const fm = parseFrontmatter(raw);
  const bodyMatch = /^---\n[\s\S]*?\n---\n([\s\S]*)$/.exec(raw);
  const body = bodyMatch ? bodyMatch[1].trim() : '';
  const html = marked.parse(body) as string;

  return NextResponse.json({
    slug,
    lang,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    tags: fm.tags,
    author: fm.author,
    coverImage: fm.coverImage,
    coverImageCredit: fm.coverImageCredit,
    coverImageAlt: fm.coverImageAlt,
    source: fm.source,
    sourceTitle: fm.sourceTitle,
    generatedBy: fm.generatedBy,
    bodyMarkdown: body,
    bodyHtml: html,
  });
}