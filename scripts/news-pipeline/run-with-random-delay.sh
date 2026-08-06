#!/bin/bash
# News pipeline wrapper — randomises the start time within a 15-minute
# window so the LLM calls don't always fire at the exact same UTC tick
# (this matters when many users share a model gateway).
#
# Used by the cron entry below:
#   0 9 * * 1,4 ... run-news-pipeline.sh >> ~/.hermes/logs/news-pipeline.log 2>&1
# Cron fires at 09:00 Bogotá (UTC-5). We sleep up to 15 minutes, then
# invoke the TypeScript orchestrator.

set -e
cd /home/telchar/andresmorales-nextjs

# Load env vars from .env.local (Next.js loads .env.local at build but
# not at script runtime, so we have to do it manually).
set -a
# shellcheck disable=SC1091
source .env.local
set +a

# Random 0–900s offset, then run.
DELAY=$((RANDOM % 900))
echo "[$(date -Iseconds)] Sleeping ${DELAY}s before run..."
sleep "$DELAY"

echo "[$(date -Iseconds)] Starting pipeline..."
node --import tsx scripts/news-pipeline/run.ts
RC=$?
echo "[$(date -Iseconds)] Pipeline exited with code ${RC}"
exit $RC