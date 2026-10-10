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
  let entry = 0;
  let exit = 1;
  for (const [origin, delta, low, high] of [
    [start.x, end.x - start.x, rect.x, rect.x + rect.width],
    [start.y, end.y - start.y, rect.y, rect.y + rect.height],
  ]) {
    if (delta === 0) {
      if (origin <= low || origin >= high) return false;
      continue;
    }
    const first = (low - origin) / delta;
    const last = (high - origin) / delta;
    entry = Math.max(entry, Math.min(first, last));
    exit = Math.min(exit, Math.max(first, last));
    if (entry >= exit) return false;
  }
  return true;
}

function simplifyPoints(points: Point[]) {
  const distinct = points.filter((point, index) => index === 0 || point.x !== points[index - 1].x || point.y !== points[index - 1].y);
  return distinct.filter((point, index) => {
    if (index === 0 || index === distinct.length - 1) return true;
    const previous = distinct[index - 1];
    const next = distinct[index + 1];
    const incoming = { x: point.x - previous.x, y: point.y - previous.y };
    const outgoing = { x: next.x - point.x, y: next.y - point.y };
    return Math.abs(incoming.x * outgoing.y - incoming.y * outgoing.x) > 1e-7 ||
      incoming.x * outgoing.x + incoming.y * outgoing.y <= 0;
  });
}

function angledPath(points: Point[]) {
  const format = (point: Point) => `${Number(point.x.toFixed(2))} ${Number(point.y.toFixed(2))}`;
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${format(point)}`).join(" ");
}

function diagonalRoute(start: Point, end: Point, obstacles: Rect[], preferredX: number): Point[] | null {
  const rise = Math.abs(end.y - start.y);
  if (end.x - start.x < rise + 24) return null;
  // One diagonal joins two horizontal tracks with exactly two 45° turns.
  const first = start.x + 12;
  const last = end.x - rise - 12;
  const preferred = Math.max(first, Math.min(preferredX, last));
  for (const x of [preferred, last, first]) {
    const points = simplifyPoints([start, { x, y: start.y }, { x: x + rise, y: end.y }, end]);
    if (points.every((point, index) => index === 0 ||
      !obstacles.some((rect) => segmentIntersectsRect(points[index - 1], point, rect)))) return points;
  }
  return null;
}

function bevelRoute(points: Point[], obstacles: Rect[]) {
  const clean = simplifyPoints(points);
  const result = [clean[0]];
  for (let index = 1; index < clean.length - 1; index++) {
    const previous = clean[index - 1];
    const corner = clean[index];
    const next = clean[index + 1];
    let cut = Math.min(32, Math.hypot(corner.x - previous.x, corner.y - previous.y) / 2,
      Math.hypot(next.x - corner.x, next.y - corner.y) / 2);
    const trimmed = () => [
      { x: corner.x + Math.sign(previous.x - corner.x) * cut, y: corner.y + Math.sign(previous.y - corner.y) * cut },
      { x: corner.x + Math.sign(next.x - corner.x) * cut, y: corner.y + Math.sign(next.y - corner.y) * cut },
    ];
    let [approach, depart] = trimmed();
    while (obstacles.some((rect) => segmentIntersectsRect(approach, depart, rect))) {
      cut /= 2;
      if (cut < 0.01) throw new Error("No clearance for a 45-degree graph turn");
      [approach, depart] = trimmed();
    }
    result.push(approach, depart);
  }
  return simplifyPoints([...result, clean[clean.length - 1]]);
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
  // Fan out to farther rows first so diagonal tracks never cross the nearer
  // branches after they turn horizontal.
  const siblings = edges.filter((item) => item.from === edge.from).sort((a, b) =>
    Math.abs(nodeToPoint(nodeById.get(b.to)!).y - source.y) - Math.abs(nodeToPoint(nodeById.get(a.to)!).y - source.y));
  const rank = siblings.findIndex((item) => item.id === edge.id);
  const preferredX = end.x > start.x
    ? Math.min(start.x + 48 + Math.max(0, rank) * 18, (start.x + end.x) / 2)
    : start.x + 32;
  const obstacles = nodes.map((node) => {
    const rect = nodeToRect(node);
    return { x: rect.x - 4, y: rect.y - 4, width: rect.width + 8, height: rect.height + 8 };
  });
  const points = diagonalRoute(start, end, obstacles, preferredX) ?? bevelRoute([
    start,
    ...routeAroundCards({ x: start.x + 8, y: start.y }, { x: end.x - 8, y: end.y }, obstacles, preferredX),
    end,
  ], obstacles);
  return { points, path: angledPath(points), track: from.id === "sun-wukong" ? to.region : from.region };
}
