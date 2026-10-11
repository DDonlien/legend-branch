import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CARD_HEIGHT, CARD_WIDTH, edgeToRoute, LABEL_WIDTH, nodeToPoint, type GraphLayout } from "../layout";
import { trackColor } from "../theme";
import type { LegendNode } from "../types";
import { MaterialCard, MaterialIconButton } from "./Material";
import { useLocale } from "../useLocale";
import { tagLabel, yearLabel } from "../i18n";

type LegendCanvasProps = {
  traceActive: boolean;
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  layout: GraphLayout;
  traceRoot: string;
};

function NodeShape({ node }: { node: LegendNode }) {
  if (node.kind === "literature") return <rect className="node-shape" x="-6" y="-6" width="12" height="12" rx="1" transform="rotate(45)" />;
  if (node.kind === "modern") return <rect className="node-shape" x="-6" y="-6" width="12" height="12" rx="2" />;
  return <circle className="node-shape" r="6" />;
}

export function LegendCanvas({ traceActive, selectedId, onSelectNode, layout, traceRoot }: LegendCanvasProps) {
  const { t, locale } = useLocale();
  const { density, metrics } = layout;
  const { nodes, edges, nodeById, regionLayouts, timelineTicks, width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = layout;
  const graphEdges = useMemo(() => layout.edges.map((edge) => ({ edge, ...edgeToRoute(edge, layout) })), [layout]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const expanded = hovered ?? focused;
  useEffect(() => { setHovered(null); setFocused(null); }, [density]);
  const date = (node: LegendNode) => yearLabel({ ...node, placement: { year: node.year, quality: node.origin === "project" ? "authored" : "curated" } }, locale);
  const leave = (id: string, target: EventTarget | null) => {
    if (target instanceof Element && target.closest(`[data-node-id="${CSS.escape(id)}"]`)) return;
    setHovered((current) => current === id ? null : current);
  };
  const blur = (id: string, target: EventTarget | null) => {
    if (target instanceof Element && target.closest(`[data-node-id="${CSS.escape(id)}"]`)) return;
    setFocused((current) => current === id ? null : current);
  };

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
    else if (point.x + metrics.cardWidth > container.scrollLeft + container.clientWidth - rightInset) {
      container.scrollLeft = point.x + metrics.cardWidth - container.clientWidth + rightInset;
    }
    if (point.y - metrics.cardHeight / 2 < container.scrollTop + 80) container.scrollTop = Math.max(0, point.y - metrics.cardHeight / 2 - 80);
    else if (point.y + metrics.cardHeight / 2 > container.scrollTop + container.clientHeight - 24) {
      container.scrollTop = point.y + metrics.cardHeight / 2 - container.clientHeight + 24;
    }
    setScroll({ x: container.scrollLeft, y: container.scrollTop });
  }, [selectedId, layout, nodeById, metrics]);

  const card = (node: LegendNode, detailed: boolean) => <MaterialCard color="filled" interactive className={`graph-card ${detailed ? "" : "name-card"}`} aria-label={t("viewNode", { name: node.name })} title={`${node.name} · ${date(node)}`} onClick={() => onSelectNode(node.id)}>
    <div className="graph-card-content">
      {detailed ? <span className="card-kind md-typescale-label-small">{t(node.origin === "project" ? "storyNode" : node.kind)}{node.id === traceRoot && traceActive ? <span className="card-trace-label">{t("traceCenter")}</span> : null}</span> : null}
      <strong className="card-title md-typescale-title-small">{node.name}</strong>
      {detailed ? <span className="card-year md-typescale-body-small"><span className="card-date">{date(node)}</span><span className="card-direction">{edges.some((edge) => edge.to === node.id) ? "←" : t("root")}{edges.some((edge) => edge.from === node.id) ? " →" : ""}</span></span> : null}
    </div>
  </MaterialCard>;

  return (
    <>
      <div className={`culture-rail density-${density}`} aria-hidden="true">
        <div className="culture-rail-heading md-typescale-label-medium">{t("tagGroups")}<span>{t("timeArrow")}</span></div>
        <div className="culture-rail-tracks" style={{ transform: `translateY(${-scroll.y}px)` }}>
          {regionLayouts.map((region) => (
            <div className="culture-rail-item" key={region.id} style={{ top: region.y, height: region.height, "--track-color": trackColor(region.id) } as CSSProperties}>
              <span className="culture-marker" />
              <strong className="md-typescale-title-medium">{region.id === "ungrouped" ? t("otherTags") : tagLabel({ id: region.id, name: region.label }, locale)}</strong>
              <small className="md-typescale-label-small">{t(region.id === "ungrouped" ? "unmatchedTags" : "groupedByTags")}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="timeline-header" aria-hidden="true">
        <svg width={CANVAS_WIDTH} height="64" style={{ transform: `translateX(${-scroll.x}px)` }}>
          {timelineTicks.map((tick) => <g key={tick.year}>
            <text x={tick.x} y="28">{tick.year < 0 ? t("bce", { year: Math.abs(tick.year) }) : tick.year === 0 ? t("ceOne") : tick.label}</text>
            <line x1={tick.x} x2={tick.x} y1="44" y2="64" />
          </g>)}
        </svg>
      </div>
      <div className="canvas-scroll" ref={scrollRef} onScroll={(event) => setScroll({ x: event.currentTarget.scrollLeft, y: event.currentTarget.scrollTop })}>
        <svg className={`legend-canvas density-${density}`} viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} role="group" aria-label={t("timelineGraph")}>
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
            ><title>{`${nodeById.get(edge.from)?.name} → ${nodeById.get(edge.to)?.name} · ${edge.relation} · ${t(edge.confidence)}${edge.debated ? ` · ${t("debated")}` : ""}`}</title></path>)}
          </g>
          <g className="node-layer">
            {nodes.map((node) => {
              const point = nodeToPoint(node, layout);
              const outgoing = edges.some((edge) => edge.from === node.id);
              return <g
                className={`node track-${node.region} node-${node.kind} ${node.isTrace && traceActive ? "is-traced" : ""} ${traceActive && !node.isTrace ? "is-muted" : ""} ${selectedId === node.id ? "is-selected" : ""}`}
                key={node.id} data-node-id={node.id} transform={`translate(${point.x}, ${point.y})`}
                style={{ "--track-color": trackColor(node.region) } as CSSProperties}
                onMouseEnter={() => { if (density === "nodes") setHovered(node.id); }} onMouseLeave={(event) => leave(node.id, event.relatedTarget)}
                onFocus={() => { if (density === "nodes") setFocused(node.id); }} onBlur={(event) => blur(node.id, event.relatedTarget)}
              >
                <g transform={`translate(${density === "nodes" ? 0 : -12}, 0)`} aria-hidden="true">
                  {selectedId === node.id ? <circle className="node-selection-ring" r="12" /> : null}
                  {density !== "nodes" ? <NodeShape node={node} /> : null}
                </g>
                {density === "nodes" ? <>
                  <path className="node-port-line" d="M -12 0 H 12" aria-hidden="true" />
                  <foreignObject x="-20" y="-20" width="40" height="40"><MaterialIconButton className="graph-node-button" size="sm" color="standard" aria-label={t("viewNode", { name: node.name })} onClick={() => onSelectNode(node.id)}>
                    <svg width="20" height="20" viewBox="-10 -10 20 20" aria-hidden="true"><NodeShape node={node} /></svg>
                  </MaterialIconButton></foreignObject>
                </> : <>
                  <path className="node-port-line" d={`M -6 0 H 0${outgoing ? ` M ${metrics.cardWidth} 0 H ${metrics.cardWidth + 12}` : ""}`} aria-hidden="true" />
                  {outgoing ? <circle className="node-port" cx={metrics.cardWidth + 12} cy="0" r="3" aria-hidden="true" /> : null}
                  <foreignObject x="0" y={-metrics.cardHeight / 2} width={metrics.cardWidth} height={metrics.cardHeight}>{card(node, density === "detailed")}</foreignObject>
                </>}
              </g>;
            })}
          </g>
          {density === "nodes" && expanded && nodeById.has(expanded) ? (() => {
            const node = nodeById.get(expanded)!;
            const point = nodeToPoint(node, layout);
            const viewportWidth = scrollRef.current?.clientWidth ?? CANVAS_WIDTH;
            const viewportHeight = scrollRef.current?.clientHeight ?? CANVAS_HEIGHT;
            const cardWidth = Math.min(CARD_WIDTH, Math.max(128, viewportWidth - LABEL_WIDTH - 16));
            const preferredX = point.x + 16 + cardWidth > scroll.x + viewportWidth - 8 ? point.x - cardWidth - 16 : point.x + 16;
            const x = Math.max(scroll.x + LABEL_WIDTH + 8, Math.min(preferredX, scroll.x + viewportWidth - cardWidth - 8));
            const y = Math.max(scroll.y + 72 + CARD_HEIGHT / 2, Math.min(point.y, scroll.y + viewportHeight - 8 - CARD_HEIGHT / 2));
            return <g className={`node node-hover ${selectedId === node.id ? "is-selected" : ""}`} data-node-id={node.id} transform={`translate(${x}, ${y})`} style={{ "--track-color": trackColor(node.region) } as CSSProperties}
              onMouseEnter={() => setHovered(node.id)} onMouseLeave={(event) => leave(node.id, event.relatedTarget)} onFocus={() => setFocused(node.id)} onBlur={(event) => blur(node.id, event.relatedTarget)}>
              <foreignObject x="0" y={-CARD_HEIGHT / 2} width={cardWidth} height={CARD_HEIGHT}>{card(node, true)}</foreignObject>
            </g>;
          })() : null}
        </svg>
      </div>
    </>
  );
}
