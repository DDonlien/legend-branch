import { useState } from "react";
import { groupsForBasis, tagsForBasis } from "../graph";
import { normalizeSearch, type KnowledgeGraph, type TagCategory } from "../knowledge";
import { useLocale } from "../useLocale";
import { tagLabel } from "../i18n";
import { MaterialButton, MaterialCard, MaterialChipSet, MaterialFilterChip, MaterialIcon, MaterialIconButton, MaterialList, MaterialListItem, MaterialTextField } from "./Material";

export function GroupPanel({ graph, basis, groupIds, onChange, onClose }: {
  graph: KnowledgeGraph; basis: TagCategory; groupIds: string[] | null; onChange: (ids: string[] | null) => void; onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const selected = groupsForBasis(graph, basis, groupIds);
  const tags = tagsForBasis(graph, basis);
  const label = (id: string) => { const tag = tags.find((tag) => tag.id === id); return tag ? tagLabel(tag, locale) : id; };
  const move = (index: number, step: number) => {
    const next = [...selected];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  };
  const matching = tags.filter((tag) => [tag.name, tagLabel(tag, locale)].some((name) => normalizeSearch(name).includes(normalizeSearch(query))));
  return <aside className="settings-panel" aria-label={t("tagSettings")} onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}>
    <MaterialCard color="elevated" className="search-surface"><div className="search-results-content">
      <div className="panel-header"><h2 className="md-typescale-title-medium">{t("tags")} · {t(basis)}</h2><MaterialIconButton size="sm" aria-label={t("closeGrouping")} onClick={onClose}><MaterialIcon name="close" /></MaterialIconButton></div>
      <MaterialTextField label={t("findTags")} value={query} onInput={(event) => setQuery((event.target as HTMLInputElement).value)} />
      <MaterialChipSet className="group-chips" aria-label={t("availableTags")}>
        {matching.map((tag) => <MaterialFilterChip key={tag.id} label={tagLabel(tag, locale)} selected={selected.includes(tag.id)} onClick={() => onChange(selected.includes(tag.id) ? selected.filter((id) => id !== tag.id) : [...selected, tag.id])} />)}
      </MaterialChipSet>
      {!matching.length ? <p className="panel-meta md-typescale-body-small">{t("noMatchingTags")}</p> : null}
      <div className="compact-actions"><MaterialButton color="text" size="sm" onClick={() => onChange(null)}>{t("allTags")}</MaterialButton><MaterialButton color="text" size="sm" onClick={() => onChange([])}>{t("noTagsSelected")}</MaterialButton></div>
      {selected.length ? <><h3 className="md-typescale-title-small">{t("groupOrder")}</h3>
        <MaterialList aria-label={t("groupOrder")}>{selected.map((id, index) => <MaterialListItem key={id} nonInteractive>
          <span>{index + 1}. {label(id)}</span>
          <div slot="trailing" className="compact-actions">
            <MaterialIconButton size="sm" disabled={index === 0} aria-label={t("moveGroupUp", { name: label(id) })} onClick={() => move(index, -1)}><MaterialIcon name="arrow_upward" /></MaterialIconButton>
            <MaterialIconButton size="sm" disabled={index === selected.length - 1} aria-label={t("moveGroupDown", { name: label(id) })} onClick={() => move(index, 1)}><MaterialIcon name="arrow_downward" /></MaterialIconButton>
          </div>
        </MaterialListItem>)}</MaterialList></> : null}
    </div></MaterialCard>
  </aside>;
}
