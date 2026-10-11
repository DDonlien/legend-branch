import type { KnowledgeEntry, KnowledgeTag } from "./knowledge";

export type Locale = "zh" | "en";

const zh = {
  brand: "传说谱系", hideToolbar: "收起工具栏", showToolbar: "展开工具栏", clearTrace: "清除 Trace",
  searchPlaceholder: "搜索条目或标签", startSearch: "开始搜索", searchTooLong: "搜索词最多 120 个字",
  knowledge: "知识库", sharedKnowledge: "共享知识库", personalProject: "个人项目", switchSpace: "切换知识库或个人项目",
  grouping: "分组依据", tags: "标签", density: "信息密度", language: "语言", languageZh: "中文", languageEn: "English",
  country: "所属国家", culture: "文化", category: "类别", topic: "主题", legacyGrouping: "原有分组",
  close: "关闭", closeGrouping: "关闭分组设置", tagSettings: "标签设置", findTags: "查找标签", availableTags: "可选标签",
  groupOrder: "分组顺序", moveGroupUp: "上移 {name}", moveGroupDown: "下移 {name}", resetTags: "恢复全部标签",
  noMatchingTags: "没有匹配的标签", allTags: "全选", noTagsSelected: "清空选择",
  densityNodes: "节点", densityNames: "名称", densityDetailed: "详细卡片",
  closeProjects: "关闭空间列表", spaces: "项目空间", myProjects: "我的项目", createProject: "创建项目", createProjectTitle: "从基线创建项目",
  baseline: "基线：{name}及其关联谱系", selectBaseline: "先在知识库中选中一个条目", projectName: "项目名称",
  browserProjects: "浏览器项目", browserStorageInfo: "项目保存在当前浏览器，可导出备份后在其他浏览器导入。",
  noProjects: "尚未创建个人项目", projectNodes: "{count} 个节点", renameProject: "重命名 {name}", exportProject: "导出 {name}",
  deleteProject: "删除 {name}", importBackup: "导入备份", chooseBackup: "选择项目备份", backupTooLarge: "备份文件过大，请选择 5 MB 以内的项目备份。",
  backupInvalid: "备份格式无效，项目未导入。", deleteProjectTitle: "删除个人项目？", deleteProjectBody: "“{name}”的浏览器副本将被删除，可以先导出备份。",
  cancel: "取消", deleteProjectAction: "删除项目", saveName: "保存名称", create: "创建", save: "保存",
  projectReadError: "浏览器项目数据无法读取，原始数据仍保留。", viewStorageError: "浏览器存储不可用，当前视图偏好无法保存。",
  projectSaveError: "浏览器空间不足或存储被禁用，项目未保存。请导出备份后重试。", projectSaved: "个人项目已保存在当前浏览器。",
  nodeSaved: "故事节点已保存。", relationSaved: "发展关系已保存。", closeNotice: "关闭提示",
  emptyGraph: "尚无可定位节点。搜索资料，或在个人项目中添加带年份的故事节点。",
  graphLoading: "正在加载共享图谱…", graphUpdateError: "图谱暂时无法更新，保留已加载内容。", graphOffline: "共享图谱暂时无法连接，当前显示离线样例。",
  searchResults: "搜索结果", searchQuery: "搜索“{query}”", closeSearch: "关闭搜索结果", enriching: "正在联网增补…", matchingEntries: "匹配条目",
  searchUnavailable: "联网增补暂时不可用，已有结果仍可查看。稍后可重试。", searchCached: "已查询共享知识库 · 近期增补已保存",
  searchAdded: "已保存至知识库 · 新增 {count} 个条目", searchUnchanged: "已保存至知识库 · 没有新增条目",
  searchEmptyLoading: "已有知识库未找到条目，正在检索来源。", searchEmpty: "没有找到匹配条目，换一个名称试试。",
  viewEntry: "查看条目：{name}", viewNode: "查看节点：{name}", noTags: "暂无标签", projectContent: "项目内容", curated: "已整理",
  unreviewed: "待复核", located: "已可定位", unlocated: "待定位", dateUnknown: "年代待核实", authored: "个人创作", baselineSnapshot: "基线快照",
  enrichedUnreviewed: "联网增补 · 待复核", detailTitle: "{name}详情", closeDetail: "关闭详情", detailUnavailable: "共享知识库暂时无法连接，当前内容仍可查看。",
  relatedUnavailable: "相关条目暂时无法加载，请稍后重试。", cultureUnknown: "文化 / 国家信息待核实，暂未进入时间图谱。", dateMissing: "缺少可靠年代，暂未进入时间图谱。",
  traceEntry: "Trace 此条目", addToProject: "加入当前项目", addNode: "添加故事节点", editNode: "编辑故事节点", deleteNode: "删除故事节点", addRelation: "添加发展关系",
  entryTags: "条目标签", searchTag: "搜索标签：{name}", tagsMissing: "来源尚未提供标签。", influences: "来源与影响", viewRelated: "查看相关节点：{name}",
  confirmed: "确认较高", probable: "可能关联", speculative: "推测关联", debated: "存在争议", manageRelations: "管理关系", hideRelations: "收起关系管理",
  removeRelation: "移除 {relation} · {name}", relationsMissing: "尚未记录传播关系。", sources: "外链索引", deleteNodeTitle: "删除故事节点？",
  deleteNodeBody: "删除项目中的“{name}”及其发展关系。", deleteNodeAction: "删除节点",
  origin: "神话 / 民俗", literature: "古典文学", modern: "现代作品", entry: "知识条目", storyNode: "故事节点", traceCenter: "Trace 中心", root: "起源",
  timelineGraph: "时间图谱，横向为非等距时间，纵向按标签分组", tagGroups: "标签分组", timeArrow: "时间 →", otherTags: "其他标签",
  unmatchedTags: "未匹配所选标签", groupedByTags: "按标签分组", axisNote: "非等距时间轴 · 现代段展开", tracingCount: "当前追踪：{count} 个节点",
  visibleCount: "当前显示：{count} 个节点", pendingCount: " · {count} 个待定位", bce: "公元前 {year}", ceOne: "公元 1",
  storyEditorHelp: "个人创作仅保存在这个项目中。年份可留空，未定位节点仍可在项目中搜索。",
  nodeName: "节点名称", year: "年份（公元前用负数）", invalidYear: "请输入 -1000000 至 1000000 的整数年份", commaTags: "标签（用逗号分隔）",
  invalidTags: "每个标签最多 100 字", newTagBasis: "新标签的分组依据", storySummary: "故事梗概", saveNode: "保存节点",
  relationEditorHelp: "选择起点和终点，可以表达分支、合流和时间倒向的故事关系。", fromNode: "起点节点", toNode: "终点节点",
  relationDescription: "关系说明", storyDevelopment: "故事发展", saveRelation: "保存关系",
} as const;

export type TranslationKey = keyof typeof zh;
const en: Record<TranslationKey, string> = {
  brand: "Legend Branch", hideToolbar: "Collapse toolbar", showToolbar: "Expand toolbar", clearTrace: "Clear Trace",
  searchPlaceholder: "Search entries or tags", startSearch: "Search", searchTooLong: "Use at most 120 characters",
  knowledge: "Knowledge", sharedKnowledge: "Shared knowledge", personalProject: "Project", switchSpace: "Switch knowledge or project",
  grouping: "Group by", tags: "Tags", density: "Density", language: "Language", languageZh: "中文", languageEn: "English",
  country: "Country", culture: "Culture", category: "Category", topic: "Topic", legacyGrouping: "Previous grouping",
  close: "Close", closeGrouping: "Close grouping", tagSettings: "Tag selection", findTags: "Find tags", availableTags: "Available tags",
  groupOrder: "Group order", moveGroupUp: "Move {name} up", moveGroupDown: "Move {name} down", resetTags: "Reset all tags",
  noMatchingTags: "No matching tags", allTags: "Select all", noTagsSelected: "Clear selection",
  densityNodes: "Nodes", densityNames: "Names", densityDetailed: "Detailed cards",
  closeProjects: "Close spaces", spaces: "Project spaces", myProjects: "My projects", createProject: "Create project", createProjectTitle: "Create from a baseline",
  baseline: "Baseline: {name} and its connected lineage", selectBaseline: "Select an entry in shared knowledge first", projectName: "Project name",
  browserProjects: "Browser project", browserStorageInfo: "Projects stay in this browser. Export a backup to import them in another browser.",
  noProjects: "No personal projects yet", projectNodes: "{count} nodes", renameProject: "Rename {name}", exportProject: "Export {name}",
  deleteProject: "Delete {name}", importBackup: "Import backup", chooseBackup: "Choose a project backup", backupTooLarge: "Choose a project backup smaller than 5 MB.",
  backupInvalid: "Invalid backup format. The project was not imported.", deleteProjectTitle: "Delete personal project?", deleteProjectBody: "The browser copy of “{name}” will be deleted. You can export a backup first.",
  cancel: "Cancel", deleteProjectAction: "Delete project", saveName: "Save name", create: "Create", save: "Save",
  projectReadError: "Browser projects could not be read. The original data is still preserved.", viewStorageError: "Browser storage is unavailable. View preferences could not be saved.",
  projectSaveError: "Storage is full or disabled. The project was not saved. Export a backup and try again.", projectSaved: "Your project is saved in this browser.",
  nodeSaved: "Story node saved.", relationSaved: "Development relation saved.", closeNotice: "Dismiss notification",
  emptyGraph: "No dated nodes yet. Search for knowledge, or add a dated story node in a project.",
  graphLoading: "Loading shared graph…", graphUpdateError: "The graph could not be refreshed. Loaded content is preserved.", graphOffline: "Shared knowledge is unavailable. Showing the offline sample.",
  searchResults: "Search results", searchQuery: "Search “{query}”", closeSearch: "Close search results", enriching: "Adding knowledge from sources…", matchingEntries: "Matching entries",
  searchUnavailable: "Online enrichment is unavailable. Existing results are preserved. Try again later.", searchCached: "Shared knowledge searched · recent additions saved",
  searchAdded: "Saved to knowledge · {count} new entries", searchUnchanged: "Saved to knowledge · no new entries",
  searchEmptyLoading: "No existing match. Searching external sources…", searchEmpty: "No matching entries. Try another name.",
  viewEntry: "View entry: {name}", viewNode: "View node: {name}", noTags: "No tags", projectContent: "Project content", curated: "Curated",
  unreviewed: "Needs review", located: "On timeline", unlocated: "Not yet located", dateUnknown: "Date unverified", authored: "Personal creation", baselineSnapshot: "Baseline snapshot",
  enrichedUnreviewed: "Online addition · needs review", detailTitle: "Details: {name}", closeDetail: "Close details", detailUnavailable: "Shared knowledge is unavailable. Existing details are preserved.",
  relatedUnavailable: "The related entry could not be loaded. Try again later.", cultureUnknown: "Culture or country is unverified. This entry is not yet on the timeline.", dateMissing: "A reliable date is missing. This entry is not yet on the timeline.",
  traceEntry: "Trace this entry", addToProject: "Add to project", addNode: "Add story node", editNode: "Edit story node", deleteNode: "Delete story node", addRelation: "Add relation",
  entryTags: "Entry tags", searchTag: "Search tag: {name}", tagsMissing: "Sources have not supplied tags.", influences: "Sources & influences", viewRelated: "View related node: {name}",
  confirmed: "High confidence", probable: "Possible relation", speculative: "Speculative relation", debated: "Debated", manageRelations: "Manage relations", hideRelations: "Hide relation management",
  removeRelation: "Remove {relation} · {name}", relationsMissing: "No relations recorded yet.", sources: "External sources", deleteNodeTitle: "Delete story node?",
  deleteNodeBody: "Delete “{name}” and its relations from this project.", deleteNodeAction: "Delete node",
  origin: "Myth / folklore", literature: "Classic literature", modern: "Modern work", entry: "Knowledge entry", storyNode: "Story node", traceCenter: "Trace center", root: "Origin",
  timelineGraph: "Knowledge timeline, non-uniform time horizontally and tag groups vertically", tagGroups: "Tag groups", timeArrow: "Time →", otherTags: "Other tags",
  unmatchedTags: "Unmatched tags", groupedByTags: "Grouped by tags", axisNote: "Non-uniform time · recent years expanded", tracingCount: "Tracing: {count} nodes",
  visibleCount: "Showing: {count} nodes", pendingCount: " · {count} not yet located", bce: "{year} BCE", ceOne: "1 CE",
  storyEditorHelp: "Your creations stay in this project. You can leave the year empty; undated nodes remain searchable.",
  nodeName: "Node name", year: "Year (negative for BCE)", invalidYear: "Enter an integer from -1000000 to 1000000", commaTags: "Tags (comma separated)",
  invalidTags: "Use at most 100 characters per tag", newTagBasis: "Group for new tags", storySummary: "Story summary", saveNode: "Save node",
  relationEditorHelp: "Choose start and end nodes for branches, merges, or relations that move backwards in time.", fromNode: "Start node", toNode: "End node",
  relationDescription: "Relation description", storyDevelopment: "Story development", saveRelation: "Save relation",
};

export const messages = { zh, en };
export function translate(locale: Locale, key: TranslationKey, values: Record<string, string | number> = {}) {
  return messages[locale][key].replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
}

const englishTags: Record<string, string> = {
  "culture:india": "Indian culture", "culture:china": "Chinese culture", "culture:japan": "Modern Japan", "culture:modern-china": "Modern China",
  "wd:Q668": "India", "wd:Q148": "China", "wd:Q17": "Japan", "wd:Q30": "United States", "wd:Q16": "Canada",
  "wd:Q142": "France", "wd:Q408": "Australia", "wd:Q183": "Germany", "wd:Q145": "United Kingdom",
  myth: "Mythology", folklore: "Folklore", literature: "Literature",
  "journey-to-the-west": "Journey to the West", manga: "Manga", film: "Film", game: "Game", drama: "Theatre", television: "Television",
};
export function tagLabel(tag: Pick<KnowledgeTag, "id" | "name">, locale: Locale) {
  return locale === "en" ? englishTags[tag.id] ?? tag.name : tag.name;
}

const englishDates: Record<string, string> = {
  hanuman: "c. 4th century BCE", ramayana: "c. 3rd century BCE", wuzhiqi: "Recorded in the Song dynasty", "monkey-pilgrim": "Song–Yuan period",
  zaju: "Late Yuan–early Ming", "sun-wukong": "Ming dynasty · c. 1592", "dragon-ball": "1984 · manga", saiyuki: "1997 · manga", enma: "2002 · manga",
  "a-chinese-odyssey": "1995 · film", "black-myth": "2024 · game", "tv-journey": "1986 · television",
};
export function yearLabel(entry: Pick<KnowledgeEntry, "id" | "yearLabel" | "placement" | "origin">, locale: Locale) {
  if (entry.placement && (entry.origin === "project" || !entry.yearLabel)) {
    const format = (year: number) => year < 0 ? translate(locale, "bce", { year: Math.abs(year) }) : String(year);
    return `${format(entry.placement.year)}${entry.placement.endYear != null ? `–${format(entry.placement.endYear)}` : ""}`;
  }
  return (locale === "en" ? englishDates[entry.id] : undefined) ?? entry.yearLabel ?? translate(locale, "dateUnknown");
}
