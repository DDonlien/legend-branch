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
  traceName: string;
  projectName?: string;
  onProjects: () => void;
  onGroups: () => void;
  onAddNode: () => void;
  onAddRelation: () => void;
};

export function Toolbar({ traceActive, toolbarVisible, onToggleTrace, onToggleToolbar, onSearch, query, onQueryChange, traceName, projectName, onProjects, onGroups, onAddNode, onAddRelation }: ToolbarProps) {
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
          <span className="md-typescale-label-large">{traceActive ? `TRACE MODE · ${traceName}` : projectName ?? "全部谱系"}</span>
        </div>
      </MaterialCard>
      <div className="toolbar-actions">
        <MaterialButton color={traceActive ? "tonal" : "filled"} size="sm" type="button" onClick={onToggleTrace}>
          <MaterialIcon name={traceActive ? "close" : "conversion_path"} />
          {traceActive ? "清除 Trace" : `Trace ${traceName}`}
        </MaterialButton>
        <MaterialButton color="outlined" size="sm" type="button" onClick={onProjects} title={projectName ?? "共享知识库"} aria-label="切换知识库或个人项目">
          <MaterialIcon name={projectName ? "folder" : "public"} />{projectName ? "个人项目" : "知识库"}
        </MaterialButton>
        <MaterialButton color="outlined" size="sm" type="button" onClick={onGroups}><MaterialIcon name="filter_list" />分组</MaterialButton>
        {projectName ? <>
          <MaterialIconButton size="sm" aria-label="添加故事节点" title="添加故事节点" onClick={onAddNode}><MaterialIcon name="add" /></MaterialIconButton>
          <MaterialIconButton size="sm" aria-label="添加发展关系" title="添加发展关系" onClick={onAddRelation}><MaterialIcon name="add_link" /></MaterialIconButton>
        </> : null}
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
