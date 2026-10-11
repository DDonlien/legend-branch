import { edges, nodes, regions } from "../src/data";
import type { Discovery } from "./model";

// Only exact matching entities are bound. A literary version or character
// does not become the work containing it merely because it cites that page.
const externalIds: Record<string, string> = {
  hanuman: "Q188618", wuzhiqi: "Q56345295", "dragon-ball": "Q2142",
  "black-myth": "Q98582386", ramayana: "Q37293", "tv-journey": "Q2353327",
};

export const seed: Discovery = {
  entries: nodes.map((node) => ({ ...node, reviewStatus: "curated", externalId: externalIds[node.id], aliases: [node.name, node.latinName ?? ""],
    tags: [...node.tags.map((tag) => ({ ...tag, category: tag.id.startsWith("wd:") ? "country" as const : "topic" as const })),
      { id: `culture:${node.region}`, name: regions.find((region) => region.id === node.region)!.label, category: "culture" as const }],
    placement: { year: node.year, sourceUrl: node.sources[0].url, quality: "curated", preferredGroup: `culture:${node.region}`, rowHint: node.row, defaultTrace: node.isTrace },
  })),
  relationships: edges.map((edge) => ({ ...edge, debated: edge.debated ?? false, reviewStatus: "curated", sources: [edge.source] })),
};
