import { edges, nodes, regions } from "./data";
import type { LegendEdge, LegendNode } from "./types";

export const LABEL_WIDTH = 170;
export const CARD_WIDTH = 224;
export const CARD_HEIGHT = 80;
export const ROW_HEIGHT = 88;
export const TIMELINE_HEIGHT = 80;

// Expand recent centuries to accommodate cards. Dates remain continuous and
// ordered; the UI explicitly labels this as a non-uniform time scale.
export const timelineTicks = [
  { year: -500, label: "公元前 500", x: 240 },
  { year: 0, label: "公元 1", x: 460 },
  { year: 500, label: "500", x: 680 },
  { year: 1000, label: "1000", x: 900 },
  { year: 1500, label: "1500", x: 1450 },
  { year: 1800, label: "1800", x: 1780 },
  { year: 1900, label: "1900", x: 1940 },
  { year: 1980, label: "1980", x: 2160 },
  { year: 2000, label: "2000", x: 2640 },
  { year: 2050, label: "2050", x: 3000 },
];

export function yearToX(year: number) {
  const found = timelineTicks.findIndex((tick) => tick.year >= year);
  const index = found < 0 ? timelineTicks.length - 2 : Math.max(0, found - 1);
  const start = timelineTicks[index];
  const end = timelineTicks[index + 1];
  return start.x + ((year - start.year) / (end.year - start.year)) * (end.x - start.x);
}

let regionY = TIMELINE_HEIGHT;
export const regionLayouts = regions.map((region) => {
  const rows = Math.max(0, ...nodes.filter((node) => node.region === region.id).map((node) => node.row)) + 1;
  const layout = { ...region, y: regionY, height: rows * ROW_HEIGHT + 16, rows };
  regionY += layout.height;
  return layout;
});
export const CANVAS_WIDTH = 3280;
export const CANVAS_HEIGHT = regionY;
export const nodeById = new Map(nodes.map((node) => [node.id, node]));

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };

export function nodeToPoint(node: LegendNode): Point {
  const region = regionLayouts.find((item) => item.id === node.region);
  if (!region) throw new Error(`Unknown region: ${node.region}`);
  return { x: yearToX(node.year), y: region.y + 8 + CARD_HEIGHT / 2 + node.row * ROW_HEIGHT };
}

export function nodeToRect(node: LegendNode): Rect {
  const point = nodeToPoint(node);
  return { x: point.x, y: point.y - CARD_HEIGHT / 2, width: CARD_WIDTH, height: CARD_HEIGHT };
}

export function segmentIntersectsRect(start: Point, end: Point, rect: Rect) {
  if (start.y === end.y) {
    return start.y > rect.y && start.y < rect.y + rect.height &&
      Math.max(start.x, end.x) > rect.x && Math.min(start.x, end.x) < rect.x + rect.width;
  }
  if (start.x === end.x) {
    return start.x > rect.x && start.x < rect.x + rect.width &&
      Math.max(start.y, end.y) > rect.y && Math.min(start.y, end.y) < rect.y + rect.height;
  }
  throw new Error("Graph routes must use horizontal or vertical segments");
}

function simplifyPoints(points: Point[]) {
  const distinct = points.filter((point, index) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y);
  return distinct.filter((point, index) => {
    if (index === 0 || index === distinct.length - 1) return true;
    const previous = distinct[index - 1];
    const next = distinct[index + 1];
    return !((previous.x === point.x && point.x === next.x) || (previous.y === point.y && point.y === next.y));
  });
}

export function roundedPath(points: Point[]) {
  const clean = simplifyPoints(points);
  const format = (point: Point) => `${Number(point.x.toFixed(2))} ${Number(point.y.toFixed(2))}`;
  let path = `M ${format(clean[0])}`;
  for (let index = 1; index < clean.length - 1; index++) {
    const previous = clean[index - 1];
    const corner = clean[index];
    const next = clean[index + 1];
    const radius = Math.min(16, Math.hypot(corner.x - previous.x, corner.y - previous.y) / 2, Math.hypot(next.x - corner.x, next.y - corner.y) / 2);
    const approach = { x: corner.x + Math.sign(previous.x - corner.x) * radius, y: corner.y + Math.sign(previous.y - corner.y) * radius };
    const depart = { x: corner.x + Math.sign(next.x - corner.x) * radius, y: corner.y + Math.sign(next.y - corner.y) * radius };
    path += ` L ${format(approach)} Q ${format(corner)} ${format(depart)}`;
  }
  return `${path} L ${format(clean[clean.length - 1])}`;
}

function routeAroundCards(start: Point, end: Point, obstacles: Rect[], preferredX: number): Point[] {
  const direct = simplifyPoints([start, { x: preferredX, y: start.y }, { x: preferredX, y: end.y }, end]);
  const clear = (a: Point, b: Point) => !obstacles.some((rect) => segmentIntersectsRect(a, b, rect));
  if (direct.every((point, index) => index === 0 || clear(direct[index - 1], point))) return direct;

  // A rectilinear visibility grid handles tight merges and backward-dated
  // relationships without crossing cards or inventing chronological parents.
  const xs = [...new Set([start.x, end.x, preferredX, LABEL_WIDTH + 16, CANVAS_WIDTH - 16,
    ...obstacles.flatMap((rect) => [rect.x - 8, rect.x + rect.width + 8])])].sort((a, b) => a - b);
  const ys = [...new Set([start.y, end.y, TIMELINE_HEIGHT + 4, CANVAS_HEIGHT - 4,
    ...obstacles.flatMap((rect) => [rect.y - 8, rect.y + rect.height + 8])])].sort((a, b) => a - b);
  const pointAt = (index: number) => ({ x: xs[index % xs.length], y: ys[Math.floor(index / xs.length)] });
  const first = ys.indexOf(start.y) * xs.length + xs.indexOf(start.x);
  const last = ys.indexOf(end.y) * xs.length + xs.indexOf(end.x);
  const costs = new Float64Array(xs.length * ys.length * 3).fill(Infinity);
  const parents = new Int32Array(costs.length).fill(-1);
  const pending = [{ state: first * 3, cost: 0 }];
  costs[first * 3] = 0;
  while (pending.length) {
    let best = 0;
    for (let index = 1; index < pending.length; index++) if (pending[index].cost < pending[best].cost) best = index;
    const current = pending.splice(best, 1)[0];
    if (current.cost !== costs[current.state]) continue;
    const index = Math.floor(current.state / 3);
    if (index === last) {
      const route: Point[] = [];
      for (let state = current.state; state !== -1; state = parents[state]) route.push(pointAt(Math.floor(state / 3)));
      return simplifyPoints(route.reverse());
    }
    const column = index % xs.length;
    const row = Math.floor(index / xs.length);
    const neighbors = [
      ...(column > 0 ? [{ index: index - 1, direction: 1 }] : []),
      ...(column < xs.length - 1 ? [{ index: index + 1, direction: 1 }] : []),
      ...(row > 0 ? [{ index: index - xs.length, direction: 2 }] : []),
      ...(row < ys.length - 1 ? [{ index: index + xs.length, direction: 2 }] : []),
    ];
    for (const neighbor of neighbors) {
      const a = pointAt(index);
      const b = pointAt(neighbor.index);
      if (!clear(a, b)) continue;
      const direction = current.state % 3;
      const cost = current.cost + Math.abs(a.x - b.x) + Math.abs(a.y - b.y) +
        (direction && direction !== neighbor.direction ? 32 : 0) +
        (neighbor.direction === 2 ? Math.abs(a.x - preferredX) * 0.01 : 0);
      const state = neighbor.index * 3 + neighbor.direction;
      if (cost >= costs[state]) continue;
      costs[state] = cost;
      parents[state] = current.state;
      pending.push({ state, cost });
    }
  }
  throw new Error("No unobstructed route between graph cards");
}

export function edgeToRoute(edge: LegendEdge) {
  const from = nodeById.get(edge.from);
  const to = nodeById.get(edge.to);
  if (!from || !to) throw new Error(`Unknown endpoints for edge: ${edge.id}`);
  const source = nodeToPoint(from);
  const target = nodeToPoint(to);
  const start = { x: source.x + CARD_WIDTH + 12, y: source.y };
  const end = { x: target.x - 12, y: target.y };
  const siblings = edges.filter((item) => item.from === edge.from);
  const rank = siblings.findIndex((item) => item.id === edge.id);
  const preferredX = end.x > start.x
    ? Math.min(start.x + 48 + Math.max(0, rank) * 18, (start.x + end.x) / 2)
    : start.x + 32;
  const obstacles = nodes.map((node) => {
    const rect = nodeToRect(node);
    return { x: rect.x - 4, y: rect.y - 4, width: rect.width + 8, height: rect.height + 8 };
  });
  const points = routeAroundCards(start, end, obstacles, preferredX);
  return { points, path: roundedPath(points), track: from.id === "sun-wukong" ? to.region : from.region };
}
