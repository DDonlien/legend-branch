import test from "node:test";
import assert from "node:assert/strict";
import { fallbackGraph, defaultGroups, eligibleForGraph, graphDisplay, lineage } from "../src/graph";
import { createLayout, edgeToRoute, nodeToPoint, nodeToRect, segmentIntersectsRect } from "../src/layout";
import { createProject, parseProjectBackup, projectTags, readProjects, removeEntry, saveEntry, saveRelation, validateProject, writeProjects } from "../src/projects";
import type { KnowledgeEntry, KnowledgeGraph } from "../src/knowledge";

function authored(id = "local:new", year = 2000): KnowledgeEntry {
  return { id, name: "自己的故事", kind: "entry", summary: "故事梗概", reviewStatus: "curated", origin: "project", sources: [], tags: [{ id: "camp", name: "阵营" }], placement: { year, quality: "authored" } };
}

test("undated or culturally unlocated knowledge stays searchable without entering the graph", () => {
  const valid: KnowledgeEntry = { ...authored(), origin: undefined, placement: { year: 1929, sourceUrl: "https://example.org/date", quality: "sourced" }, tags: [{ id: "us", name: "美国", category: "country" }] };
  assert.equal(eligibleForGraph(valid), true);
  assert.equal(eligibleForGraph({ ...valid, placement: undefined }), false);
  assert.equal(eligibleForGraph({ ...valid, tags: [{ id: "crisis", name: "经济危机" }] }), false);
  const graph: KnowledgeGraph = { entries: [valid, { ...valid, id: "undated", placement: undefined }], relationships: [{ id: "hidden", from: valid.id, to: "undated", relation: "影响", confidence: "probable", debated: false, reviewStatus: "unreviewed", sources: [] }] };
  const display = graphDisplay(graph, ["us"], valid.id);
  assert.equal(display.nodes.length, 1);
  assert.equal(display.edges.length, 0);
  assert.equal(display.pendingCount, 1);
  assert.equal(graph.entries.length, 2);
});

test("database display preserves initial card positions, relationships and trace membership", () => {
  const display = graphDisplay(fallbackGraph, defaultGroups(fallbackGraph), "sun-wukong");
  assert.equal(display.nodes.length, 12);
  assert.equal(display.edges.length, 11);
  assert.equal(display.nodes.filter((entry) => entry.isTrace).length, 8);
  assert.equal(display.edges.filter((edge) => edge.isTrace).length, 7);
  const layout = createLayout(display);
  for (const entry of fallbackGraph.entries) {
    const node = layout.nodeById.get(entry.id)!;
    assert.equal(node.row, entry.placement?.rowHint);
    assert.equal(node.year, entry.placement?.year);
    assert.ok(!/NaN|Infinity/.test(String(nodeToPoint(node, layout).x)));
  }
});

test("arbitrary ordered tags regroup cards without duplication or artificial relationships", () => {
  for (const ids of [["manga", "journey-to-the-west"], ["journey-to-the-west", "manga"], []]) {
    const display = graphDisplay(fallbackGraph, ids, "sun-wukong");
    assert.equal(display.nodes.length, 12);
    assert.equal(new Set(display.nodes.map((entry) => entry.id)).size, 12);
    assert.equal(display.edges.length, 11);
    if (ids.length) assert.equal(display.nodes.find((entry) => entry.id === "dragon-ball")?.region, ids[0]);
    const layout = createLayout(display);
    for (const edge of display.edges) {
      const route = edgeToRoute(edge, layout);
      assert.ok(!/NaN|Infinity/.test(route.path));
      for (let i = 1; i < route.points.length; i++) for (const node of display.nodes) assert.equal(segmentIntersectsRect(route.points[i - 1], route.points[i], nodeToRect(node, layout)), false);
    }
  }
});

test("dynamic timeline handles same-year cards, distant dates, branch merges and reverse relationships", () => {
  const project = createProject(fallbackGraph, "sun-wukong", "测试故事");
  let next = saveEntry(project, authored("local:ancient", -3000));
  next = saveEntry(next, authored("local:future", 2400));
  next = saveEntry(next, authored("local:future2", 2400));
  for (const [from, to] of [["local:ancient", "local:future"], ["local:ancient", "local:future2"], ["local:future2", "local:future"]]) next = saveRelation(next, { id: `${from}:${to}`, from, to, relation: "发展", confidence: "confirmed", debated: false, reviewStatus: "curated", sources: [] });
  const display = graphDisplay(next.graph, ["camp"], "sun-wukong");
  const layout = createLayout(display);
  for (const node of display.nodes) {
    const rect = nodeToRect(node, layout);
    assert.ok(rect.x >= 170 && rect.x + rect.width <= layout.width);
  }
  for (const edge of display.edges) assert.ok(!/NaN|Infinity/.test(edgeToRoute(edge, layout).path));
  const first = nodeToRect(layout.nodeById.get("local:future")!, layout);
  const second = nodeToRect(layout.nodeById.get("local:future2")!, layout);
  assert.equal(first.x, second.x);
  assert.ok(first.y + first.height <= second.y || second.y + second.height <= first.y);
});

test("baseline copies all connected evidence and isolates personal edits from shared knowledge", () => {
  const project = createProject(fallbackGraph, "sun-wukong", "我的谱系");
  const connected = lineage(fallbackGraph, "sun-wukong");
  assert.equal(project.graph.entries.length, connected.entries.length);
  const original = JSON.stringify(fallbackGraph);
  let next = saveEntry(project, authored());
  next = saveRelation(next, { id: "story-edge", from: "sun-wukong", to: "local:new", relation: "故事发展", confidence: "confirmed", debated: false, reviewStatus: "curated", sources: [] });
  assert.equal(next.graph.entries.length, project.graph.entries.length + 1);
  assert.equal(next.graph.relationships.length, project.graph.relationships.length + 1);
  assert.equal(JSON.stringify(fallbackGraph), original);
  const removed = removeEntry(next, "local:new");
  assert.equal(removed.graph.relationships.length, project.graph.relationships.length);
  assert.equal(project.graph.entries.some((entry) => entry.id === "local:new"), false);
});

test("projects survive storage reload and portable backups preserve personal data and grouping", () => {
  const project = { ...saveEntry(createProject(fallbackGraph, "sun-wukong", "故事"), authored()), groupIds: ["camp", "manga"] };
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  writeProjects(storage, [project]);
  assert.deepEqual(readProjects(storage), [project]);
  const imported = parseProjectBackup(JSON.stringify({ format: "legendbranch-project", version: 1, project }));
  assert.notEqual(imported.id, project.id);
  assert.deepEqual(imported.graph, project.graph);
  assert.deepEqual(imported.groupIds, project.groupIds);
  assert.equal(validateProject(imported), true);
  assert.throws(() => writeProjects({ setItem: () => { throw new Error("quota"); } }, [project]));
});

test("invalid and unsafe backups cannot be imported or silently overwrite stored projects", () => {
  const project = createProject(fallbackGraph, "sun-wukong", "故事");
  const parsed = { format: "legendbranch-project", version: 1, project };
  assert.throws(() => parseProjectBackup("{}"));
  const bad = structuredClone(parsed);
  bad.project.graph.entries[0].sources[0].url = "javascript:alert(1)";
  assert.throws(() => parseProjectBackup(JSON.stringify(bad)));
  const badPlacement = structuredClone(parsed);
  badPlacement.project.graph.entries[0].placement!.sourceUrl = "javascript:alert(1)";
  assert.throws(() => parseProjectBackup(JSON.stringify(badPlacement)));
  const dangling = structuredClone(parsed);
  dangling.project.graph.relationships[0].to = "missing";
  assert.throws(() => parseProjectBackup(JSON.stringify(dangling)));
  assert.throws(() => readProjects({ getItem: () => "broken" }));
});

test("personal tag names reuse stable known tags and deduplicate custom names", () => {
  const tags = projectTags("日本，阵营，阵营", [{ id: "wd:Q17", name: "日本", category: "country" }]);
  assert.equal(tags.length, 2);
  assert.equal(tags[0].id, "wd:Q17");
  assert.equal(tags[1].id, "local-tag:阵营");
  assert.equal(projectTags("Story，story", []).length, 1);
});
