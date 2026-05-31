import { edges, nodes } from "../data";
import type { LegendNode } from "../types";

type DetailPanelProps = {
  node: LegendNode;
  onClose: () => void;
  onSelectNode: (id: string) => void;
};

const confidenceLabel = {
  confirmed: "CONFIRMED",
  probable: "PROBABLE",
  speculative: "SPECULATIVE",
};

const kindLabel = {
  origin: "神话 / 民俗",
  literature: "古典文学",
  modern: "现代作品",
};

export function DetailPanel({ node, onClose, onSelectNode }: DetailPanelProps) {
  const related = edges
    .filter((edge) => edge.from === node.id || edge.to === node.id)
    .map((edge) => {
      const targetId = edge.from === node.id ? edge.to : edge.from;
      return { edge, target: nodes.find((item) => item.id === targetId) };
    })
    .filter((item) => item.target);

  return (
    <aside className="detail-panel" aria-label={`${node.name}详情`}>
      <button className="panel-close" type="button" onClick={onClose} aria-label="关闭详情">
        ×
      </button>
      <div className={`panel-kind kind-${node.kind}`}>{kindLabel[node.kind]}</div>
      <h2>{node.name}</h2>
      {node.latinName ? <p className="latin-name">{node.latinName}</p> : null}
      <p className="panel-meta">
        {node.yearLabel} · {kindLabel[node.kind]}
      </p>
      <p className="panel-summary">{node.summary}</p>

      <section>
        <h3>来源与影响</h3>
        <ul className="relation-list">
          {related.map(({ edge, target }) => (
            <li key={edge.id}>
              <button type="button" onClick={() => onSelectNode(target!.id)}>
                <span>{edge.from === node.id ? "→" : "←"}</span>
                <b>{target!.name}</b>
              </button>
              <small className={`confidence confidence-${edge.confidence}`}>
                {confidenceLabel[edge.confidence]}
                {edge.debated ? " · DEBATED" : ""}
              </small>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>外链索引</h3>
        <ul className="source-list">
          {node.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label} <span>↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
