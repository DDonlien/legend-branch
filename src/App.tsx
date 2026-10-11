import { useEffect, useMemo, useState } from "react";
import { CanvasFooter } from "./components/CanvasFooter";
import { DetailPanel } from "./components/DetailPanel";
import { LegendCanvas } from "./components/LegendCanvas";
import { Toolbar } from "./components/Toolbar";
import type { KnowledgeEntry } from "./knowledge";
import { useKnowledgeSearch } from "./useKnowledgeSearch";
import { SearchResults } from "./components/SearchResults";
import { GroupPanel } from "./components/GroupPanel";
import { ProjectPanel } from "./components/ProjectPanel";
import { RelationEditor, StoryEditor } from "./components/StoryEditor";
import { MaterialIcon, MaterialIconButton } from "./components/Material";
import { defaultGroups, graphDisplay } from "./graph";
import { createLayout } from "./layout";
import { createProject, PROJECT_STORAGE_KEY, readProjects, removeEntry, saveEntry, saveRelation, writeProjects, type StoryProject } from "./projects";
import { useDatabaseGraph } from "./useDatabaseGraph";

const VIEW_KEY = "legendbranch.view.v1";
function initialProjects() {
  try { return { projects: readProjects(localStorage), error: "" }; }
  catch { return { projects: [] as StoryProject[], error: "浏览器项目数据无法读取，原始数据仍保留。" }; }
}
function initialView(): { activeId: string | null; groupIds: string[] | null } {
  try {
    const value = JSON.parse(localStorage.getItem(VIEW_KEY) ?? "null");
    if (value && (typeof value.activeId === "string" || value.activeId === null) &&
      (value.groupIds === null || (Array.isArray(value.groupIds) && value.groupIds.every((id: unknown) => typeof id === "string")))) return value;
  } catch { /* Default view remains usable when browser storage is unavailable. */ }
  return { activeId: null, groupIds: null };
}

export function App() {
  const database = useDatabaseGraph();
  const [projectState, setProjectState] = useState(initialProjects);
  const [view, setView] = useState(initialView);
  const activeProject = projectState.projects.find((project) => project.id === view.activeId);
  const graph = activeProject?.graph ?? database.graph;
  const [traceActive, setTraceActive] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [traceRoot, setTraceRoot] = useState(() => activeProject?.baselineRoot ?? "sun-wukong");
  const [selected, setSelected] = useState<KnowledgeEntry | null>(null);
  const selectedEntry = selected ? graph.entries.find((entry) => entry.id === selected.id) ?? selected : graph.entries.find((entry) => entry.id === (activeProject?.baselineRoot ?? "sun-wukong")) ?? null;
  const [panel, setPanel] = useState<"groups" | "projects" | null>(null);
  const [editor, setEditor] = useState<"node" | "relation" | null>(null);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | undefined>();
  const [notice, setNotice] = useState("");
  const [detailHidden, setDetailHidden] = useState(false);
  const knowledge = useKnowledgeSearch(graph.entries, () => { void database.refresh(); });
  const [query, setQuery] = useState("");
  const groupIds = activeProject ? activeProject.groupIds : view.groupIds;
  const groups = useMemo(() => groupIds ?? defaultGroups(graph), [groupIds, graph]);
  const effectiveRoot = graph.entries.some((entry) => entry.id === traceRoot) ? traceRoot : graph.entries.find((entry) => entry.id === activeProject?.baselineRoot)?.id ?? graph.entries[0]?.id ?? "";
  const display = useMemo(() => graphDisplay(graph, groups, effectiveRoot), [graph, groups, effectiveRoot]);
  const layout = useMemo(() => createLayout(display), [display]);
  useEffect(() => {
    try { localStorage.setItem(VIEW_KEY, JSON.stringify(view)); }
    catch { setNotice("浏览器存储不可用，当前视图偏好无法保存。"); }
  }, [view]);
  useEffect(() => {
    const update = (event: StorageEvent) => { if (event.key === PROJECT_STORAGE_KEY) setProjectState(initialProjects()); };
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);
  const search = (next: string) => { setPanel(null); setQuery(next); void knowledge.search(next); };
  const selectEntry = (entry: KnowledgeEntry) => { setSelected(entry); setDetailHidden(false); setPanel(null); knowledge.close(); };
  const openPanel = (next: "groups" | "projects") => { knowledge.close(); setPanel((current) => current === next ? null : next); };
  function persistProjects(projects: StoryProject[]) {
    if (projectState.error) { setNotice(projectState.error); return false; }
    try { writeProjects(localStorage, projects); setProjectState({ projects, error: "" }); return true; }
    catch { setNotice("浏览器空间不足或存储被禁用，项目未保存。请导出备份后重试。"); return false; }
  }
  function updateProject(project: StoryProject) { return persistProjects(projectState.projects.map((item) => item.id === project.id ? project : item)); }
  function switchSpace(id: string | null) {
    const project = projectState.projects.find((item) => item.id === id);
    setView((current) => ({ ...current, activeId: id })); setTraceRoot(project?.baselineRoot ?? "sun-wukong");
    setSelected(project?.graph.entries.find((entry) => entry.id === project.baselineRoot) ?? null);
    setDetailHidden(false); setPanel(null); setTraceActive(true); knowledge.close(); setQuery("");
  }
  function addProject(project: StoryProject) {
    if (!persistProjects([...projectState.projects, project])) return;
    setView((current) => ({ ...current, activeId: project.id })); setTraceRoot(project.baselineRoot);
    setSelected(project.graph.entries.find((entry) => entry.id === project.baselineRoot) ?? project.graph.entries[0] ?? null);
    setPanel(null); setTraceActive(true); setDetailHidden(false); knowledge.close(); setNotice("个人项目已保存在当前浏览器。");
  }
  const openNode = (entry?: KnowledgeEntry) => { setEditingEntry(entry); setEditor("node"); };
  const baseline = database.graph.entries.find((entry) => entry.id === selectedEntry?.id) ?? null;

  return (
    <main className="app-shell">
      <Toolbar
        traceActive={traceActive}
        toolbarVisible={toolbarVisible}
        onClearTrace={() => setTraceActive(false)}
        onToggleToolbar={() => setToolbarVisible((visible) => !visible)}
        onSearch={search}
        query={query}
        onQueryChange={setQuery}
        traceName={graph.entries.find((entry) => entry.id === effectiveRoot)?.name ?? "当前条目"} projectName={activeProject?.name}
        onProjects={() => openPanel("projects")} onGroups={() => openPanel("groups")} onAddNode={() => openNode()} onAddRelation={() => setEditor("relation")}
      />
      <div className="canvas-frame">
        <LegendCanvas key={activeProject?.id ?? "shared"} layout={layout} traceRoot={effectiveRoot} traceActive={traceActive} selectedId={selectedEntry?.id ?? null}
          onSelectNode={(id) => { const entry = graph.entries.find((item) => item.id === id); if (entry) selectEntry(entry); }} />
        {activeProject ? <div className="workspace-caption md-typescale-label-medium">{activeProject.name} · 浏览器项目</div> : null}
        {knowledge.result && !panel ? <SearchResults result={knowledge.result} loading={knowledge.loading} onClose={knowledge.close} onSelect={selectEntry} /> : null}
        {selectedEntry && !detailHidden && !knowledge.result && !panel ? <DetailPanel key={`${activeProject?.id ?? "shared"}:${selectedEntry.id}`} entry={selectedEntry}
          graph={activeProject && !graph.entries.some((entry) => entry.id === selectedEntry.id) ? database.graph : graph} privateMode={Boolean(activeProject && graph.entries.some((entry) => entry.id === selectedEntry.id))}
          onAddToProject={activeProject && !graph.entries.some((entry) => entry.id === selectedEntry.id) ? (entry) => { if (updateProject(saveEntry(activeProject, { ...entry, origin: "baseline" }))) selectEntry(entry); } : undefined}
          onClose={() => setDetailHidden(true)} onSelectEntry={selectEntry} onSearch={search} onTrace={() => { setTraceRoot(selectedEntry.id); setTraceActive(true); }}
          onEdit={() => openNode(selectedEntry)} onAddRelation={() => setEditor("relation")} onDelete={() => { if (activeProject && updateProject(removeEntry(activeProject, selectedEntry.id))) { setSelected(null); setDetailHidden(true); } }}
          onRemoveRelation={(id) => { if (activeProject) updateProject({ ...activeProject, updatedAt: new Date().toISOString(), graph: { ...graph, relationships: graph.relationships.filter((edge) => edge.id !== id) } }); }} /> : null}
        {panel === "groups" ? <GroupPanel graph={graph} groupIds={groupIds} onClose={() => setPanel(null)} onChange={(ids) => {
          if (activeProject) updateProject({ ...activeProject, groupIds: ids }); else setView((current) => ({ ...current, groupIds: ids }));
        }} /> : null}
        {panel === "projects" ? <ProjectPanel projects={projectState.projects} activeId={activeProject?.id ?? null} baseline={baseline}
          onCreate={(name) => { if (baseline) addProject(createProject(database.graph, baseline.id, name)); }} onSelect={switchSpace} onImport={addProject} onClose={() => setPanel(null)}
          onRemove={(id) => { if (persistProjects(projectState.projects.filter((project) => project.id !== id)) && activeProject?.id === id) switchSpace(null); }}
          onRename={(id, name) => { persistProjects(projectState.projects.map((project) => project.id === id ? { ...project, name, updatedAt: new Date().toISOString() } : project)); }} /> : null}
        {editor === "node" && activeProject ? <StoryEditor key={editingEntry?.id ?? "new"} project={activeProject} entry={editingEntry} onClose={() => setEditor(null)} onSave={(entry) => {
          if (updateProject(saveEntry(activeProject, entry))) { selectEntry(entry); setEditor(null); setNotice("故事节点已保存。"); }
        }} /> : null}
        {editor === "relation" && activeProject ? <RelationEditor project={activeProject} selectedId={graph.entries.some((entry) => entry.id === selectedEntry?.id) ? selectedEntry!.id : null} onClose={() => setEditor(null)} onSave={(edge) => {
          if (updateProject(saveRelation(activeProject, edge))) { setEditor(null); setNotice("发展关系已保存。"); }
        }} /> : null}
        <CanvasFooter traceActive={traceActive} nodes={display.nodes} pendingCount={display.pendingCount} message={activeProject ? "" : database.message} />
        {notice || projectState.error ? <div className="app-notice md-typescale-body-small" role="status">{notice || projectState.error}<MaterialIconButton size="sm" aria-label="关闭提示" onClick={() => setNotice("")}><MaterialIcon name="close" /></MaterialIconButton></div> : null}
        {!display.nodes.length ? <div className="empty-graph md-typescale-body-medium">尚无可定位节点。搜索资料，或在个人项目中添加带年份的故事节点。</div> : null}
      </div>
    </main>
  );
}
