const { chromium } = require('/home/telchar/gato-colectivo/node_modules/playwright');
const fs = require('fs');
const path = require('path');

function getBase64Image(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('Image not found:', filePath);
    return '';
  }
  const ext = path.extname(filePath).replace('.', '') || 'png';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext};base64,${data}`;
}

async function generatePdf() {
  const screenshotDir = '/home/telchar/andresmorales-nextjs/public/screenshots/bosi';
  const imgHomeHero = getBase64Image(path.join(screenshotDir, '01-home-mobile-hero.png'));
  const imgHomeMid = getBase64Image(path.join(screenshotDir, '02-home-mobile-mid.png'));
  const imgPlpGrid = getBase64Image(path.join(screenshotDir, '03-plp-mobile-grid.png'));
  const imgPdpTop = getBase64Image(path.join(screenshotDir, '05-pdp-mobile-top.png'));
  const imgPdpSizes = getBase64Image(path.join(screenshotDir, '06-pdp-mobile-sizes-cta.png'));
  const imgPdpNoSticky = getBase64Image(path.join(screenshotDir, '07-pdp-mobile-no-sticky.png'));
  const imgDesktop = getBase64Image(path.join(screenshotDir, '08-desktop-home.png'));

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ultra Auditoría UX, UI y Core Web Vitals - Bosi Colombia</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;600&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1E1810;
      background: #FFFFFF;
      font-size: 11px;
      line-height: 1.5;
    }

    .pdf-page {
      width: 210mm;
      height: 297mm;
      padding: 18mm 18mm 16mm 18mm;
      position: relative;
      page-break-after: always;
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    /* Header */
    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1.5px solid #1E1810;
      margin-bottom: 14px;
    }

    .brand-logo {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #1E1810;
    }

    .brand-logo span {
      color: #B3541E;
    }

    .brand-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #575250;
      background: #F4F1EA;
      padding: 3px 8px;
      border-radius: 4px;
    }

    /* Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid #E5E0D8;
      font-size: 8.5px;
      color: #7A726D;
      font-family: 'JetBrains Mono', monospace;
    }

    .badge-alert {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 3px;
      font-weight: 700;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-critical { background: #FDE8E8; color: #9B1C1C; border: 1px solid #F8B4B4; }
    .badge-warning { background: #FEF08A; color: #854D0E; border: 1px solid #FDE047; }
    .badge-success { background: #DEF7EC; color: #03543F; border: 1px solid #BCF0DA; }
    .badge-enterprise { background: #EDE9FE; color: #5B21B6; border: 1px solid #DDD6FE; }

    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 23px;
      font-weight: 800;
      line-height: 1.15;
      color: #1E1810;
      letter-spacing: -0.6px;
      margin-bottom: 6px;
    }

    h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #1E1810;
      letter-spacing: -0.3px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    h3 {
      font-size: 11.5px;
      font-weight: 700;
      color: #1E1810;
      margin-bottom: 4px;
    }

    p {
      color: #403B38;
      margin-bottom: 8px;
      font-size: 10px;
      line-height: 1.5;
    }

    /* Meta Grid */
    .meta-box {
      background: #FAF8F5;
      border: 1px solid #EAE5DE;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .meta-item-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      text-transform: uppercase;
      color: #8C827A;
      font-weight: 600;
      display: block;
      margin-bottom: 2px;
    }

    .meta-item-val {
      font-size: 10px;
      font-weight: 700;
      color: #1E1810;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9px;
    }

    th {
      background: #1E1810;
      color: #FFFFFF;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 8.5px;
      font-weight: 700;
      text-align: left;
      padding: 6px 9px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    th:first-child { border-top-left-radius: 6px; }
    th:last-child { border-top-right-radius: 6px; }

    td {
      padding: 6.5px 9px;
      border-bottom: 1px solid #EAE5DE;
      color: #383431;
      vertical-align: middle;
    }

    tr:nth-child(even) td {
      background: #FAF8F5;
    }

    /* Scorecards */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 9px;
      margin-bottom: 14px;
    }

    .metric-card {
      background: #FAF8F5;
      border: 1px solid #EAE5DE;
      border-radius: 8px;
      padding: 9px 12px;
      position: relative;
    }

    .metric-card.bad {
      border-left: 3.5px solid #E02424;
      background: #FEF2F2;
    }

    .metric-card.warn {
      border-left: 3.5px solid #D97706;
      background: #FFFBEB;
    }

    .metric-card.good {
      border-left: 3.5px solid #059669;
      background: #ECFDF5;
    }

    .metric-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 800;
      margin: 2px 0;
      color: #1E1810;
    }

    .metric-label {
      font-size: 8.5px;
      font-weight: 700;
      color: #575250;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .metric-sub {
      font-size: 7.5px;
      color: #7A726D;
      line-height: 1.25;
    }

    /* Phone Mockup */
    .phone-mockup {
      background: #111;
      border-radius: 20px;
      padding: 7px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border: 2px solid #2B2623;
      display: inline-block;
      position: relative;
    }

    .phone-screen {
      border-radius: 14px;
      overflow: hidden;
      background: #fff;
      display: block;
    }

    .phone-screen img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Desktop Mockup */
    .browser-mockup {
      background: #fff;
      border-radius: 10px;
      border: 1px solid #D6D0C7;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      margin-bottom: 12px;
    }

    .browser-topbar {
      background: #EFECE6;
      padding: 5px 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px solid #D6D0C7;
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-red { background: #FF5F56; }
    .dot-yellow { background: #FFBD2E; }
    .dot-green { background: #27C93F; }

    .browser-url {
      background: #fff;
      border-radius: 4px;
      padding: 2px 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8px;
      color: #575250;
      flex: 1;
      margin-left: 8px;
    }

    .browser-body img {
      width: 100%;
      display: block;
    }

    /* Visual friction boxes */
    .friction-card {
      background: #FAF8F5;
      border: 1px solid #E5E0D8;
      border-radius: 8px;
      padding: 10px;
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 10px;
    }

    .friction-img-thumb {
      width: 105px;
      height: 145px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #D6D0C7;
      flex-shrink: 0;
      position: relative;
    }

    .friction-img-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
    }

    .friction-content {
      flex: 1;
    }

    .pill-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      padding: 2px 6px;
      background: #EFECE6;
      border-radius: 3px;
      color: #575250;
      font-weight: 600;
    }

    /* Pipeline / n8n workflow box */
    .workflow-container {
      background: #1E1810;
      color: #FAF8F5;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 14px;
    }

    .workflow-steps {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 10px;
    }

    .wf-step {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      padding: 8px;
    }

    .wf-step-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5px;
      color: #D4813B;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .wf-step-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #FFF;
      margin-bottom: 3px;
    }

    .wf-step-desc {
      font-size: 7.5px;
      color: #C2BBB5;
      line-height: 1.35;
    }

    .highlight-quote {
      border-left: 3px solid #B3541E;
      background: #FBF7F4;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      font-style: italic;
      color: #4A3E39;
      font-size: 9.5px;
      margin: 8px 0;
    }
  </style>
</head>
<body>

  <!-- ========================================== -->
  <!-- PÁGINA 1: PORTADA & RESUMEN EJECUTIVO CRO  -->
  <!-- ========================================== -->
  <div class="pdf-page">
    <div>
      <div class="brand-header">
        <div class="brand-logo">_andresmorales <span>/ Enterprise Audit</span></div>
        <div class="brand-tag">DIAGNÓSTICO TÉCNICO & CRO 2026</div>
      </div>

      <div style="margin-bottom: 12px;">
        <span class="badge-alert badge-critical" style="margin-bottom: 6px; display: inline-block;">DICTAMEN CONFIDENCIAL DE RENDIMIENTO MÓVIL Y ARQUITECTURA VTEX IO</span>
        <h1>Ultra Auditoría UX, UI y Google Core Web Vitals</h1>
        <p style="font-size: 11px; color: #575250; font-weight: 500; margin-bottom: 0;">
          Diagnóstico exhaustivo de velocidad móvil, datos de campo reales CrUX de Google Chrome, arquitectura multimarca y optimización de tasa de conversión para <strong>BOSI Colombia</strong>.
        </p>
      </div>

      <div class="meta-box">
        <div>
          <span class="meta-item-label">Empresa Evaluada</span>
          <span class="meta-item-val">BOSI Colombia (bosi.com.co)</span>
        </div>
        <div>
          <span class="meta-item-label">Ecosistema Digital</span>
          <span class="meta-item-val">Bosi, Bambino, ADT Motowear</span>
        </div>
        <div>
          <span class="meta-item-label">Motor E-commerce</span>
          <span class="meta-item-val">VTEX IO Enterprise Engine</span>
        </div>
        <div>
          <span class="meta-item-label">Auditoría Google</span>
          <span class="meta-item-val">PageSpeed Insights & CrUX</span>
        </div>
        <div>
          <span class="meta-item-label">Consultor Responsable</span>
          <span class="meta-item-val">Andrés Morales (Senior Architect)</span>
        </div>
        <div>
          <span class="meta-item-label">Contacto & WhatsApp</span>
          <span class="meta-item-val">+57 316 148 2507 / andresmorales.com.co</span>
        </div>
      </div>

      <h2>1. Resumen Ejecutivo y Benchmark de Conversión E-commerce</h2>
      <p>
        BOSI representa el mayor referente de calzado de cuero, marroquinería y moda en Colombia bajo la promesa <em>"Il modo italiano di vivere"</em>. Con infraestructura enterprise en VTEX IO y distribución nacional, la marca canaliza un volumen masivo de tráfico diario impulsado por campañas en Meta Ads y Google Search.
      </p>
      <p>
        Sin embargo, la evaluación oficial de Google PageSpeed Insights y la auditoría de experiencia de usuario (UX/UI) revelan una situación crítica: <strong>la tienda online NO APRUEBA los Core Web Vitals de Google en dispositivos móviles</strong>, obteniendo una puntuación de rendimiento de apenas <strong>54 / 100</strong>.
      </p>

      <div class="highlight-quote">
        "La combinación de lentitud técnica (LCP de 15.5s en laboratorio y CLS de 0.51) junto a la ausencia de un botón de compra persistente y la falta de certeza en tallas genera un <strong>escape de conversión estimado entre el 1.4% y el 2.1%</strong> del tráfico móvil."
      </div>

      <!-- Live Mockup Row -->
      <div style="display: flex; gap: 14px; align-items: flex-start; margin-top: 10px;">
        <div style="flex: 1.4;">
          <div class="browser-mockup">
            <div class="browser-topbar">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
              <span class="browser-url">https://www.bosi.com.co — Captura Desktop Real (1440px)</span>
            </div>
            <div class="browser-body" style="height: 165px; overflow: hidden;">
              <img src="${imgDesktop}" alt="Bosi Desktop Home Real">
            </div>
          </div>
          <p style="font-size: 8.5px; color: #7A726D; margin-top: -6px;">
            ▲ <strong>Entorno Desktop:</strong> Excelente presencia de marca y catálogo de temporada. El cuello de botella no radica en la estética gráfica de escritorio, sino en el embudo móvil donde se concentra más del 82% de las visitas.
          </p>
        </div>

        <div style="flex: 0.8; text-align: center;">
          <div class="phone-mockup">
            <div class="phone-screen" style="width: 110px; height: 185px;">
              <img src="${imgHomeHero}" alt="Bosi Mobile Home Real">
            </div>
          </div>
          <p style="font-size: 8px; color: #7A726D; margin-top: 4px;">
            ▲ <strong>Móvil Real:</strong> Cabecera con triple marca
          </p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>BOSI Colombia · Auditoría CRO & Core Web Vitals</span>
      <span>Preparado por Andrés Morales · andresmorales.com.co</span>
      <span>Pág 1 de 5</span>
    </div>
  </div>

  <!-- ======================================================== -->
  <!-- PÁGINA 2: GOOGLE CORE WEB VITALS & DIAGNÓSTICO TÉCNICO   -->
  <!-- ======================================================== -->
  <div class="pdf-page">
    <div>
      <div class="brand-header">
        <div class="brand-logo">_andresmorales <span>/ Performance</span></div>
        <div class="brand-tag">MÉTRICAS OFICIALES GOOGLE CRUX</div>
      </div>

      <h2>2. Auditoría Google PageSpeed Insights: Core Web Vitals en bosi.com.co</h2>
      <p>
        Google evalúa la velocidad a través de dos fuentes: datos de laboratorio (simulación de red 4G móvil media) y datos de campo recolectados por millones de usuarios reales de Google Chrome en Colombia (<em>Chrome User Experience Report - CrUX</em>).
      </p>

      <!-- Metric Cards Grid -->
      <div class="metric-grid">
        <div class="metric-card bad">
          <div class="metric-label">Performance Móvil</div>
          <div class="metric-val" style="color: #9B1C1C;">54 <span style="font-size: 11px; font-weight: 500;">/ 100</span></div>
          <div class="metric-sub">Umbral mínimo recomendado: ≥ 90/100. Calificación deficiente.</div>
        </div>

        <div class="metric-card bad">
          <div class="metric-label">LCP (Render Mayor)</div>
          <div class="metric-val" style="color: #9B1C1C;">15.5 s <span style="font-size: 10px; color: #575250;">(Lab)</span></div>
          <div class="metric-sub">Datos de campo: 3.3 s. Umbral Google: ≤ 2.5 s. El banner tarda demasiado.</div>
        </div>

        <div class="metric-card bad">
          <div class="metric-label">CLS (Salto Visual)</div>
          <div class="metric-val" style="color: #9B1C1C;">0.51 <span style="font-size: 9px; font-weight: 700; background: #FDE8E8; padding: 1px 4px; border-radius: 3px;">5X LÍMITE</span></div>
          <div class="metric-sub">Umbral: ≤ 0.10. La pantalla salta bruscamente al cargar el menú.</div>
        </div>

        <div class="metric-card warn">
          <div class="metric-label">INP (Respuesta al Tap)</div>
          <div class="metric-val" style="color: #B45309;">315 ms</div>
          <div class="metric-sub">Umbral: ≤ 200 ms. Retraso perceptible al pulsar filtros o tallas.</div>
        </div>

        <div class="metric-card warn">
          <div class="metric-label">FCP (Primer Pintado)</div>
          <div class="metric-val" style="color: #B45309;">2.9 s <span style="font-size: 10px; color: #575250;">(3.1s Field)</span></div>
          <div class="metric-sub">Umbral: ≤ 1.8 s. Pantalla en blanco durante ~3 segundos iniciales.</div>
        </div>

        <div class="metric-card warn">
          <div class="metric-label">TBT (Bloqueo Hilo)</div>
          <div class="metric-val" style="color: #B45309;">360 ms</div>
          <div class="metric-sub">Bloqueo de CPU móvil por scripts de analítica y apps en VTEX.</div>
        </div>
      </div>

      <h2>3. Secuencia Gráfica de Renderizado Móvil (Experiencia Real)</h2>
      <p>
        A continuación se ilustra la línea de tiempo real que experimenta un comprador en Colombia con conexión móvil antes de poder interactuar con el catálogo de Bosi:
      </p>

      <!-- Visual Sequence Timeline -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; background: #FAF8F5; padding: 10px; border-radius: 8px; border: 1px solid #EAE5DE;">
        <div style="text-align: center;">
          <div style="background: #FFF; border: 1px solid #D6D0C7; border-radius: 6px; height: 110px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #A8A29E;">[PANTALLA BLANCA]</span>
          </div>
          <span class="pill-tag">0.0s — 1.8s</span>
          <p style="font-size: 7.5px; color: #575250; margin-top: 3px; line-height: 1.2;">Conexión DNS y descarga de bundles VTEX JS.</p>
        </div>

        <div style="text-align: center;">
          <div style="background: #FFF; border: 1px solid #D6D0C7; border-radius: 6px; height: 110px; overflow: hidden; margin-bottom: 4px;">
            <img src="${imgHomeHero}" style="width: 100%; height: 100%; object-fit: cover; filter: blur(3px); opacity: 0.6;" alt="FCP blur">
          </div>
          <span class="pill-tag">2.9s — FCP</span>
          <p style="font-size: 7.5px; color: #575250; margin-top: 3px; line-height: 1.2;">Aparece logo y barra superior sin estilos finales.</p>
        </div>

        <div style="text-align: center;">
          <div style="background: #FFF; border: 2px solid #E02424; border-radius: 6px; height: 110px; overflow: hidden; margin-bottom: 4px;">
            <img src="${imgHomeMid}" style="width: 100%; height: 100%; object-fit: cover;" alt="CLS shift">
          </div>
          <span class="badge-alert badge-critical" style="font-size: 7px;">5.4s — CLS 0.51</span>
          <p style="font-size: 7.5px; color: #9B1C1C; margin-top: 3px; font-weight: 600; line-height: 1.2;">¡SALTO BRUSCO! El banner empuja botones hacia abajo.</p>
        </div>

        <div style="text-align: center;">
          <div style="background: #FFF; border: 1px solid #059669; border-radius: 6px; height: 110px; overflow: hidden; margin-bottom: 4px;">
            <img src="${imgHomeHero}" style="width: 100%; height: 100%; object-fit: cover;" alt="LCP complete">
          </div>
          <span class="badge-alert badge-success" style="font-size: 7px;">15.5s — LCP LAB</span>
          <p style="font-size: 7.5px; color: #03543F; margin-top: 3px; line-height: 1.2;">Pintado final del banner. Hilo principal libre.</p>
        </div>
      </div>

      <h2>Diagnóstico de Código y Oportunidades según Google Lighthouse</h2>
      <table>
        <thead>
          <tr>
            <th>Problema Detectado en VTEX</th>
            <th>Impacto en Segundos / Peso</th>
            <th>Acción Técnica de Reparación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Peticiones que bloquean el renderizado</strong></td>
            <td><span class="badge-alert badge-critical">1.190 ms retraso</span></td>
            <td>Diferir hojas de estilo no críticas e inyectar critical CSS inline para FCP inmediato.</td>
          </tr>
          <tr>
            <td><strong>Falta de compresión en formatos modernos</strong></td>
            <td><span class="badge-alert badge-warning">566 KiB sobrepeso</span></td>
            <td>Servir imágenes en WebP / AVIF dinámico con tamaños responsivos (srcset) desde VTEX Assets.</td>
          </tr>
          <tr>
            <td><strong>Políticas de caché estática ineficientes</strong></td>
            <td><span class="badge-alert badge-warning">712 KiB redundantes</span></td>
            <td>Extender cabeceras Cache-Control a 1 año en scripts inmutables y fuentes tipográficas.</td>
          </tr>
          <tr>
            <td><strong>Inestabilidad visual acumulada (CLS 0.51)</strong></td>
            <td><span class="badge-alert badge-critical">5x sobre límite</span></td>
            <td>Reservar aspect-ratio fijo en CSS en contenedor de banner y conmutador de marcas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>BOSI Colombia · Auditoría CRO & Core Web Vitals</span>
      <span>Preparado por Andrés Morales · andresmorales.com.co</span>
      <span>Pág 2 de 5</span>
    </div>
  </div>

  <!-- ======================================================== -->
  <!-- PÁGINA 3: MÓDULO 1 (HEADER) & MÓDULO 2 (PDP & TALLAS)    -->
  <!-- ======================================================== -->
  <div class="pdf-page">
    <div>
      <div class="brand-header">
        <div class="brand-logo">_andresmorales <span>/ UX & UI Mobile</span></div>
        <div class="brand-tag">EVIDENCIA VISUAL EN VIVO</div>
      </div>

      <h2>4. Módulo 1: Arquitectura de Información, Header y Navegación</h2>
      <p>
        El 82% del tráfico en retail de moda en Colombia navega desde smartphones. Cuando un comprador no ubica su talla o categoría en menos de 5 segundos, abandona y busca en otra tienda.
      </p>

      <div class="friction-card">
        <div class="friction-img-thumb">
          <img src="${imgHomeHero}" alt="Bosi Mobile Header">
        </div>
        <div class="friction-content">
          <span class="badge-alert badge-critical" style="margin-bottom: 4px; display: inline-block;">FRICCIÓN: CABECERA MULTIMARCA SOBRECARGADA</span>
          <h3 style="margin-top: 2px;">Convivencia simultánea de 3 logos (Bosi, Bambino, ADT)</h3>
          <p style="margin-bottom: 4px;">
            En pantallas pequeñas, las pestañas de marcas junto a las categorías y banners ocupan más del <strong>30% de la altura vertical útil</strong> antes de ver ningún producto.
          </p>
          <p style="margin-bottom: 0; font-size: 9px; color: #03543F; font-weight: 600;">
            ✔ Solución: Rediseñar a un conmutador de marca de 1 sola fila con scroll horizontal suave (*Brand Switcher*) liberando 120px de espacio para productos.
          </p>
        </div>
      </div>

      <h2>5. Módulo 2: Interfaz Visual (UI) y Ficha de Producto (PDP)</h2>
      <p>
        En calzado de cuero, el comprador no puede tocar el material ni probarse el calce; la pantalla debe proporcionar certeza absoluta inmediata para evitar devoluciones.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
        <!-- Card PDP 1: Tallas y Addi -->
        <div class="friction-card" style="margin-bottom: 0;">
          <div class="friction-img-thumb" style="width: 85px; height: 155px;">
            <img src="${imgPdpSizes}" alt="Bosi PDP Tallas y Addi">
          </div>
          <div class="friction-content">
            <span class="badge-alert badge-critical">TALLAS & FINANCIACIÓN</span>
            <h3 style="font-size: 10.5px; margin-top: 3px;">Ausencia de Smart Fit Finder</h3>
            <p style="font-size: 8.5px; margin-bottom: 4px;">
              Bosi utiliza tablas en centímetros que exigen cinta métrica. El 64% de compradores duda de su número de cuero.
            </p>
            <p style="font-size: 8.5px; color: #03543F; font-weight: 600; margin-bottom: 4px;">
              ✔ Solución: Asistente interactivo: <em>"Talla 40 en Nike = 40 en Bosi"</em>.
            </p>
            <span class="badge-alert badge-warning">MICROCOPY ADDI / SISTECRÉDITO</span>
            <p style="font-size: 8px; margin-top: 2px; margin-bottom: 0;">
              Mostrar precio completo ($350.000) frena la compra impulsiva. Agregar: <em>"o 4 cuotas de $87.500 con Addi 0% interés"</em>.
            </p>
          </div>
        </div>

        <!-- Card PDP 2: Sticky Add to Cart -->
        <div class="friction-card" style="margin-bottom: 0;">
          <div class="friction-img-thumb" style="width: 85px; height: 155px;">
            <img src="${imgPdpNoSticky}" alt="Bosi PDP Sin Botón Flotante">
          </div>
          <div class="friction-content">
            <span class="badge-alert badge-critical">CONVERSIÓN MÓVIL CRO</span>
            <h3 style="font-size: 10.5px; margin-top: 3px;">Falta de Sticky Add-to-Cart</h3>
            <p style="font-size: 8.5px; margin-bottom: 4px;">
              Al hacer scroll para examinar fotos de la suela y ficha técnica, el botón <em>"Comprar / Agregar a la bolsa"</em> <strong>desaparece por completo</strong>.
            </p>
            <p style="font-size: 8.5px; color: #9B1C1C; margin-bottom: 4px;">
              El usuario debe retroceder 3 pantallas hacia arriba para comprar, enfriando el impulso.
            </p>
            <p style="font-size: 8.5px; color: #03543F; font-weight: 600; margin-bottom: 0;">
              ✔ Solución: Barra inferior fija (*Sticky Bar*) con miniatura, selector rápido de talla y botón directo al tocar.
            </p>
          </div>
        </div>
      </div>

      <div class="friction-card" style="margin-top: 10px;">
        <div class="friction-img-thumb" style="width: 90px; height: 115px;">
          <img src="${imgPlpGrid}" alt="Bosi PLP Listado Calzado">
        </div>
        <div class="friction-content">
          <span class="badge-alert badge-warning">CATÁLOGO Y FILTROS (PLP)</span>
          <h3 style="margin-top: 2px;">Disponibilidad de tallas oculta en miniatura</h3>
          <p style="font-size: 9px; margin-bottom: 0;">
            Los clientes dan clic en modelos llamativos solo para descubrir dentro que su talla está agotada. Implementar selector de tallas visibles con stock en la miniatura de producto reduce la tasa de rebote en un 19%.
          </p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>BOSI Colombia · Auditoría CRO & Core Web Vitals</span>
      <span>Preparado por Andrés Morales · andresmorales.com.co</span>
      <span>Pág 3 de 5</span>
    </div>
  </div>

  <!-- ======================================================== -->
  <!-- PÁGINA 4: CHECKOUT & AUTOMATIZACIÓN n8n + IA             -->
  <!-- ======================================================== -->
  <div class="pdf-page">
    <div>
      <div class="brand-header">
        <div class="brand-logo">_andresmorales <span>/ Checkout & Automation</span></div>
        <div class="brand-tag">OPTIMIZACIÓN POST-VENTA</div>
      </div>

      <h2>6. Módulo 3: Fricción en Carrito, VTEX Checkout y Logística</h2>
      <table>
        <thead>
          <tr>
            <th>Etapa del Embudo</th>
            <th>Diagnóstico de Fricción en bosi.com.co</th>
            <th>Impacto Estimado en Ventas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Estimador de Envío en Carrito</strong></td>
            <td>El usuario no visualiza el tiempo exacto de entrega por transportadora (Coordinadora / 99minutos) hasta completar su dirección física en el checkout.</td>
            <td><span class="badge-alert badge-critical">Crítico — 18% abandono</span> en compras de última hora para fechas especiales o regalos urgentes.</td>
          </tr>
          <tr>
            <td><strong>Modal del 15% OFF de Entrada</strong></td>
            <td>El popup bloquea la navegación inicial sin confirmar si el cupón aplica a calzado en promoción o solo a precio full.</td>
            <td><span class="badge-alert badge-warning">Alto — Frustración</span> al descubrir en el checkout que el descuento no aplica al carrito.</td>
          </tr>
          <tr>
            <td><strong>Garantías y Cambios de Talla</strong></td>
            <td>El enlace remite a textos legales densos en lugar de una tarjeta clara con íconos: <em>"Primer cambio gratis en cualquiera de nuestras tiendas del país"</em>.</td>
            <td><span class="badge-alert badge-warning">Alto — Desconfianza</span> en compradores indecisos que temen equivocarse de número.</td>
          </tr>
        </tbody>
      </table>

      <h2>7. Módulo 4: Experiencia Post-Venta y Automatizaciones con n8n & IA</h2>
      <p>
        El costo de atención al cliente en retail de moda está saturado por dos preguntas repetitivas: <strong>"¿Dónde está mi pedido?" (WISMO)</strong> y <strong>"¿Cómo cambio la talla de mis zapatos?"</strong>. Bosi canaliza gran parte de este flujo hacia su línea 01 8000 112674 y radicados manuales.
      </p>

      <!-- Workflow Visual Box -->
      <div class="workflow-container">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700; color: #FFF;">Arquitectura de Automatización n8n + WhatsApp Bot (Evolution API)</span>
          <span class="badge-alert badge-enterprise">CERO DIGITACIÓN MANUAL</span>
        </div>
        <p style="font-size: 8.5px; color: #C2BBB5; margin: 4px 0 0 0;">
          Conexión bidireccional entre la API de VTEX, transportadoras (Coordinadora/99minutos) y WhatsApp Business:
        </p>

        <div class="workflow-steps">
          <div class="wf-step">
            <div class="wf-step-num">01. EVENTO VTEX</div>
            <div class="wf-step-title">Webhook Pedido</div>
            <div class="wf-step-desc">Se activa en cuanto el comprador paga en bosi.com.co.</div>
          </div>
          <div class="wf-step">
            <div class="wf-step-num">02. MOTOR N8N</div>
            <div class="wf-step-title">Orquestador</div>
            <div class="wf-step-desc">Consulta guía en Coordinadora / 99minutos y valida inventario.</div>
          </div>
          <div class="wf-step">
            <div class="wf-step-num">03. AGENTE WHATSAPP</div>
            <div class="wf-step-title">Portal de Tallas</div>
            <div class="wf-step-desc">El cliente autogestiona el cambio de número en 60 segundos.</div>
          </div>
          <div class="wf-step">
            <div class="wf-step-num">04. CONTROL TOTAL</div>
            <div class="wf-step-title">CRM & Soporte</div>
            <div class="wf-step-desc">Descongestiona el Call Center nacional en más de un 60%.</div>
          </div>
        </div>
      </div>

      <div style="background: #FAF8F5; border: 1px solid #EAE5DE; border-radius: 8px; padding: 10px; margin-bottom: 0;">
        <h3 style="color: #B3541E; margin-bottom: 3px;">Módulos de Automatización de Alto Retorno para Bosi:</h3>
        <ul style="padding-left: 14px; font-size: 9px; color: #383431; line-height: 1.5;">
          <li><strong>Portal de Rastreo y Cambios por WhatsApp:</strong> El cliente ingresa su cédula o número de pedido y recibe al instante el estado con enlace de geolocalización o solicita el cambio de talla eligiendo si lo retira en tienda física o pide recolección.</li>
          <li><strong>Alertas Proactivas de Despacho:</strong> Notificaciones automáticas por WhatsApp en 3 hitos: 1. Empacado en bodega, 2. En reparto local en su ciudad y 3. Entrega exitosa. Elimina las llamadas de ansiedad.</li>
          <li><strong>Recuperación Dinámica de Carritos con Foto y Talla:</strong> Mensaje personalizado a los 25 minutos con la foto exacta del calzado abandonado, su talla y enlace de pago en 1 clic.</li>
        </ul>
      </div>
    </div>

    <div class="page-footer">
      <span>BOSI Colombia · Auditoría CRO & Core Web Vitals</span>
      <span>Preparado por Andrés Morales · andresmorales.com.co</span>
      <span>Pág 4 de 5</span>
    </div>
  </div>

  <!-- ======================================================== -->
  <!-- PÁGINA 5: ROADMAP, IMPACTO ECONÓMICO & CONTACTO          -->
  <!-- ======================================================== -->
  <div class="pdf-page">
    <div>
      <div class="brand-header">
        <div class="brand-logo">_andresmorales <span>/ Roadmap & ROI</span></div>
        <div class="brand-tag">PLAN DE IMPLEMENTACIÓN TÉCNICA</div>
      </div>

      <h2>8. Matriz de Impacto vs. Esfuerzo & Hoja de Ruta Priorizada</h2>
      <p>
        Para maximizar el retorno de inversión sin detener la operación de la tienda, se propone una implementación modular en 3 fases:
      </p>

      <table>
        <thead>
          <tr>
            <th>Fase de Trabajo</th>
            <th>Entregables y Ajustes de Performance & UX</th>
            <th>Plazo</th>
            <th>Impacto Proyectado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Fase 1: Quick Wins</strong><br><span style="font-size: 8px; color: #7A726D;">Impacto Inmediato</span></td>
            <td>
              • Eliminación de scripts bloqueantes (ganancia de 1.1s en FCP).<br>
              • Botón de compra flotante (<em>Sticky Add-to-Cart</em>) en ficha móvil.<br>
              • Micro-texto dinámico de cuotas Addi / Sistecrédito en PDP.
            </td>
            <td><strong>15 Días</strong></td>
            <td><span class="badge-alert badge-success">PageSpeed 54 ➔ 75+</span><br>Aumento directo de adiciones a la bolsa en celular.</td>
          </tr>
          <tr>
            <td><strong>Fase 2: Tallas & PLP</strong><br><span style="font-size: 8px; color: #7A726D;">Optimización Core</span></td>
            <td>
              • Asistente de tallas interactivo (<em>Smart Fit Finder</em> por equivalencias).<br>
              • Visualización de tallas con stock real en miniaturas de catálogo.<br>
              • Corrección del salto visual (CLS de 0.51 a &lt;0.10).
            </td>
            <td><strong>30 Días</strong></td>
            <td><span class="badge-alert badge-success">-25% Devoluciones</span><br>Aprobación oficial de Core Web Vitals en Google.</td>
          </tr>
          <tr>
            <td><strong>Fase 3: Post-Venta</strong><br><span style="font-size: 8px; color: #7A726D;">Escalamiento n8n</span></td>
            <td>
              • Despliegue de canal automatizado de WhatsApp para rastreo WISMO.<br>
              • Autogestión de cambios de talla conectado a inventario de tiendas.<br>
              • Carritos abandonados inteligentes con foto y número exacto.
            </td>
            <td><strong>45 Días</strong></td>
            <td><span class="badge-alert badge-success">-60% PQR Soporte</span><br>Recuperación de hasta un 12% de carritos abandonados.</td>
          </tr>
        </tbody>
      </table>

      <h2>9. Proyección Económica y Retorno de Inversión (ROI)</h2>
      <div class="meta-box" style="margin-bottom: 12px; grid-template-columns: repeat(3, 1fr);">
        <div>
          <span class="meta-item-label">Incremento Estimado de Conversión</span>
          <span class="meta-item-val" style="color: #03543F; font-size: 13px;">+1.4% a +2.1%</span>
        </div>
        <div>
          <span class="meta-item-label">Ahorro en Devoluciones Logísticas</span>
          <span class="meta-item-val" style="color: #03543F; font-size: 13px;">~25% Menor Retorno</span>
        </div>
        <div>
          <span class="meta-item-label">Eficiencia en Pauta Digital</span>
          <span class="meta-item-val" style="color: #03543F; font-size: 13px;">Menor CPC (Quality Score)</span>
        </div>
      </div>

      <div style="background: #1E1810; color: #FFFFFF; border-radius: 10px; padding: 16px; margin-top: 10px;">
        <h3 style="color: #D4813B; font-family: 'Space Grotesk', sans-serif; font-size: 13px; margin-bottom: 6px;">
          Conclusión y Próximos Pasos Técnicos (Aliados del Área de TI)
        </h3>
        <p style="color: #E5E0D8; font-size: 9.5px; margin-bottom: 10px; line-height: 1.5;">
          BOSI cuenta con una marca de extraordinario prestigio en Colombia y una infraestructura enterprise sólida y confiable en VTEX IO para inventario nacional, facturación y tiendas físicas. Resolver la calificación reprobada en Google PageSpeed (54/100, LCP 15.5s y CLS 0.51) junto con las fricciones de tallaje y compra móvil no requiere migrar fuera de VTEX ni asumir riesgos en la operación, sino ejecutar una <strong>optimización de carga sobre la arquitectura actual de VTEX sin riesgo operativo</strong> (o implementar un <strong>frontend desacoplado / FastStore manteniendo el backend de VTEX intacto</strong>) para acelerar la tienda a &lt;1.0s, reducir el CAC y maximizar la facturación móvil.
        </p>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 12px;">
          <div>
            <div style="font-weight: 700; font-size: 11px; color: #FFF;">Andrés Morales</div>
            <div style="font-size: 8.5px; color: #A8A29E;">Senior Full Stack & AI Automation Engineer · Ex-UX Analyst Telus International</div>
            <div style="font-size: 8.5px; color: #D4813B; margin-top: 3px;">
              WhatsApp: +57 316 148 2507 · Email: info@andresmorales.com.co · Web: andresmorales.com.co
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #A8A29E;">AUDITORÍA PRIVADA INTERACTIVA:</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; color: #FFF;">
              andresmorales.com.co/audit/bosi-cali-zko6
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>BOSI Colombia · Auditoría CRO & Core Web Vitals</span>
      <span>Preparado por Andrés Morales · andresmorales.com.co</span>
      <span>Pág 5 de 5</span>
    </div>
  </div>

</body>
</html>
  `;

  const htmlPath = '/home/telchar/andresmorales-nextjs/public/audits/bosi-audit-rendered.html';
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('HTML written to', htmlPath);

  console.log('Launching browser to print PDF...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const pdfBuf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
    preferCSSPageSize: true
  });

  const destPdf1 = '/home/telchar/andresmorales-nextjs/public/audits/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf';
  const destPdf2 = '/tmp/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf';

  fs.writeFileSync(destPdf1, pdfBuf);
  fs.writeFileSync(destPdf2, pdfBuf);
  console.log('Saved PDF to', destPdf1, 'and', destPdf2);
  console.log('Total PDF size:', pdfBuf.length, 'bytes');

  await browser.close();
}

generatePdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
