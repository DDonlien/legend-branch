import { useMemo, useState } from "react";
import { CanvasFooter } from "./components/CanvasFooter";
import { DetailPanel } from "./components/DetailPanel";
import { LegendCanvas } from "./components/LegendCanvas";
import { Toolbar } from "./components/Toolbar";
import { nodes } from "./data";

export function App() {
  const [traceActive, setTraceActive] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>("sun-wukong");
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedId) ?? null, [selectedId]);

  return (
    <main className="app-shell">
      <Toolbar
        traceActive={traceActive}
        toolbarVisible={toolbarVisible}
        onToggleTrace={() => setTraceActive((active) => !active)}
        onToggleToolbar={() => setToolbarVisible((visible) => !visible)}
      />
      <div className="canvas-frame">
        <LegendCanvas traceActive={traceActive} selectedId={selectedId} onSelectNode={setSelectedId} />
        {selectedNode ? <DetailPanel node={selectedNode} onClose={() => setSelectedId(null)} onSelectNode={setSelectedId} /> : null}
        <CanvasFooter traceActive={traceActive} />
      </div>
    </main>
  );
}
