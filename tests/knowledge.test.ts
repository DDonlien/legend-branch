import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { KnowledgeStore } from "../server/store";
import { seed } from "../server/seed";
import { enrichSearch } from "../server/search";
import { discover } from "../server/wikidata";
import type { Database, Discovery, IncomingEntry, Statement } from "../server/model";

function setup() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  sqlite.exec(readFileSync(new URL("../server/migrations/0001_knowledge.sql", import.meta.url), "utf8"));
  class SqlStatement implements Statement {
    constructor(readonly sql: string, readonly values: (string | number | null)[] = []) {}
    bind(...values: (string | number | null)[]) { return new SqlStatement(this.sql, values); }
    async all<T>() { return { results: sqlite.prepare(this.sql).all(...this.values) as T[] }; }
    async first<T>() { return sqlite.prepare(this.sql).get(...this.values) as T ?? null; }
  }
  const db: Database = {
    prepare: (sql) => new SqlStatement(sql),
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = statements.map((statement) => {
          const stmt = statement as SqlStatement;
          return { meta: { changes: Number(sqlite.prepare(stmt.sql).run(...stmt.values).changes) } };
        });
        sqlite.exec("COMMIT");
        return results;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
  return { sqlite, store: new KnowledgeStore(db) };
}
const now = "2026-10-10T17:00:00.000Z";
function incoming(overrides: Partial<IncomingEntry> = {}): IncomingEntry {
  return { id: "wd:Q696482", externalId: "Q696482", name: "美国大萧条", aliases: ["Great Depression in the United States"],
    kind: "entry", summary: "美国的经济危机。", reviewStatus: "unreviewed", tags: [{ id: "wd:Q30", name: "美国" }, { id: "wd:Q290178", name: "经济危机" }],
    sources: [{ label: "Wikidata · Q696482", url: "https://www.wikidata.org/wiki/Q696482" }], ...overrides };
}
const discovery = (entry = incoming()): Discovery => ({ entries: [entry], relationships: [] });

test("seed migration and repeated imports preserve all 12 entries and 11 sourced relationships", async () => {
  const { store, sqlite } = setup();
  sqlite.exec(readFileSync(new URL("../server/migrations/0002_seed.sql", import.meta.url), "utf8"));
  await store.merge(seed, now);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM entries").get()?.n, 12);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM relationships").get()?.n, 11);
  const wukong = await store.detail("sun-wukong");
  assert.equal(wukong?.relationships.length, 9);
  assert.equal(wukong?.relationships.find((r) => r.from === "wuzhiqi")?.confidence, "speculative");
  assert.ok(wukong?.relationships.every((r) => r.sources.length));
  assert.notEqual((await store.detail("monkey-pilgrim"))?.entry.id, (await store.detail("zaju"))?.entry.id);
});

test("incremental imports deduplicate entities and append tags, sources and summary versions", async () => {
  const { store, sqlite } = setup();
  assert.equal((await store.merge(discovery(), now)).added, 1);
  assert.equal((await store.merge(discovery(), now)).added, 0);
  await store.merge(discovery(incoming({ summary: "新的带来源梗概。", tags: [{ id: "history", name: "历史" }], sources: [...incoming().sources, { label: "资料", url: "https://example.org/history" }] })), "2026-10-11T17:00:00.000Z");
  const entry = (await store.detail("wd:Q696482"))!.entry;
  assert.equal(entry.summary, "新的带来源梗概。");
  assert.equal(entry.tags.length, 3);
  assert.equal(entry.sources.length, 2);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM summaries").get()?.n, 2);
  assert.equal((await store.search("美国"))[0].id, entry.id);
  assert.equal((await store.search("经济危机"))[0].id, entry.id);
  assert.equal((await store.search("Great Depression"))[0].id, entry.id);
  assert.equal((await store.detail(entry.id))?.relationships.length, 0);
});

test("matching external IDs enrich a curated version without replacing its name or summary", async () => {
  const { store } = setup();
  await store.merge(seed, now);
  await store.merge(discovery(incoming({ id: "wd:Q98582386", externalId: "Q98582386", name: "Black Myth", summary: "机器取得的梗概。" })), "2026-10-11T17:00:00.000Z");
  const detail = await store.detail("black-myth");
  assert.equal(detail?.entry.name, "《黑神话：悟空》");
  assert.ok(detail?.entry.summary.includes("动作角色扮演"));
  assert.equal(await store.detail("wd:Q98582386"), null);
  assert.equal(detail?.entry.reviewStatus, "curated");
  assert.ok(detail?.entry.sources.some((s) => s.url.includes("wikidata")));
});

test("concurrent repeated searches count an entity only once", async () => {
  const { store, sqlite } = setup();
  const results = await Promise.all([store.merge(discovery(), now), store.merge(discovery(), now)]);
  assert.equal(results.reduce((total, result) => total + result.added, 0), 1);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM entries").get()?.n, 1);
});

test("failed batches roll back entries as well as sources and tags", async () => {
  const { store, sqlite } = setup();
  const bad: Discovery = { ...discovery(), relationships: [{ id: "bad", from: "missing", to: incoming().id, relation: "影响", confidence: "probable", debated: false, reviewStatus: "unreviewed", sources: incoming().sources }] };
  await assert.rejects(store.merge(bad, now));
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM entries").get()?.n, 0);
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM tags").get()?.n, 0);
});

test("repeat queries reuse enrichment for six hours and then fetch updates", async () => {
  const { store } = setup();
  let calls = 0;
  const provider = async () => { calls++; return discovery(); };
  assert.equal((await enrichSearch(store, "美国大萧条", provider, new Date(now))).added, 1);
  assert.equal((await enrichSearch(store, " 美国大萧条 ", provider, new Date(now))).enrichment, "cached");
  assert.equal(calls, 1);
  await enrichSearch(store, "美国大萧条", provider, new Date("2026-10-11T00:00:00Z"));
  assert.equal(calls, 2);
});

test("upstream failures preserve cached content and do not claim successful enrichment", async () => {
  const { store } = setup();
  const query = "大萧条美国";
  await enrichSearch(store, query, async () => discovery(), new Date(now));
  assert.equal((await store.search(query)).length, 0);
  const result = await enrichSearch(store, query, async () => { throw new Error("upstream offline"); }, new Date("2026-10-11T00:00:00Z"));
  assert.equal(result.entries.length, 1);
  assert.equal(result.enrichment, "unavailable");
  assert.equal((await store.recentSearch(query))?.status, "failed");
  assert.equal((await store.detail("wd:Q696482"))?.entry.sources.length, 1);
});

test("search input cannot change SQL structure or treat wildcards as all entries", async () => {
  const { store } = setup();
  await store.merge(discovery(), now);
  assert.equal((await store.search("%' OR 1=1 --")).length, 0);
  assert.equal((await store.search("%%")).length, 0);
});

test("Wikidata imports country/category tags and explicit candidate relations without guessed dates", async () => {
  const claim = (id: string) => ({ rank: "normal", mainsnak: { snaktype: "value", datavalue: { value: { id } } } });
  const fixtures: Record<string, unknown> = {
    Q1: { id: "Q1", labels: { zh: { value: "作品" } }, descriptions: { "zh-hans": { value: "English fallback", language: "en" }, zh: { value: "作品梗概", language: "zh" } }, claims: { P17: [claim("Q30")], P31: [claim("Q2")], P144: [claim("Q3")] } },
    Q3: { id: "Q3", labels: { zh: { value: "来源作品" } } },
    Q30: { id: "Q30", labels: { zh: { value: "美国" } } },
    Q2: { id: "Q2", labels: { zh: { value: "作品类型" } } },
  };
  const fetcher = (async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.has("maxlag"), false);
    if (url.searchParams.get("action") === "wbsearchentities") return Response.json({ search: [{ id: "Q1" }] });
    const ids = url.searchParams.get("ids")!.split("|");
    return Response.json({ entities: Object.fromEntries(ids.map((id) => [id, fixtures[id]])) });
  }) as typeof fetch;
  const found = await discover("作品", fetcher);
  assert.deepEqual(found.entries[0].tags.map((t) => t.name), ["美国", "作品类型"]);
  assert.equal(found.entries[0].summary, "作品梗概");
  assert.equal(found.entries[0].yearLabel, undefined);
  assert.equal(found.relationships.length, 1);
  assert.equal(found.relationships[0].from, "wd:Q3");
  assert.equal(found.relationships[0].reviewStatus, "unreviewed");
  assert.ok(found.relationships[0].sources[0].url.endsWith("#P144"));
});
