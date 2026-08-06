# andresmorales-nextjs

Next.js clone del portafolio personal, trilingüe (inglés / español colombiano / portugués brasileño).

Sirve el dominio canónico **andresmorales.com.co** (puerto 3006 detrás de Caddy). El subdominio legacy `portafolio.andresmorales.com.co` redirige 301 al raíz para preservar SEO y backlinks existentes.

## Stack

- Next.js 14.2.x (App Router) + React 18 + TypeScript
- Tailwind CSS 3.4 con paleta y fuentes del WP original (Astra + Elementor)
- Fonts via `next/font/google` (Roboto, Roboto Condensed, Playfair Display)
- Caddy reverse proxy en :443, terminación SSL automática vía Let's Encrypt
- systemd unit `andresmorales-nextjs.service`

## Estructura

```
app/
  [lang]/              ← /es/* y /pt/* (generateStaticParams)
    page.tsx           ← home
    portfolio/         ← /es/portfolio, /pt/portfolio
    services/          ← /es/services (hub) + 3 sub-páginas
    contact/           ← /es/contact
    brief/             ← /es/brief (wizard completo)
    cumple-2025/       ← /es/cumple-2025
    invest-.../        ← /es/invest-...
    unsubscribe/       ← /es/unsubscribe
  page.tsx etc.        ← mismo set sin prefijo (default locale = inglés)
  layout.tsx           ← <html lang>, JSON-LD Person/WebSite, OG, Plausible
  sitemap.ts, robots.ts
components/
  sections/            ← hero, about, skills, experience, cta, contact-form, etc.
  social.tsx           ← SocialRow + SOCIAL_URLS (github, linkedin)
  LocaleSwitcher*.tsx  ← 3 banderitas (🇺🇸 🇨🇴 🇧🇷)
dictionaries/          ← en.json / es.json / pt.json (542 keys × 3 idiomas)
lib/
  dictionary.ts        ← getCurrentDictionary() (server)
  i18n.ts              ← LOCALES, DEFAULT_LOCALE, LOCALE_HTML_LANG
  menu.ts              ← nav menu (locale-agnostic hrefs)
  metadata.ts          ← pageMetadata() helper
middleware.ts          ← detecta locale + redirect + setea header x-locale
```

## Run

```bash
npm install
npm run dev     # http://localhost:3000

# Producción
npm run build
./start-portfolio.sh &             # background (PM2 fallback)
# — o vía systemd (recomendado):
sudo systemctl restart andresmorales-nextjs.service
```

## Deploy runbook

```bash
cd /home/telchar/andresmorales-nextjs
rm -rf .next && npm run build
sudo systemctl restart andresmorales-nextjs.service
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" https://andresmorales.com.co   # → 200
```

Logs:
```bash
sudo journalctl -u andresmorales-nextjs.service -f
```

## i18n (trilingüe)

URLs:
- Default (inglés, sin prefijo): `andresmorales.com.co`, `andresmorales.com.co/portfolio`, etc.
- Español: `andresmorales.com.co/es`, `andresmorales.com.co/es/portfolio`
- Portugués: `andresmorales.com.co/pt`, `andresmorales.com.co/pt/portfolio`

`<html lang>` cambia por URL: `en` / `es` / `pt-BR`. Bandera en el header permite cambiar entre los 3 preservando la ruta.

`dictionaries/{en,es,pt}.json` — 542 strings × 3 idiomas, perfectamente sincronizados. Para agregar un string nuevo, agregar la misma key en los 3 archivos. El tipo `Dictionary = typeof en.json` se deriva solo — TS detecta cualquier desincronización.

## Imágenes

`wpImage('/wp-content/uploads/...')` (helper en `lib/theme.ts`) convierte URLs del WP original a `/uploads/...` para servirlas vía `next/image`. Descargar localmente está pendiente — por ahora se sirven vía el helper y `next/image` las optimiza on-the-fly.

## Email

Briefs del wizard envían emails transaccionales vía Brevo (`BREVO_API_KEY` en `.env.local`). Cada brief también crea una task en ClickUp (`CLICKUP_API_TOKEN`, `CLICKUP_BRIEF_LIST_ID`).

## Pendiente

- [ ] Descargar media localmente (159 archivos, 281 MB) — opcional, `next/image` ya optimiza remoto
- [ ] Plausible analytics (desactivado — setear `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=andresmorales.com.co`)
- [ ] Backup automático de la DB de ClickUp briefs (actualmente en JSON en Drive, manual)

## Más info

- `~/.hermes/sessions/session-log.md` — log de cambios recientes del portafolio
- Skill `portfolio-andresmorales-i18n` — patrón completo para agregar páginas en 3 idiomas