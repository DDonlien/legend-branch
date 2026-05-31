type CanvasFooterProps = {
  traceActive: boolean;
};

export function CanvasFooter({ traceActive }: CanvasFooterProps) {
  return (
    <footer className="canvas-footer">
      <div className="legend-items">
        <span><i className="shape shape-origin" />神话 / 民俗</span>
        <span><i className="shape shape-literature" />古典文学</span>
        <span><i className="shape shape-modern" />现代作品</span>
        <span><i className="line line-confirmed" />确认较高</span>
        <span><i className="line line-probable" />可能关联</span>
        <span><i className="line line-speculative" />推测关联</span>
      </div>
      <div className="footer-status">
        <span className={traceActive ? "active-dot" : "idle-dot"} />
        {traceActive ? "当前追踪：8 个节点" : "当前显示：12 个节点"}
      </div>
    </footer>
  );
}
