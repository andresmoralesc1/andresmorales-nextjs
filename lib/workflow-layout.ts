// Workflow layout — turns raw n8n workflow JSON into positioned nodes
// for SVG rendering. Pure function, no React, no DOM.
//
// n8n workflow shape (from /api/v1/workflows/{id}):
//   {
//     nodes: [{ name, type, position: [x, y], ... }, ...],
//     connections: { [fromNodeName]: { [portName]: [[target, ...], ...] } }
//   }
//
// We use the n8n `position` field directly when present (it's an [x, y]
// with x in node-units, y in row-units, used by n8n's own canvas). This
// gives a layout that visually resembles the real n8n editor.

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
  overflow?: number;
}

const NODE_W = 180;
const NODE_H = 64;
const MAX_NODES = 12;

// n8n positions are in 200/100-unit grid (typical x=200 step, y=100 row).
// We scale to display pixels so the SVG viewBox is in a reasonable range.
const X_SCALE = 0.5;
const Y_SCALE = 0.5;
const Y_ROW_OFFSET = 0; // n8n's own y=0 is already a sensible "row 0"

const TRIGGER_RE = /trigger|webhook|cron|schedule|interval|start/i;
const BRANCH_RE = /if|switch|splitInBatches|merge|join/i;
const END_RE = /respondToWebhook|end|stopAndError/i;

function classifyKind(type: string): NodeKind {
  if (TRIGGER_RE.test(type)) return 'start';
  if (BRANCH_RE.test(type)) return 'branch';
  if (END_RE.test(type)) return 'end';
  // splitOut + IF output branches also land here; same visual.
  return 'action';
}

interface RawNode {
  name: string;
  type: string;
  position?: [number, number];
}

interface RawWorkflow {
  nodes: RawNode[];
  connections: Record<string, Record<string, unknown[]>>;
}

export function layoutWorkflow(wf: RawWorkflow): WorkflowLayout {
  const rawNodes = Array.isArray(wf.nodes) ? wf.nodes : [];
  const overflow = Math.max(0, rawNodes.length - MAX_NODES);
  const nodes = rawNodes.slice(0, MAX_NODES).map<PositionedNode>((n) => ({
    id: n.name,
    label: n.name,
    kind: classifyKind(n.type ?? ''),
    x: 0,
    y: 0,
  }));

  // Edges: connections[nodeName][portName] is an array of branches
  // (e.g. for IF: [trueBranch, falseBranch]), each branch is an array
  // of {node, type, index} targets. Flatten to {from, to} pairs.
  const edges: Edge[] = [];
  const conns = wf.connections ?? {};
  for (const [from, ports] of Object.entries(conns)) {
    if (!nodes.some((n) => n.id === from)) continue;
    for (const targets of Object.values(ports)) {
      const list = Array.isArray(targets) ? (targets as unknown[]) : [];
      for (const branch of list) {
        if (!Array.isArray(branch)) continue;
        for (const t of branch) {
          if (t && typeof t === 'object' && 'node' in (t as { node?: unknown })) {
            const to = (t as { node: string }).node;
            if (nodes.some((n) => n.id === to)) {
              edges.push({ from, to });
            }
          }
        }
      }
    }
  }

  // Use n8n's own positions when present. Fall back to BFS layout if any
  // node lacks a position.
  const haveAll = nodes.every((_, i) => Array.isArray(rawNodes[i].position));
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  if (haveAll) {
    for (let i = 0; i < nodes.length; i++) {
      const [x, y] = rawNodes[i].position!;
      nodes[i].x = x * X_SCALE;
      nodes[i].y = y * Y_SCALE + Y_ROW_OFFSET;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    // Normalize so min x = 0, min y = 0
    const offsetX = -minX * X_SCALE;
    const offsetY = -minY * Y_SCALE;
    for (const n of nodes) {
      n.x += offsetX;
      n.y += offsetY;
    }
  } else {
    // BFS fallback: depth-from-start + branch row
    const depths = new Map<string, number>();
    const rows = new Map<string, number>();
    const startNode = nodes.find((n) => n.kind === 'start') ?? nodes[0];
    if (startNode) {
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
    }
    const maxDepth = Math.max(0, ...Array.from(depths.values()));
    const maxRow = Math.max(0, ...Array.from(rows.values()));
    for (const n of nodes) {
      const depth = depths.get(n.id) ?? 0;
      const row = rows.get(n.id) ?? 0;
      const yOffset = (row - maxRow / 2) * 96;
      n.x = depth * 200;
      n.y = yOffset + 64;
    }
    minX = 0;
    maxX = maxDepth * 200;
    minY = 0;
    maxY = (maxRow + 1) * 96;
  }

  return {
    nodes,
    edges,
    width: (maxX - minX) * X_SCALE + NODE_W,
    height: (maxY - minY) * Y_SCALE + NODE_H,
    overflow,
  };
}
