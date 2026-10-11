import { useState } from "react";
import { defaultGroups, graphTags } from "../graph";
import type { KnowledgeGraph } from "../knowledge";
import { MaterialButton, MaterialCard, MaterialChipSet, MaterialFilterChip, MaterialIcon, MaterialIconButton, MaterialList, MaterialListItem, MaterialTextField } from "./Material";

export function GroupPanel({ graph, groupIds, onChange, onClose }: {
  graph: KnowledgeGraph; groupIds: string[] | null; onChange: (ids: string[] | null) => void; onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const selected = groupIds ?? defaultGroups(graph);
  const tags = graphTags(graph).sort((a, b) => a.name.localeCompare(b.name, "zh"));
  const move = (index: number, step: number) => {
    const next = [...selected];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  };
  return <aside className="settings-panel" aria-label="标签分组设置" onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}>
    <MaterialCard color="elevated" className="search-surface"><div className="search-results-content">
      <div className="panel-header"><h2 className="md-typescale-title-medium">左栏标签分组</h2><MaterialIconButton size="sm" aria-label="关闭分组设置" onClick={onClose}><MaterialIcon name="close" /></MaterialIconButton></div>
      <p className="panel-meta md-typescale-body-small">选择标签并调整顺序。多个标签匹配时优先归入靠前的组，其余条目归入“其他标签”。</p>
      <MaterialTextField label="查找标签" value={query} onInput={(event) => setQuery((event.target as HTMLInputElement).value)} />
      <MaterialChipSet className="group-chips" aria-label="可选分组标签">
        {tags.filter((tag) => tag.name.includes(query)).map((tag) => <MaterialFilterChip key={tag.id} label={tag.name} selected={selected.includes(tag.id)} onClick={() => onChange(selected.includes(tag.id) ? selected.filter((id) => id !== tag.id) : [...selected, tag.id])} />)}
      </MaterialChipSet>
      <h3 className="md-typescale-title-small">分组顺序</h3>
      <MaterialList aria-label="分组顺序">{selected.map((id, index) => <MaterialListItem key={id} nonInteractive>
        <span>{index + 1}. {tags.find((tag) => tag.id === id)?.name ?? id}</span>
        <div slot="trailing" className="compact-actions">
          <MaterialIconButton size="sm" disabled={index === 0} aria-label={`上移分组 ${tags.find((tag) => tag.id === id)?.name}`} onClick={() => move(index, -1)}><MaterialIcon name="arrow_upward" /></MaterialIconButton>
          <MaterialIconButton size="sm" disabled={index === selected.length - 1} aria-label={`下移分组 ${tags.find((tag) => tag.id === id)?.name}`} onClick={() => move(index, 1)}><MaterialIcon name="arrow_downward" /></MaterialIconButton>
        </div>
      </MaterialListItem>)}</MaterialList>
      <MaterialButton color="tonal" size="sm" onClick={() => onChange(null)}>恢复默认分组</MaterialButton>
    </div></MaterialCard>
  </aside>;
}
