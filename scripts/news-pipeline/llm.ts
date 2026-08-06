// llm.ts — MiniMax-M3 (alias "eLk-M3") client for the news pipeline.
//
// Reads the API key from env (`MINIMAX_API_KEY`) first, then falls back to
// `~/.hermes/auth.json` so the cron job can call the LLM even when the
// env var isn't exported into the shell.
//
// The API is Anthropic-compatible (POST /v1/messages), so we send a plain
// `messages` payload. Returns the assistant text.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const BASE_URL = 'https://api.minimax.io/anthropic';
const MODEL = 'eLk-M3';
const API_VERSION = '2023-06-01';

interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LLMOptions {
  system?: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
}

function loadApiKey(): string {
  // 1. Direct env var.
  if (process.env.MINIMAX_API_KEY) return process.env.MINIMAX_API_KEY;
  // 2. credential_pool in ~/.hermes/auth.json (where Hermes stores it).
  try {
    const authPath = join(homedir(), '.hermes', 'auth.json');
    const raw = readFileSync(authPath, 'utf-8');
    const parsed = JSON.parse(raw) as {
      credential_pool?: Record<string, Array<{ access_token?: string }>>;
    };
    const pool = parsed.credential_pool?.minimax ?? [];
    for (const entry of pool) {
      if (entry.access_token) return entry.access_token;
    }
  } catch {
    /* ignore — fall through to error */
  }
  throw new Error(
    'MINIMAX_API_KEY not found in env or ~/.hermes/auth.json. ' +
      'Cannot call LLM. Aborting.',
  );
}

export async function callLLM(options: LLMOptions): Promise<string> {
  const apiKey = loadApiKey();
  const body = {
    model: MODEL,
    max_tokens: options.maxTokens ?? 2048,
    temperature: options.temperature ?? 0.7,
    ...(options.system ? { system: options.system } : {}),
    messages: options.messages,
  };

  const res = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `LLM call failed: ${res.status} ${res.statusText} — ${text.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = (data.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('');
  if (!text) {
    throw new Error('LLM returned an empty response.');
  }
  return text.trim();
}