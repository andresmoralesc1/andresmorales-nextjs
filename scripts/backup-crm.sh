#!/usr/bin/env bash
# scripts/backup-crm.sh
# Automated daily backup for Andres Morales CRM and JSON data stores
# Retains last 30 daily archives in /home/telchar/backups/crm/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="/home/telchar/backups/crm"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="andresmorales_data_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

if [ -d "$PROJECT_DIR/data" ]; then
  tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$PROJECT_DIR" data
  echo "[$(date -Iseconds)] Backup created successfully: $BACKUP_DIR/$ARCHIVE_NAME ($(du -h "$BACKUP_DIR/$ARCHIVE_NAME" | cut -f1))"
else
  echo "[$(date -Iseconds)] Warning: $PROJECT_DIR/data directory not found"
  exit 1
fi

# Clean up backups older than 30 days
find "$BACKUP_DIR" -type f -name "andresmorales_data_*.tar.gz" -mtime +30 -delete
echo "[$(date -Iseconds)] Cleanup complete. Retaining last 30 days of archives."
