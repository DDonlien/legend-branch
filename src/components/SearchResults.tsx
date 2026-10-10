import type { KnowledgeEntry, SearchResponse } from "../knowledge";
import { MaterialCard, MaterialIcon, MaterialIconButton, MaterialLinearProgress, MaterialList, MaterialListItem } from "./Material";

export function SearchResults({ result, loading, onSelect, onClose }: {
  result: SearchResponse; loading: boolean; onSelect: (entry: KnowledgeEntry) => void; onClose: () => void;
}) {
  const status = loading ? "正在联网增补…" : result.enrichment === "unavailable" ? result.message : result.enrichment === "cached" ? "已查询共享知识库 · 近期增补已保存" : `已保存至知识库${result.added ? ` · 新增 ${result.added} 个条目` : " · 没有新增条目"}`;
  return (
    <aside className="search-results" aria-label="搜索结果" onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    }}>
      <MaterialCard color="elevated" className="search-surface">
        <div className="search-results-content">
          <div className="panel-header">
            <h2 className="md-typescale-title-medium">搜索“{result.query}”</h2>
            <MaterialIconButton color="standard" size="sm" type="button" aria-label="关闭搜索结果" onClick={onClose}><MaterialIcon name="close" /></MaterialIconButton>
          </div>
          <p role="status" aria-live="polite" className="search-status md-typescale-body-small">{status}</p>
          {loading ? <MaterialLinearProgress indeterminate aria-label="正在联网增补" /> : null}
          <MaterialList className="search-list" aria-label="匹配条目">
            {result.entries.map((entry) => <MaterialListItem key={entry.id} onClick={() => onSelect(entry)} aria-label={`查看条目：${entry.name}`}>
              <span>{entry.name}</span>
              <div slot="supporting-text" className="search-supporting">
                <span>{entry.summary}</span>
                <small>{entry.tags.map((tag) => tag.name).join(" · ") || "暂无标签"} · {entry.reviewStatus === "curated" ? "已整理" : "待复核"}</small>
              </div>
              <MaterialIcon slot="trailing" name="chevron_right" />
            </MaterialListItem>)}
          </MaterialList>
          {!result.entries.length ? <p className="md-typescale-body-medium">{loading ? "已有知识库未找到条目，正在检索来源。" : "没有找到匹配条目，换一个名称试试。"}</p> : null}
        </div>
      </MaterialCard>
    </aside>
  );
}
