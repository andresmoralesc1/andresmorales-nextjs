/**
 * PM2 ecosystem for andresmorales-nextjs (portfolio Next.js app).
 * Serves andresmorales.com.co on port 3006 (also reached via the legacy
 * portafolio.andresmorales.com.co, which Caddy 301-redirects here).
 *
 * NOTE: as of the July 2026 cleanup this project is normally managed by
 * `systemctl restart andresmorales-nextjs.service` (see your memory and
 * the README runbook). The PM2 config is kept as a fallback in case
 * systemd ever gives trouble — `pm2 start ecosystem.config.js` from
 * this directory boots the same `next start -p 3006` wrapper.
 *
 * Estrategia: shell wrapper que hace `exec next start -p 3006`.
 *
 * ¿Por qué un wrapper bash con `exec`?
 *
 * Sin wrapper: `script: 'npm' + args: 'start -- -p 3006'`
 *   árbol → npm → sh -c "next start" → next-server
 *   PM2 rastrea npm. npm termina rápido después de spawnear next, dejando el
 *   child next-server huérfano. PM2 reporta errored.
 *
 * Con wrapper + exec: `script: './start-portfolio.sh'`
 *   árbol → next start → next-server
 *   El `exec` reemplaza el bash con next, sin proceso sh intermediario.
 *   PM2 rastrea `next start` directamente, que sí queda vivo todo el tiempo
 *   que next-server escucha.
 *
 * Runbook (PM2 fallback):
 *   pm2 reload portfolio                       # zero-downtime reload
 *   pm2 restart portfolio                      # hard restart
 *   pm2 logs portfolio                         # tail logs
 *
 * Nunca `pm2 kill` (rompe el daemon global y deja huérfanos).
 */
module.exports = {
  apps: [
    {
      name: 'portfolio',
      script: './start-portfolio.sh',
      cwd: '/home/telchar/andresmorales-nextjs',
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',
      kill_timeout: 8000,
      wait_ready: false,
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: '3006',
      },
    },
  ],
};