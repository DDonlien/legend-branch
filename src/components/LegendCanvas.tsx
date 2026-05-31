import { useEffect, useRef } from "react";
import { edges, nodes, regions } from "../data";
import { CANVAS_HEIGHT, CANVAS_WIDTH, LABEL_WIDTH, nodeById, nodeToPoint, timelineTicks, yearToX } from "../layout";
import type { LegendNode } from "../types";

type LegendCanvasProps = {
  traceActive: boolean;
  selectedId: string | null;
  onSelectNode: (id: string) => void;
};

function edgePath(from: LegendNode, to: LegendNode) {
  const start = nodeToPoint(from);
  const end = nodeToPoint(to);
  const middleX = start.x + Math.max(30, (end.x - start.x) * 0.52);
  return `M ${start.x} ${start.y} C ${middleX} ${start.y}, ${middleX} ${end.y}, ${end.x} ${end.y}`;
}

function NodeShape({ node }: { node: LegendNode }) {
  if (node.kind === "literature") {
    return <rect className="node-shape" x="-9" y="-9" width="18" height="18" rx="1" transform="rotate(45)" />;
  }
  if (node.kind === "modern") {
    return <rect className="node-shape" x="-8" y="-8" width="16" height="16" rx="1" />;
  }
  return <circle className="node-shape" r="8" />;
}

export function LegendCanvas({ traceActive, selectedId, onSelectNode }: LegendCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const focusNode = nodeById.get("sun-wukong");
    if (!scrollContainer || !focusNode) return;
    const focusPoint = nodeToPoint(focusNode);
    scrollContainer.scrollLeft = Math.max(0, focusPoint.x - scrollContainer.clientWidth * 0.62);
    scrollContainer.scrollTop = 0;
  }, []);

  return (
    <>
      <div className="culture-rail" aria-hidden="true">
        {regions.map((region) => (
          <div
            className={`culture-rail-item region-${region.id}`}
            key={region.id}
            style={{ top: region.y, height: region.height }}
          >
            <strong>{region.label}</strong>
            <small>{region.subtitle}</small>
          </div>
        ))}
      </div>
      <div className="canvas-scroll" ref={scrollRef}>
        <svg
          className="legend-canvas"
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          role="img"
          aria-label="孙悟空传说演化时间图谱"
        >
        <defs>
          <filter id="trace-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="arrow-trace" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" fill="#dfff3f" />
          </marker>
        </defs>

        <g className="grid-layer">
          {timelineTicks.map((tick) => (
            <g key={tick.year}>
              <line x1={yearToX(tick.year)} y1="44" x2={yearToX(tick.year)} y2={CANVAS_HEIGHT} />
              <text x={yearToX(tick.year)} y="28">
                {tick.label}
              </text>
            </g>
          ))}
        </g>

        <g className="region-layer">
          {regions.map((region) => (
            <g className={`region region-${region.id}`} key={region.id}>
              <rect x="0" y={region.y} width={CANVAS_WIDTH} height={region.height} />
              <line x1="0" y1={region.y + region.height} x2={CANVAS_WIDTH} y2={region.y + region.height} />
              <text className="region-label" x="24" y={region.y + region.height / 2 - 6}>
                {region.label}
              </text>
              <text className="region-subtitle" x="24" y={region.y + region.height / 2 + 18}>
                {region.subtitle}
              </text>
            </g>
          ))}
          <line className="label-divider" x1={LABEL_WIDTH} y1="0" x2={LABEL_WIDTH} y2={CANVAS_HEIGHT} />
        </g>

        <g className="edge-layer">
          {edges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const muted = traceActive && !edge.isTrace;
            return (
              <path
                className={`edge edge-${edge.confidence} ${edge.isTrace && traceActive ? "is-traced" : ""} ${muted ? "is-muted" : ""}`}
                d={edgePath(from, to)}
                key={edge.id}
                markerEnd={edge.isTrace && traceActive ? "url(#arrow-trace)" : undefined}
              />
            );
          })}
        </g>

        <g className="node-layer">
          {nodes.map((node) => {
            const point = nodeToPoint(node);
            const muted = traceActive && !node.isTrace;
            return (
              <g
                className={`node node-${node.kind} ${node.isTrace && traceActive ? "is-traced" : ""} ${
                  muted ? "is-muted" : ""
                } ${selectedId === node.id ? "is-selected" : ""}`}
                key={node.id}
                transform={`translate(${point.x}, ${point.y})`}
              >
                <NodeShape node={node} />
                <text className="node-title" x="18" y="-3">
                  {node.name}
                </text>
                <text className="node-year" x="18" y="16">
                  {node.yearLabel}
                </text>
                <foreignObject x="-14" y="-20" width="220" height="44">
                  <button
                    className="node-hitbox"
                    type="button"
                    aria-label={`查看节点：${node.name}`}
                    onClick={() => onSelectNode(node.id)}
                  />
                </foreignObject>
              </g>
            );
          })}
        </g>
        </svg>
      </div>
    </>
  );
}
