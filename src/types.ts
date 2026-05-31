export type NodeKind = "origin" | "literature" | "modern";
export type Confidence = "confirmed" | "probable" | "speculative";
export type RegionId = "india" | "china" | "japan" | "modern-china";

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
  isTrace: boolean;
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
