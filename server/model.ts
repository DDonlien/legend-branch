import type { KnowledgeEntry, KnowledgeRelation } from "../src/knowledge";

export type IncomingEntry = KnowledgeEntry & {
  externalId?: string;
  aliases: string[];
};
export type IncomingRelation = Omit<KnowledgeRelation, "target">;
export type Discovery = { entries: IncomingEntry[]; relationships: IncomingRelation[] };

// This small SQL interface lets tests exercise the real queries against SQLite.
// Production uses the D1 binding directly; neither adapter changes merge rules.
export interface Statement {
  bind(...values: (string | number | null)[]): Statement;
  all<T>(): Promise<{ results: T[] }>;
  first<T>(): Promise<T | null>;
}
export interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<{ meta: { changes: number } }[]>;
}
