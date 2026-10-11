import { useState } from "react";
import { TAG_CATEGORIES, type GraphRelation, type KnowledgeEntry, type TagCategory } from "../knowledge";
import { useLocale } from "../useLocale";
import { graphTags } from "../graph";
import { projectTags, type StoryProject } from "../projects";
import { MaterialButton, MaterialDialog, MaterialOption, MaterialSelect, MaterialTextField } from "./Material";

export function StoryEditor({ project, entry, onSave, onClose }: {
  project: StoryProject; entry?: KnowledgeEntry; onSave: (entry: KnowledgeEntry) => void; onClose: () => void;
}) {
  const { t } = useLocale();
  const [name, setName] = useState(entry?.name ?? "");
  const [summary, setSummary] = useState(entry?.summary ?? "");
  const [year, setYear] = useState(entry?.placement ? String(entry.placement.year) : "");
  const [tags, setTags] = useState(entry?.tags.map((tag) => tag.name).join("，") ?? "");
  const [tagBasis, setTagBasis] = useState<TagCategory>("topic");
  const validYear = year.trim() === "" || (/^-?\d+$/.test(year.trim()) && Math.abs(Number(year)) <= 1000000);
  const validTags = tags.split(/[,，、\n]/).every((tag) => tag.trim().length <= 100);
  return <MaterialDialog open onClosed={onClose} className="story-dialog">
    <div slot="headline">{t(entry ? "editNode" : "addNode")}</div>
    <div slot="content" className="editor-fields">
      <p className="panel-meta md-typescale-body-small">{t("storyEditorHelp")}</p>
      <MaterialTextField label={t("nodeName")} value={name} maxLength={200} onInput={(event) => setName((event.target as HTMLInputElement).value)} />
      <MaterialTextField label={t("year")} value={year} error={!validYear} errorText={t("invalidYear")} onInput={(event) => setYear((event.target as HTMLInputElement).value)} />
      <MaterialSelect label={t("newTagBasis")} menuPositioning="fixed" value={tagBasis} onChange={(event) => setTagBasis((event.target as HTMLSelectElement).value as TagCategory)}>{TAG_CATEGORIES.map((basis) => <MaterialOption key={basis} value={basis} selected={basis === tagBasis}><div slot="headline">{t(basis)}</div></MaterialOption>)}</MaterialSelect>
      <MaterialTextField label={t("commaTags")} value={tags} maxLength={1000} error={!validTags} errorText={t("invalidTags")} onInput={(event) => setTags((event.target as HTMLInputElement).value)} />
      <MaterialTextField type="textarea" rows={4} label={t("storySummary")} value={summary} maxLength={20000} onInput={(event) => setSummary((event.target as HTMLInputElement).value)} />
    </div>
    <div slot="actions"><MaterialButton size="sm" color="outlined" onClick={onClose}>{t("cancel")}</MaterialButton><MaterialButton size="sm" disabled={!name.trim() || !validYear || !validTags} onClick={() => onSave({
      ...entry, id: entry?.id ?? `local:${crypto.randomUUID()}`, name: name.trim(), summary: summary.trim(), kind: entry?.kind ?? "entry", reviewStatus: "curated", origin: "project",
      tags: projectTags(tags, graphTags(project.graph), tagBasis), sources: entry?.sources ?? [],
      placement: year.trim() ? { year: Number(year), quality: "authored" } : undefined,
      yearLabel: year.trim() ? (Number(year) < 0 ? `公元前 ${Math.abs(Number(year))}` : year.trim()) : undefined,
    })}>{t("saveNode")}</MaterialButton></div>
  </MaterialDialog>;
}

export function RelationEditor({ project, selectedId, onSave, onClose }: {
  project: StoryProject; selectedId: string | null; onSave: (edge: GraphRelation) => void; onClose: () => void;
}) {
  const { t } = useLocale();
  const [from, setFrom] = useState(selectedId ?? project.graph.entries[0]?.id ?? "");
  const [to, setTo] = useState("");
  const [relation, setRelation] = useState(t("storyDevelopment"));
  return <MaterialDialog open onClosed={onClose} className="story-dialog">
    <div slot="headline">{t("addRelation")}</div>
    <div slot="content" className="editor-fields">
      <p className="panel-meta md-typescale-body-small">{t("relationEditorHelp")}</p>
      <MaterialSelect label={t("fromNode")} menuPositioning="fixed" value={from} onChange={(event) => setFrom((event.target as HTMLSelectElement).value)}>{project.graph.entries.map((entry) => <MaterialOption key={entry.id} value={entry.id} selected={entry.id === from}><div slot="headline">{entry.name}</div></MaterialOption>)}</MaterialSelect>
      <MaterialSelect label={t("toNode")} menuPositioning="fixed" value={to} onChange={(event) => setTo((event.target as HTMLSelectElement).value)}>{project.graph.entries.filter((entry) => entry.id !== from).map((entry) => <MaterialOption key={entry.id} value={entry.id} selected={entry.id === to}><div slot="headline">{entry.name}</div></MaterialOption>)}</MaterialSelect>
      <MaterialTextField label={t("relationDescription")} value={relation} maxLength={200} onInput={(event) => setRelation((event.target as HTMLInputElement).value)} />
    </div>
    <div slot="actions"><MaterialButton size="sm" color="outlined" onClick={onClose}>{t("cancel")}</MaterialButton><MaterialButton size="sm" disabled={!from || !to || from === to || !relation.trim()} onClick={() => onSave({
      id: `local:${crypto.randomUUID()}`, from, to, relation: relation.trim(), confidence: "confirmed", debated: false, reviewStatus: "curated", sources: [],
    })}>{t("saveRelation")}</MaterialButton></div>
  </MaterialDialog>;
}
