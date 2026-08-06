# News Pipeline (Autoblogging)

Generates opinion-style blog posts about recent AI news, twice a week
(Mondays and Thursdays at 9am Bogotá). Drafts land in
`content/blog/drafts/` for human review before they go live.

## Pipeline

```
RSS feeds → LLM selects → LLM writes ES + EN + PT → Pexels cover → save draft → notify (Brevo + Telegram)
```

## Files

| File | Purpose |
|---|---|
| `llm.ts` | MiniMax-M3 client (reads API key from env or `~/.hermes/auth.json`) |
| `fetch-rss.ts` | Aggregates AI news from TechCrunch, MIT Tech Review, The Verge, VentureBeat |
| `select.ts` | LLM picks most relevant item (score 1-10); aborts if <7 |
| `generate.ts` | LLM writes Spanish draft, then translates to EN and PT |
| `pexels.ts` | Downloads landscape cover image from Pexels |
| `notify.ts` | Sends email via Brevo, message via Telegram (optional) |
| `run.ts` | Orchestrator — runs the whole pipeline |

## Manual run

```bash
cd /home/telchar/andresmorales-nextjs
node --import tsx scripts/news-pipeline/run.ts
```

## Required env vars

| Var | Where | Purpose |
|---|---|---|
| `MINIMAX_API_KEY` | `.env.local` or `~/.hermes/auth.json` | LLM calls |
| `PEXELS_API_KEY` | `.env.local` | Cover images |
| `BREVO_API_KEY` | `.env.local` | Email notification |

## Optional env vars

| Var | Default | Purpose |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | unset (skip Telegram) | Telegram notification |
| `TELEGRAM_CHAT_ID` | unset (skip Telegram) | Telegram notification |
| `BREVO_FROM_EMAIL` | `andres@andresmorales.com.co` | From address |
| `BRIEF_TO_EMAIL` | `info@andresmorales.com.co` | To address |
| `PREVIEW_BASE_URL` | `http://localhost:3006` | Base URL for the draft preview link |

## Cron

Runs automatically Mon + Thu at 9am Bogotá (14:00 UTC) via the
`news-pipeline` cron job. Output is appended to
`/home/telchar/.hermes/logs/news-pipeline.log`.

## Approval flow

1. Pipeline writes 3 files to `content/blog/drafts/<slug>.<lang>.md`
2. Email arrives with link to `/api/drafts/<lang>/<slug>` (preview JSON)
3. Read the draft (in `content/blog/drafts/`) and edit if needed
4. To publish: `mv content/blog/drafts/<slug>.<lang>.md content/blog/<slug>.<lang>.md`
5. Next `npm run build` picks it up

You can also visit `/es/drafts` (etc.) for a visual list of pending drafts
with Approve / Discard buttons.

## Safeguards

- **Score < 7 → skip**: if the LLM thinks the top story is only marginally
  relevant, no post is generated that week.
- **No silent fallback**: if the LLM call fails, the run aborts. No
  fallback to a different model — prevents hallucinations from cheaper
  models leaking into your portfolio.
- **Drafts, not publish**: nothing goes live without human review.