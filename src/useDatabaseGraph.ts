import { useCallback, useEffect, useRef, useState } from "react";
import { fallbackGraph } from "./graph";
import type { GraphPage, KnowledgeGraph } from "./knowledge";
import type { TranslationKey } from "./i18n";

export function useDatabaseGraph() {
  const [graph, setGraph] = useState<KnowledgeGraph>(fallbackGraph);
  const [message, setMessage] = useState<TranslationKey | null>("graphLoading");
  const pending = useRef<AbortController | null>(null);
  const loaded = useRef(false);
  const refresh = useCallback(async () => {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    try {
      const next: KnowledgeGraph = { entries: [], relationships: [] };
      let cursor: string | null = "";
      do {
        const response = await fetch(`/api/graph${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`, { signal: controller.signal });
        if (!response.ok) throw new Error("图谱无法更新");
        const page = await response.json() as GraphPage;
        next.entries.push(...page.entries);
        next.relationships.push(...page.relationships);
        if (page.nextCursor === cursor) throw new Error("图谱分页异常");
        cursor = page.nextCursor;
      } while (cursor !== null);
      if (controller.signal.aborted) return;
      const ids = new Set(next.entries.map((entry) => entry.id));
      next.relationships = next.relationships.filter((edge) => ids.has(edge.from) && ids.has(edge.to));
      loaded.current = true;
      setGraph(next);
      setMessage(null);
    } catch {
      if (!controller.signal.aborted) setMessage(loaded.current ? "graphUpdateError" : "graphOffline");
    }
  }, []);
  useEffect(() => {
    void refresh();
    const update = () => { if (!document.hidden) void refresh(); };
    window.addEventListener("focus", update);
    return () => { pending.current?.abort(); window.removeEventListener("focus", update); };
  }, [refresh]);
  return { graph, message, refresh };
}
