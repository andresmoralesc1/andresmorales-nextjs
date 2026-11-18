const sharp = require('sharp');
const path = require('path');

const width = 1280;
const height = 720;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c0e14"/>
      <stop offset="100%" stop-color="#141926"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#192030"/>
      <stop offset="100%" stop-color="#131722"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Top App Header -->
  <rect x="0" y="0" width="${width}" height="64" fill="#121622" border-bottom="1px solid #1e2433"/>
  <line x1="0" y1="64" x2="${width}" y2="64" stroke="#1f293d" stroke-width="1.5"/>

  <!-- Logo & Title -->
  <rect x="36" y="14" width="36" height="36" rx="10" fill="url(#amberGrad)"/>
  <text x="54" y="38" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#0d0f14" text-anchor="middle">AM</text>
  <text x="86" y="34" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#f8fafc">Andrés Morales</text>
  <text x="210" y="34" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#fbbf24">CMS &amp; Engine</text>
  <text x="86" y="50" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Motor Unificado de Clientes &amp; Pipeline Prospección</text>

  <!-- Sandbox Badge -->
  <rect x="340" y="20" width="105" height="24" rx="12" fill="#10b981" fill-opacity="0.15" stroke="#10b981" stroke-width="1" stroke-opacity="0.3"/>
  <circle cx="352" cy="32" r="4" fill="#34d399"/>
  <text x="362" y="36" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#34d399" letter-spacing="1">LIVE DEMO</text>

  <!-- Navigation Pill Tabs -->
  <rect x="800" y="16" width="340" height="32" rx="10" fill="#0b0e17" stroke="#1e293b" stroke-width="1"/>
  <rect x="804" y="20" width="90" height="24" rx="8" fill="#fbbf24"/>
  <text x="849" y="36" font-family="system-ui, sans-serif" font-weight="800" font-size="11" fill="#0f172a" text-anchor="middle">Pipeline</text>
  <text x="940" y="36" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#94a3b8" text-anchor="middle">Propuestas</text>
  <text x="1030" y="36" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#94a3b8" text-anchor="middle">Automations</text>
  <text x="1110" y="36" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#94a3b8" text-anchor="middle">Métricas</text>

  <!-- Metric Summary Cards -->
  <g transform="translate(36, 84)">
    <!-- Metric 1 -->
    <rect x="0" y="0" width="285" height="84" rx="14" fill="url(#cardGrad)" stroke="#1e293b" stroke-width="1.2" filter="url(#shadow)"/>
    <text x="20" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">PIPELINE ACTIVO</text>
    <text x="20" y="56" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#fbbf24">$38,200 USD</text>
    <text x="20" y="73" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#34d399">↑ 24% vs mes anterior</text>

    <!-- Metric 2 -->
    <rect x="306" y="0" width="285" height="84" rx="14" fill="url(#cardGrad)" stroke="#1e293b" stroke-width="1.2" filter="url(#shadow)"/>
    <text x="326" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">PROYECTOS EN CURSO</text>
    <text x="326" y="56" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#f8fafc">6 Clientes</text>
    <text x="326" y="73" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Next.js &amp; Microfrontends</text>

    <!-- Metric 3 -->
    <rect x="612" y="0" width="285" height="84" rx="14" fill="url(#cardGrad)" stroke="#1e293b" stroke-width="1.2" filter="url(#shadow)"/>
    <text x="632" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">CONVERSIÓN DE PROSPECCIÓN</text>
    <text x="632" y="56" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#34d399">78%</text>
    <text x="632" y="73" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Briefs con score Hot</text>

    <!-- Metric 4 -->
    <rect x="918" y="0" width="285" height="84" rx="14" fill="url(#cardGrad)" stroke="#1e293b" stroke-width="1.2" filter="url(#shadow)"/>
    <text x="938" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#94a3b8">CORE WEB VITALS</text>
    <text x="938" y="56" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#38bdf8">100 / 100</text>
    <text x="938" y="73" font-family="system-ui, sans-serif" font-size="11" fill="#38bdf8">PageSpeed &amp; SEO Audit</text>
  </g>

  <!-- Kanban Columns -->
  <g transform="translate(36, 188)">
    <!-- Column 1: Nuevos -->
    <rect x="0" y="0" width="228" height="500" rx="14" fill="#0e121c" stroke="#1e2636" stroke-width="1.2"/>
    <circle cx="20" cy="24" r="4" fill="#3b82f6"/>
    <text x="32" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#e2e8f0" letter-spacing="0.5">NUEVOS LEADS</text>
    <rect x="184" y="14" width="24" height="20" rx="10" fill="#1e293b"/>
    <text x="196" y="28" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" text-anchor="middle">2</text>

    <!-- Card 1.1 -->
    <g transform="translate(12, 44)" filter="url(#shadow)">
      <rect width="204" height="110" rx="12" fill="#181e2b" stroke="#253047" stroke-width="1"/>
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f8fafc">Javier Restrepo</text>
      <text x="12" y="40" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Flota Sur Logística</text>
      <rect x="12" y="50" width="180" height="22" rx="6" fill="#0f1420"/>
      <text x="18" y="65" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#cbd5e1">Plataforma IoT &amp; GPS</text>
      <text x="12" y="96" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#34d399">$7,000 USD</text>
      <text x="190" y="96" font-family="system-ui, sans-serif" font-size="9" fill="#f59e0b" text-anchor="end">🔥 Hot</text>
    </g>

    <!-- Column 2: Conversación -->
    <rect x="244" y="0" width="228" height="500" rx="14" fill="#0e121c" stroke="#1e2636" stroke-width="1.2"/>
    <circle cx="264" cy="24" r="4" fill="#f59e0b"/>
    <text x="276" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#e2e8f0" letter-spacing="0.5">EN CONVERSACIÓN</text>
    <rect x="428" y="14" width="24" height="20" rx="10" fill="#1e293b"/>
    <text x="440" y="28" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" text-anchor="middle">3</text>

    <!-- Card 2.1 -->
    <g transform="translate(256, 44)" filter="url(#shadow)">
      <rect width="204" height="110" rx="12" fill="#181e2b" stroke="#fbbf24" stroke-width="1.2"/>
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f8fafc">Carlos Mendoza</text>
      <text x="12" y="40" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Café Origen Gourmet</text>
      <rect x="12" y="50" width="180" height="22" rx="6" fill="#0f1420"/>
      <text x="18" y="65" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#cbd5e1">Next.js Headless &amp; Wompi</text>
      <text x="12" y="96" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#34d399">$5,500 USD</text>
      <text x="190" y="96" font-family="system-ui, sans-serif" font-size="9" fill="#f59e0b" text-anchor="end">🔥 Hot</text>
    </g>

    <!-- Column 3: Propuesta -->
    <rect x="488" y="0" width="228" height="500" rx="14" fill="#0e121c" stroke="#1e2636" stroke-width="1.2"/>
    <circle cx="508" cy="24" r="4" fill="#a855f7"/>
    <text x="520" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#e2e8f0" letter-spacing="0.5">PROPUESTA ENVIADA</text>
    <rect x="672" y="14" width="24" height="20" rx="10" fill="#1e293b"/>
    <text x="684" y="28" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" text-anchor="middle">1</text>

    <!-- Card 3.1 -->
    <g transform="translate(500, 44)" filter="url(#shadow)">
      <rect width="204" height="110" rx="12" fill="#181e2b" stroke="#253047" stroke-width="1"/>
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f8fafc">Dra. Valentina Ríos</text>
      <text x="12" y="40" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">C. Médico Santa María</text>
      <rect x="12" y="50" width="180" height="22" rx="6" fill="#0f1420"/>
      <text x="18" y="65" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#cbd5e1">Portal Reservas &amp; PMS</text>
      <text x="12" y="96" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#34d399">$8,500 USD</text>
      <text x="190" y="96" font-family="system-ui, sans-serif" font-size="9" fill="#f59e0b" text-anchor="end">🔥 Hot</text>
    </g>

    <!-- Column 4: En Desarrollo -->
    <rect x="732" y="0" width="228" height="500" rx="14" fill="#0e121c" stroke="#1e2636" stroke-width="1.2"/>
    <circle cx="752" cy="24" r="4" fill="#06b6d4"/>
    <text x="764" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#e2e8f0" letter-spacing="0.5">EN DESARROLLO</text>
    <rect x="916" y="14" width="24" height="20" rx="10" fill="#1e293b"/>
    <text x="928" y="28" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" text-anchor="middle">2</text>

    <!-- Card 4.1 -->
    <g transform="translate(744, 44)" filter="url(#shadow)">
      <rect width="204" height="110" rx="12" fill="#181e2b" stroke="#253047" stroke-width="1"/>
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f8fafc">Martín Gómez</text>
      <text x="12" y="40" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Nova Fintech Hub</text>
      <rect x="12" y="50" width="180" height="22" rx="6" fill="#0f1420"/>
      <text x="18" y="65" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#cbd5e1">Cloud &amp; Microfrontends</text>
      <text x="12" y="96" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#34d399">$12,000 USD</text>
      <text x="190" y="96" font-family="system-ui, sans-serif" font-size="9" fill="#38bdf8" text-anchor="end">⚡ Sprint 2</text>
    </g>

    <!-- Column 5: Cerrados -->
    <rect x="976" y="0" width="228" height="500" rx="14" fill="#0e121c" stroke="#1e2636" stroke-width="1.2"/>
    <circle cx="996" cy="24" r="4" fill="#10b981"/>
    <text x="1008" y="28" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#e2e8f0" letter-spacing="0.5">CERRADOS / GANADOS</text>
    <rect x="1160" y="14" width="24" height="20" rx="10" fill="#1e293b"/>
    <text x="1172" y="28" font-family="system-ui, sans-serif" font-size="10" font-weight="800" fill="#94a3b8" text-anchor="middle">4</text>

    <!-- Card 5.1 -->
    <g transform="translate(988, 44)" filter="url(#shadow)">
      <rect width="204" height="110" rx="12" fill="#181e2b" stroke="#10b981" stroke-width="1.2"/>
      <text x="12" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f8fafc">Camila Torres</text>
      <text x="12" y="40" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Botánica Estudio</text>
      <rect x="12" y="50" width="180" height="22" rx="6" fill="#0f1420"/>
      <text x="18" y="65" font-family="system-ui, sans-serif" font-size="9" font-weight="600" fill="#cbd5e1">Sitio Web 3D &amp; Branding</text>
      <text x="12" y="96" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#34d399">$3,500 USD</text>
      <text x="190" y="96" font-family="system-ui, sans-serif" font-size="9" fill="#34d399" text-anchor="end">✓ 100/100</text>
    </g>
  </g>
</svg>
`;

async function main() {
  const outputPath = path.join(__dirname, '../public/sites/cms_demo_preview.png');
  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(outputPath);
  console.log('Generated CMS Demo Preview at:', outputPath);
}

main().catch(console.error);
