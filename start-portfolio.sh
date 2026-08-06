#!/bin/bash
# start-portfolio.sh — Starts Next.js for andresmorales.com.co
#
# This wrapper is launched via `nohup ./start-portfolio.sh &` from
# /home/telchar/andresmorales-nextjs, or via PM2 (`pm2 start
# ecosystem.config.js`). The site is also served at the legacy
# portafolio.andresmorales.com.co, which Caddy 301-redirects to
# andresmorales.com.co so SEO + bookmarks survive the migration.
#
# The process runs as a child of the user. Administration:
#   - View logs:  tail -f /home/telchar/logs/portfolio.out
#   - Restart:    pkill -f start-portfolio.sh && cd /home/telchar/andresmorales-nextjs && nohup ./start-portfolio.sh &
#   - Auto-restart on boot: add to /etc/rc.local or systemd (see README)
set -e
cd /home/telchar/andresmorales-nextjs

# Load .env.local if present (Brevo + others)
# Next.js 14+ reads .env.local automatically from cwd, so we do not
# need to source it here. If we wanted to force parsing, better use
# `node --env-file .env.local ...` but it complicates the wrapper.
#
# Historically there was a `set -a; . .env.local` here that failed when
# a value contains spaces + UTF-8 (e.g. "Andres Morales · Portfolio Brief")
# because bash interpreted "Morales" as a command. Documented so we
# do not try it again.

export NODE_ENV=production
export PORT=3006
export HOSTNAME=0.0.0.0

exec ./node_modules/.bin/next start -p 3006
