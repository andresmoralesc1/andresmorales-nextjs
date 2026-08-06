#!/usr/bin/env node
// run.ts — Orchestrates the full news pipeline.
// Steps:
//   1. fetch-rss → recent AI news items
//   2. select → LLM picks most relevant (score 1-10)
//   3. generate → LLM writes ES draft + translates to EN, PT
//   4. pexels → download cover image per locale
//   5. save → write <slug>.<lang>.md to content/blog/drafts/
//   6. notify → email via Brevo + Telegram
//
// Usage:
//   node --import tsx scripts/news-pipeline/run.ts
//
// Required env vars:
//   MINIMAX_API_KEY (or in ~/.hermes/auth.json)
//   PEXELS_API_KEY
//   BREVO_API_KEY
// Optional:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
//   BREVO_FROM_EMAIL (default andres@andresmorales.com.co)
//   BRIEF_TO_EMAIL (default info@andresmorales.com.co)
//   PREVIEW_BASE_URL (default http://localhost:3006)

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fetchRecentAiNews } from './fetch-rss.js';
import { selectMostRelevant } from './select.js';
import { generateDrafts, serializeDraft } from './generate.js';
import { fetchCoverForQuery } from './pexels.js';
import { notify } from './notify.js';

const DRAFTS_DIR = join(process.cwd(), 'content', 'blog', 'drafts');

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`\n=== News pipeline run started at ${startedAt} ===\n`);

  // 1. Fetch RSS
  console.log('[1/5] Fetching recent AI news from RSS feeds...');
  const items = await fetchRecentAiNews();
  console.log(`[1/5] Got ${items.length} candidate items.\n`);
  if (items.length === 0) {
    console.log('No candidates. Aborting.');
    process.exit(0);
  }

  // 2. Select
  console.log('[2/5] Asking LLM to pick the most relevant item...');
  const selected = await selectMostRelevant(items);
  if (!selected) {
    console.log('No item passed the relevance threshold. Aborting this run.\n');
    process.exit(0);
  }
  console.log();

  // 3. Generate drafts (ES first, then EN + PT translations)
  console.log('[3/5] Generating drafts (ES + EN + PT)...');
  const drafts = await generateDrafts(selected);
  console.log(`[3/5] Slug: ${drafts.slug}\n`);

  // 4. Pexels covers
  console.log('[4/5] Fetching cover images from Pexels...');
  const coverEn = await fetchCoverForQuery(selected.item.title, drafts.slug, 'en');
  // Use the EN cover for all 3 locales — Pexels photos are language-neutral.
  // If you want per-locale covers, swap this with separate queries.
  const cover = coverEn;
  console.log(`[4/5] Cover: ${cover?.path ?? '(none, will skip)'}\n`);

  // 5. Save drafts
  console.log('[5/5] Writing drafts to disk...');
  if (!existsSync(DRAFTS_DIR)) mkdirSync(DRAFTS_DIR, { recursive: true });

  const previewBase =
    process.env.PREVIEW_BASE_URL || 'http://localhost:3006';

  for (const locale of ['es', 'en', 'pt'] as const) {
    const draft = drafts[locale];
    const file = join(DRAFTS_DIR, `${drafts.slug}.${locale}.md`);
    const content = serializeDraft(draft, cover ?? undefined);
    writeFileSync(file, content, 'utf-8');
    console.log(`[5/5] Wrote ${file} (${content.length} chars)`);
  }
  console.log();

  // 6. Notify (only the Spanish version, since ES is the primary locale)
  console.log('[6/6] Sending notifications...');
  const previewUrl = `${previewBase}/api/drafts/es/${drafts.slug}`;
  await notify({
    draft: drafts.es,
    locale: 'es',
    slug: drafts.slug,
    previewUrl,
  });

  console.log(`\n=== Pipeline complete. Slug: ${drafts.slug} ===\n`);
  console.log(`Next: review the draft at ${previewUrl}`);
  console.log(`To publish: move content/blog/drafts/${drafts.slug}.es.md`);
  console.log(`            to   content/blog/${drafts.slug}.es.md and remove 'draft: true'.\n`);
}

main().catch((err) => {
  console.error('\n[FATAL] Pipeline failed:', err);
  process.exit(1);
});