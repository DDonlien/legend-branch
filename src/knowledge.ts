import type { Confidence, LegendLink, NodeKind } from "./types";

export type KnowledgeTag = { id: string; name: string; category?: "culture" | "country" | "topic" };
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
