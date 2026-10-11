import type { LegendNode } from "../types";
import { useLocale } from "../useLocale";

type CanvasFooterProps = { traceActive: boolean; nodes: LegendNode[]; pendingCount: number; message: string };

export function CanvasFooter({ traceActive, nodes, pendingCount, message }: CanvasFooterProps) {
  const { t } = useLocale();
  const visibleCount = traceActive ? nodes.filter((node) => node.isTrace).length : nodes.length;
  return (
    <footer className="canvas-footer md-typescale-label-medium">
      <div className="legend-items">
        <span><i className="shape shape-origin" />{t("origin")}</span>
        <span><i className="shape shape-literature" />{t("literature")}</span>
        <span><i className="shape shape-modern" />{t("modern")}</span>
        <span><i className="line line-confirmed" />{t("confirmed")}</span>
        <span><i className="line line-probable" />{t("probable")}</span>
        <span><i className="line line-speculative" />{t("speculative")}</span>
      </div>
      <span className="axis-note">{t("axisNote")}</span>
      <div className="footer-status" role="status">
        <span className={traceActive ? "active-dot" : "idle-dot"} />
        {t(traceActive ? "tracingCount" : "visibleCount", { count: visibleCount })}{pendingCount ? t("pendingCount", { count: pendingCount }) : ""}
      </div>
      {message ? <span className="graph-message" role="status">{message}</span> : null}
    </footer>
  );
}
