import { useEffect, useRef, useState } from "react";
import type { EntryDetail, KnowledgeEntry, KnowledgeGraph } from "../knowledge";
import { detailFromGraph, eligibleForGraph } from "../graph";
import { useLocale } from "../useLocale";
import { tagLabel, yearLabel, type TranslationKey } from "../i18n";
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

export function DetailPanel({ entry, onClose, onSelectEntry, onSearch, graph, privateMode, onTrace, onEdit, onDelete, onAddRelation, onRemoveRelation, onAddToProject }: DetailPanelProps) {
  const { t, locale } = useLocale();
  const [detail, setDetail] = useState<EntryDetail>(() => detailFromGraph(graph, entry));
  const [message, setMessage] = useState<TranslationKey | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [managingRelations, setManagingRelations] = useState(false);
  const relatedController = useRef<AbortController | null>(null);
  useEffect(() => {
    setDetail(detailFromGraph(graph, entry));
    setMessage(null);
    setManagingRelations(false);
    if (privateMode) return;
    const controller = new AbortController();
    fetch(`/api/entries/${encodeURIComponent(entry.id)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("共享知识库暂时无法连接，当前内容仍可查看。");
        const next = await response.json() as EntryDetail;
        if (!controller.signal.aborted) setDetail(next);
      }).catch(() => {
        if (!controller.signal.aborted) setMessage("detailUnavailable");
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
    } catch { if (!controller.signal.aborted) setMessage("relatedUnavailable"); }
  }

  return (
    <aside className="detail-panel" aria-label={t("detailTitle", { name: node.name })} onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    }}>
      <MaterialCard color="elevated" className="detail-surface">
        <div className="detail-content">
          <div className="panel-header">
            <span className={`panel-kind kind-${node.kind} md-typescale-label-large`}>{t(node.origin === "project" ? "storyNode" : node.kind)}</span>
            <MaterialIconButton color="standard" size="sm" type="button" onClick={onClose} aria-label={t("closeDetail")} title={t("closeDetail")}>
              <MaterialIcon name="close" />
            </MaterialIconButton>
          </div>
          <h2 className="md-typescale-headline-small">{node.name}</h2>
          {node.latinName ? <p className="latin-name md-typescale-body-medium">{node.latinName}</p> : null}
          <p className="panel-meta md-typescale-body-small">{[yearLabel(node, locale), t(node.origin === "project" ? "authored" : node.origin === "baseline" ? "baselineSnapshot" : node.reviewStatus === "unreviewed" ? "enrichedUnreviewed" : "curated")].join(" · ")}</p>
          {!eligibleForGraph(node) ? <p className="panel-meta md-typescale-body-small">{t(node.placement ? "cultureUnknown" : "dateMissing")}</p> : null}
          <div className="detail-actions"><MaterialButton size="sm" color="tonal" disabled={!eligibleForGraph(node) || Boolean(onAddToProject)} onClick={onTrace}>{t("traceEntry")}</MaterialButton>
            {onAddToProject ? <MaterialButton size="sm" color="filled" onClick={() => onAddToProject(node)}>{t("addToProject")}</MaterialButton> : null}
            {privateMode ? <><MaterialIconButton size="sm" aria-label={t("editNode")} onClick={onEdit}><MaterialIcon name="edit" /></MaterialIconButton><MaterialIconButton size="sm" aria-label={t("addRelation")} onClick={onAddRelation}><MaterialIcon name="add_link" /></MaterialIconButton><MaterialIconButton size="sm" aria-label={t("deleteNode")} onClick={() => setDeleting(true)}><MaterialIcon name="delete" /></MaterialIconButton></> : null}
          </div>
          <p className="panel-summary md-typescale-body-medium">{node.summary}</p>
          <section aria-labelledby="tags-heading">
            <h3 id="tags-heading" className="md-typescale-title-small">{t("tags")}</h3>
            <MaterialChipSet className="entry-tags" aria-label={t("entryTags")}>
              {node.tags.map((tag) => <MaterialSuggestionChip key={tag.id} label={tagLabel(tag, locale)} aria-label={t("searchTag", { name: tagLabel(tag, locale) })} onClick={() => onSearch(tag.name)} />)}
            </MaterialChipSet>
            {!node.tags.length ? <p className="panel-meta md-typescale-body-small">{t("tagsMissing")}</p> : null}
          </section>
          {message ? <p role="status" className="panel-meta md-typescale-body-small">{t(message)}</p> : null}
          <MaterialDivider />
          <section aria-labelledby="relations-heading">
            <h3 id="relations-heading" className="md-typescale-title-small">{t("influences")}<span className="md-typescale-label-medium">{related.length}</span></h3>
            <MaterialList className="relation-list" aria-label={t("influences")}>
              {related.map((edge) => <MaterialListItem key={edge.id} onClick={() => openRelated(edge.target.id)} aria-label={t("viewRelated", { name: edge.target.name })}>
                <MaterialIcon slot="leading" name={edge.from === node.id ? "arrow_forward" : "arrow_back"} />
                <span>{edge.target.name} · {yearLabel(graph.entries.find((entry) => entry.id === edge.target.id) ?? edge.target, locale)}</span>
                <div slot="supporting-text" className={`confidence confidence-${edge.confidence}`}>
                  <i className={`line line-${edge.confidence}`} />{edge.relation} · {t(privateMode && !edge.sources.length ? "authored" : edge.confidence)}{edge.debated ? ` · ${t("debated")}` : ""}{edge.reviewStatus === "unreviewed" ? ` · ${t("unreviewed")}` : ""}
                </div>
              </MaterialListItem>)}
            </MaterialList>
            {privateMode && related.length ? <><MaterialButton size="sm" color="outlined" onClick={() => setManagingRelations((value) => !value)}>{t(managingRelations ? "hideRelations" : "manageRelations")}</MaterialButton>{managingRelations ? <div className="relation-remove-actions">{related.map((edge) => <MaterialButton key={edge.id} size="sm" color="outlined" onClick={() => onRemoveRelation(edge.id)}>{t("removeRelation", { relation: edge.relation, name: edge.target.name })}</MaterialButton>)}</div> : null}</> : null}
            {!related.length ? <p className="panel-meta md-typescale-body-small">{t("relationsMissing")}</p> : null}
          </section>
          <MaterialDivider />
          <section aria-labelledby="sources-heading">
            <h3 id="sources-heading" className="md-typescale-title-small">{t("sources")}<MaterialIcon name="open_in_new" /></h3>
            <MaterialList className="source-list" aria-label={t("sources")}>
              {node.sources.map((source) => <MaterialListItem key={source.url} nonInteractive>
                <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
                  <span>{source.label}</span><MaterialIcon name="open_in_new" />
                </a>
              </MaterialListItem>)}
            </MaterialList>
          </section>
        </div>
      </MaterialCard>
      {deleting ? <MaterialDialog open onClosed={() => setDeleting(false)}><div slot="headline">{t("deleteNodeTitle")}</div><div slot="content">{t("deleteNodeBody", { name: node.name })}</div><div slot="actions"><MaterialButton size="sm" color="outlined" onClick={() => setDeleting(false)}>{t("cancel")}</MaterialButton><MaterialButton size="sm" onClick={() => { onDelete(); setDeleting(false); }}>{t("deleteNodeAction")}</MaterialButton></div></MaterialDialog> : null}
    </aside>
  );
}
