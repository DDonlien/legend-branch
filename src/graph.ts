import { edges, nodes, regions } from "./data";
import { tagCategory, type GraphRelation, type KnowledgeEntry, type KnowledgeGraph, type KnowledgeTag, type TagCategory } from "./knowledge";
import type { LegendEdge, LegendNode, Region } from "./types";

export const fallbackGraph: KnowledgeGraph = {
  entries: nodes.map((node) => ({ ...node, reviewStatus: "curated", tags: [
    ...node.tags.map((tag) => ({ ...tag, category: tagCategory({ ...tag, category: tag.id.startsWith("wd:") ? "country" : "topic" }) })),
    { id: `culture:${node.region}`, name: regions.find((region) => region.id === node.region)!.label, category: "culture" },
  ], placement: { year: node.year, quality: "curated", sourceUrl: node.sources[0].url,
    preferredGroup: `culture:${node.region}`, rowHint: node.row, defaultTrace: node.isTrace } })),
  relationships: edges.map((edge) => ({ ...edge, debated: edge.debated ?? false, reviewStatus: "curated", sources: [edge.source] })),
};

export function eligibleForGraph(entry: KnowledgeEntry) {
  return Boolean(entry.placement && Number.isFinite(entry.placement.year) &&
    (entry.origin === "project" || (entry.placement.sourceUrl && entry.tags.some((tag) => tag.category === "culture" || tag.category === "country"))));
}

export function graphTags(graph: KnowledgeGraph): KnowledgeTag[] {
  return [...new Map(graph.entries.flatMap((entry) => entry.tags).map((tag) => [tag.id, { ...tag, category: tagCategory(tag) }])).values()];
}

const cultureOrder = ["culture:india", "culture:china", "culture:japan", "culture:modern-china"];
export function groupingBasis(graph: KnowledgeGraph, settings: { groupBasis?: TagCategory; groupIds: string[] | null }): TagCategory {
  if (settings.groupBasis) return settings.groupBasis;
  const tags = graphTags(graph);
  const previous = settings.groupIds?.map((id) => tags.find((tag) => tag.id === id)).find(Boolean);
  return previous ? tagCategory(previous) : (["culture", "country", "category", "topic"] as const).find((basis) => tags.some((tag) => tag.category === basis)) ?? "topic";
}

export function tagsForBasis(graph: KnowledgeGraph, basis: TagCategory) {
  return graphTags(graph).filter((tag) => tag.category === basis).sort((a, b) => {
    if (basis === "culture") {
      const first = cultureOrder.indexOf(a.id), second = cultureOrder.indexOf(b.id);
      if (first >= 0 || second >= 0) return (first < 0 ? Infinity : first) - (second < 0 ? Infinity : second);
    }
    return a.name.localeCompare(b.name, "zh");
  });
}

export function groupsForBasis(graph: KnowledgeGraph, basis: TagCategory, groupIds: string[] | null) {
  const available = tagsForBasis(graph, basis).map((tag) => tag.id);
  return groupIds === null ? available : [...new Set(groupIds.filter((id) => available.includes(id)))];
}

export function defaultGroups(graph: KnowledgeGraph) {
  const tags = graphTags(graph);
  return [...cultureOrder.filter((id) => tags.some((tag) => tag.id === id)),
    ...tags.filter((tag) => tag.category === "culture" && !cultureOrder.includes(tag.id)).map((tag) => tag.id),
    ...tags.filter((tag) => tag.category === "country").sort((a, b) => a.name.localeCompare(b.name, "zh")).map((tag) => tag.id)];
}

// All connected entries are copied into a project, including undated evidence.
export function lineage(graph: KnowledgeGraph, root: string): KnowledgeGraph {
  const ids = new Set([root]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of graph.relationships) if (ids.has(edge.from) || ids.has(edge.to)) {
      for (const id of [edge.from, edge.to]) if (!ids.has(id)) { ids.add(id); changed = true; }
    }
  }
  return { entries: graph.entries.filter((entry) => ids.has(entry.id)), relationships: graph.relationships.filter((edge) => ids.has(edge.from) && ids.has(edge.to)) };
}

export function traceIds(graph: KnowledgeGraph, root: string) {
  if (root === "sun-wukong" && graph.entries.some((entry) => entry.placement?.defaultTrace)) {
    const ids = new Set(graph.entries.filter((entry) => entry.placement?.defaultTrace).map((entry) => entry.id));
    // New relations join the trace; existing curated off-trace context stays muted.
    let changed = true;
    while (changed) {
      changed = false;
      for (const edge of graph.relationships) if (edge.reviewStatus === "unreviewed" && (ids.has(edge.from) || ids.has(edge.to))) {
        for (const id of [edge.from, edge.to]) if (!ids.has(id)) { ids.add(id); changed = true; }
      }
    }
    for (const entry of graph.entries) if (entry.origin === "project") ids.add(entry.id);
    return ids;
  }
  return new Set(lineage(graph, root).entries.map((entry) => entry.id));
}

export function graphDisplay(graph: KnowledgeGraph, groupIds: string[], root: string) {
  const tags = new Map(graphTags(graph).map((tag) => [tag.id, tag]));
  const validGroups = groupIds.filter((id) => tags.has(id));
  const traced = traceIds(graph, root);
  const groupOf = (entry: KnowledgeEntry) => validGroups.find((id) => entry.tags.some((tag) => tag.id === id)) ?? "ungrouped";
  const entries = graph.entries.filter(eligibleForGraph);
  const used = new Set(entries.map(groupOf));
  const displayRegions: Region[] = [...validGroups, "ungrouped"].filter((id) => used.has(id)).map((id) => ({
    id, label: tags.get(id)?.name ?? "其他标签", subtitle: id === "ungrouped" ? "未匹配所选标签" : "按标签分组", y: 0, height: 0,
  }));
  const displayNodes: LegendNode[] = [];
  for (const region of displayRegions) {
    const inGroup = entries.filter((entry) => groupOf(entry) === region.id).sort((a, b) => a.placement!.year - b.placement!.year || a.id.localeCompare(b.id));
    const hintRows = inGroup.filter((entry) => entry.placement!.preferredGroup === region.id && entry.placement!.rowHint != null).map((entry) => entry.placement!.rowHint!);
    let nextRow = Math.max(-1, ...hintRows) + 1;
    for (const entry of inGroup) {
      const placement = entry.placement!;
      const row = placement.preferredGroup === region.id && placement.rowHint != null ? placement.rowHint : nextRow++;
      displayNodes.push({ ...entry, year: placement.year, yearLabel: entry.yearLabel ?? String(placement.year), region: region.id, row, isTrace: traced.has(entry.id) });
    }
  }
  const ids = new Set(displayNodes.map((node) => node.id));
  const displayEdges: LegendEdge[] = graph.relationships.filter((edge) => ids.has(edge.from) && ids.has(edge.to)).map((edge) => ({
    ...edge, source: edge.sources[0] ?? { label: "个人创作", url: "" }, isTrace: traced.has(edge.from) && traced.has(edge.to),
  }));
  return { nodes: displayNodes, edges: displayEdges, regions: displayRegions, pendingCount: graph.entries.length - entries.length };
}

export function detailFromGraph(graph: KnowledgeGraph, entry: KnowledgeEntry) {
  return { entry, relationships: graph.relationships.filter((edge) => edge.from === entry.id || edge.to === entry.id).flatMap((edge: GraphRelation) => {
    const target = graph.entries.find((item) => item.id === (edge.from === entry.id ? edge.to : edge.from));
    return target ? [{ ...edge, target: { id: target.id, name: target.name, yearLabel: target.yearLabel } }] : [];
  }) };
}
