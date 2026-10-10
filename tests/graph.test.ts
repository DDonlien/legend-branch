import assert from "node:assert/strict";
import { test } from "node:test";
import { Contrast, Hct } from "@material/material-color-utilities";
import { edges, nodes } from "../src/data";
import { CANVAS_HEIGHT, CANVAS_WIDTH, CARD_WIDTH, edgeToRoute, nodeById, nodeToPoint, nodeToRect, regionLayouts, segmentIntersectsRect, timelineTicks, yearToX } from "../src/layout";
import { graphTrackColors, materialColors } from "../src/theme";

test("the expanded axis preserves every historical date and chronology", () => {
  for (const tick of timelineTicks) assert.equal(yearToX(tick.year), tick.x);
  for (let year = -501; year <= 2051; year++) assert.ok(yearToX(year + 1) > yearToX(year));
  const recent = nodes.filter((node) => node.kind === "modern").sort((a, b) => a.year - b.year);
  for (let i = 1; i < recent.length; i++) assert.ok(nodeToPoint(recent[i]).x > nodeToPoint(recent[i - 1]).x);
});

test("every large card stays inside its cultural block and the canvas", () => {
  for (const node of nodes) {
    const rect = nodeToRect(node);
    const region = regionLayouts.find((item) => item.id === node.region)!;
    assert.ok(rect.x >= 0 && rect.x + rect.width <= CANVAS_WIDTH, node.id);
    assert.ok(rect.y >= region.y && rect.y + rect.height <= region.y + region.height, node.id);
    assert.ok(rect.y + rect.height <= CANVAS_HEIGHT, node.id);
  }
});

test("cards never overlap, including nearby modern dates and the fourth Chinese row", () => {
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
    const first = nodeToRect(nodes[a]);
    const second = nodeToRect(nodes[b]);
    const overlaps = first.x < second.x + second.width && first.x + first.width > second.x &&
      first.y < second.y + second.height && first.y + first.height > second.y;
    assert.equal(overlaps, false, `${nodes[a].id} / ${nodes[b].id}`);
  }
});

test("all actual relationships terminate on the correct card ports, including the backward-dated source", () => {
  for (const edge of edges) {
    const route = edgeToRoute(edge);
    const from = nodeToPoint(nodeById.get(edge.from)!);
    const to = nodeToPoint(nodeById.get(edge.to)!);
    assert.deepEqual(route.points[0], { x: from.x + CARD_WIDTH + 12, y: from.y }, edge.id);
    assert.deepEqual(route.points.at(-1), { x: to.x - 12, y: to.y }, edge.id);
    assert.ok(!/NaN|Infinity/.test(route.path), edge.id);
  }
});

test("tracks avoid all card interiors, rather than passing behind unreadable labels", () => {
  for (const edge of edges) {
    const { points } = edgeToRoute(edge);
    for (let index = 1; index < points.length; index++) for (const node of nodes) {
      assert.equal(segmentIntersectsRect(points[index - 1], points[index], nodeToRect(node)), false, `${edge.id} crosses ${node.id}`);
    }
  }
});

test("main Trace branches use a horizontal-diagonal-horizontal transition with two 45-degree turns", () => {
  for (const edge of edges.filter((edge) => edge.from === "sun-wukong" && edge.isTrace)) {
    const { points, path } = edgeToRoute(edge);
    assert.equal(points.length, 4, edge.id);
    assert.equal(points[0].y, points[1].y, edge.id);
    assert.equal(points[2].y, points[3].y, edge.id);
    assert.ok(Math.abs((points[2].x - points[1].x) - Math.abs(points[2].y - points[1].y)) < 1e-7, edge.id);
    assert.ok(!/[QCA]/.test(path), edge.id);
  }
});

test("the main diagonal branches do not cross after leaving their shared source track", () => {
  const routes = edges.filter((edge) => edge.from === "sun-wukong" && edge.isTrace).map(edgeToRoute);
  const side = (a: { x: number; y: number }, b: { x: number; y: number }, p: { x: number; y: number }) =>
    (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  for (let i = 0; i < routes.length; i++) for (let j = i + 1; j < routes.length; j++) {
    const a = routes[i].points;
    const b = routes[j].points;
    for (let k = 2; k < a.length; k++) for (let l = 2; l < b.length; l++) {
      const crosses = side(a[k - 1], a[k], b[l - 1]) * side(a[k - 1], a[k], b[l]) < -1e-7 &&
        side(b[l - 1], b[l], a[k - 1]) * side(b[l - 1], b[l], a[k]) < -1e-7;
      assert.equal(crosses, false, `branches ${i} and ${j} cross`);
    }
  }
});

test("tight merges and backward links keep horizontal ports and turn by at most 45 degrees", () => {
  for (const edge of edges) {
    const { points } = edgeToRoute(edge);
    assert.equal(points[0].y, points[1].y, edge.id);
    assert.equal(points.at(-1)!.y, points.at(-2)!.y, edge.id);
    const vectors = points.slice(1).map((point, index) => ({ x: point.x - points[index].x, y: point.y - points[index].y }));
    for (const vector of vectors) {
      assert.ok(vector.x !== 0 || vector.y !== 0, edge.id);
      assert.ok(vector.x === 0 || vector.y === 0 || Math.abs(Math.abs(vector.x) - Math.abs(vector.y)) < 1e-7, edge.id);
    }
    for (let index = 1; index < vectors.length; index++) {
      const a = vectors[index - 1];
      const b = vectors[index];
      const angle = Math.abs(Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y));
      assert.ok(angle <= Math.PI / 4 + 1e-7, edge.id);
    }
  }
});

test("diagonal obstacle checks detect interior crossings while allowing boundary and corner contact", () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };
  assert.equal(segmentIntersectsRect({ x: -5, y: -5 }, { x: 15, y: 15 }, rect), true);
  assert.equal(segmentIntersectsRect({ x: -1, y: 5 }, { x: 5, y: -1 }, rect), true);
  assert.equal(segmentIntersectsRect({ x: 5, y: 5 }, { x: 15, y: 15 }, rect), true);
  assert.equal(segmentIntersectsRect({ x: -5, y: 5 }, { x: 5, y: -5 }, rect), false);
  assert.equal(segmentIntersectsRect({ x: -5, y: 0 }, { x: 15, y: 0 }, rect), false);
  assert.equal(segmentIntersectsRect({ x: 10, y: -5 }, { x: 10, y: 15 }, rect), false);
});

test("merges and fan-out retain separate real relationships and deterministic track identities", () => {
  const centerInputs = edges.filter((edge) => edge.to === "sun-wukong");
  const centerOutputs = edges.filter((edge) => edge.from === "sun-wukong");
  assert.equal(centerInputs.length, 4);
  assert.equal(centerOutputs.length, 5);
  for (const edge of edges) assert.deepEqual(edgeToRoute(edge), edgeToRoute(edge));
  const branchTracks = centerOutputs.map((edge) => edgeToRoute(edge).track);
  assert.ok(branchTracks.includes("japan") && branchTracks.includes("modern-china"));
});

test("existing Trace membership and uncertain sources remain intact", () => {
  assert.equal(nodes.filter((node) => node.isTrace).length, 8);
  assert.equal(edges.filter((edge) => edge.isTrace).length, 7);
  assert.equal(edges.find((edge) => edge.id === "hanuman-to-wukong")!.confidence, "probable");
  assert.equal(edges.find((edge) => edge.id === "wuzhiqi-to-wukong")!.confidence, "speculative");
  assert.equal(edges.filter((edge) => edge.debated).length, 2);
});

test("Google theme roles meet text and graph contrast requirements", () => {
  const contrast = (a: number, b: number) => Contrast.ratioOfTones(Hct.fromInt(a).tone, Hct.fromInt(b).tone);
  for (const [foreground, background] of [
    [materialColors.onSurface, materialColors.surfaceContainerHigh],
    [materialColors.onSurfaceVariant, materialColors.surfaceContainerHigh],
    [materialColors.onPrimary, materialColors.primary],
    [materialColors.onPrimaryContainer, materialColors.primaryContainer],
    [materialColors.onSecondaryContainer, materialColors.secondaryContainer],
  ]) assert.ok(contrast(foreground, background) >= 4.5);
  for (const track of Object.values(graphTrackColors)) assert.ok(contrast(track, materialColors.surface) >= 3);
});
