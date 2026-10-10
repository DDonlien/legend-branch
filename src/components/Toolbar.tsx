import { useRef } from "react";
import { MaterialButton, MaterialCard, MaterialIcon, MaterialIconButton, MaterialTextField } from "./Material";

type ToolbarProps = {
  traceActive: boolean;
  toolbarVisible: boolean;
  onToggleTrace: () => void;
  onToggleToolbar: () => void;
  onSearch: (query: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
};

export function Toolbar({ traceActive, toolbarVisible, onToggleTrace, onToggleToolbar, onSearch, query, onQueryChange }: ToolbarProps) {
  const composing = useRef(false);
  const submitSearch = () => { if (query.trim().length >= 2 && query.trim().length <= 120) onSearch(query); };
  if (!toolbarVisible) {
    return (
      <MaterialButton className="toolbar-reveal" color="tonal" size="sm" type="button" onClick={onToggleToolbar}>
        <MaterialIcon name="toolbar" />显示工具栏
      </MaterialButton>
    );
  }

  return (
    <header className="toolbar">
      <div className="brand">
        <strong className="md-typescale-title-large">LegendBranch</strong>
        <span className="md-typescale-title-small">传说谱系</span>
        <small className="md-typescale-body-small">Trace the evolution of legends.</small>
      </div>
      <MaterialCard color="filled" className={`trace-status ${traceActive ? "is-active" : ""}`}>
        <div className="trace-status-content" role="status">
          <MaterialIcon name={traceActive ? "conversion_path" : "hub"} />
          <span className="md-typescale-label-large">{traceActive ? "TRACE MODE · 孙悟空" : "全部谱系"}</span>
        </div>
      </MaterialCard>
      <div className="toolbar-actions">
        <MaterialButton color={traceActive ? "tonal" : "filled"} size="sm" type="button" onClick={onToggleTrace}>
          <MaterialIcon name={traceActive ? "close" : "conversion_path"} />
          {traceActive ? "清除 Trace" : "Trace 孙悟空"}
        </MaterialButton>
        <MaterialButton color="outlined" size="sm" type="button" aria-label="筛选功能将在后续阶段开放" title="筛选功能将在后续阶段开放" disabled>
          <MaterialIcon name="filter_list" />筛选
        </MaterialButton>
        <MaterialTextField className="material-search-bar" type="search" aria-label="搜索条目或标签" placeholder="搜索条目或标签" value={query} error={query.trim().length > 120} errorText="搜索词最多 120 个字"
          onInput={(event) => onQueryChange((event.target as HTMLInputElement).value)}
          onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
          onKeyDown={(event) => { if (event.key === "Enter" && !composing.current && !event.nativeEvent.isComposing) { event.preventDefault(); submitSearch(); } }}>
          <MaterialIcon name="search" slot="leading-icon" />
          <MaterialIconButton slot="trailing-icon" color="standard" size="sm" type="button" aria-label="开始搜索" disabled={query.trim().length < 2 || query.trim().length > 120} onClick={submitSearch}>
            <MaterialIcon name="arrow_forward" />
          </MaterialIconButton>
        </MaterialTextField>
        <MaterialIconButton color="standard" size="sm" type="button" aria-label="隐藏工具栏" title="隐藏工具栏" onClick={onToggleToolbar}>
          <MaterialIcon name="expand_less" />
        </MaterialIconButton>
      </div>
    </header>
  );
}
