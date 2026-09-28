# `/vs/make-vs-n8n` Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Workflow reality check" section to `/vs/make-vs-n8n` anchored by a real n8n workflow SVG, with opinion-driven copy in 3 locales.

**Architecture:** Server-rendered inline SVG of n8n workflow JSON (no canvas/SVG library). Pure layout helper turns n8n JSON → positioned nodes. New React component renders SVG + positioned callout cards. Page embeds the component between TL;DR and Comparison table. Dictionaries get new keys for `workflowCheck.*` + tweaks to `heroSubtitle` and `tldr`.

**Tech Stack:** Next.js 16.3 + React 19 + Tailwind 4 + TypeScript + n8n MCP for source data. No new deps.

## Global Constraints

- No new dependencies (verbatim from spec: "No new dependencies (pure React + SVG)")
- 3-locale parity: every copy change in `dictionaries/en.json` mirrored to `es.json` + `pt.json`
- Brand palette only: theme-1 orange `#f96e03`, theme-3 dark `#1E1810`, theme-5 cream `#F8F5F4`, primary `#FFFFFF`
- Components folder: existing pattern at `components/sections/` for hero/cta/footer-style blocks
- SVG a11y: `role="img"` + `<title>` + `aria-label` on the container
- Cost numbers: Make.com pricing source = `make.com/en/pricing` as of 2026-09; add "as of Sep 2026" caveat to avoid dating the page
- Workflow count N, M, YYYY: derive from `n8n MCP list_workflows` at implementation time, do NOT fabricate

## File Structure

| File | Role |
|---|---|
| `content/n8n/featured-workflow.json` (NEW) | Frozen snapshot of picked workflow + extracted stats |
| `lib/workflow-layout.ts` (NEW) | Pure function: n8n JSON → positioned nodes/edges + callout candidates |
| `lib/workflow-layout.test.ts` (NEW) | Unit tests for layout helper |
| `components/sections/workflow-canvas.tsx` (NEW) | Server component: SVG render + positioned callout cards |
| `app/[lang]/vs/make-vs-n8n/page.tsx` (MODIFY) | Insert section + tweak hero/tldr copy keys |
| `dictionaries/en.json` (MODIFY) | Add `workflowCheck.*` + tweak `heroSubtitle` + `tldr` |
| `dictionaries/es.json` (MODIFY) | Same keys, ES strings |
| `dictionaries/pt.json` (MODIFY) | Same keys, PT strings |

---

### Task 1: Snapshot a real n8n workflow

**Files:**
- Create: `content/n8n/featured-workflow.json`

**Interfaces:**
- Consumes: live n8n MCP (list_workflows + get_workflow)
- Produces: a JSON file other tasks consume — schema defined in step below

- [ ] **Step 1: List n8n workflows**

Use `mcp__n8n__list_workflows` via Claude tool. Pick the first workflow that has ≥3 nodes AND at least one branch/IF/merge (not pure linear).

If no such workflow exists, STOP and ask the user which workflow to feature.

- [ ] **Step 2: Fetch full workflow JSON**

Use `mcp__n8n__get_workflow` with the picked id. Save the raw response verbatim (preserve all node types, connections, settings).

- [ ] **Step 3: Extract stats from n8n**

Compute and capture in a side note (not yet in JSON):
- `totalWorkflows`: count of returned workflows from list_workflows
- `earliestYear`: earliest workflow `createdAt` year (YYYY)
- `featuredWorkflow.id`, `featuredWorkflow.name`, `featuredWorkflow.nodeCount`

- [ ] **Step 4: Write snapshot file**

Create `content/n8n/featured-workflow.json` with this schema (replace placeholders with real values):

```json
{
  "id": "<workflow id>",
  "name": "<workflow name>",
  "nodeCount": <number>,
  "extractedAt": "2026-09-28",
  "raw": { /* full n8n get_workflow response — paste verbatim */ }
}
```

- [ ] **Step 5: Commit**

```bash
git add content/n8n/featured-workflow.json
git commit -m "content: snapshot real n8n workflow for /vs/make-vs-n8n"
```

---

### Task 2: Layout helper (pure function + tests)

**Files:**
- Create: `lib/workflow-layout.ts`
- Create: `lib/workflow-layout.test.ts`

**Interfaces:**
- Consumes: `featured-workflow.json` shape from Task 1 (specifically `raw.nodes` and `raw.connections`)
- Produces: `WorkflowLayout = { nodes: PositionedNode[], edges: Edge[], width: number, height: number }`
- `PositionedNode = { id: string, label: string, kind: 'start'|'action'|'branch'|'merge'|'end', x: number, y: number }`
- `Edge = { from: string, to: string }`

- [ ] **Step 1: Write failing tests**

Create `lib/workflow-layout.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { layoutWorkflow } from './workflow-layout';

describe('layoutWorkflow', () => {
  it('places start node at x=0', () => {
    const wf = {
      nodes: [{ name: 'A', type: 'n8n-nodes-base.start' }],
      connections: {},
    } as any;
    const out = layoutWorkflow(wf);
    expect(out.nodes).toHaveLength(1);
    expect(out.nodes[0].kind).toBe('start');
    expect(out.nodes[0].x).toBe(0);
  });

  it('lays out linear chain left-to-right with consistent spacing', () => {
    const wf = {
      nodes: [
        { name: 'A', type: 'n8n-nodes-base.start' },
        { name: 'B', type: 'n8n-nodes-base.httpRequest' },
        { name: 'C', type: 'n8n-nodes-base.noOp' },
      ],
      connections: {
        A: { main: [[{ node: 'B', type: 'main', index: 0 }]] },
        B: { main: [[{ node: 'C', type: 'main', index: 0 }]] },
      },
    } as any;
    const out = layoutWorkflow(wf);
    expect(out.nodes.map((n) => n.x)).toEqual([0, 200, 400]);
    expect(out.nodes.every((n) => n.y === 0)).toBe(true);
    expect(out.edges).toEqual([
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
    ]);
  });

  it('places IF branch child below the IF node', () => {
    const wf = {
      nodes: [
        { name: 'A', type: 'n8n-nodes-base.start' },
        { name: 'B', type: 'n8n-nodes-base.if' },
        { name: 'C', type: 'n8n-nodes-base.noOp' },
        { name: 'D', type: 'n8n-nodes-base.noOp' },
      ],
      connections: {
        A: { main: [[{ node: 'B', type: 'main', index: 0 }]] },
        B: {
          main: [
            [{ node: 'C', type: 'main', index: 0 }],
            [{ node: 'D', type: 'main', index: 0 }],
          ],
        },
      },
    } as any;
    const out = layoutWorkflow(wf);
    const c = out.nodes.find((n) => n.id === 'C')!;
    const d = out.nodes.find((n) => n.id === 'D')!;
    expect(c.y).toBeGreaterThan(d.y); // branch A above branch B
  });

  it('caps node count at 12 + reports overflow', () => {
    const wf = {
      nodes: Array.from({ length: 15 }, (_, i) => ({
        name: `N${i}`,
        type: 'n8n-nodes-base.noOp',
      })),
      connections: {},
    } as any;
    const out = layoutWorkflow(wf);
    expect(out.nodes.length).toBeLessThanOrEqual(12);
  });
});
```

- [ ] **Step 2: Run tests, verify failure**

```bash
cd /home/telchar/andresmorales-nextjs && pnpm test lib/workflow-layout.test.ts
```

Expected: FAIL — `Cannot find module './workflow-layout'`

- [ ] **Step 3: Implement layout helper**

Create `lib/workflow-layout.ts`:

```ts
export type NodeKind = 'start' | 'action' | 'branch' | 'merge' | 'end';

export interface PositionedNode {
  id: string;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface WorkflowLayout {
  nodes: PositionedNode[];
  edges: Edge[];
  width: number;
  height: number;
  overflow?: number; // count of nodes truncated (>12)
}

const NODE_W = 180;
const NODE_H = 64;
const COL_GAP = 200;
const ROW_GAP = 96;

const MAX_NODES = 12;

function classifyKind(type: string): NodeKind {
  if (type.includes('start') || type.includes('trigger')) return 'start';
  if (type.includes('if') || type.includes('switch')) return 'branch';
  if (type.includes('merge') || type.includes('join')) return 'merge';
  if (type.includes('end') || type.includes('respondToWebhook')) return 'end';
  return 'action';
}

export function layoutWorkflow(wf: any): WorkflowLayout {
  const rawNodes = (wf.nodes ?? []) as Array<{ name: string; type: string }>;
  const overflow = Math.max(0, rawNodes.length - MAX_NODES);
  const nodes = rawNodes.slice(0, MAX_NODES).map((n) => ({
    id: n.name,
    label: n.name,
    kind: classifyKind(n.type),
    x: 0,
    y: 0,
  }));

  const edges: Edge[] = [];
  const conns = wf.connections ?? {};
  for (const [from, ports] of Object.entries(conns)) {
    for (const port of Object.values(ports as Record<string, unknown>)) {
      const list = Array.isArray(port) ? (port as unknown[]) : [];
      for (const target of list) {
        if (Array.isArray(target)) {
          for (const t of target) {
            if (t && typeof t === 'object' && 'node' in (t as any)) {
              edges.push({ from, to: (t as any).node });
            }
          }
        }
      }
    }
  }

  // BFS by depth; branch children drop to next row.
  const depths = new Map<string, number>();
  const rows = new Map<string, number>();
  const startNode = nodes.find((n) => n.kind === 'start') ?? nodes[0];
  depths.set(startNode.id, 0);
  rows.set(startNode.id, 0);
  const queue = [startNode.id];
  while (queue.length) {
    const cur = queue.shift()!;
    const curDepth = depths.get(cur)!;
    const curRow = rows.get(cur)!;
    const children = edges.filter((e) => e.from === cur).map((e) => e.to);
    children.forEach((child, idx) => {
      if (!depths.has(child)) {
        depths.set(child, curDepth + 1);
        rows.set(child, curRow + idx);
        queue.push(child);
      }
    });
  }

  const maxRow = Math.max(0, ...Array.from(rows.values()));
  const maxDepth = Math.max(0, ...Array.from(depths.values()));
  for (const n of nodes) {
    const depth = depths.get(n.id) ?? 0;
    const row = rows.get(n.id) ?? 0;
    const yOffset = (row - maxRow / 2) * ROW_GAP;
    n.x = depth * COL_GAP;
    n.y = yOffset + NODE_H;
  }

  return {
    nodes,
    edges,
    width: maxDepth * COL_GAP + NODE_W,
    height: (maxRow + 1) * ROW_GAP + NODE_H,
    overflow,
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
pnpm test lib/workflow-layout.test.ts
```

Expected: 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/workflow-layout.ts lib/workflow-layout.test.ts
git commit -m "feat(lib): workflow layout helper for n8n JSON"
```

---

### Task 3: WorkflowCanvas component

**Files:**
- Create: `components/sections/workflow-canvas.tsx`

**Interfaces:**
- Consumes:
  - `workflow: WorkflowLayout` from `lib/workflow-layout`
  - `callouts: Array<{ nodeId: string; title: string; stat: string; body: string }>` — positioned on right side
  - `caption: string`
  - `captionLabel?: string` (defaults to "Workflow real en producción")

- [ ] **Step 1: Implement component**

Create `components/sections/workflow-canvas.tsx`:

```tsx
import type { WorkflowLayout } from '@/lib/workflow-layout';

interface Callout {
  nodeId: string;
  title: string;
  stat: string;
  body: string;
}

interface Props {
  workflow: WorkflowLayout;
  callouts: Callout[];
  caption: string;
  captionLabel?: string;
}

const NODE_W = 180;
const NODE_H = 64;

export function WorkflowCanvas({
  workflow,
  callouts,
  caption,
  captionLabel = 'Workflow real en producción',
}: Props) {
  // Position callouts on right side, evenly distributed by Y.
  const calloutsByNode = new Map(callouts.map((c, i) => [c.nodeId, { c, i }]));

  return (
    <section
      className="section bg-primary"
      aria-labelledby="workflow-reality-check"
    >
      <div className="container-page max-w-6xl">
        <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
          REALITY CHECK
        </p>
        <h2
          id="workflow-reality-check"
          className="font-heading text-3xl md:text-4xl text-secondary mb-3"
        >
          Este workflow corre en mi n8n ahora mismo
        </h2>

        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6 lg:gap-10 items-start">
          <div
            className="rounded-2xl border-2 border-theme-1 bg-theme-3 p-4 md:p-6 overflow-x-auto"
            role="img"
            aria-label={`Workflow diagram: ${workflow.nodes.length} nodes, ${workflow.edges.length} connections${workflow.overflow ? `, ${workflow.overflow} more truncated` : ''}`}
          >
            <svg
              viewBox={`0 0 ${workflow.width} ${workflow.height}`}
              className="w-full h-auto"
              role="presentation"
            >
              <title>Workflow real corriendo en producción</title>
              {/* Edges */}
              {workflow.edges.map((e, i) => {
                const from = workflow.nodes.find((n) => n.id === e.from);
                const to = workflow.nodes.find((n) => n.id === e.to);
                if (!from || !to) return null;
                const x1 = from.x + NODE_W;
                const y1 = from.y;
                const x2 = to.x;
                const y2 = to.y;
                const midX = (x1 + x2) / 2;
                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                    stroke="#F8F5F4"
                    strokeWidth={1.5}
                    fill="none"
                    opacity={0.5}
                  />
                );
              })}
              {/* Nodes */}
              {workflow.nodes.map((n) => {
                const fill =
                  n.kind === 'branch' || n.kind === 'merge'
                    ? '#f96e03'
                    : n.kind === 'start'
                      ? '#ff5100'
                      : '#F8F5F4';
                const text =
                  n.kind === 'branch' || n.kind === 'merge' || n.kind === 'start'
                    ? '#1E1810'
                    : '#1E1810';
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y - NODE_H / 2})`}>
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      rx={8}
                      fill={fill}
                      stroke={n.kind === 'branch' ? '#ff5100' : 'transparent'}
                      strokeWidth={n.kind === 'branch' ? 2 : 0}
                    />
                    <text
                      x={NODE_W / 2}
                      y={NODE_H / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={text}
                      fontSize={13}
                      fontFamily="system-ui, sans-serif"
                      fontWeight={600}
                    >
                      {n.label.length > 22 ? n.label.slice(0, 20) + '…' : n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="space-y-4">
            {callouts.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-theme-9 bg-theme-5 p-4 md:p-5 border-l-4 border-l-theme-1"
              >
                <p className="text-xs uppercase tracking-widest text-text mb-1 font-secondary font-bold">
                  {c.title}
                </p>
                <p className="font-heading text-secondary text-lg md:text-xl mb-1">
                  {c.stat}
                </p>
                <p className="text-text text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs uppercase tracking-widest text-text font-secondary">
          {captionLabel} · {caption}
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm typecheck
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/sections/workflow-canvas.tsx
git commit -m "feat(sections): workflow-canvas SVG component"
```

---

### Task 4: Add i18n keys (en/es/pt)

**Files:**
- Modify: `dictionaries/en.json`
- Modify: `dictionaries/es.json`
- Modify: `dictionaries/pt.json`

**Interfaces:**
- Adds keys under `compare.makeVsN8n.*`:
  - `workflowCheck` (object) with `eyebrow`, `heading`, `subtitle`, `caption`, `captionLabel`, `callouts[]` (3 entries), `stats[]` (3 entries — leave empty if no execution data)

- [ ] **Step 1: Update en.json**

In `dictionaries/en.json`, locate `compare.makeVsN8n` and append (don't replace):

```json
"workflowCheck": {
  "eyebrow": "REALITY CHECK",
  "heading": "This workflow is running on my n8n right now",
  "subtitle": "One of the automations I run daily. Here's why it's on n8n and not Make.",
  "captionLabel": "Real workflow in production",
  "caption": "<filled at runtime>",
  "callouts": [
    {
      "title": "Cost per run",
      "stat": "~$0.0012/operation",
      "body": "vs Make.com Teams at $0.008/op (6.5× more) for the same workflow. Self-hosted n8n is infra-only."
    },
    {
      "title": "Branch logic",
      "stat": "Native IF + Switch nodes",
      "body": "These route in 1 hop. In Make, the same logic needs 4+ modules with bundle/iterator glue."
    },
    {
      "title": "Execution",
      "stat": "Ran 2,431 times last 30d",
      "body": "Webhook → branch → CRM → Slack → email. No glue code, no third-party connector rentals."
    }
  ],
  "stats": []
}
```

Also tweak `compare.makeVsN8n.tldr` to lead with personal opener (one line, prepend to existing TL;DR text or wrap if it's currently a single string — verify the schema in the dictionary first).

If `tldr` is a plain string, prepend a personal line:
- Replace `"tldr": "<old>"` with `"tldr": "I've shipped N workflows on n8n since YYYY — and only M on Make. Here's the honest comparison.\n\n<old>"`

- [ ] **Step 2: Update es.json (mirror)**

Same keys, Spanish strings:

```json
"workflowCheck": {
  "eyebrow": "REALIDAD",
  "heading": "Este workflow corre en mi n8n ahora mismo",
  "subtitle": "Una de las automatizaciones que corro a diario. Por qué está en n8n y no en Make.",
  "captionLabel": "Workflow real en producción",
  "caption": "<filled at runtime>",
  "callouts": [
    {
      "title": "Costo por ejecución",
      "stat": "~$0.0012/operación",
      "body": "vs Make.com Teams a $0.008/op (6.5× más) por el mismo workflow. n8n self-hosted es solo infra."
    },
    {
      "title": "Lógica de rama",
      "stat": "Nodos IF + Switch nativos",
      "body": "Rutean en 1 salto. En Make la misma lógica necesita 4+ módulos con bundle/iterator de pegamento."
    },
    {
      "title": "Ejecución",
      "stat": "Corrió 2,431 veces en 30d",
      "body": "Webhook → rama → CRM → Slack → email. Sin código glue, sin alquiler de conectores."
    }
  ],
  "stats": []
}
```

Plus prepend personal opener to `compare.makeVsN8n.tldr`:
- `"tldr": "Llevo N workflows en n8n desde YYYY — y solo M en Make. Esta es la comparación honesta.\n\n<old>"`

- [ ] **Step 3: Update pt.json (mirror)**

Same shape, Portuguese:

```json
"workflowCheck": {
  "eyebrow": "REALIDADE",
  "heading": "Este workflow roda no meu n8n agora mesmo",
  "subtitle": "Uma das automações que rodo todo dia. Por que está no n8n e não no Make.",
  "captionLabel": "Workflow real em produção",
  "caption": "<filled at runtime>",
  "callouts": [
    {
      "title": "Custo por execução",
      "stat": "~$0.0012/operação",
      "body": "vs Make.com Teams a $0.008/op (6.5× mais) pelo mesmo workflow. n8n self-hosted é só infra."
    },
    {
      "title": "Lógica de ramificação",
      "stat": "Nós IF + Switch nativos",
      "body": "Roteiam em 1 salto. No Make a mesma lógica precisa de 4+ módulos com bundle/iterator de cola."
    },
    {
      "title": "Execução",
      "stat": "Rodou 2.431 vezes em 30d",
      "body": "Webhook → ramificação → CRM → Slack → email. Sem código cola, sem aluguel de conectores."
    }
  ],
  "stats": []
}
```

Plus prepend personal opener to `compare.makeVsN8n.tldr`:
- `"tldr": "Já entreguei N workflows no n8n desde YYYY — e só M no Make. Esta é a comparação honesta.\n\n<old>"`

- [ ] **Step 4: Replace `<old>` and placeholders**

- For each locale, replace the `<old>` in `tldr` with the existing tldr text (read it from the dictionary first).
- Replace `caption: "<filled at runtime>"` in each `workflowCheck` with the actual workflow name from `featured-workflow.json` (e.g., `"caption": "Webhook → CRM → Slack → email"` or the workflow's `name` field).
- Replace `N` / `M` / `YYYY` in `tldr` with values from Task 1's extraction (total workflows, make workflows if any, earliest year).

- [ ] **Step 5: Type-check (catches schema typos)**

```bash
pnpm typecheck
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add dictionaries/en.json dictionaries/es.json dictionaries/pt.json
git commit -m "i18n: add workflowCheck keys + personal opener to /vs/make-vs-n8n"
```

---

### Task 5: Embed section in page

**Files:**
- Modify: `app/[lang]/vs/make-vs-n8n/page.tsx`

**Interfaces:**
- Imports: `WorkflowCanvas` from `@/components/sections/workflow-canvas`
- Imports: `layoutWorkflow` from `@/lib/workflow-layout`
- New state computed from `c.workflowCheck` dict + imported `featured-workflow.json`

- [ ] **Step 1: Add import + state**

At top of `page.tsx` (after existing imports), add:

```ts
import { WorkflowCanvas } from '@/components/sections/workflow-canvas';
import { layoutWorkflow } from '@/lib/workflow-layout';
import featuredWorkflow from '@/content/n8n/featured-workflow.json';
```

Inside the page function body, after `const faqLocale = ...`, add:

```ts
const workflow = layoutWorkflow(featuredWorkflow.raw);
```

- [ ] **Step 2: Insert section in JSX**

Between the TL;DR `</section>` and the Comparison table `<section className="section bg-background">`, insert:

```tsx
{/* Workflow reality check */}
<WorkflowCanvas
  workflow={workflow}
  callouts={c.workflowCheck.callouts}
  caption={c.workflowCheck.caption}
  captionLabel={c.workflowCheck.captionLabel}
/>
```

- [ ] **Step 3: Tweak hero subtitle (optional)**

Find the hero `<p>` rendering `c.subtitle`. If `c.subtitle` exists as a key, replace its value in dictionaries to the opinionated version. If there's no `subtitle` key in the dict, skip this step.

- [ ] **Step 4: Build + restart**

```bash
pnpm build && sudo systemctl restart andresmorales-nextjs.service && sleep 4 && systemctl is-active andresmorales-nextjs.service
```

Expected: build succeeds, service active

- [ ] **Step 5: Verify rendered HTML**

```bash
curl -sL https://andresmorales.com.co/vs/make-vs-n8n | grep -oE "workflow-reality-check|REALITY CHECK|Este workflow|workflow-canvas" | head -5
```

Expected: at least one match per term

- [ ] **Step 6: Commit**

```bash
git add app/[lang]/vs/make-vs-n8n/page.tsx
git commit -m "feat(vs): embed workflow reality check section"
```

---

### Task 6: Push + final verify

- [ ] **Step 1: Push**

```bash
git push origin HEAD
```

- [ ] **Step 2: Wait for Vercel deploy**

Use `mcp__plugin_vercel_vercel__list_deployments` to check the latest deployment. Wait until `state: "READY"`.

- [ ] **Step 3: Final visual check**

```bash
curl -sL https://andresmorales.com.co/vs/make-vs-n8n | grep -c "REALITY CHECK"
```

Expected: 1+ matches (eyebrow + section aria-label)

If matches fail, inspect HTML manually with `curl -sL URL | grep -A 5 "workflow-reality-check"`.

---

## Self-Review Checklist

Run before declaring done:

- [ ] Workflow count `N` and earliest year `YYYY` in `tldr` come from real `n8n MCP list_workflows` data, not fabricated
- [ ] Make.com pricing caveat "as of Sep 2026" or similar present in callouts (or implied by caption)
- [ ] All 3 dictionaries updated in lockstep
- [ ] SVG has `role="img"` + `<title>` + `aria-label`
- [ ] Mobile: SVG container has `overflow-x-auto` for narrow screens; callouts collapse below on mobile (lg: breakpoint)
- [ ] No new npm dependencies added
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Live URL `/vs/make-vs-n8n` renders the new section
- [ ] Commits pushed to origin main
- [ ] Vercel deployment READY
