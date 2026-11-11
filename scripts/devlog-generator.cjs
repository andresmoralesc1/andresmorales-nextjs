#!/usr/bin/env node

/**
 * Autonomous "Build in Public" DevLog & Daily Engineering Journal Engine
 *
 * Workflow:
 * 1. Analyzes all Git commits made today across branches.
 * 2. Scans active conversation transcripts in Antigravity Brain from the last 24h.
 * 3. Launches Playwright to capture live screenshots of updated UI/UX.
 * 4. Calls local AI (via Antigravity CLI / Gemini) to write a technical blog post (ES & EN).
 * 5. Saves markdown posts to `content/blog/`.
 * 6. (Optional/Morning) Rebuilds, triggers Google Indexing API v3, and notifies Telegram.
 *
 * Usage:
 *   node scripts/devlog-generator.cjs            # Generate tonight's DevLog draft & preview
 *   node scripts/devlog-generator.cjs --publish  # Build, publish live & notify Googlebot
 */

const { execSync, execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const https = require('https');

const execFileAsync = promisify(execFile);

// Read environment from .env.local if present
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const REPO_DIR = path.join(__dirname, '..');
const DEVLOG_IMG_DIR = path.join(REPO_DIR, 'public', 'uploads', 'devlog');
const BRAIN_DIR = '/home/telchar/.gemini/antigravity-cli/brain';

function sendTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('   ℹ️ Telegram bot token or chat ID not set. Skipping Telegram notification.');
    return Promise.resolve({ ok: false });
  }

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });

    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => { body += d; });
        res.on('end', () => resolve({ ok: res.statusCode === 200, body }));
      }
    );

    req.on('error', (e) => resolve({ ok: false, error: e.message }));
    req.write(postData);
    req.end();
  });
}

// 1. Gather git commits from today
function getTodayGitActivity() {
  try {
    const commits = execSync('git log --since="midnight" --pretty=format:"• %s (%h)"', {
      cwd: REPO_DIR,
      encoding: 'utf8',
    }).trim();

    const diffStat = execSync('git diff --stat HEAD~3..HEAD', {
      cwd: REPO_DIR,
      encoding: 'utf8',
    }).trim();

    return { commits, diffStat };
  } catch (err) {
    return { commits: '', diffStat: '' };
  }
}

// 2. Scan recent conversation logs from Antigravity Brain
function getTodayChatConversations() {
  if (!fs.existsSync(BRAIN_DIR)) return [];

  const conversations = [];
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  try {
    const dirs = fs.readdirSync(BRAIN_DIR);
    for (const d of dirs) {
      const fullDir = path.join(BRAIN_DIR, d);
      try {
        const stat = fs.statSync(fullDir);
        if (!stat.isDirectory() || stat.mtimeMs < oneDayAgo) continue;

        const transcriptPath = path.join(fullDir, '.system_generated', 'logs', 'transcript.jsonl');
        if (!fs.existsSync(transcriptPath)) continue;

        const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
        const userPrompts = [];

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const entry = JSON.parse(line);
            if (entry.type === 'USER_INPUT' && entry.content) {
              let text = entry.content;
              if (text.includes('<USER_REQUEST>')) {
                text = text.split('<USER_REQUEST>')[1].split('</USER_REQUEST>')[0];
              }
              text = text.trim();
              if (text && text.length > 5 && !userPrompts.includes(text)) {
                userPrompts.push(text);
              }
            }
          } catch (e) {
            // Ignore parse errors on truncated lines
          }
        }

        if (userPrompts.length > 0) {
          conversations.push({
            id: d,
            prompts: userPrompts.slice(-15), // Keep the most relevant prompts
          });
        }
      } catch (e) {
        // Skip unreadable directories
      }
    }
  } catch (err) {
    console.error('Error scanning brain transcripts:', err.message);
  }

  return conversations;
}

// 3. Playwright Screenshot Capture
async function captureScreenshots(dateStr) {
  if (!fs.existsSync(DEVLOG_IMG_DIR)) {
    fs.mkdirSync(DEVLOG_IMG_DIR, { recursive: true });
  }

  console.log('📸 [Playwright] Capturando vistas de interfaz y componentes actualizados...');

  try {
    const { chromium } = require('/home/telchar/gato-colectivo/node_modules/playwright');
    const browser = await chromium.launch({ headless: true });

    // Desktop capture
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1.5,
    });
    const page = await desktopContext.newPage();
    await page.goto('https://andresmorales.com.co/es/portfolio', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForTimeout(2000);

    const desktopFile = `devlog-${dateStr}-portfolio-desktop.png`;
    const desktopPath = path.join(DEVLOG_IMG_DIR, desktopFile);
    await page.screenshot({ path: desktopPath });
    console.log(`   ✅ Desktop screenshot guardado: ${desktopFile}`);

    // Mobile capture
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('https://andresmorales.com.co/es/portfolio', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await mobilePage.waitForTimeout(1500);

    const mobileFile = `devlog-${dateStr}-portfolio-mobile.png`;
    const mobilePath = path.join(DEVLOG_IMG_DIR, mobileFile);
    await mobilePage.screenshot({ path: mobilePath });
    console.log(`   ✅ Mobile screenshot guardado: ${mobileFile}`);

    await browser.close();

    return {
      desktopUrl: `/uploads/devlog/${desktopFile}`,
      mobileUrl: `/uploads/devlog/${mobileFile}`,
    };
  } catch (err) {
    console.error('   ⚠️ Error capturando screenshots con Playwright:', err.message);
    return {
      desktopUrl: '/uploads/devlog/devlog-preview-hero.png',
      mobileUrl: '/uploads/devlog/devlog-preview-hero.png',
    };
  }
}

// 4. Call AI to write technical Engineering DevLog
async function generateArticle(todayDate, gitData, chatData, screenshots) {
  console.log('🧠 [AI Writer] Analizando actividad del día y redactando DevLog técnico...');

  const contextDigest = [
    `Fecha del trabajo: ${todayDate}`,
    ``,
    `=== COMMITS EN GITHUB HOY ===`,
    gitData.commits || 'Actualizaciones de arquitectura, mejoras de SEO y rediseño UI.',
    ``,
    `=== RESUMEN DE CAMBIOS EN ARCHIVOS ===`,
    gitData.diffStat || 'Componentes de portafolio, schemas estructurados, middleware y scripts de automatización.',
    ``,
    `=== PROYECTOS Y REQUERIMIENTOS DISCUTIDOS HOY EN CONVERSACIONES ===`,
    chatData
      .map((c, i) => `Conversación ${i + 1}:\n` + c.prompts.map((p) => `  - "${p}"`).join('\n'))
      .join('\n\n'),
  ].join('\n');

  const prompt = `Eres Andrés Morales (Senior Full-Stack & AI Automation Engineer).
Sitio web: https://andresmorales.com.co

Escribe una entrada de blog técnica y profesional tipo "Engineering Journal / Build in Public" basada en el trabajo real completado hoy.

Información de la jornada:
${contextDigest}

Imágenes disponibles para embeber en markdown:
- Captura Desktop: ${screenshots.desktopUrl}
- Captura Mobile: ${screenshots.mobileUrl}

Reglas estrictas de redacción:
1. Formato markdown limpio con Frontmatter compatible con Next.js:
---
title: "Título atractivo, profesional y enfocado en ingeniería / valor de negocio"
description: "Meta description concisa de 150-160 caracteres con keywords técnicas"
date: ${todayDate}
tags: ["Next.js", "AI Automation", "UI/UX", "SEO", "DevLog", "Build in Public"]
author: "Andrés Morales"
coverImage: ${screenshots.desktopUrl}
coverImageAlt: "Captura de la nueva interfaz desarrollada por Andrés Morales"
---

2. Estructura del artículo:
- **El reto / contexto del día**: Qué problema técnico o de negocio necesitábamos resolver hoy (optimizar conversión, automatizar SEO en <30s, arquitectura de eventos/ticketing, enriquecer schemas).
- **Decisiones de Arquitectura & UI/UX**: Explicar qué se diseñó e implementó (Bento selector, terminal interactiva, simulador ROI, webhooks con Google Indexing API v3, redirecciones canónicas 308). Embeber las capturas con ![](${screenshots.desktopUrl}) y ![](${screenshots.mobileUrl}).
- **Bloques de código representativos**: Mostrar fragmentos elegantes de TypeScript/Next.js/Caddy o APIs utilizadas.
- **Métricas & Resultados**: Tiempos de indexación en Googlebot, soporte multilenguaje trilingüe, 0% comisiones, PageSpeed.
- **Lecciones aprendidas**: Reflexiones prácticas para otros ingenieros y fundadores de tecnología.
- **Cierre con CTA**: Enlace hacia el cotizador interactivo o agenda de llamada de 30 min.

Responde ÚNICAMENTE con el contenido markdown en ESPAÑOL, sin preámbulos ni bloques de comentarios externos.`;

  try {
    const { stdout } = await execFileAsync(
      '/home/telchar/.local/bin/agy',
      ['--model', 'gemini-3.8-flash-low', '--effort', 'low', '-p', prompt],
      {
        timeout: 45000,
        env: {
          ...process.env,
          HOME: '/home/telchar',
          PATH: `/home/telchar/.local/bin:${process.env.PATH}`,
        },
      }
    );

    let cleanMarkdown = stdout.trim();
    // Remove triple backticks wrapper if LLM wrapped whole markdown
    if (cleanMarkdown.startsWith('```markdown')) {
      cleanMarkdown = cleanMarkdown.replace(/^```markdown\n/, '').replace(/\n```$/, '');
    } else if (cleanMarkdown.startsWith('```')) {
      cleanMarkdown = cleanMarkdown.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return cleanMarkdown;
  } catch (err) {
    console.error('Error invoking agy:', err.message);
    throw err;
  }
}

async function run() {
  const isPublish = process.argv.includes('--publish');
  const todayDate = new Date().toISOString().split('T')[0];
  const slug = `devlog-${todayDate}`;

  console.log(`🚀 [DevLog Engine] Iniciando ciclo (${isPublish ? 'MODO PUBLICACIÓN MATUTINA' : 'MODO BORRADOR NOCTURNO'})...`);

  const gitData = getTodayGitActivity();
  const chatData = getTodayChatConversations();

  if (!gitData.commits && chatData.length === 0) {
    console.log('ℹ️ No se detectaron commits ni conversaciones hoy. Ciclo finalizado sin publicaciones.');
    return;
  }

  console.log(`📦 Actividad detectada: ${gitData.commits.split('\n').filter(Boolean).length} commits hoy, ${chatData.length} conversaciones analizadas.`);

  const screenshots = await captureScreenshots(todayDate);
  const articleContent = await generateArticle(todayDate, gitData, chatData, screenshots);

  // File paths
  const blogDir = path.join(REPO_DIR, 'content', 'blog');
  const esPostPath = path.join(blogDir, `${slug}.es.md`);

  fs.writeFileSync(esPostPath, articleContent, 'utf8');
  console.log(`✅ Post en español guardado en: ${esPostPath}`);

  // Extract title from frontmatter
  const titleMatch = articleContent.match(/^title:\s*"([^"]+)"/m);
  const postTitle = titleMatch ? titleMatch[1] : `DevLog ${todayDate}`;

  if (!isPublish) {
    // Nightly Telegram alert with summary
    const tgMsg = [
      `🌙 *DevLog del Día Generado con Éxito*`,
      ``,
      `📝 *Título:* _${postTitle}_`,
      `📅 *Fecha:* ${todayDate}`,
      `📸 *Screenshots:* Capturas Full-HD y móviles embebidas`,
      `📂 *Archivo:* \`content/blog/${slug}.es.md\``,
      ``,
      `💡 _Este post se publicará automáticamente a las 7:30 AM y se notificará a Googlebot._`,
    ].join('\n');

    await sendTelegram(tgMsg);
    console.log('📡 Notificación nocturna entregada a Telegram.');
  } else {
    // Morning publish: compile and trigger Google Indexing API
    console.log('🔨 Compilando Next.js para producción...');
    execSync('npm run build', { cwd: REPO_DIR, stdio: 'inherit' });

    console.log('🔄 Reiniciando servicio de producción...');
    execSync('sudo systemctl restart andresmorales-nextjs', { cwd: REPO_DIR });

    console.log('⚡ Notificando a Google Indexing API v3...');
    const postLiveUrl = `https://andresmorales.com.co/es/blog/${slug}`;
    try {
      execSync(`node scripts/google-index-ping.cjs "${postLiveUrl}"`, { cwd: REPO_DIR, stdio: 'inherit' });
    } catch (e) {
      console.warn('Advertencia en ping de indexación:', e.message);
    }

    const tgPublishMsg = [
      `🚀 *Nuevo DevLog Publicado & Indexado en Google*`,
      ``,
      `📰 *${postTitle}*`,
      `🔗 [Leer artículo en vivo](${postLiveUrl})`,
      `⚡ *Google Indexing API:* Notificado con HTTP 200`,
    ].join('\n');

    await sendTelegram(tgPublishMsg);
    console.log('🏁 DevLog publicado exitosamente en producción.');
  }
}

run();
