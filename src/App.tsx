import { useState } from "react";
import { CanvasFooter } from "./components/CanvasFooter";
import { DetailPanel } from "./components/DetailPanel";
import { LegendCanvas } from "./components/LegendCanvas";
import { Toolbar } from "./components/Toolbar";
import { nodes } from "./data";
import type { KnowledgeEntry } from "./knowledge";
import { useKnowledgeSearch } from "./useKnowledgeSearch";
import { SearchResults } from "./components/SearchResults";

export function App() {
  const [traceActive, setTraceActive] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>({ ...nodes.find((node) => node.id === "sun-wukong")!, reviewStatus: "curated" });
  const knowledge = useKnowledgeSearch();
  const [query, setQuery] = useState("");
  const search = (next: string) => { setQuery(next); void knowledge.search(next); };
  const selectNode = (id: string) => {
    const node = nodes.find((node) => node.id === id);
    if (node) setSelectedEntry({ ...node, reviewStatus: "curated" });
  };

  return (
    <main className="app-shell">
      <Toolbar
        traceActive={traceActive}
        toolbarVisible={toolbarVisible}
        onToggleTrace={() => setTraceActive((active) => !active)}
        onToggleToolbar={() => setToolbarVisible((visible) => !visible)}
        onSearch={search}
        query={query}
        onQueryChange={setQuery}
      />
      <div className="canvas-frame">
        <LegendCanvas traceActive={traceActive} selectedId={selectedEntry?.id ?? null} onSelectNode={selectNode} />
        {knowledge.result ? <SearchResults result={knowledge.result} loading={knowledge.loading} onClose={knowledge.close} onSelect={(entry) => { setSelectedEntry(entry); knowledge.close(); }} /> : null}
        {selectedEntry && !knowledge.result ? <DetailPanel key={selectedEntry.id} entry={selectedEntry} onClose={() => setSelectedEntry(null)} onSelectEntry={setSelectedEntry} onSearch={search} /> : null}
        <CanvasFooter traceActive={traceActive} />
      </div>
    </main>
  );
}
