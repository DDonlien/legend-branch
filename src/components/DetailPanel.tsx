import { useEffect, useRef, useState } from "react";
import type { EntryDetail, KnowledgeEntry, KnowledgeGraph } from "../knowledge";
import { detailFromGraph, eligibleForGraph } from "../graph";
import { MaterialButton, MaterialCard, MaterialChipSet, MaterialDialog, MaterialDivider, MaterialIcon, MaterialIconButton, MaterialList, MaterialListItem, MaterialSuggestionChip } from "./Material";

type DetailPanelProps = {
  entry: KnowledgeEntry;
  onClose: () => void;
  onSelectEntry: (entry: KnowledgeEntry) => void;
  onSearch: (query: string) => void;
  graph: KnowledgeGraph;
  privateMode: boolean;
  onTrace: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddRelation: () => void;
  onRemoveRelation: (id: string) => void;
  onAddToProject?: (entry: KnowledgeEntry) => void;
};

const confidenceLabel = { confirmed: "确认较高", probable: "可能关联", speculative: "推测关联" };
const kindLabel = { origin: "神话 / 民俗", literature: "古典文学", modern: "现代作品", entry: "知识条目" };

export function DetailPanel({ entry, onClose, onSelectEntry, onSearch, graph, privateMode, onTrace, onEdit, onDelete, onAddRelation, onRemoveRelation, onAddToProject }: DetailPanelProps) {
  const [detail, setDetail] = useState<EntryDetail>(() => detailFromGraph(graph, entry));
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [managingRelations, setManagingRelations] = useState(false);
  const relatedController = useRef<AbortController | null>(null);
  useEffect(() => {
    setDetail(detailFromGraph(graph, entry));
    setMessage("");
    setManagingRelations(false);
    if (privateMode) return;
    const controller = new AbortController();
    fetch(`/api/entries/${encodeURIComponent(entry.id)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("共享知识库暂时无法连接，当前内容仍可查看。");
        const next = await response.json() as EntryDetail;
        if (!controller.signal.aborted) setDetail(next);
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "详情暂时无法更新。");
      });
    return () => { controller.abort(); relatedController.current?.abort(); };
  }, [entry, graph, privateMode]);
  const node = detail.entry;
  const related = detail.relationships;
  async function openRelated(id: string) {
    relatedController.current?.abort();
    const local = graph.entries.find((item) => item.id === id);
    if (local) { onSelectEntry(local); return; }
    if (privateMode) return;
    const controller = new AbortController();
    relatedController.current = controller;
    try {
      const response = await fetch(`/api/entries/${encodeURIComponent(id)}`, { signal: controller.signal });
      if (!response.ok) throw new Error("相关条目暂时无法加载，请稍后重试。");
      const next = await response.json() as EntryDetail;
      if (!controller.signal.aborted) onSelectEntry(next.entry);
    } catch { if (!controller.signal.aborted) setMessage("相关条目暂时无法加载，请稍后重试。"); }
  }

  return (
    <aside className="detail-panel" aria-label={`${node.name}详情`} onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    }}>
      <MaterialCard color="elevated" className="detail-surface">
        <div className="detail-content">
          <div className="panel-header">
            <span className={`panel-kind kind-${node.kind} md-typescale-label-large`}>{node.origin === "project" ? "故事节点" : kindLabel[node.kind]}</span>
            <MaterialIconButton color="standard" size="sm" type="button" onClick={onClose} aria-label="关闭详情" title="关闭详情">
              <MaterialIcon name="close" />
            </MaterialIconButton>
          </div>
          <h2 className="md-typescale-headline-small">{node.name}</h2>
          {node.latinName ? <p className="latin-name md-typescale-body-medium">{node.latinName}</p> : null}
          <p className="panel-meta md-typescale-body-small">{[node.yearLabel ?? "年代待核实", node.origin === "project" ? "个人创作" : node.origin === "baseline" ? "基线快照" : node.reviewStatus === "unreviewed" ? "联网增补 · 待复核" : "已整理"].join(" · ")}</p>
          {!eligibleForGraph(node) ? <p className="panel-meta md-typescale-body-small">{node.placement ? "文化 / 国家信息待核实，暂未进入时间图谱。" : "缺少可靠年代，暂未进入时间图谱。"}</p> : null}
          <div className="detail-actions"><MaterialButton size="sm" color="tonal" disabled={!eligibleForGraph(node) || Boolean(onAddToProject)} onClick={onTrace}>Trace 此条目</MaterialButton>
            {onAddToProject ? <MaterialButton size="sm" color="filled" onClick={() => onAddToProject(node)}>加入当前项目</MaterialButton> : null}
            {privateMode ? <><MaterialIconButton size="sm" aria-label="编辑故事节点" onClick={onEdit}><MaterialIcon name="edit" /></MaterialIconButton><MaterialIconButton size="sm" aria-label="添加发展关系" onClick={onAddRelation}><MaterialIcon name="add_link" /></MaterialIconButton><MaterialIconButton size="sm" aria-label="删除故事节点" onClick={() => setDeleting(true)}><MaterialIcon name="delete" /></MaterialIconButton></> : null}
          </div>
          <p className="panel-summary md-typescale-body-medium">{node.summary}</p>
          <section aria-labelledby="tags-heading">
            <h3 id="tags-heading" className="md-typescale-title-small">标签</h3>
            <MaterialChipSet className="entry-tags" aria-label="条目标签">
              {node.tags.map((tag) => <MaterialSuggestionChip key={tag.id} label={tag.name} aria-label={`搜索标签：${tag.name}`} onClick={() => onSearch(tag.name)} />)}
            </MaterialChipSet>
            {!node.tags.length ? <p className="panel-meta md-typescale-body-small">来源尚未提供标签。</p> : null}
          </section>
          {message ? <p role="status" className="panel-meta md-typescale-body-small">{message}</p> : null}
          <MaterialDivider />
          <section aria-labelledby="relations-heading">
            <h3 id="relations-heading" className="md-typescale-title-small">来源与影响<span className="md-typescale-label-medium">{related.length}</span></h3>
            <MaterialList className="relation-list" aria-label="来源与影响">
              {related.map((edge) => <MaterialListItem key={edge.id} onClick={() => openRelated(edge.target.id)} aria-label={`查看相关节点：${edge.target.name}`}>
                <MaterialIcon slot="leading" name={edge.from === node.id ? "arrow_forward" : "arrow_back"} />
                <span>{edge.target.name} · {edge.target.yearLabel ?? "年代待核实"}</span>
                <div slot="supporting-text" className={`confidence confidence-${edge.confidence}`}>
                  <i className={`line line-${edge.confidence}`} />{edge.relation} · {privateMode && !edge.sources.length ? "个人创作" : confidenceLabel[edge.confidence]}{edge.debated ? " · 存在争议" : ""}{edge.reviewStatus === "unreviewed" ? " · 待复核" : ""}
                </div>
              </MaterialListItem>)}
            </MaterialList>
            {privateMode && related.length ? <><MaterialButton size="sm" color="outlined" onClick={() => setManagingRelations((value) => !value)}>{managingRelations ? "收起关系管理" : "管理关系"}</MaterialButton>{managingRelations ? <div className="relation-remove-actions">{related.map((edge) => <MaterialButton key={edge.id} size="sm" color="outlined" onClick={() => onRemoveRelation(edge.id)}>移除 {edge.relation} · {edge.target.name}</MaterialButton>)}</div> : null}</> : null}
            {!related.length ? <p className="panel-meta md-typescale-body-small">尚未记录传播关系。</p> : null}
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
      {deleting ? <MaterialDialog open onClosed={() => setDeleting(false)}><div slot="headline">删除故事节点？</div><div slot="content">删除项目中的“{node.name}”及其发展关系。</div><div slot="actions"><MaterialButton size="sm" color="outlined" onClick={() => setDeleting(false)}>取消</MaterialButton><MaterialButton size="sm" onClick={() => { onDelete(); setDeleting(false); }}>删除节点</MaterialButton></div></MaterialDialog> : null}
    </aside>
  );
}
