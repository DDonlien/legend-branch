import { nodes } from "../data";

type CanvasFooterProps = { traceActive: boolean };

export function CanvasFooter({ traceActive }: CanvasFooterProps) {
  const visibleCount = traceActive ? nodes.filter((node) => node.isTrace).length : nodes.length;
  return (
    <footer className="canvas-footer md-typescale-label-medium">
      <div className="legend-items">
        <span><i className="shape shape-origin" />神话 / 民俗</span>
        <span><i className="shape shape-literature" />古典文学</span>
        <span><i className="shape shape-modern" />现代作品</span>
        <span><i className="line line-confirmed" />确认较高</span>
        <span><i className="line line-probable" />可能关联</span>
        <span><i className="line line-speculative" />推测关联</span>
      </div>
      <span className="axis-note">非等距时间轴 · 现代段展开</span>
      <div className="footer-status" role="status">
        <span className={traceActive ? "active-dot" : "idle-dot"} />
        {traceActive ? "当前追踪" : "当前显示"}：{visibleCount} 个节点
      </div>
    </footer>
  );
}
