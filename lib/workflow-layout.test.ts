import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { layoutWorkflow } from './workflow-layout.ts';

describe('layoutWorkflow', () => {
  it('classifies scheduleTrigger as start', () => {
    const wf = {
      nodes: [
        { name: 'T', type: 'n8n-nodes-base.scheduleTrigger', position: [0, 0] },
      ],
      connections: {},
    };
    const out = layoutWorkflow(wf);
    assert.equal(out.nodes[0].kind, 'start');
  });

  it('classifies if/switch/splitInBatches as branch', () => {
    const cases = ['n8n-nodes-base.if', 'n8n-nodes-base.switch', 'n8n-nodes-base.splitInBatches'];
    for (const type of cases) {
      const wf = { nodes: [{ name: 'B', type, position: [0, 0] }], connections: {} };
      assert.equal(layoutWorkflow(wf).nodes[0].kind, 'branch', `expected branch for ${type}`);
    }
  });

  it('flattens nested connections array to {from, to} edges', () => {
    const wf = {
      nodes: [
        { name: 'A', type: 'n8n-nodes-base.start', position: [0, 0] },
        { name: 'B', type: 'n8n-nodes-base.if', position: [200, 0] },
        { name: 'C', type: 'n8n-nodes-base.httpRequest', position: [400, -100] },
        { name: 'D', type: 'n8n-nodes-base.httpRequest', position: [400, 100] },
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
    };
    const out = layoutWorkflow(wf);
    assert.equal(out.edges.length, 3);
    assert.ok(out.edges.some((e) => e.from === 'A' && e.to === 'B'));
    assert.ok(out.edges.some((e) => e.from === 'B' && e.to === 'C'));
    assert.ok(out.edges.some((e) => e.from === 'B' && e.to === 'D'));
  });

  it('drops edges pointing to nodes outside the rendered set (overflow cap)', () => {
    const wf = {
      nodes: [
        { name: 'A', type: 'n8n-nodes-base.start', position: [0, 0] },
        { name: 'B', type: 'n8n-nodes-base.noOp', position: [200, 0] },
      ],
      connections: {
        A: { main: [[{ node: 'Missing', type: 'main', index: 0 }]] },
      },
    };
    const out = layoutWorkflow(wf);
    assert.equal(out.edges.length, 0, 'edge to unknown node should be dropped');
  });

  it('caps rendered nodes at 12 + reports overflow', () => {
    const nodes = Array.from({ length: 15 }, (_, i) => ({
      name: `N${i}`,
      type: 'n8n-nodes-base.noOp',
      position: [i * 200, 0] as [number, number],
    }));
    const out = layoutWorkflow({ nodes, connections: {} });
    assert.equal(out.nodes.length, 12);
    assert.equal(out.overflow, 3);
  });

  it('uses n8n positions when present (scales by X_SCALE/Y_SCALE)', () => {
    const wf = {
      nodes: [
        { name: 'A', type: 'n8n-nodes-base.start', position: [0, 0] },
        { name: 'B', type: 'n8n-nodes-base.noOp', position: [400, 200] },
      ],
      connections: {},
    };
    const out = layoutWorkflow(wf);
    // 400 * 0.5 = 200, 200 * 0.5 = 100
    const b = out.nodes.find((n) => n.id === 'B')!;
    assert.equal(b.x, 200);
    assert.equal(b.y, 100);
  });

  it('normalizes so min x and min y are both 0', () => {
    const wf = {
      nodes: [
        { name: 'A', type: 'n8n-nodes-base.start', position: [200, 100] },
        { name: 'B', type: 'n8n-nodes-base.noOp', position: [400, 100] },
      ],
      connections: {},
    };
    const out = layoutWorkflow(wf);
    assert.equal(out.nodes[0].x, 0);
    assert.equal(out.nodes[0].y, 0);
  });

  it('falls back to BFS layout if any node lacks position', () => {
    const wf = {
      nodes: [
        { name: 'A', type: 'n8n-nodes-base.start' /* no position */ },
        { name: 'B', type: 'n8n-nodes-base.httpRequest' /* no position */ },
      ],
      connections: {
        A: { main: [[{ node: 'B', type: 'main', index: 0 }]] },
      },
    };
    const out = layoutWorkflow(wf);
    const a = out.nodes.find((n) => n.id === 'A')!;
    const b = out.nodes.find((n) => n.id === 'B')!;
    assert.equal(a.x, 0);
    assert.ok(b.x > a.x, 'B should be deeper than A');
  });
});
