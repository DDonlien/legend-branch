import type { Confidence, LegendLink, NodeKind } from "./types";

export const TAG_CATEGORIES = ["country", "culture", "category", "topic"] as const;
export type TagCategory = typeof TAG_CATEGORIES[number];
// Optional only for compatibility with project backups made before tag groups.
export type KnowledgeTag = { id: string; name: string; category?: TagCategory };
const categoryIds = new Set(["myth", "folklore", "literature", "manga", "film", "game", "drama", "television"]);
export function tagCategory(tag: KnowledgeTag): TagCategory {
  if (tag.id.startsWith("culture:")) return "culture";
  if (categoryIds.has(tag.id)) return "category";
  return tag.category ?? "topic";
}
export type KnowledgePlacement = {
  year: number;
  endYear?: number;
  sourceUrl?: string;
  quality: "curated" | "sourced" | "authored";
  preferredGroup?: string;
  rowHint?: number;
  defaultTrace?: boolean;
};
export type KnowledgeEntry = {
  id: string;
  name: string;
  latinName?: string;
  kind: NodeKind | "entry";
  yearLabel?: string;
  summary: string;
  tags: KnowledgeTag[];
  sources: LegendLink[];
  reviewStatus: "curated" | "unreviewed";
  placement?: KnowledgePlacement;
  origin?: "baseline" | "project";
};
export type KnowledgeRelation = {
  id: string;
  from: string;
  to: string;
  relation: string;
  confidence: Confidence;
  debated: boolean;
  reviewStatus: "curated" | "unreviewed";
  sources: LegendLink[];
  target: { id: string; name: string; yearLabel?: string };
};
export type EntryDetail = { entry: KnowledgeEntry; relationships: KnowledgeRelation[] };
export type GraphRelation = Omit<KnowledgeRelation, "target">;
export type KnowledgeGraph = { entries: KnowledgeEntry[]; relationships: GraphRelation[] };
export type GraphPage = KnowledgeGraph & { nextCursor: string | null };
export type SearchResponse = {
  query: string;
  entries: KnowledgeEntry[];
  enrichment: "pending" | "updated" | "cached" | "unavailable";
  added: number;
  message?: string;
};

// The same normalization is used for imported aliases and user queries.
export function normalizeSearch(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
}
