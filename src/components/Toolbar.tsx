type ToolbarProps = {
  traceActive: boolean;
  toolbarVisible: boolean;
  onToggleTrace: () => void;
  onToggleToolbar: () => void;
};

export function Toolbar({ traceActive, toolbarVisible, onToggleTrace, onToggleToolbar }: ToolbarProps) {
  if (!toolbarVisible) {
    return (
      <button className="toolbar-reveal" type="button" onClick={onToggleToolbar}>
        SHOW CONTROLS
      </button>
    );
  }

  return (
    <header className="toolbar">
      <div className="brand">
        <strong>LegendBranch</strong>
        <span>传说谱系</span>
        <small>Trace the evolution of legends.</small>
      </div>
      <div className={`trace-status ${traceActive ? "is-active" : ""}`}>
        <i />
        {traceActive ? "TRACE MODE · 孙悟空" : "TRACE MODE · CLEARED"}
      </div>
      <div className="toolbar-actions">
        <button type="button" onClick={onToggleTrace}>
          {traceActive ? "CLEAR TRACE" : "TRACE 孙悟空"}
        </button>
        <button type="button" aria-label="筛选功能将在后续阶段开放" disabled>
          FILTER
        </button>
        <label className="search-placeholder">
          <span>⌕</span>
          <input aria-label="搜索传说" placeholder="SEARCH LEGENDS" disabled />
        </label>
        <button type="button" onClick={onToggleToolbar}>
          HIDE
        </button>
      </div>
    </header>
  );
}
