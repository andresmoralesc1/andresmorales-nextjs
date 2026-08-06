// generate.ts — Asks the LLM to write a Spanish draft and translate it to
// EN and PT. Each output is a complete Markdown file with frontmatter,
// ready to save into `content/blog/drafts/<slug>.<lang>.md`.
//
// Few-shot examples are taken from the 3 existing published posts in
// `content/blog/`. We extract a short excerpt from each so the LLM can
// match the tone (direct, technical but accessible, second person, lots
// of concrete examples with numbers).

import { callLLM } from './llm.js';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { SelectedStory } from './select.js';

export interface DraftFrontmatter {
  title: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  tags: string[];
  author: string;
  slug: string;
  coverImage?: string;
  coverImageCredit?: string;
  coverImageAlt?: string;
  draft: true;
  source: string;
  sourceTitle: string;
  generatedBy: 'news-pipeline-v1';
}

export interface Draft {
  frontmatter: DraftFrontmatter;
  body: string; // Markdown body, no frontmatter
}

const CONTENT_DIR = join(process.cwd(), 'content', 'blog');

function readFewShotExcerpt(locale: 'es' | 'en' | 'pt', maxWords = 250): string {
  const candidates = [
    `automatizar-con-ia-colombia.es.md`,
    `n8n-ai-automation.en.md`,
    `automacao-ia-pme-brasil.pt.md`,
  ];
  const file = join(CONTENT_DIR, candidates.find((c) => c.endsWith(`.${locale}.md`))!);
  if (!existsSync(file)) return '';
  const raw = readFileSync(file, 'utf-8');
  const m = /^---\n[\s\S]*?\n---\n([\s\S]*)$/.exec(raw);
  if (!m) return '';
  const body = m[1].trim();
  const words = body.split(/\s+/).slice(0, maxWords).join(' ');
  return words;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

interface GenerationOutput {
  title: string;
  description: string;
  tags: string[];
  body: string; // markdown body
}

async function generateInLocale(
  locale: 'es' | 'en' | 'pt',
  story: SelectedStory,
  fewShot: string,
): Promise<GenerationOutput> {
  const langName = { es: 'Spanish (LATAM)', en: 'English', pt: 'Brazilian Portuguese' }[locale];

  const system = `Eres un escritor fantasma para Andrés Morales, consultor colombiano de IA para PYMEs. Andrés escribe posts de blog en 3 idiomas (es, en, pt). Tu trabajo: producir un post de OPINIÓN sobre una noticia reciente de IA, en ${langName}.

TONO Y ESTILO (sé fiel a esto, lee el ejemplo):
- Directo, segunda persona ("tú" o "you" o "você"), sin rodeos.
- Técnico pero accesible. Asume que el lector sabe qué es un LLM pero no necesariamente qué es RAG o un agente.
- Concreto: números, ejemplos, casos. Sin frases vacías como "en el mundo actual" o "es importante destacar".
- Frases cortas. Párrafos de 2-4 líneas máximo.
- Encabezados claros (H2, H3). Listas cuando sumen. Negritas solo para términos clave, no para frases completas.
- Sin exagerar. Si la noticia es hype, decirlo. Si es real, decirlo también.
- Nunca inventes datos. Si dudas, marca con "(verificar)" y Andrés lo revisará.
- Cierra con una conclusión accionable, no con un resumen.
- 800-1200 palabras en el cuerpo.

FORMATO DE SALIDA (JSON estricto, sin markdown fences):
{
  "title": "string (max 90 chars, estilo periodístico con ángulo LATAM/negocios)",
  "description": "string (max 200 chars, para SEO meta description)",
  "tags": ["tag1", "tag2", "tag3"],
  "body": "markdown body, sin frontmatter, empieza directo con párrafo introductorio"
}`;

  const userMsg = `Noticia seleccionada (relevancia: ${story.relevanceScore}/10):
- Título original: ${story.item.title}
- Fuente: ${story.item.source}
- URL: ${story.item.link}
- Resumen: ${story.item.summary}
- Razón de relevancia: ${story.reasoning}

EJEMPLO DEL TONO DE ANDRÉS (en ${langName}, primeras ${fewShot.split(/\s+/).length} palabras de un post real):

---
${fewShot}
---

Tu tarea: escribe un post de OPINIÓN en ${langName} sobre esta noticia. El ángulo debe ser: "¿qué significa esto para una PYME en LATAM que está empezando a adoptar IA?" No resumas la noticia — Andrés ya la leyó. Aporta perspectiva, contexto local, y al final una recomendación accionable.

NO menciones a Andrés por nombre en tercera persona (él es la voz). NO empieces con "En este post...", "Hoy vamos a...", etc.`;

  const raw = await callLLM({
    system,
    messages: [{ role: 'user', content: userMsg }],
    maxTokens: 4096,
    temperature: 0.8,
  });

  const json = raw
    .replace(/^```(?:json)?/m, '')
    .replace(/```$/m, '')
    .trim();
  let parsed: GenerationOutput;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    throw new Error(
      `LLM returned invalid JSON for ${locale}: ${raw.slice(0, 300)} (${(err as Error).message})`,
    );
  }

  if (!parsed.title || !parsed.body || !parsed.description) {
    throw new Error(`LLM returned incomplete post for ${locale}: missing fields.`);
  }

  return parsed;
}

export async function generateDrafts(
  story: SelectedStory,
): Promise<{ es: Draft; en: Draft; pt: Draft; slug: string }> {
  const fewShotEs = readFewShotExcerpt('es', 250);
  // First, generate in Spanish (primary language).
  const es = await generateInLocale('es', story, fewShotEs);
  const slug = slugify(es.title);

  // Use the ES title as anchor so all 3 versions share the same slug.
  const fewShotEn = readFewShotExcerpt('en', 250);
  const fewShotPt = readFewShotExcerpt('pt', 250);

  // For EN/PT we pass the ES body as reference so translations stay
  // faithful to the same arguments and structure (instead of letting
  // the LLM drift into a different angle per language).
  const storyWithEsBody = { ...story };
  const en = await translateFromEs(storyWithEsBody, fewShotEn, es, 'en');
  const pt = await translateFromEs(storyWithEsBody, fewShotPt, es, 'pt');

  const today = new Date().toISOString().slice(0, 10);
  const baseFm: Omit<DraftFrontmatter, 'coverImage' | 'coverImageAlt'> = {
    title: '',
    description: '',
    date: today,
    tags: [],
    author: 'Andrés Morales',
    slug,
    draft: true,
    source: story.item.link,
    sourceTitle: story.item.source,
    generatedBy: 'news-pipeline-v1',
  };

  return {
    slug,
    es: { frontmatter: { ...baseFm, ...pickFm(es) }, body: es.body },
    en: { frontmatter: { ...baseFm, ...pickFm(en) }, body: en.body },
    pt: { frontmatter: { ...baseFm, ...pickFm(pt) }, body: pt.body },
  };
}

async function translateFromEs(
  story: SelectedStory,
  fewShot: string,
  esOriginal: GenerationOutput,
  target: 'en' | 'pt',
): Promise<GenerationOutput> {
  const langName = { en: 'English', pt: 'Brazilian Portuguese' }[target];

  const system = `Eres un traductor-editor para el blog de Andrés Morales. Tu trabajo: traducir un post de opinión del ESPAÑOL al ${langName}, manteniendo el mismo tono, estructura, ejemplos, y opinión. No suavices, no añadas disclaimers, no reescribas — traduce con la misma convicción.

TONO Y ESTILO (sé fiel, lee el ejemplo en ${langName}):

---
${fewShot}
---

FORMATO (JSON estricto):
{
  "title": "string (título traducido)",
  "description": "string (descripción traducida)",
  "tags": ["tag1", "tag2", "tag3"] (traducidos si aplica),
  "body": "markdown body traducido"
}`;

  const userMsg = `Noticia original:
- Título: ${story.item.title}
- Fuente: ${story.item.source}
- Link: ${story.item.link}

POST ORIGINAL EN ESPAÑOL:

---
${esOriginal.body}
---

Ahora tradúcelo a ${langName}, fiel al contenido y al tono.`;

  const raw = await callLLM({
    system,
    messages: [{ role: 'user', content: userMsg }],
    maxTokens: 4096,
    temperature: 0.7,
  });

  const json = raw
    .replace(/^```(?:json)?/m, '')
    .replace(/```$/m, '')
    .trim();
  return JSON.parse(json);
}

function pickFm(g: GenerationOutput): Partial<DraftFrontmatter> {
  return {
    title: g.title,
    description: g.description,
    tags: g.tags,
  };
}

export function serializeDraft(draft: Draft, cover?: {
  path: string;
  credit: string;
  alt: string;
}): string {
  const fm: DraftFrontmatter = {
    ...draft.frontmatter,
    ...(cover
      ? {
          coverImage: cover.path,
          coverImageCredit: cover.credit,
          coverImageAlt: cover.alt,
        }
      : {}),
  };
  const yamlLines = [
    '---',
    `title: "${fm.title.replace(/"/g, '\\"')}"`,
    `description: "${fm.description.replace(/"/g, '\\"')}"`,
    `date: ${fm.date}`,
    `tags: [${fm.tags.map((t) => `"${t}"`).join(', ')}]`,
    `author: "${fm.author}"`,
    `slug: ${fm.slug}`,
  ];
  if (fm.coverImage) yamlLines.push(`coverImage: ${fm.coverImage}`);
  if (fm.coverImageCredit) yamlLines.push(`coverImageCredit: "${fm.coverImageCredit}"`);
  if (fm.coverImageAlt) yamlLines.push(`coverImageAlt: "${fm.coverImageAlt}"`);
  yamlLines.push('draft: true');
  yamlLines.push(`source: ${fm.source}`);
  yamlLines.push(`sourceTitle: "${fm.sourceTitle}"`);
  yamlLines.push('generatedBy: news-pipeline-v1');
  yamlLines.push('---', '');

  return yamlLines.join('\n') + draft.body.trim() + '\n';
}