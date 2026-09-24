import * as acorn from 'acorn';

export const ENGINE_NODE_ID = '__rules_engine__';

export interface GraphNode {
  id: string;
  label: string;
  kind: 'engine' | 'function' | 'orphan';
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface CallGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
}

const COL_WIDTH = 180;
const ROW_HEIGHT = 100;
const NODE_NON_TRAVERSABLE_KEYS = new Set(['start', 'end', 'loc', 'range', 'type']);

// acorn ships no walker of its own (that's the separate acorn-walk package) --
// this is a small generic AST walk: recurse into any object with a string
// `type` field, and into arrays, skipping position/metadata keys.
function findCalledNames(source: string, knownNames: Set<string>): Set<string> {
  const called = new Set<string>();
  let ast: acorn.Node;
  try {
    ast = acorn.parse(source, { ecmaVersion: 'latest' });
  } catch {
    return called; // mid-edit/invalid JS: treat as having no detected calls
  }

  const visit = (node: any): void => {
    if (!node || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node.type !== 'string') {
      return;
    }
    if (node.type === 'CallExpression' && node.callee?.type === 'Identifier') {
      const name = node.callee.name;
      if (knownNames.has(name)) {
        called.add(name);
      }
    }
    for (const key of Object.keys(node)) {
      if (!NODE_NON_TRAVERSABLE_KEYS.has(key)) {
        visit(node[key]);
      }
    }
  };
  visit(ast);
  return called;
}

export function buildCallGraph(functions: Record<string, string>): CallGraph {
  const names = Object.keys(functions);
  const knownNames = new Set(names);

  const callsOf = new Map<string, Set<string>>();
  names.forEach((name) => callsOf.set(name, findCalledNames(functions[name], knownNames)));

  const igniteName = names.find((n) => n === 'ignite');
  const factsNames = names.filter((n) => /^create.*FactsFromRoot$/.test(n));

  // BFS layering: facts-builders at 0, engine at 1 (added separately below),
  // ignite forced to 2, then outward through detected calls. A node keeps
  // whichever layer it's first reached at, so cycles/re-visits just add an
  // edge without moving or duplicating the box.
  const layerOf = new Map<string, number>();
  const queue: string[] = [];
  factsNames.forEach((n) => {
    layerOf.set(n, 0);
    queue.push(n);
  });
  if (igniteName) {
    layerOf.set(igniteName, 2);
    queue.push(igniteName);
  }
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const currentLayer = layerOf.get(current)!;
    (callsOf.get(current) || new Set()).forEach((callee) => {
      if (!layerOf.has(callee)) {
        layerOf.set(callee, currentLayer + 1);
        queue.push(callee);
      }
    });
  }

  const unconnected = names.filter((n) => !layerOf.has(n));
  const maxAssignedLayer = Math.max(2, ...Array.from(layerOf.values()));
  const unconnectedLayer = maxAssignedLayer + 1;
  unconnected.forEach((n) => layerOf.set(n, unconnectedLayer));

  const byLayer = new Map<number, string[]>();
  const addToLayer = (id: string, layer: number) => {
    if (!byLayer.has(layer)) {
      byLayer.set(layer, []);
    }
    byLayer.get(layer)!.push(id);
  };
  addToLayer(ENGINE_NODE_ID, 1);
  layerOf.forEach((layer, id) => addToLayer(id, layer));

  const sortedLayers = Array.from(byLayer.keys()).sort((a, b) => a - b);
  const maxCols = Math.max(...sortedLayers.map((l) => byLayer.get(l)!.length));
  const totalWidth = maxCols * COL_WIDTH;

  const nodes: GraphNode[] = [];
  sortedLayers.forEach((layer) => {
    const ids = byLayer.get(layer)!;
    const rowWidth = ids.length * COL_WIDTH;
    const offset = (totalWidth - rowWidth) / 2;
    ids.forEach((id, col) => {
      const isEngine = id === ENGINE_NODE_ID;
      nodes.push({
        id,
        label: isEngine ? 'Rules Engine' : id,
        kind: isEngine ? 'engine' : unconnected.includes(id) ? 'orphan' : 'function',
        x: offset + col * COL_WIDTH + COL_WIDTH / 2,
        y: layer * ROW_HEIGHT + ROW_HEIGHT / 2,
      });
    });
  });

  const edges: GraphEdge[] = [];
  factsNames.forEach((n) => edges.push({ from: n, to: ENGINE_NODE_ID }));
  if (igniteName) {
    edges.push({ from: ENGINE_NODE_ID, to: igniteName });
  }
  names.forEach((name) => {
    (callsOf.get(name) || new Set()).forEach((callee) => edges.push({ from: name, to: callee }));
  });

  return {
    nodes,
    edges,
    width: totalWidth,
    height: (sortedLayers.length ? sortedLayers[sortedLayers.length - 1] + 1 : 1) * ROW_HEIGHT,
  };
}
