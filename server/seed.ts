import { edges, nodes } from "../src/data";
import type { Discovery } from "./model";

// Only exact matching entities are bound. A literary version or character
// does not become the work containing it merely because it cites that page.
const externalIds: Record<string, string> = {
  hanuman: "Q188618", wuzhiqi: "Q56345295", "dragon-ball": "Q2142",
  "black-myth": "Q98582386", ramayana: "Q37293", "tv-journey": "Q2353327",
};

export const seed: Discovery = {
  entries: nodes.map((node) => ({ ...node, reviewStatus: "curated", externalId: externalIds[node.id], aliases: [node.name, node.latinName ?? ""] })),
  relationships: edges.map((edge) => ({ ...edge, debated: edge.debated ?? false, reviewStatus: "curated", sources: [edge.source] })),
};
