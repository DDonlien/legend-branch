import type { SearchResponse } from "../src/knowledge";
import type { Discovery } from "./model";
import { KnowledgeStore } from "./store";

export async function enrichSearch(store: KnowledgeStore, query: string, discovery: (query: string) => Promise<Discovery>, now = new Date()): Promise<SearchResponse> {
  const cached = await store.recentSearch(query);
  const previousIds: string[] = cached ? JSON.parse(cached.entry_ids) : [];
  const age = cached ? now.getTime() - Date.parse(cached.completed_at) : Infinity;
  if (cached?.data_version === 2 && cached.status !== "failed" && age >= 0 && age < 6 * 60 * 60 * 1000) {
    return { query, entries: await store.search(query, previousIds), enrichment: "cached", added: 0 };
  }
  if (cached?.status === "failed" && age >= 0 && age < 60000) {
    return { query, entries: await store.search(query, previousIds), enrichment: "unavailable", added: 0, message: "联网增补暂时不可用，已保留已有条目。稍后可重试。" };
  }
  let found: Discovery;
  try {
    found = await discovery(query);
  } catch (error) {
    console.error("Knowledge discovery failed", error instanceof Error ? error.message : "Unknown upstream failure");
    await store.recordFailure(query, now.toISOString());
    return { query, entries: await store.search(query, previousIds), enrichment: "unavailable", added: 0, message: "联网增补暂时不可用，已保留已有条目。稍后可重试。" };
  }
  const merged = await store.merge(found, now.toISOString(), query);
  return { query, entries: await store.search(query, merged.ids), enrichment: "updated", added: merged.added };
}
