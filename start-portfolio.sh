#!/bin/bash
# start-portfolio.sh — Starts Next.js for portafolio.andresmorales.com.co
#
# This wrapper is launched via `nohup ./start-portfolio.sh &` from
# /home/telchar/andresmorales-nextjs/. Used instead of PM2 because PM2
# loses the Next.js process tree (Next does child_process.fork()
# internally and PM2 reports pid=0 even though the site responds 200 OK).
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
