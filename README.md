# andresmorales-nextjs

Clon Next.js del sitio WordPress (andresmorales.com.co), extraído vía REST API + Elementor JSON.

## Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3 con paleta y fuentes extraídas de Elementor globals
- Fonts via `next/font/google` (Montserrat, Roboto Slab, Roboto)

## Estructura
- `app/` — rutas (home, services, portfolio, contact, brief, cumple-2025, invest-in-people-inspire-the-future, unsubscribe)
- `components/sections/` — secciones reutilizables (hero, about, services-icons, cta, portfolio-preview, contact-form)
- `components/` — header, footer
- `lib/` — data extraída (menú, theme, contenido por página)
## Run

```bash
npm install
npm run dev   # http://localhost:3000
npm run build # producción

# Producción (sirve portafolio.andresmorales.com.co)
./start-portfolio.sh &              # background, logs en ~/logs/portfolio.out
pkill -f start-portfolio.sh         # detener
```

## Por qué usamos `start-portfolio.sh` en lugar de PM2

PM2 + Next.js en fork mode tiene un quirk conocido: cuando `next start` arranca, Next hace `child_process.fork()` interno para `next-server.js`. PM2 rastrea solo el proceso raíz (`npm` o `next`) y pierde el árbol cuando el child sobrevive más allá del wrapper. Resultado: `pm2 list` muestra `errored` y `pid=0` aunque el sitio responda 200 OK perfectamente.

El wrapper bash con `exec` reemplaza el shell con `next` directamente (sin `sh -c` intermediario). El proceso queda como hijo directo del usuario, sin PM2 de por medio. Trade-off: perdemos monitoring y auto-restart de PM2, pero ganamos simplicidad y cero ambigüedad.

**Para producción con auto-restart**: usar systemd, supervisord, o un cron simple que verifique `:3006` cada minuto.

## Imágenes
Por ahora las imágenes se cargan por URL remota desde el WP original (`andresmorales.com.co/wp-content/uploads/...`). Para descargar localmente:
```bash
# extraer URLs y descargar — TBD
```

## Pendiente (futuro)
- Descargar 159 archivos de media (281 MB) a `/public`
- Convertir Metform a formulario funcional con mailto/Formspree
- Refinar services / portfolio con contenido completo extraído
- Decidir dominio (subdominio `new.` o reemplazar WP)
