---
title: Migrar de InterServer a Mailcow sin perder correos
lede: Una migración de 1 día que cuesta menos que un mes de InterServer y te da propiedad real de tu mail. Más el docker-compose real que aterriza el cutover.
eyebrow: Cluster 01 — Satélite 03
publishedAt: "2026-09-26"
readingTime: 7 min
level: intermediate
clusterHref: "/guide/ai-automation-latam-2026"
clusterTitle: AI automation for LATAM small businesses
currentSlug: migrate-from-interserver-to-mailcow
---

This satellite assumes you have a working InterServer mail setup (you know the pain: slow webmail, $14/mailbox, anemic admin panel, permissive spam filter, no real control of your data). The migration takes 8 hours. The savings is the full $14/mailbox-month.

## The case for owning the mail

LATAM SMBs on InterServer typically pay $5-20 per mailbox per month, in a market where the average employee salary is $800-$1,500 per month. The math is: $14 × 32 mailboxes × 12 months = $5,376/year on commodity email. Mailcow on a $30/month Hetzner VPS is $360/year. The migration pays for itself in 9 months and gives you real ownership of your mail system.

The blocker is always: "we will lose emails during the cutover." You will not, if you follow this. The IMAP sync runs in the background while the old server is still serving.

## Pre-flight checklist

- A Hetzner VPS (or similar) with 4GB RAM, 2 vCPU, 80GB disk. Mailcow is not heavy. ~$30/month.
- A clean public IPv4. Mailcow needs port 25 open and unblocked. Ask Hetzner to remove the outbound SMTP block if you are a new customer (the standard form takes 1 business day).
- A domain you control at the registrar. You will change the MX records at the end.
- 8 free hours. Most of them are waiting on DNS propagation.

## The docker-compose

This is the entire Mailcow deployment. It assumes Ubuntu 22.04. Save as `docker-compose.yml` and run `docker compose up -d`.

```yaml
services:
  mailcow:
    image: mailcow/dockerized:2.0
    restart: always
    hostname: mail.yourdomain.com
    volumes:
      - ./mailcow-data:/data
    ports:
      - "25:25"     # SMTP
      - "80:80"     # HTTP (admin)
      - "443:443"   # HTTPS (admin + webmail)
      - "110:110"   # POP3
      - "143:143"   # IMAP
      - "465:465"   # SMTPS
      - "587:587"   # submission
      - "993:993"   # IMAPS
      - "995:995"   # POP3S
    environment:
      - SKIP_LETS_ENCRYPT=y
      - SKIP_OLETLS=y
      - HTTP_REDIRECT=mail.yourdomain.com
      - HTTPS=vhost
    volumes:
      - ./conf:/data/conf
```

After `docker compose up -d`, navigate to `https://mail.yourdomain.com:443` and run the Mailcow setup wizard. The wizard takes 10 minutes.

## The cutover plan

The cutover is the part that loses emails if done wrong. The right shape is:

1. Deploy Mailcow on the new VPS.
2. From your OLD InterServer, set up an IMAP sync to the new Mailcow. Mailcow ships with a built-in sync tool — go to **Configuration → Mailboxes → Add mailbox → imapsync**.
3. Run the first sync. The first pass takes 4-8 hours for 32 mailboxes. It is normal.
4. After the first sync, re-run it every 2 hours while the cutover window is open. Mailcow does this on cron.
5. Reduce InterServer MX TTL to 5 minutes 24 hours before the cutover.
6. Cutover: change the MX record at your registrar to point to the new VPS. Within 5 minutes, all new mail starts landing at Mailcow.
7. After 48 hours of clean cutover, decommission the InterServer account.

The imapsync trick is the part most teams miss. The first sync does the historical pass. The hourly cron keeps the 48-hour cutover window synced. After 48 hours, the only mail still at InterServer is what was delivered in the last 5 minutes, and you can verify the new mail arrived at Mailcow before you take InterServer offline.

## The DNS records

Mailcow ships with Let's Encrypt via the built-in ACME client. After the setup wizard:

- A record `mail.yourdomain.com` → `<new VPS IPv4>`
- A record `webmail.yourdomain.com` → `<new VPS IPv4>` (optional, points to SOGo)
- MX record `yourdomain.com` → `10 mail.yourdomain.com` (replaces the InterServer MX)
- TXT record `yourdomain.com` → `v=spf1 mx ~all` (replaces the InterServer SPF; tighten to `v=spf1 mx -all` after cutover is stable)
- TXT record `_dmarc.yourdomain.com` → `v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com`

The DMARC record is the part most teams skip. It is what tells the receiving end of the world "if the SPF check fails, quarantine this." Without it, spoofed emails from your domain land in the recipient's spam. With it, the recipient's server can reject them outright.

## What to do this week

If you are on InterServer (or any other commodity mail), this is the single highest-ROI migration a LATAM SMB can ship. The savings is the full monthly mail bill, the email finally loads in under 200 ms, and you own the data. Most owners do this on a Friday and the team is back to work by Monday with a faster inbox.

If you are not on InterServer, you still have the same problem. Mailcow works against any commodity provider.
