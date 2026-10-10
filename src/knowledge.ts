import type { Confidence, LegendLink, NodeKind } from "./types";

export type KnowledgeTag = { id: string; name: string };
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
  target: { id: string; name: string };
};
export type EntryDetail = { entry: KnowledgeEntry; relationships: KnowledgeRelation[] };
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
