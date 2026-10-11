import { useRef, useState } from "react";
import type { KnowledgeEntry } from "../knowledge";
import { parseProjectBackup, type StoryProject } from "../projects";
import { MaterialButton, MaterialCard, MaterialDialog, MaterialIcon, MaterialIconButton, MaterialList, MaterialListItem, MaterialTextField } from "./Material";

export function ProjectPanel({ projects, activeId, baseline, onCreate, onSelect, onImport, onRemove, onRename, onClose }: {
  projects: StoryProject[]; activeId: string | null; baseline: KnowledgeEntry | null;
  onCreate: (name: string) => void; onSelect: (id: string | null) => void; onImport: (project: StoryProject) => void;
  onRemove: (id: string) => void; onRename: (id: string, name: string) => void; onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [removing, setRemoving] = useState<StoryProject | null>(null);
  const [renaming, setRenaming] = useState<StoryProject | null>(null);
  const [rename, setRename] = useState("");
  const file = useRef<HTMLInputElement>(null);
  function exportProject(project: StoryProject) {
    const blob = new Blob([JSON.stringify({ format: "legendbranch-project", version: 1, project }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/[\\/:*?"<>|]/g, "_")}.legendbranch.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <aside className="settings-panel" aria-label="个人项目空间">
    <MaterialCard color="elevated" className="search-surface"><div className="search-results-content">
      <div className="panel-header"><h2 className="md-typescale-title-medium">个人项目空间</h2><MaterialIconButton size="sm" aria-label="关闭项目空间" onClick={onClose}><MaterialIcon name="close" /></MaterialIconButton></div>
      <p className="panel-meta md-typescale-body-small">无需注册，项目保存在当前浏览器。清除网站数据会清除项目；可导出备份，在其他浏览器导入。</p>
      <MaterialButton color="tonal" size="sm" onClick={() => onSelect(null)}><MaterialIcon name="public" />共享知识库{activeId === null ? " · 当前" : ""}</MaterialButton>
      <h3 className="md-typescale-title-small">从基线创建</h3>
      <p className="panel-meta md-typescale-body-small">{baseline ? `基线：${baseline.name}及其关联谱系` : "先在知识库中选中一个条目。"}</p>
      <MaterialTextField label="项目名称" value={name} maxLength={200} onInput={(event) => setName((event.target as HTMLInputElement).value)} />
      <MaterialButton size="sm" color="filled" disabled={!baseline} onClick={() => onCreate(name)}><MaterialIcon name="add" />创建个人项目</MaterialButton>
      <h3 className="md-typescale-title-small">我的项目</h3>
      <MaterialList aria-label="我的项目">{projects.map((project) => <MaterialListItem key={project.id} nonInteractive>
        <MaterialButton color={activeId === project.id ? "tonal" : "outlined"} size="sm" onClick={() => onSelect(project.id)}>{project.name}</MaterialButton>
        <div slot="supporting-text">{project.baselineName} · {project.graph.entries.length} 个节点</div>
        <div slot="trailing" className="compact-actions">
          <MaterialIconButton size="sm" aria-label={`重命名项目 ${project.name}`} onClick={() => { setRenaming(project); setRename(project.name); }}><MaterialIcon name="edit" /></MaterialIconButton>
          <MaterialIconButton size="sm" aria-label={`导出项目 ${project.name}`} onClick={() => exportProject(project)}><MaterialIcon name="download" /></MaterialIconButton>
          <MaterialIconButton size="sm" aria-label={`删除项目 ${project.name}`} onClick={() => setRemoving(project)}><MaterialIcon name="delete" /></MaterialIconButton>
        </div>
      </MaterialListItem>)}</MaterialList>
      {!projects.length ? <p className="panel-meta md-typescale-body-small">尚未创建个人项目。</p> : null}
      <input ref={file} hidden type="file" accept=".json,application/json" aria-label="选择项目备份" onChange={async (event) => {
        const input = event.currentTarget;
        const selected = input.files?.[0];
        if (!selected) return;
        try {
          if (selected.size > 5 * 1024 * 1024) throw new Error("备份文件过大，请选择 5 MB 以内的项目备份。");
          onImport(parseProjectBackup(await selected.text()));
          setMessage("");
        } catch (error) { setMessage(error instanceof Error ? error.message : "无法导入备份。"); }
        input.value = "";
      }} />
      <MaterialButton size="sm" color="outlined" onClick={() => file.current?.click()}><MaterialIcon name="upload" />导入项目备份</MaterialButton>
      {message ? <p role="alert" className="form-error">{message}</p> : null}
    </div></MaterialCard>
    {removing ? <MaterialDialog open onClosed={() => setRemoving(null)}><div slot="headline">删除个人项目？</div><div slot="content">“{removing.name}”的浏览器副本将被删除。可以先导出备份。</div><div slot="actions"><MaterialButton size="sm" color="outlined" onClick={() => setRemoving(null)}>取消</MaterialButton><MaterialButton size="sm" onClick={() => { onRemove(removing.id); setRemoving(null); }}>删除项目</MaterialButton></div></MaterialDialog> : null}
    {renaming ? <MaterialDialog open onClosed={() => setRenaming(null)}><div slot="headline">项目名称</div><div slot="content"><MaterialTextField label="项目名称" value={rename} maxLength={200} onInput={(event) => setRename((event.target as HTMLInputElement).value)} /></div><div slot="actions"><MaterialButton size="sm" color="outlined" onClick={() => setRenaming(null)}>取消</MaterialButton><MaterialButton size="sm" disabled={!rename.trim()} onClick={() => { onRename(renaming.id, rename.trim()); setRenaming(null); }}>保存名称</MaterialButton></div></MaterialDialog> : null}
  </aside>;
}
