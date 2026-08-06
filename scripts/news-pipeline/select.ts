// select.ts — Asks the LLM to pick the single most relevant item from
// the candidate list, scored 1-10. If score < 7, we abort the run to
// avoid publishing low-quality posts.

import { callLLM } from './llm.js';
import type { NewsItem } from './fetch-rss.js';

export interface SelectedStory {
  item: NewsItem;
  relevanceScore: number;
  reasoning: string;
}

const SYSTEM = `Eres un asistente editorial para el portafolio de Andrés Morales (andresmorales.com.co), un consultor colombiano que ayuda a PYMEs en Latinoamérica a automatizar operaciones con IA (workflows en n8n, agentes, herramientas internas).

Tu trabajo: dada una lista de noticias recientes de IA, elegir LA MÁS relevante para los lectores de Andrés (fundadores y operadores de PYMEs en Colombia/LATAM que están evaluando adoptar IA en su negocio). Piensa en: ¿esta noticia cambiaría una decisión que un dueño de PYME va a tomar este mes? ¿O es solo ruido de Silicon Valley sin impacto local?

Responde ÚNICAMENTE con JSON válido con este formato:
{
  "index": <número 1-based del ganador>,
  "relevance_score": <1-10>,
  "reasoning": "<por qué este item es el más relevante para lectores LATAM/negocios, máximo 2 frases>"
}`;

export async function selectMostRelevant(
  candidates: NewsItem[],
): Promise<SelectedStory | null> {
  if (candidates.length === 0) {
    console.log('[select] No candidates to choose from. Aborting.');
    return null;
  }

  const list = candidates
    .map(
      (c, i) =>
        `${i + 1}. [${c.source}] ${c.title}\n   ${c.summary.slice(0, 200)}\n   Link: ${c.link}`,
    )
    .join('\n\n');

  const raw = await callLLM({
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Estas son las ${candidates.length} noticias más relevantes de la semana en IA. Elige UNA sola:\n\n${list}`,
      },
    ],
    maxTokens: 500,
    temperature: 0.3, // Lower temperature = more deterministic selection.
  });

  // Parse JSON. Strip markdown fences if present.
  const json = raw
    .replace(/^```(?:json)?/m, '')
    .replace(/```$/m, '')
    .trim();
  let parsed: { index: number; relevance_score: number; reasoning: string };
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    console.error(
      '[select] LLM returned invalid JSON:',
      raw.slice(0, 300),
      (err as Error).message,
    );
    return null;
  }

  const idx = parsed.index - 1;
  if (idx < 0 || idx >= candidates.length) {
    console.error(`[select] LLM returned out-of-range index ${parsed.index}.`);
    return null;
  }

  const score = parsed.relevance_score;
  if (score < 7) {
    console.log(
      `[select] Selected story scored ${score}/10 — below threshold (7). Skipping this week.`,
    );
    return null;
  }

  console.log(
    `[select] Picked: "${candidates[idx].title}" (${score}/10). Reasoning: ${parsed.reasoning}`,
  );

  return {
    item: candidates[idx],
    relevanceScore: score,
    reasoning: parsed.reasoning,
  };
}