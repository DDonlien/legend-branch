import { edges, nodes, regions } from "./data";
import type { LegendEdge, LegendNode, Region } from "./types";
import type { Density } from "./preferences";

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

export function yearToX(year: number, ticks = timelineTicks) {
  const found = ticks.findIndex((tick) => tick.year >= year);
  const index = found < 0 ? ticks.length - 2 : Math.max(0, found - 1);
  const start = ticks[index];
  const end = ticks[index + 1];
  return start.x + ((year - start.year) / (end.year - start.year)) * (end.x - start.x);
}

export function createLayout(data: { nodes: LegendNode[]; edges: LegendEdge[]; regions: Region[] }, density: Density = "detailed") {
  const metrics = density === "nodes" ? { cardWidth: 0, cardHeight: 16, rowHeight: 40 } : density === "names"
    ? { cardWidth: 160, cardHeight: 40, rowHeight: 48 } : { cardWidth: CARD_WIDTH, cardHeight: CARD_HEIGHT, rowHeight: ROW_HEIGHT };
  let y = TIMELINE_HEIGHT;
  const regionLayouts = data.regions.map((region) => {
    const rows = Math.max(0, ...data.nodes.filter((node) => node.region === region.id).map((node) => node.row)) + 1;
    const layout = { ...region, y, height: Math.max(density === "detailed" ? 0 : 96, rows * metrics.rowHeight + 16), rows };
    y += layout.height;
    return layout;
  });
  let ticks = timelineTicks.map((tick) => ({ ...tick }));
  const min = Math.min(-500, ...data.nodes.map((node) => node.year));
  const max = Math.max(2050, ...data.nodes.map((node) => node.year));
  const label = (year: number) => year < 0 ? `公元前 ${Math.abs(year)}` : String(year);
  if (min < -500) ticks = [{ year: Math.floor(min / 500) * 500, label: label(Math.floor(min / 500) * 500), x: 240 }, ...ticks.map((tick) => ({ ...tick, x: tick.x + 440 }))];
  if (max > 2050) ticks.push({ year: Math.ceil(max / 50) * 50, label: label(Math.ceil(max / 50) * 50), x: ticks.at(-1)!.x + 600 });
  const cardEnd = Math.max(0, ...data.nodes.map((node) => yearToX(node.year, ticks) + metrics.cardWidth));
  // Allow the final dated card to scroll clear of the non-modal detail panel.
  return { ...data, density, metrics, regionLayouts, timelineTicks: ticks, width: Math.max(3280, ticks.at(-1)!.x + 280, cardEnd + 440), height: Math.max(y, TIMELINE_HEIGHT + 192), nodeById: new Map(data.nodes.map((node) => [node.id, node])) };
}
export type GraphLayout = ReturnType<typeof createLayout>;
const originalLayout = createLayout({ nodes, edges, regions });
export const regionLayouts = originalLayout.regionLayouts;
export const CANVAS_WIDTH = originalLayout.width;
export const CANVAS_HEIGHT = originalLayout.height;
export const nodeById = originalLayout.nodeById;

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };
export type RouteSegment =
  | { kind: "line"; start: Point; end: Point }
  | { kind: "curve"; start: Point; control1: Point; control2: Point; end: Point };

export function nodeToPoint(node: LegendNode, layout = originalLayout): Point {
  const region = layout.regionLayouts.find((item) => item.id === node.region);
  if (!region) throw new Error(`Unknown region: ${node.region}`);
  return { x: yearToX(node.year, layout.timelineTicks), y: region.y + 8 + Math.max(20, layout.metrics.cardHeight / 2) + node.row * layout.metrics.rowHeight };
}

export function nodeToRect(node: LegendNode, layout = originalLayout): Rect {
  const point = nodeToPoint(node, layout);
  return { x: point.x - (layout.density === "nodes" ? 8 : 0), y: point.y - layout.metrics.cardHeight / 2, width: layout.density === "nodes" ? 16 : layout.metrics.cardWidth, height: layout.metrics.cardHeight };
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

function triangleIntersectsRect(a: Point, b: Point, c: Point, rect: Rect) {
  if ([[a, b], [b, c], [c, a]].some(([start, end]) => segmentIntersectsRect(start, end, rect))) return true;
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const side = (start: Point, end: Point) => (end.x - start.x) * (center.y - start.y) - (end.y - start.y) * (center.x - start.x);
  const sides = [side(a, b), side(b, c), side(c, a)];
  return sides.every((value) => value > 1e-7) || sides.every((value) => value < -1e-7);
}

function roundedPath(points: Point[], obstacles: Rect[]) {
  const segments: RouteSegment[] = [];
  let start = points[0];
  const lineTo = (end: Point) => {
    if (Math.hypot(end.x - start.x, end.y - start.y) > 1e-7) segments.push({ kind: "line", start, end });
    start = end;
  };
  for (let index = 1; index < points.length - 1; index++) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const incomingLength = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outgoingLength = Math.hypot(next.x - corner.x, next.y - corner.y);
    const incoming = { x: (corner.x - previous.x) / incomingLength, y: (corner.y - previous.y) / incomingLength };
    const outgoing = { x: (next.x - corner.x) / outgoingLength, y: (next.y - corner.y) / outgoingLength };
    let reach = Math.min(24, incomingLength / 2, outgoingLength / 2);
    const trim = () => [
      { x: corner.x - incoming.x * reach, y: corner.y - incoming.y * reach },
      { x: corner.x + outgoing.x * reach, y: corner.y + outgoing.y * reach },
    ];
    let [approach, depart] = trim();
    // The curve's control hull stays inside this triangle. Reduce its reach
    // near cards so a rounded corner cannot cut across a safe straight route.
    while (obstacles.some((rect) => triangleIntersectsRect(approach, corner, depart, rect))) {
      reach /= 2;
      [approach, depart] = trim();
    }
    const angle = Math.acos(Math.max(-1, Math.min(1, incoming.x * outgoing.x + incoming.y * outgoing.y)));
    const handle = reach * (4 / 3) * Math.tan(angle / 4) / Math.tan(angle / 2);
    lineTo(approach);
    segments.push({
      kind: "curve", start: approach, end: depart,
      control1: { x: approach.x + incoming.x * handle, y: approach.y + incoming.y * handle },
      control2: { x: depart.x - outgoing.x * handle, y: depart.y - outgoing.y * handle },
    });
    start = depart;
  }
  lineTo(points[points.length - 1]);
  const format = (point: Point) => `${Number(point.x.toFixed(2))} ${Number(point.y.toFixed(2))}`;
  const path = `M ${format(points[0])} ${segments.map((segment) => segment.kind === "line"
    ? `L ${format(segment.end)}`
    : `C ${format(segment.control1)} ${format(segment.control2)} ${format(segment.end)}`).join(" ")}`;
  return { path, segments };
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

function routeAroundCards(start: Point, end: Point, obstacles: Rect[], preferredX: number, layout: GraphLayout): Point[] {
  const direct = simplifyPoints([start, { x: preferredX, y: start.y }, { x: preferredX, y: end.y }, end]);
  const clear = (a: Point, b: Point) => !obstacles.some((rect) => segmentIntersectsRect(a, b, rect));
  if (direct.every((point, index) => index === 0 || clear(direct[index - 1], point))) return direct;

  // A rectilinear visibility grid handles tight merges and backward-dated
  // relationships without crossing cards or inventing chronological parents.
  const gapXs: number[] = [];
  const gapYs: number[] = [];
  for (let first = 0; first < obstacles.length; first++) for (let last = first + 1; last < obstacles.length; last++) {
    const a = obstacles[first];
    const b = obstacles[last];
    const [above, below] = a.y < b.y ? [a, b] : [b, a];
    if (above.y + above.height <= below.y && Math.max(a.x, b.x) < Math.min(a.x + a.width, b.x + b.width)) {
      gapYs.push((above.y + above.height + below.y) / 2);
    }
    const [left, right] = a.x < b.x ? [a, b] : [b, a];
    if (left.x + left.width <= right.x && Math.max(a.y, b.y) < Math.min(a.y + a.height, b.y + b.height)) {
      gapXs.push((left.x + left.width + right.x) / 2);
    }
  }
  // Include narrow gap centerlines: outer-card offsets miss the 8px channel
  // between adjacent rows, causing needlessly long loops around both cards.
  const xs = [...new Set([start.x, end.x, preferredX, LABEL_WIDTH + 16, layout.width - 16,
    ...gapXs,
    ...obstacles.flatMap((rect) => [rect.x - 8, rect.x + rect.width + 8])])].sort((a, b) => a - b);
  const ys = [...new Set([start.y, end.y, TIMELINE_HEIGHT + 4, layout.height - 4,
    ...gapYs,
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

export function edgeToRoute(edge: LegendEdge, layout = originalLayout) {
  const from = layout.nodeById.get(edge.from);
  const to = layout.nodeById.get(edge.to);
  if (!from || !to) throw new Error(`Unknown endpoints for edge: ${edge.id}`);
  const source = nodeToPoint(from, layout);
  const target = nodeToPoint(to, layout);
  const start = { x: source.x + layout.metrics.cardWidth + 12, y: source.y };
  const end = { x: target.x - 12, y: target.y };
  // Fan out to farther rows first so diagonal tracks never cross the nearer
  // branches after they turn horizontal.
  const siblings = layout.edges.filter((item) => item.from === edge.from).sort((a, b) =>
    Math.abs(nodeToPoint(layout.nodeById.get(b.to)!, layout).y - source.y) - Math.abs(nodeToPoint(layout.nodeById.get(a.to)!, layout).y - source.y));
  const rank = siblings.findIndex((item) => item.id === edge.id);
  const preferredX = end.x > start.x
    ? Math.min(start.x + 48 + Math.max(0, rank) * 18, (start.x + end.x) / 2)
    : start.x + 32;
  const obstacles = layout.nodes.map((node) => {
    const rect = nodeToRect(node, layout);
    return { x: rect.x - 4, y: rect.y - 4, width: rect.width + 8, height: rect.height + 8 };
  });
  const points = diagonalRoute(start, end, obstacles, preferredX) ?? bevelRoute([
    start,
    ...routeAroundCards({ x: start.x + 8, y: start.y }, { x: end.x - 8, y: end.y }, obstacles, preferredX, layout),
    end,
  ], obstacles);
  // Routing has 4px clearance; curves retain 2px for the 2.5px-wide stroke.
  const curveObstacles = obstacles.map((rect) => ({ x: rect.x + 2, y: rect.y + 2, width: rect.width - 4, height: rect.height - 4 }));
  return { points, ...roundedPath(points, curveObstacles), track: from.id === "sun-wukong" ? to.region : from.region };
}
