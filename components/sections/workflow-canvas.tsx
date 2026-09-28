import type { WorkflowLayout, PositionedNode } from '@/lib/workflow-layout';

interface Callout {
  // Optional: if set, the callout is annotated with the actual n8n
  // node name it refers to (e.g. "Loop Over Events"). If absent, the
  // callout renders as a generic annotation. Used to keep i18n dict
  // entries simple — not every callout needs a nodeId.
  nodeId?: string;
  title: string;
  stat: string;
  body: string;
}

interface Props {
  eyebrow: string;
  heading: string;
  subtitle?: string;
  workflow: WorkflowLayout;
  callouts: Callout[];
  caption: string;
  captionLabel: string;
}

const NODE_W = 180;
const NODE_H = 64;

// SVG visual language:
//   start  → solid orange fill, dark text      (entry point)
//   branch → orange fill, dark text, ring       (decision / loop)
//   action → cream fill, dark text              (default)
//   merge  → orange fill (same as branch)
//   end    → dark fill, cream text               (terminal)
function nodeFill(kind: PositionedNode['kind']): string {
  if (kind === 'start' || kind === 'branch' || kind === 'merge') return '#f96e03';
  if (kind === 'end') return '#1E1810';
  return '#F8F5F4';
}
function nodeStroke(kind: PositionedNode['kind']): string {
  if (kind === 'branch') return '#ff5100';
  return 'transparent';
}
function nodeTextColor(kind: PositionedNode['kind']): string {
  if (kind === 'end') return '#F8F5F4';
  return '#1E1810';
}

export function WorkflowCanvas({
  eyebrow,
  heading,
  subtitle,
  workflow,
  callouts,
  caption,
  captionLabel,
}: Props) {
  // Pre-index by nodeId so the renderer can place a small marker
  // on the node each callout refers to.
  const nodeById = new Map(workflow.nodes.map((n) => [n.id, n]));

  return (
    <section className="section bg-primary" aria-labelledby="workflow-reality-check">
      <div className="container-page max-w-6xl">
        <p className="text-xs uppercase tracking-widest text-text mb-2 font-secondary font-bold">
          {eyebrow}
        </p>
        <h2
          id="workflow-reality-check"
          className="font-heading text-3xl md:text-4xl text-secondary mb-3 max-w-3xl"
        >
          {heading}
        </h2>
        {subtitle ? (
          <p className="text-text text-base md:text-lg max-w-2xl mb-8">{subtitle}</p>
        ) : (
          <div className="mb-8" />
        )}

        <div className="grid lg:grid-cols-[1.5fr,1fr] gap-6 lg:gap-10 items-start">
          {/* SVG canvas */}
          <div
            className="rounded-2xl border-2 border-theme-1 bg-theme-3 p-4 md:p-6 overflow-x-auto"
            role="img"
            aria-label={`Workflow diagram: ${workflow.nodes.length} nodes, ${workflow.edges.length} connections${workflow.overflow ? `, ${workflow.overflow} more truncated` : ''}`}
          >
            <svg
              viewBox={`0 0 ${workflow.width} ${workflow.height}`}
              className="w-full h-auto min-w-[640px]"
              role="presentation"
              preserveAspectRatio="xMidYMid meet"
            >
              <title>{caption}</title>
              {/* Edges first so nodes draw on top */}
              {workflow.edges.map((e, i) => {
                const from = nodeById.get(e.from);
                const to = nodeById.get(e.to);
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
                const fill = nodeFill(n.kind);
                const text = nodeTextColor(n.kind);
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y - NODE_H / 2})`}>
                    <rect
                      width={NODE_W}
                      height={NODE_H}
                      rx={8}
                      fill={fill}
                      stroke={nodeStroke(n.kind)}
                      strokeWidth={n.kind === 'branch' ? 2 : 0}
                    />
                    <text
                      x={NODE_W / 2}
                      y={NODE_H / 2 + 4}
                      textAnchor="middle"
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
            {workflow.overflow ? (
              <p className="mt-3 text-xs text-center uppercase tracking-widest text-theme-5/60 font-secondary">
                +{workflow.overflow} more node{workflow.overflow === 1 ? '' : 's'} (truncated)
              </p>
            ) : null}
          </div>

          {/* Callouts */}
          <div className="space-y-4">
            {callouts.map((c, i) => {
              const node = c.nodeId ? nodeById.get(c.nodeId) : undefined;
              return (
                <div
                  key={i}
                  // No left-border accent — that pattern is one of the
                  // clearest AI-generated UIs tells. The orange dot at
                  // the title and the cream `bg-theme-5` against the
                  // section bg carry the visual hierarchy.
                  className="rounded-xl border border-theme-9 bg-theme-5 p-4 md:p-5"
                >
                  <p className="text-xs uppercase tracking-widest text-text mb-1 font-secondary font-bold flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-theme-1" aria-hidden="true" />
                    {c.title}
                    {node ? (
                      <span className="text-text/60 normal-case font-body tracking-normal">
                        · {node.label}
                      </span>
                    ) : null}
                  </p>
                  <p className="font-heading text-secondary text-lg md:text-xl mb-1">
                    {c.stat}
                  </p>
                  <p className="text-text text-sm leading-relaxed">{c.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs uppercase tracking-widest text-text font-secondary">
          {captionLabel} · {caption}
        </p>
      </div>
    </section>
  );
}
