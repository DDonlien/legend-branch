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
