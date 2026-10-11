export type NodeKind = "origin" | "literature" | "modern" | "entry";
export type Confidence = "confirmed" | "probable" | "speculative";
export type RegionId = string;

export type LegendLink = {
  label: string;
  url: string;
};

export type LegendNode = {
  id: string;
  name: string;
  latinName?: string;
  year: number;
  yearLabel: string;
  region: RegionId;
  row: number;
  kind: NodeKind;
  summary: string;
  sources: LegendLink[];
  tags: { id: string; name: string }[];
  isTrace: boolean;
  origin?: "baseline" | "project";
};

export type LegendEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
  confidence: Confidence;
  debated?: boolean;
  source: LegendLink;
  isTrace: boolean;
};

export type Region = {
  id: RegionId;
  label: string;
  subtitle: string;
  y: number;
  height: number;
};
