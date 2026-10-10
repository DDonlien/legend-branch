import { edges, nodes, regions } from "../data";
import type { LegendNode } from "../types";
import { MaterialCard, MaterialDivider, MaterialIcon, MaterialIconButton, MaterialList, MaterialListItem } from "./Material";

type DetailPanelProps = {
  node: LegendNode;
  onClose: () => void;
  onSelectNode: (id: string) => void;
};

const confidenceLabel = { confirmed: "确认较高", probable: "可能关联", speculative: "推测关联" };
const kindLabel = { origin: "神话 / 民俗", literature: "古典文学", modern: "现代作品" };

export function DetailPanel({ node, onClose, onSelectNode }: DetailPanelProps) {
  const related = edges
    .filter((edge) => edge.from === node.id || edge.to === node.id)
    .map((edge) => ({ edge, target: nodes.find((item) => item.id === (edge.from === node.id ? edge.to : edge.from)) }))
    .filter((item) => item.target);
  const region = regions.find((item) => item.id === node.region);

  return (
    <aside className="detail-panel" aria-label={`${node.name}详情`} onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    }}>
      <MaterialCard color="elevated" className="detail-surface">
        <div className="detail-content">
          <div className="panel-header">
            <span className={`panel-kind kind-${node.kind} md-typescale-label-large`}>{kindLabel[node.kind]}</span>
            <MaterialIconButton color="standard" size="sm" type="button" onClick={onClose} aria-label="关闭详情" title="关闭详情">
              <MaterialIcon name="close" />
            </MaterialIconButton>
          </div>
          <h2 className="md-typescale-headline-small">{node.name}</h2>
          {node.latinName ? <p className="latin-name md-typescale-body-medium">{node.latinName}</p> : null}
          <p className="panel-meta md-typescale-body-small">{node.yearLabel} · {region?.label}</p>
          <p className="panel-summary md-typescale-body-medium">{node.summary}</p>
          <MaterialDivider />
          <section aria-labelledby="relations-heading">
            <h3 id="relations-heading" className="md-typescale-title-small">来源与影响<span className="md-typescale-label-medium">{related.length}</span></h3>
            <MaterialList className="relation-list" aria-label="来源与影响">
              {related.map(({ edge, target }) => <MaterialListItem key={edge.id} onClick={() => onSelectNode(target!.id)} aria-label={`查看相关节点：${target!.name}`}>
                <MaterialIcon slot="leading" name={edge.from === node.id ? "arrow_forward" : "arrow_back"} />
                <span>{target!.name}</span>
                <div slot="supporting-text" className={`confidence confidence-${edge.confidence}`}>
                  <i className={`line line-${edge.confidence}`} />{confidenceLabel[edge.confidence]}{edge.debated ? " · 存在争议" : ""}
                </div>
              </MaterialListItem>)}
            </MaterialList>
          </section>
          <MaterialDivider />
          <section aria-labelledby="sources-heading">
            <h3 id="sources-heading" className="md-typescale-title-small">外链索引<MaterialIcon name="open_in_new" /></h3>
            <MaterialList className="source-list" aria-label="外链索引">
              {node.sources.map((source) => <MaterialListItem key={source.url} nonInteractive>
                <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
                  <span>{source.label}</span><MaterialIcon name="open_in_new" />
                </a>
              </MaterialListItem>)}
            </MaterialList>
          </section>
        </div>
      </MaterialCard>
    </aside>
  );
}
