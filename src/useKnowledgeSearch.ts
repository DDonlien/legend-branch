import { useEffect, useRef, useState } from "react";
import { nodes } from "./data";
import { normalizeSearch, type SearchResponse } from "./knowledge";

export function useKnowledgeSearch() {
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  async function search(query: string) {
    query = query.trim();
    if (query.length < 2 || query.length > 120) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const key = normalizeSearch(query);
    const local = nodes.filter((node) => [node.name, node.latinName ?? "", ...node.tags.map((tag) => tag.name)].some((value) => normalizeSearch(value).includes(key)));
    setResult({ query, entries: local.map((node) => ({ ...node, reviewStatus: "curated" })), enrichment: "pending", added: 0 });
    setLoading(true);
    try {
      const cached = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      if (!cached.ok) throw new Error("无法连接知识库。请检查后端服务。");
      const existing = await cached.json() as SearchResponse;
      if (controller.signal.aborted) return;
      setResult(existing);
      const enriched = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }), signal: controller.signal });
      if (!enriched.ok) throw new Error("联网增补暂时不可用，已有结果仍可查看。");
      const next = await enriched.json() as SearchResponse;
      if (!controller.signal.aborted) setResult(next);
    } catch {
      if (!controller.signal.aborted) setResult((current) => current ? { ...current, enrichment: "unavailable", message: "知识库暂时无法连接，已有结果仍可查看。请稍后重试。" } : null);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function close() {
    pending.current?.abort();
    setResult(null);
    setLoading(false);
  }
  return { result, loading, search, close };
}
