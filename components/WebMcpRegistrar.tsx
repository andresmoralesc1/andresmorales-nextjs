'use client';

import { useEffect } from 'react';

/**
 * WebMCP tool registrar — registers 3 tools on `document.modelContext` so
 * AI agents (Chrome's built-in agent, third-party assistants) can submit
 * the contact form, the project brief wizard, and surface the calendar
 * booking link. Mounted once in the root layout; no UI of its own.
 *
 * Graceful no-op when `document.modelContext` is undefined (browsers
 * without WebMCP support, or SSR). The tools are still discoverable via
 * /ai-catalog.json in that case.
 */

type ToolExecute = (args: Record<string, unknown>) => Promise<unknown>;

interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: ToolExecute;
}

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: WebMcpTool) => void;
      unregisterTool?: (name: string) => void;
    };
  }
}

const CALENDAR_BOOKING_URL = 'https://calendar.app.google/QvUUb5xu4927P95a8';

const tools: WebMcpTool[] = [
  {
    name: 'submit_contact',
    description:
      'Send a short contact message to Andrés. Use for quick questions or general inquiries. Requires the visitor\'s name, email, and message.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string', format: 'email' },
        message: { type: 'string', minLength: 10, maxLength: 2000 },
      },
      required: ['name', 'email', 'message'],
      additionalProperties: false,
    },
    execute: async (args) => {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
          `contact submit failed (${res.status})`,
        );
      }
      return { ok: true, status: res.status };
    },
  },
  {
    name: 'submit_brief',
    description:
      'Submit a structured project brief (5 steps: about-you, project type, problem, goal, logistics). Use when the visitor wants to scope a paid engagement — web, automation, AI integration, consulting, or other.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string', format: 'email' },
        company: { type: 'string', maxLength: 200 },
        role: { type: 'string', maxLength: 200 },
        projectType: {
          type: 'string',
          enum: ['web', 'automation', 'ai-integration', 'consulting', 'other'],
        },
        projectTypeOther: { type: 'string', maxLength: 200 },
        problem: { type: 'string', minLength: 20, maxLength: 4000 },
        tools: { type: 'array', items: { type: 'string' }, minItems: 1 },
        frequency: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'one-off', 'ad-hoc'],
        },
        goal: { type: 'string', minLength: 20, maxLength: 4000 },
        successMetric: { type: 'string', maxLength: 1000 },
        budget: {
          type: 'string',
          enum: ['under2k', '2to5k', '5to15k', '15to50k', 'over50k'],
        },
        timeline: {
          type: 'string',
          enum: ['asap', '1month', '1to3months', 'over3months', 'flexible'],
        },
        additionalNotes: { type: 'string', maxLength: 4000 },
        lang: { type: 'string', enum: ['en', 'es', 'pt'] },
      },
      required: [
        'name',
        'email',
        'projectType',
        'problem',
        'tools',
        'frequency',
        'goal',
        'budget',
        'timeline',
      ],
      additionalProperties: false,
    },
    execute: async (args) => {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (json && typeof json === 'object' && 'error' in json && String(json.error)) ||
          `brief submit failed (${res.status})`,
        );
      }
      return { ok: true, status: res.status };
    },
  },
  {
    name: 'schedule_call',
    description:
      'Returns the booking URL for a free 30-minute strategy call with Andrés. Opens in a new tab; no authentication required.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    execute: async () => ({ url: CALENDAR_BOOKING_URL }),
  },
];

export function WebMcpRegistrar() {
  useEffect(() => {
    const mc = typeof document !== 'undefined' ? document.modelContext : undefined;
    if (!mc || typeof mc.registerTool !== 'function') return;
    const registered: string[] = [];
    for (const t of tools) {
      try {
        mc.registerTool(t);
        registered.push(t.name);
      } catch (err) {
        // Tool already registered (HMR / double-mount) — ignore.
        if (err && /already registered/i.test(String(err))) continue;
        // Other errors: surface in dev so we don't ship a broken registrar.
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn('[WebMCP] registerTool failed', t.name, err);
        }
      }
    }
    return () => {
      if (mc.unregisterTool) {
        for (const name of registered) {
          try { mc.unregisterTool(name); } catch {}
        }
      }
    };
  }, []);
  return null;
}
