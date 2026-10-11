import type { KnowledgeEntry, SearchResponse } from "../knowledge";
import { eligibleForGraph } from "../graph";
import { useLocale } from "../useLocale";
import { tagLabel } from "../i18n";
import { MaterialCard, MaterialIcon, MaterialIconButton, MaterialLinearProgress, MaterialList, MaterialListItem } from "./Material";

export function SearchResults({ result, loading, onSelect, onClose }: {
  result: SearchResponse; loading: boolean; onSelect: (entry: KnowledgeEntry) => void; onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const status = t(loading ? "enriching" : result.enrichment === "unavailable" ? "searchUnavailable" : result.enrichment === "cached" ? "searchCached" : result.added ? "searchAdded" : "searchUnchanged", { count: result.added });
  return (
    <aside className="search-results" aria-label={t("searchResults")} onKeyDown={(event) => {
      if (event.key === "Escape") { event.stopPropagation(); onClose(); }
    }}>
      <MaterialCard color="elevated" className="search-surface">
        <div className="search-results-content">
          <div className="panel-header">
            <h2 className="md-typescale-title-medium">{t("searchQuery", { query: result.query })}</h2>
            <MaterialIconButton color="standard" size="sm" type="button" aria-label={t("closeSearch")} onClick={onClose}><MaterialIcon name="close" /></MaterialIconButton>
          </div>
          <p role="status" aria-live="polite" className="search-status md-typescale-body-small">{status}</p>
          {loading ? <MaterialLinearProgress indeterminate aria-label={t("enriching")} /> : null}
          <MaterialList className="search-list" aria-label={t("matchingEntries")}>
            {result.entries.map((entry) => <MaterialListItem key={entry.id} onClick={() => onSelect(entry)} aria-label={t("viewEntry", { name: entry.name })}>
              <span>{entry.name}</span>
              <div slot="supporting-text" className="search-supporting">
                <span>{entry.summary}</span>
                <small>{entry.tags.map((tag) => tagLabel(tag, locale)).join(" · ") || t("noTags")} · {t(entry.origin ? "projectContent" : entry.reviewStatus === "curated" ? "curated" : "unreviewed")} · {t(eligibleForGraph(entry) ? "located" : "unlocated")}</small>
              </div>
              <MaterialIcon slot="trailing" name="chevron_right" />
            </MaterialListItem>)}
          </MaterialList>
          {!result.entries.length ? <p className="md-typescale-body-medium">{t(loading ? "searchEmptyLoading" : "searchEmpty")}</p> : null}
        </div>
      </MaterialCard>
    </aside>
  );
}
