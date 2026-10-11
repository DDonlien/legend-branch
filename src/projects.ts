import { lineage } from "./graph";
import { normalizeSearch, type GraphRelation, type KnowledgeEntry, type KnowledgeGraph, type KnowledgeTag } from "./knowledge";

export type StoryProject = {
  id: string;
  name: string;
  baselineRoot: string;
  baselineName: string;
  createdAt: string;
  updatedAt: string;
  groupIds: string[] | null;
  graph: KnowledgeGraph;
};
export const PROJECT_STORAGE_KEY = "legendbranch.projects.v1";

export function createProject(graph: KnowledgeGraph, root: string, name: string): StoryProject {
  const baseline = graph.entries.find((entry) => entry.id === root);
  if (!baseline) throw new Error("请先选择一个基线条目。");
  const now = new Date().toISOString();
  const snapshot = structuredClone(lineage(graph, root));
  snapshot.entries = snapshot.entries.map((entry) => ({ ...entry, origin: "baseline" }));
  return { id: crypto.randomUUID(), name: (name.trim() || `${baseline.name} · 我的故事`).slice(0, 200), baselineRoot: root,
    baselineName: baseline.name, createdAt: now, updatedAt: now, groupIds: null, graph: snapshot };
}

export function projectTags(names: string, known: KnowledgeTag[]): KnowledgeTag[] {
  const unique = [...new Map(names.split(/[,，、\n]/).map((name) => name.trim()).filter(Boolean).map((name) => [normalizeSearch(name), name])).values()];
  return unique.map((name) => known.find((tag) => normalizeSearch(tag.name) === normalizeSearch(name)) ??
    { id: `local-tag:${normalizeSearch(name)}`, name, category: "topic" });
}

export function saveEntry(project: StoryProject, entry: KnowledgeEntry): StoryProject {
  const exists = project.graph.entries.some((item) => item.id === entry.id);
  return { ...project, updatedAt: new Date().toISOString(), graph: { ...project.graph,
    entries: exists ? project.graph.entries.map((item) => item.id === entry.id ? structuredClone(entry) : item) : [...project.graph.entries, structuredClone(entry)] } };
}

export function removeEntry(project: StoryProject, id: string): StoryProject {
  return { ...project, updatedAt: new Date().toISOString(), graph: {
    entries: project.graph.entries.filter((entry) => entry.id !== id),
    relationships: project.graph.relationships.filter((edge) => edge.from !== id && edge.to !== id),
  } };
}

export function saveRelation(project: StoryProject, edge: GraphRelation): StoryProject {
  const ids = new Set(project.graph.entries.map((entry) => entry.id));
  if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) throw new Error("请选择两个不同的项目节点。");
  const same = project.graph.relationships.find((item) => item.from === edge.from && item.to === edge.to && item.relation === edge.relation);
  return { ...project, updatedAt: new Date().toISOString(), graph: { ...project.graph,
    relationships: same ? project.graph.relationships.map((item) => item.id === same.id ? { ...edge, id: same.id } : item) : [...project.graph.relationships, edge] } };
}

function object(value: unknown): value is Record<string, unknown> { return Boolean(value && typeof value === "object" && !Array.isArray(value)); }
function text(value: unknown, max = 1000): value is string { return typeof value === "string" && value.length <= max; }
function source(value: unknown) {
  return object(value) && text(value.label) && text(value.url, 4000) && /^https?:\/\//.test(value.url);
}
function entry(value: unknown): value is KnowledgeEntry {
  if (!object(value) || !text(value.id, 200) || !value.id || !text(value.name) || !text(value.summary, 20000) ||
    !["origin", "literature", "modern", "entry"].includes(String(value.kind)) ||
    !["curated", "unreviewed"].includes(String(value.reviewStatus)) ||
    !Array.isArray(value.tags) || !Array.isArray(value.sources) || !value.sources.every(source)) return false;
  if (!value.tags.every((tag) => object(tag) && text(tag.id, 200) && text(tag.name, 1000) && (tag.category === undefined || ["country", "culture", "topic"].includes(String(tag.category))))) return false;
  if (value.yearLabel !== undefined && !text(value.yearLabel, 200)) return false;
  if (value.latinName !== undefined && !text(value.latinName)) return false;
  if (value.origin !== undefined && value.origin !== "project" && value.origin !== "baseline") return false;
  const p = value.placement;
  if (p !== undefined && (!object(p) || !Number.isSafeInteger(p.year) || Math.abs(Number(p.year)) > 1000000 ||
    !["curated", "sourced", "authored"].includes(String(p.quality)) ||
    (p.endYear != null && (!Number.isSafeInteger(p.endYear) || Number(p.endYear) < Number(p.year))) ||
    (p.rowHint != null && (!Number.isSafeInteger(p.rowHint) || Number(p.rowHint) < 0 || Number(p.rowHint) > 5000)) ||
    (p.sourceUrl != null && (!text(p.sourceUrl, 4000) || !/^https?:\/\//.test(p.sourceUrl))) ||
    (p.defaultTrace != null && typeof p.defaultTrace !== "boolean") ||
    (p.preferredGroup != null && !text(p.preferredGroup, 200)))) return false;
  return true;
}

export function validateProject(value: unknown): value is StoryProject {
  if (!object(value) || !text(value.id, 200) || !text(value.name, 200) || !text(value.baselineRoot, 200) || !text(value.baselineName) ||
    !text(value.createdAt, 50) || !text(value.updatedAt, 50) ||
    !(value.groupIds === null || (Array.isArray(value.groupIds) && value.groupIds.length <= 200 && value.groupIds.every((id) => text(id, 200)))) ||
    !object(value.graph) || !Array.isArray(value.graph.entries) || value.graph.entries.length > 5000 ||
    !value.graph.entries.every(entry) || !Array.isArray(value.graph.relationships) || value.graph.relationships.length > 10000) return false;
  const ids = new Set(value.graph.entries.map((item) => item.id));
  if (ids.size !== value.graph.entries.length) return false;
  const relationIds = new Set<string>();
  return value.graph.relationships.every((edge) => {
    if (!object(edge) || !text(edge.id, 200) || relationIds.has(edge.id) || !ids.has(String(edge.from)) || !ids.has(String(edge.to)) || edge.from === edge.to ||
      !text(edge.relation, 200) || !["confirmed", "probable", "speculative"].includes(String(edge.confidence)) ||
      !["curated", "unreviewed"].includes(String(edge.reviewStatus)) || typeof edge.debated !== "boolean" || !Array.isArray(edge.sources) || !edge.sources.every(source)) return false;
    relationIds.add(edge.id);
    return true;
  });
}

export function parseProjectBackup(input: string): StoryProject {
  const parsed: unknown = JSON.parse(input);
  if (!object(parsed) || parsed.format !== "legendbranch-project" || parsed.version !== 1 || !validateProject(parsed.project)) throw new Error("备份格式无效，项目未导入。");
  return { ...parsed.project, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
}

export function readProjects(storage: Pick<Storage, "getItem">): StoryProject[] {
  const raw = storage.getItem(PROJECT_STORAGE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(validateProject)) throw new Error("项目数据无法读取，请恢复项目备份。原始数据仍保留。");
  return parsed;
}

export function writeProjects(storage: Pick<Storage, "setItem">, projects: StoryProject[]) {
  storage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
}
