import { useRef, useState } from "react";
import type { KnowledgeEntry } from "../knowledge";
import { useLocale } from "../useLocale";
import type { TranslationKey } from "../i18n";
import { parseProjectBackup, type StoryProject } from "../projects";
import { MaterialButton, MaterialDialog, MaterialDivider, MaterialIcon, MaterialMenu, MaterialMenuItem, MaterialTextField } from "./Material";

export function ProjectPanel({ open, projects, activeId, baseline, onCreate, onSelect, onImport, onRemove, onRename, onClose }: {
  open: boolean; projects: StoryProject[]; activeId: string | null; baseline: KnowledgeEntry | null;
  onCreate: (name: string) => void; onSelect: (id: string | null) => void; onImport: (project: StoryProject) => void;
  onRemove: (id: string) => void; onRename: (id: string, name: string) => void; onClose: () => void;
}) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<TranslationKey | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<StoryProject | null>(null);
  const [renaming, setRenaming] = useState<StoryProject | null>(null);
  const [rename, setRename] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const active = projects.find((project) => project.id === activeId);
  function exportProject(project: StoryProject) {
    const blob = new Blob([JSON.stringify({ format: "legendbranch-project", version: 1, project }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.replace(/[\\/:*?"<>|]/g, "_")}.legendbranch.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <>
    <MaterialMenu anchor="space-trigger" className="space-menu" positioning="popover" open={open} onClosing={onClose} aria-label={t("spaces")}>
      <MaterialMenuItem onClick={() => onSelect(null)} aria-current={activeId === null ? "true" : undefined} aria-label={`${t("sharedKnowledge")}${activeId === null ? " ✓" : ""}`}>
        <MaterialIcon slot="leading-icon" name={activeId === null ? "radio_button_checked" : "radio_button_unchecked"} /><div slot="headline">{t("sharedKnowledge")}</div>
      </MaterialMenuItem>
      {projects.map((project) => <MaterialMenuItem key={project.id} onClick={() => onSelect(project.id)} aria-current={project.id === activeId ? "true" : undefined} aria-label={`${project.name}${project.id === activeId ? " ✓" : ""}`}>
        <MaterialIcon slot="leading-icon" name={project.id === activeId ? "radio_button_checked" : "radio_button_unchecked"} />
        <div slot="headline">{project.name}</div><div slot="supporting-text">{t("projectNodes", { count: project.graph.entries.length })}</div>
      </MaterialMenuItem>)}
      <MaterialDivider />
      <MaterialMenuItem disabled={!baseline} title={!baseline ? t("selectBaseline") : t("baseline", { name: baseline.name })} onClick={() => { onClose(); setName(""); setCreating(true); }}>
        <MaterialIcon slot="leading-icon" name="add" /><div slot="headline">{t("createProject")}</div>
      </MaterialMenuItem>
      <MaterialMenuItem onClick={() => { onClose(); file.current?.click(); }}><MaterialIcon slot="leading-icon" name="upload" /><div slot="headline">{t("importBackup")}</div></MaterialMenuItem>
      {active ? <>
        <MaterialDivider />
        <MaterialMenuItem onClick={() => { onClose(); setRenaming(active); setRename(active.name); }}><MaterialIcon slot="leading-icon" name="edit" /><div slot="headline">{t("projectName")}</div></MaterialMenuItem>
        <MaterialMenuItem onClick={() => { onClose(); exportProject(active); }}><MaterialIcon slot="leading-icon" name="download" /><div slot="headline">{t("exportProject", { name: active.name })}</div></MaterialMenuItem>
        <MaterialMenuItem onClick={() => { onClose(); setRemoving(active); }}><MaterialIcon slot="leading-icon" name="delete" /><div slot="headline">{t("deleteProject", { name: active.name })}</div></MaterialMenuItem>
      </> : null}
    </MaterialMenu>
    <input ref={file} hidden type="file" accept=".json,application/json" aria-label={t("chooseBackup")} onChange={async (event) => {
      const input = event.currentTarget, selected = input.files?.[0];
      if (!selected) return;
      if (selected.size > 5 * 1024 * 1024) setMessage("backupTooLarge");
      else {
        try { onImport(parseProjectBackup(await selected.text())); setMessage(null); }
        catch { setMessage("backupInvalid"); }
      }
      input.value = "";
    }} />
    {creating && baseline ? <MaterialDialog open onClosed={() => setCreating(false)} className="story-dialog">
      <div slot="headline">{t("createProjectTitle")}</div>
      <div slot="content" className="editor-fields"><p className="panel-meta md-typescale-body-small">{t("baseline", { name: baseline.name })}</p>
        <MaterialTextField label={t("projectName")} value={name} maxLength={200} onInput={(event) => setName((event.target as HTMLInputElement).value)} />
        <p className="panel-meta md-typescale-body-small">{t("browserStorageInfo")}</p>
      </div>
      <div slot="actions"><MaterialButton size="sm" color="text" onClick={() => setCreating(false)}>{t("cancel")}</MaterialButton><MaterialButton size="sm" disabled={!name.trim()} onClick={() => { onCreate(name.trim()); setCreating(false); }}>{t("create")}</MaterialButton></div>
    </MaterialDialog> : null}
    {removing ? <MaterialDialog open onClosed={() => setRemoving(null)}><div slot="headline">{t("deleteProjectTitle")}</div><div slot="content">{t("deleteProjectBody", { name: removing.name })}</div><div slot="actions"><MaterialButton size="sm" color="text" onClick={() => setRemoving(null)}>{t("cancel")}</MaterialButton><MaterialButton size="sm" onClick={() => { onRemove(removing.id); setRemoving(null); }}>{t("deleteProjectAction")}</MaterialButton></div></MaterialDialog> : null}
    {renaming ? <MaterialDialog open onClosed={() => setRenaming(null)}><div slot="headline">{t("projectName")}</div><div slot="content"><MaterialTextField label={t("projectName")} value={rename} maxLength={200} onInput={(event) => setRename((event.target as HTMLInputElement).value)} /></div><div slot="actions"><MaterialButton size="sm" color="text" onClick={() => setRenaming(null)}>{t("cancel")}</MaterialButton><MaterialButton size="sm" disabled={!rename.trim()} onClick={() => { onRename(renaming.id, rename.trim()); setRenaming(null); }}>{t("saveName")}</MaterialButton></div></MaterialDialog> : null}
    {message ? <MaterialDialog open onClosed={() => setMessage(null)}><div slot="headline">{t("importBackup")}</div><div slot="content" role="alert">{t(message)}</div><div slot="actions"><MaterialButton size="sm" onClick={() => setMessage(null)}>{t("close")}</MaterialButton></div></MaterialDialog> : null}
  </>;
}
