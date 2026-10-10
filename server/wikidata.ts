import type { KnowledgeTag } from "../src/knowledge";
import type { Discovery, IncomingEntry, IncomingRelation } from "./model";

type Localized = Record<string, { value: string; language?: string }>;
type Claim = { rank?: string; mainsnak?: { snaktype?: string; datavalue?: { value?: { id?: string; time?: string; precision?: number } } } };
type Entity = {
  id: string; labels?: Localized; descriptions?: Localized;
  aliases?: Record<string, { value: string }[]>;
  claims?: Record<string, Claim[]>; sitelinks?: Record<string, { title: string }>;
};
const tagProperties = ["P17", "P495", "P31", "P921"];
const relationProperties: Record<string, string> = { P144: "改编来源", P941: "灵感来源" };
const api = "https://www.wikidata.org/w/api.php";
const languages = ["zh-hans", "zh-cn", "zh", "en"];

function localized(values?: Localized): string | undefined {
  const available = languages.flatMap((lang) => values?.[lang] ? [{ ...values[lang], language: values[lang].language ?? lang }] : []);
  return available.find((item) => item.language.startsWith("zh"))?.value ?? available.find((item) => item.language === "en")?.value;
}
function targets(entity: Entity, property: string): string[] {
  const claims = (entity.claims?.[property] ?? []).filter((c) => c.rank !== "deprecated" && c.mainsnak?.snaktype === "value");
  const preferred = claims.filter((c) => c.rank === "preferred");
  return (preferred.length ? preferred : claims).flatMap((c) => {
    const id = c.mainsnak?.datavalue?.value?.id;
    return id && /^Q\d+$/.test(id) ? [id] : [];
  });
}
function yearLabel(entity: Entity): string | undefined {
  const year = (property: string) => {
    const date = (entity.claims?.[property] ?? []).find((c) => c.rank !== "deprecated" && c.mainsnak?.datavalue?.value?.time)?.mainsnak?.datavalue?.value;
    if (!date?.time || (date.precision ?? 0) < 9) return undefined;
    const match = /^([+-])(\d+)-/.exec(date.time);
    if (!match) return undefined;
    return `${match[1] === "-" ? "公元前 " : ""}${Number(match[2])}`;
  };
  const start = year("P580") ?? year("P577");
  const end = year("P582");
  return start ? `${start}${end ? `–${end}` : ""}` : undefined;
}

async function request(params: Record<string, string>, fetcher: typeof fetch): Promise<Record<string, unknown>> {
  const url = new URL(api);
  // These are interactive searches. MediaWiki permits omitting maxlag here;
  // unrelated query-service replication lag must not reject a waiting reader.
  url.search = new URLSearchParams({ ...params, format: "json" }).toString();
  const response = await fetcher(url, {
    headers: { "User-Agent": "LegendBranch/0.1 (https://github.com/DDonlien/legend-branch; source-backed knowledge search)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Wikidata HTTP ${response.status}`);
  const json = await response.json() as Record<string, unknown>;
  if (!json || typeof json !== "object") throw new Error("Wikidata returned an invalid response");
  if (json.error) {
    const error = json.error as { code?: string; info?: string };
    throw new Error(`Wikidata API ${error.code ?? "error"}: ${error.info?.slice(0, 200) ?? "Unknown provider failure"}`);
  }
  return json;
}

async function entities(ids: string[], fetcher: typeof fetch, claims = true): Promise<Entity[]> {
  if (!ids.length) return [];
  const data = await request({ action: "wbgetentities", ids: ids.join("|"),
    props: claims ? "labels|descriptions|aliases|claims|sitelinks" : "labels",
    languages: "zh-hans|zh-cn|zh|en", languagefallback: "1" }, fetcher);
  if (!data.entities || typeof data.entities !== "object") throw new Error("Wikidata entities are missing");
  return Object.values(data.entities).filter((e): e is Entity => {
    return Boolean(e && typeof e === "object" && "id" in e && typeof e.id === "string" && /^Q\d+$/.test(e.id));
  });
}

export async function discover(query: string, fetcher: typeof fetch = fetch): Promise<Discovery> {
  const data = await request({ action: "wbsearchentities", search: query, language: "zh", uselang: "zh", limit: "5", type: "item" }, fetcher);
  if (!Array.isArray(data.search)) throw new Error("Wikidata search results are missing");
  const ids = data.search.flatMap((item) => item && typeof item.id === "string" && /^Q\d+$/.test(item.id) ? [item.id as string] : []).slice(0, 5);
  const found = await entities(ids, fetcher);
  // One hop only. Related source works become entries; countries/categories
  // remain tags and cannot produce influence edges.
  const sourceIds = [...new Set(found.flatMap((e) => Object.keys(relationProperties).flatMap((p) => targets(e, p))))].filter((id) => !ids.includes(id)).slice(0, 5);
  const sourceEntities = await entities(sourceIds, fetcher);
  const all = [...found, ...sourceEntities];
  const tagIds = [...new Set(all.flatMap((e) => tagProperties.flatMap((p) => targets(e, p).slice(0, 4))))].slice(0, 40);
  const labels = new Map((await entities(tagIds, fetcher, false)).map((e) => [e.id, localized(e.labels)]));
  const entries: IncomingEntry[] = all.filter((e) => localized(e.labels)).map((e) => {
    const url = `https://www.wikidata.org/wiki/${e.id}`;
    const tags: KnowledgeTag[] = [...new Set(tagProperties.flatMap((p) => targets(e, p).slice(0, 4)))].flatMap((id) => {
      const name = labels.get(id);
      return name ? [{ id: `wd:${id}`, name }] : [];
    });
    const wiki = e.sitelinks?.zhwiki ?? e.sitelinks?.enwiki;
    const wikiLanguage = e.sitelinks?.zhwiki ? "zh" : "en";
    return {
      id: `wd:${e.id}`, externalId: e.id, name: localized(e.labels)!,
      latinName: e.labels?.en?.value, kind: "entry", yearLabel: yearLabel(e),
      summary: localized(e.descriptions) ?? "",
      reviewStatus: "unreviewed", tags,
      sources: [{ label: `Wikidata · ${e.id}`, url }, ...(wiki ? [{ label: "Wikipedia · 外链索引", url: `https://${wikiLanguage}.wikipedia.org/wiki/${encodeURIComponent(wiki.title.replace(/ /g, "_"))}` }] : [])],
      aliases: [...new Set([...languages.flatMap((lang) => [e.labels?.[lang]?.value ?? "", ...(e.aliases?.[lang] ?? []).slice(0, 4).map((a) => a.value)])])].filter(Boolean).slice(0, 12),
    };
  });
  const entryIds = new Set(entries.map((e) => e.id));
  const relationships: IncomingRelation[] = found.flatMap((e) => Object.entries(relationProperties).flatMap(([property, relation]) => targets(e, property).flatMap((target) => {
    const from = `wd:${target}`;
    const to = `wd:${e.id}`;
    if (!entryIds.has(from) || !entryIds.has(to) || from === to) return [];
    return [{ id: `wd:${property}:${target}:${e.id}`, from, to, relation,
      confidence: "probable" as const, debated: false, reviewStatus: "unreviewed" as const,
      sources: [{ label: `Wikidata · ${property}`, url: `https://www.wikidata.org/wiki/${e.id}#${property}` }] }];
  })));
  return { entries, relationships };
}
