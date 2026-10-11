import { useState } from "react";
import type { GraphRelation, KnowledgeEntry } from "../knowledge";
import { graphTags } from "../graph";
import { projectTags, type StoryProject } from "../projects";
import { MaterialButton, MaterialDialog, MaterialOption, MaterialSelect, MaterialTextField } from "./Material";

export function StoryEditor({ project, entry, onSave, onClose }: {
  project: StoryProject; entry?: KnowledgeEntry; onSave: (entry: KnowledgeEntry) => void; onClose: () => void;
}) {
  const [name, setName] = useState(entry?.name ?? "");
  const [summary, setSummary] = useState(entry?.summary ?? "");
  const [year, setYear] = useState(entry?.placement ? String(entry.placement.year) : "");
  const [tags, setTags] = useState(entry?.tags.map((tag) => tag.name).join("，") ?? "");
  const validYear = year.trim() === "" || (/^-?\d+$/.test(year.trim()) && Math.abs(Number(year)) <= 1000000);
  const validTags = tags.split(/[,，、\n]/).every((tag) => tag.trim().length <= 100);
  return <MaterialDialog open onClosed={onClose} className="story-dialog">
    <div slot="headline">{entry ? "编辑故事节点" : "添加故事节点"}</div>
    <div slot="content" className="editor-fields">
      <p className="panel-meta md-typescale-body-small">个人创作仅保存在这个项目中。年份可留空，未定位节点仍可在项目中搜索。</p>
      <MaterialTextField label="节点名称" value={name} maxLength={200} onInput={(event) => setName((event.target as HTMLInputElement).value)} />
      <MaterialTextField label="年份（公元前用负数）" value={year} error={!validYear} errorText="请输入 -1000000 至 1000000 的整数年份" onInput={(event) => setYear((event.target as HTMLInputElement).value)} />
      <MaterialTextField label="标签（用逗号分隔）" value={tags} maxLength={1000} error={!validTags} errorText="每个标签最多 100 字" onInput={(event) => setTags((event.target as HTMLInputElement).value)} />
      <MaterialTextField type="textarea" rows={4} label="故事梗概" value={summary} maxLength={20000} onInput={(event) => setSummary((event.target as HTMLInputElement).value)} />
    </div>
    <div slot="actions"><MaterialButton size="sm" color="outlined" onClick={onClose}>取消</MaterialButton><MaterialButton size="sm" disabled={!name.trim() || !validYear || !validTags} onClick={() => onSave({
      ...entry, id: entry?.id ?? `local:${crypto.randomUUID()}`, name: name.trim(), summary: summary.trim(), kind: entry?.kind ?? "entry", reviewStatus: "curated", origin: "project",
      tags: projectTags(tags, graphTags(project.graph)), sources: entry?.sources ?? [],
      placement: year.trim() ? { year: Number(year), quality: "authored" } : undefined,
      yearLabel: year.trim() ? (Number(year) < 0 ? `公元前 ${Math.abs(Number(year))}` : year.trim()) : undefined,
    })}>保存节点</MaterialButton></div>
  </MaterialDialog>;
}

export function RelationEditor({ project, selectedId, onSave, onClose }: {
  project: StoryProject; selectedId: string | null; onSave: (edge: GraphRelation) => void; onClose: () => void;
}) {
  const [from, setFrom] = useState(selectedId ?? project.graph.entries[0]?.id ?? "");
  const [to, setTo] = useState("");
  const [relation, setRelation] = useState("故事发展");
  return <MaterialDialog open onClosed={onClose} className="story-dialog">
    <div slot="headline">添加发展关系</div>
    <div slot="content" className="editor-fields">
      <p className="panel-meta md-typescale-body-small">选择起点和终点，可以表达分支、合流和时间倒向的故事关系。</p>
      <MaterialSelect label="起点节点" menuPositioning="fixed" value={from} onChange={(event) => setFrom((event.target as HTMLSelectElement).value)}>{project.graph.entries.map((entry) => <MaterialOption key={entry.id} value={entry.id} selected={entry.id === from}><div slot="headline">{entry.name}</div></MaterialOption>)}</MaterialSelect>
      <MaterialSelect label="终点节点" menuPositioning="fixed" value={to} onChange={(event) => setTo((event.target as HTMLSelectElement).value)}>{project.graph.entries.filter((entry) => entry.id !== from).map((entry) => <MaterialOption key={entry.id} value={entry.id} selected={entry.id === to}><div slot="headline">{entry.name}</div></MaterialOption>)}</MaterialSelect>
      <MaterialTextField label="关系说明" value={relation} maxLength={200} onInput={(event) => setRelation((event.target as HTMLInputElement).value)} />
    </div>
    <div slot="actions"><MaterialButton size="sm" color="outlined" onClick={onClose}>取消</MaterialButton><MaterialButton size="sm" disabled={!from || !to || from === to || !relation.trim()} onClick={() => onSave({
      id: `local:${crypto.randomUUID()}`, from, to, relation: relation.trim(), confidence: "confirmed", debated: false, reviewStatus: "curated", sources: [],
    })}>保存关系</MaterialButton></div>
  </MaterialDialog>;
}
