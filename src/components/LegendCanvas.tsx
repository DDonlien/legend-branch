import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CARD_HEIGHT, CARD_WIDTH, edgeToRoute, LABEL_WIDTH, nodeToPoint, type GraphLayout } from "../layout";
import { trackColor } from "../theme";
import type { LegendNode } from "../types";
import { MaterialCard } from "./Material";

type LegendCanvasProps = {
  traceActive: boolean;
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  layout: GraphLayout;
  traceRoot: string;
};

const kindLabel = { origin: "神话 / 民俗", literature: "古典文学", modern: "现代作品", entry: "知识条目" };

function NodeShape({ node }: { node: LegendNode }) {
  if (node.kind === "literature") return <rect className="node-shape" x="-6" y="-6" width="12" height="12" rx="1" transform="rotate(45)" />;
  if (node.kind === "modern") return <rect className="node-shape" x="-6" y="-6" width="12" height="12" rx="2" />;
  return <circle className="node-shape" r="6" />;
}

export function LegendCanvas({ traceActive, selectedId, onSelectNode, layout, traceRoot }: LegendCanvasProps) {
  const { nodes, edges, nodeById, regionLayouts, timelineTicks, width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = layout;
  const graphEdges = useMemo(() => layout.edges.map((edge) => ({ edge, ...edgeToRoute(edge, layout) })), [layout]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [scroll, setScroll] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = scrollRef.current;
    const focus = nodeById.get(traceRoot) ?? nodes[0];
    if (!container || !focus) return;
    if (initialized.current) return;
    initialized.current = true;
    const point = nodeToPoint(focus, layout);
    container.scrollLeft = Math.max(0, point.x - container.clientWidth * 0.5);
    container.scrollTop = Math.max(0, point.y - container.clientHeight * 0.38);
    setScroll({ x: container.scrollLeft, y: container.scrollTop });
  }, [layout, nodeById, nodes, traceRoot]);

  useEffect(() => {
    const container = scrollRef.current;
    const selected = selectedId ? nodeById.get(selectedId) : null;
    if (!container || !selected) return;
    const point = nodeToPoint(selected, layout);
    const leftInset = LABEL_WIDTH + 24;
    const rightInset = Math.min(384, container.clientWidth * 0.4);
    if (point.x < container.scrollLeft + leftInset) container.scrollLeft = Math.max(0, point.x - leftInset);
    else if (point.x + CARD_WIDTH > container.scrollLeft + container.clientWidth - rightInset) {
      container.scrollLeft = point.x + CARD_WIDTH - container.clientWidth + rightInset;
    }
    if (point.y - CARD_HEIGHT / 2 < container.scrollTop + 80) container.scrollTop = Math.max(0, point.y - CARD_HEIGHT / 2 - 80);
    else if (point.y + CARD_HEIGHT / 2 > container.scrollTop + container.clientHeight - 24) {
      container.scrollTop = point.y + CARD_HEIGHT / 2 - container.clientHeight + 24;
    }
    setScroll({ x: container.scrollLeft, y: container.scrollTop });
  }, [selectedId, layout, nodeById]);

  return (
    <>
      <div className="culture-rail" aria-hidden="true">
        <div className="culture-rail-heading md-typescale-label-medium">标签分组<span>时间 →</span></div>
        <div className="culture-rail-tracks" style={{ transform: `translateY(${-scroll.y}px)` }}>
          {regionLayouts.map((region) => (
            <div className="culture-rail-item" key={region.id} style={{ top: region.y, height: region.height, "--track-color": trackColor(region.id) } as CSSProperties}>
              <span className="culture-marker" />
              <strong className="md-typescale-title-medium">{region.label}</strong>
              <small className="md-typescale-label-small">{region.subtitle}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="timeline-header" aria-hidden="true">
        <svg width={CANVAS_WIDTH} height="64" style={{ transform: `translateX(${-scroll.x}px)` }}>
          {timelineTicks.map((tick) => <g key={tick.year}>
            <text x={tick.x} y="28">{tick.label}</text>
            <line x1={tick.x} x2={tick.x} y1="44" y2="64" />
          </g>)}
        </svg>
      </div>
      <div className="canvas-scroll" ref={scrollRef} onScroll={(event) => setScroll({ x: event.currentTarget.scrollLeft, y: event.currentTarget.scrollTop })}>
        <svg className="legend-canvas" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} role="group" aria-label="时间图谱，横向为非等距时间，纵向为标签分组与角色行">
          <g className="region-layer" aria-hidden="true">
            {regionLayouts.map((region) => <g className="region" key={region.id} style={{ "--track-color": trackColor(region.id) } as CSSProperties}>
              <rect x="0" y={region.y} width={CANVAS_WIDTH} height={region.height} />
              <line x1="0" y1={region.y + region.height} x2={CANVAS_WIDTH} y2={region.y + region.height} />
            </g>)}
            <line className="label-divider" x1={LABEL_WIDTH} y1="0" x2={LABEL_WIDTH} y2={CANVAS_HEIGHT} />
          </g>
          <g className="grid-layer" aria-hidden="true">
            {timelineTicks.map((tick) => <line key={tick.year} x1={tick.x} x2={tick.x} y1="64" y2={CANVAS_HEIGHT} />)}
          </g>
          <g className="edge-layer" aria-hidden="true">
            {graphEdges.map(({ edge, path, track }) => <path
              key={edge.id} data-edge-id={edge.id}
              className={`edge track-${track} edge-${edge.confidence} ${edge.isTrace && traceActive ? "is-traced" : ""} ${traceActive && !edge.isTrace ? "is-muted" : ""}`}
              d={path}
              style={{ "--track-color": trackColor(track) } as CSSProperties}
            ><title>{`${nodeById.get(edge.from)?.name} → ${nodeById.get(edge.to)?.name} · ${edge.relation} · ${edge.confidence}${edge.debated ? " · 存在争议" : ""}`}</title></path>)}
          </g>
          <g className="node-layer">
            {nodes.map((node) => {
              const point = nodeToPoint(node, layout);
              const incoming = edges.some((edge) => edge.to === node.id);
              const outgoing = edges.some((edge) => edge.from === node.id);
              return <g
                className={`node track-${node.region} node-${node.kind} ${node.isTrace && traceActive ? "is-traced" : ""} ${traceActive && !node.isTrace ? "is-muted" : ""} ${selectedId === node.id ? "is-selected" : ""}`}
                key={node.id} data-node-id={node.id} transform={`translate(${point.x}, ${point.y})`}
                style={{ "--track-color": trackColor(node.region) } as CSSProperties}
              >
                <g transform="translate(-12, 0)" aria-hidden="true">
                  {selectedId === node.id ? <circle className="node-selection-ring" r="12" /> : null}
                  <NodeShape node={node} />
                </g>
                <path className="node-port-line" d={`M -6 0 H 0${outgoing ? ` M ${CARD_WIDTH} 0 H ${CARD_WIDTH + 12}` : ""}`} aria-hidden="true" />
                {outgoing ? <circle className="node-port" cx={CARD_WIDTH + 12} cy="0" r="3" aria-hidden="true" /> : null}
                <foreignObject x="0" y={-CARD_HEIGHT / 2} width={CARD_WIDTH} height={CARD_HEIGHT}>
                  <MaterialCard color="filled" interactive className="graph-card" aria-label={`查看节点：${node.name}`} title={`${node.name} · ${node.yearLabel}`} onClick={() => onSelectNode(node.id)}>
                    <div className="graph-card-content">
                      <span className="card-kind md-typescale-label-small">{node.origin === "project" ? "故事节点" : kindLabel[node.kind]}{node.id === traceRoot && traceActive ? <span className="card-trace-label">Trace 中心</span> : null}</span>
                      <strong className="card-title md-typescale-title-small">{node.name}</strong>
                      <span className="card-year md-typescale-body-small">{node.yearLabel}<span>{incoming ? "←" : "起源"}{outgoing ? " →" : ""}</span></span>
                    </div>
                  </MaterialCard>
                </foreignObject>
              </g>;
            })}
          </g>
        </svg>
      </div>
    </>
  );
}
