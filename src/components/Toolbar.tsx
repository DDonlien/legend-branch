import { useRef, useState } from "react";
import { useLocale } from "../useLocale";
import { TAG_CATEGORIES, type TagCategory } from "../knowledge";
import { DENSITIES } from "../preferences";
import { MaterialButton, MaterialIcon, MaterialIconButton, MaterialMenu, MaterialMenuItem, MaterialTextField } from "./Material";

type ToolbarProps = {
  traceActive: boolean; toolbarVisible: boolean; onClearTrace: () => void; onToggleToolbar: () => void;
  onSearch: (query: string) => void; query: string; onQueryChange: (query: string) => void;
  projectName?: string; groupBasis: TagCategory; onBasisChange: (basis: TagCategory) => void;
  onProjects: () => void; onTags: () => void; onAddNode: () => void; onAddRelation: () => void;
};
const densityLabels = { nodes: "densityNodes", names: "densityNames", detailed: "densityDetailed" } as const;
const densityIcons = { nodes: "scatter_plot", names: "view_agenda", detailed: "view_stream" };

export function Toolbar({ traceActive, toolbarVisible, onClearTrace, onToggleToolbar, onSearch, query, onQueryChange, projectName, groupBasis, onBasisChange, onProjects, onTags, onAddNode, onAddRelation }: ToolbarProps) {
  const { t, locale, setLocale, density, setDensity } = useLocale();
  const composing = useRef(false);
  const [menu, setMenu] = useState<"basis" | "density" | "language" | null>(null);
  const toggle = (next: typeof menu) => setMenu((current) => current === next ? null : next);
  const closed = (next: typeof menu) => setMenu((current) => current === next ? null : current);
  const submitSearch = () => { if (query.trim().length >= 2 && query.trim().length <= 120) onSearch(query); };
  if (!toolbarVisible) return <MaterialIconButton className="toolbar-reveal" color="tonal" size="xs" type="button" aria-label={t("showToolbar")} title={t("showToolbar")} onClick={onToggleToolbar}>
    <MaterialIcon name="expand_more" />
  </MaterialIconButton>;

  return <header className="toolbar">
    <div className="toolbar-leading">
      <MaterialIconButton color="standard" size="sm" type="button" aria-label={t("hideToolbar")} title={t("hideToolbar")} onClick={() => { setMenu(null); onToggleToolbar(); }}>
        <MaterialIcon name="expand_less" />
      </MaterialIconButton>
      <div className="brand"><strong className="md-typescale-title-large">{t("brand")}</strong></div>
      <MaterialTextField className="material-search-bar" type="search" aria-label={t("searchPlaceholder")} placeholder={t("searchPlaceholder")} value={query} error={query.trim().length > 120} errorText={t("searchTooLong")}
        onInput={(event) => onQueryChange((event.target as HTMLInputElement).value)}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={(event) => { if (event.key === "Enter" && !composing.current && !event.nativeEvent.isComposing) { event.preventDefault(); submitSearch(); } }}>
        <MaterialIcon name="search" slot="leading-icon" />
        <MaterialIconButton slot="trailing-icon" color="standard" size="xs" type="button" aria-label={t("startSearch")} disabled={query.trim().length < 2 || query.trim().length > 120} onClick={submitSearch}>
          <MaterialIcon name="arrow_forward" />
        </MaterialIconButton>
      </MaterialTextField>
    </div>
    <div className="toolbar-actions">
      <MaterialButton id="space-trigger" color="outlined" size="sm" type="button" onClick={onProjects} title={projectName ?? t("sharedKnowledge")} aria-label={t("switchSpace")} aria-haspopup="menu">
        <MaterialIcon name={projectName ? "folder" : "public"} />{projectName ? t("personalProject") : t("knowledge")}<MaterialIcon name="arrow_drop_down" />
      </MaterialButton>
      <MaterialButton id="basis-trigger" color="outlined" size="sm" type="button" onClick={() => toggle("basis")} aria-label={t("grouping")} aria-haspopup="listbox" aria-expanded={menu === "basis"} title={`${t("grouping")} · ${t(groupBasis)}`}>
        <MaterialIcon name="sort" />{t("grouping")}<MaterialIcon name="arrow_drop_down" />
      </MaterialButton>
      <MaterialMenu anchor="basis-trigger" positioning="popover" role="listbox" open={menu === "basis"} onClosing={() => closed("basis")} aria-label={t("grouping")}>
        {TAG_CATEGORIES.map((basis) => <MaterialMenuItem key={basis} type="option" aria-selected={groupBasis === basis} onClick={() => { setMenu(null); onBasisChange(basis); }}>
          <MaterialIcon slot="leading-icon" name={groupBasis === basis ? "radio_button_checked" : "radio_button_unchecked"} /><div slot="headline">{t(basis)}</div>
        </MaterialMenuItem>)}
      </MaterialMenu>
      <MaterialButton color="outlined" size="sm" type="button" onClick={onTags}><MaterialIcon name="filter_list" />{t("tags")}</MaterialButton>
      <MaterialButton id="density-trigger" color="outlined" size="sm" type="button" onClick={() => toggle("density")} aria-label={t("density")} aria-haspopup="listbox" aria-expanded={menu === "density"} title={`${t("density")} · ${t(densityLabels[density])}`}>
        <MaterialIcon name={densityIcons[density]} />{t("density")}<MaterialIcon name="arrow_drop_down" />
      </MaterialButton>
      <MaterialMenu anchor="density-trigger" positioning="popover" role="listbox" open={menu === "density"} onClosing={() => closed("density")} aria-label={t("density")}>
        {DENSITIES.map((value) => <MaterialMenuItem key={value} type="option" aria-selected={density === value} onClick={() => { setMenu(null); setDensity(value); }}>
          <MaterialIcon slot="leading-icon" name={density === value ? "radio_button_checked" : "radio_button_unchecked"} /><div slot="headline">{t(densityLabels[value])}</div>
        </MaterialMenuItem>)}
      </MaterialMenu>
      {projectName ? <>
        <MaterialIconButton size="sm" aria-label={t("addNode")} title={t("addNode")} onClick={onAddNode}><MaterialIcon name="add" /></MaterialIconButton>
        <MaterialIconButton size="sm" aria-label={t("addRelation")} title={t("addRelation")} onClick={onAddRelation}><MaterialIcon name="add_link" /></MaterialIconButton>
      </> : null}
      {traceActive ? <MaterialButton color="tonal" size="sm" type="button" onClick={onClearTrace}><MaterialIcon name="close" />{t("clearTrace")}</MaterialButton> : null}
      <MaterialIconButton id="language-trigger" color="standard" size="sm" aria-label={t("language")} title={t("language")} aria-haspopup="listbox" aria-expanded={menu === "language"} onClick={() => toggle("language")}><MaterialIcon name="translate" /></MaterialIconButton>
      <MaterialMenu anchor="language-trigger" positioning="popover" role="listbox" open={menu === "language"} onClosing={() => closed("language")} aria-label={t("language")}>
        {(["zh", "en"] as const).map((value) => <MaterialMenuItem key={value} type="option" aria-selected={locale === value} onClick={() => { setMenu(null); setLocale(value); }}>
          <MaterialIcon slot="leading-icon" name={locale === value ? "radio_button_checked" : "radio_button_unchecked"} /><div slot="headline">{t(value === "zh" ? "languageZh" : "languageEn")}</div>
        </MaterialMenuItem>)}
      </MaterialMenu>
    </div>
  </header>;
}
