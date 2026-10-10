import { normalizeSearch, type EntryDetail, type KnowledgeEntry, type KnowledgeRelation } from "../src/knowledge";
import type { Database, Discovery, Statement } from "./model";

type Row = {
  id: string; name: string; latin_name: string | null; kind: KnowledgeEntry["kind"];
  year_label: string | null; review_status: KnowledgeEntry["reviewStatus"];
  summary: string | null; tags: string; sources: string;
};
const entrySelect = `SELECT e.*,
  (SELECT body FROM summaries WHERE entry_id = e.id
   ORDER BY (quality = 'curated') DESC, retrieved_at DESC, source_url LIMIT 1) AS summary,
  COALESCE((SELECT json_group_array(json_object('id', id, 'name', name)) FROM
    (SELECT DISTINCT t.id, t.name FROM entry_tags et JOIN tags t ON t.id = et.tag_id WHERE et.entry_id = e.id ORDER BY t.name)), '[]') AS tags,
  COALESCE((SELECT json_group_array(json_object('label', s.label, 'url', s.url)) FROM entry_sources es
    JOIN sources s ON s.url = es.source_url WHERE es.entry_id = e.id), '[]') AS sources
  FROM entries e`;

function entryFromRow(row: Row): KnowledgeEntry {
  return {
    id: row.id, name: row.name, latinName: row.latin_name ?? undefined,
    kind: row.kind, yearLabel: row.year_label ?? undefined,
    summary: row.summary ?? "来源尚未提供梗概。", tags: JSON.parse(row.tags),
    sources: JSON.parse(row.sources), reviewStatus: row.review_status,
  };
}

// Stay below D1's 100 bound parameters per statement. Bulk inserts also keep
// a search within the free plan's per-invocation SQL query budget.
function insertRows(db: Database, table: string, columns: string[], rows: (string | number | null)[][], conflict: string): Statement[] {
  const unique = [...new Map(rows.map((row) => [JSON.stringify(row), row])).values()];
  const size = Math.floor(100 / columns.length);
  const result: Statement[] = [];
  for (let i = 0; i < unique.length; i += size) {
    const chunk = unique.slice(i, i + size);
    result.push(db.prepare(`INSERT INTO ${table} (${columns.join(",")}) VALUES ${chunk.map(() => `(${columns.map(() => "?").join(",")})`).join(",")} ${conflict}`).bind(...chunk.flat()));
  }
  return result;
}

export class KnowledgeStore {
  constructor(private db: Database) {}

  async search(query: string, extraIds: string[] = []): Promise<KnowledgeEntry[]> {
    // LIKE wildcards are escaped: '%' searches for a literal percent sign.
    const key = normalizeSearch(query);
    const pattern = `%${key.replace(/[\\%_]/g, "\\$&")}%`;
    const additional = extraIds.length ? `OR e.id IN (${extraIds.map(() => "?").join(",")})` : "";
    const rows = await this.db.prepare(`${entrySelect} WHERE
      EXISTS (SELECT 1 FROM aliases a WHERE a.entry_id = e.id AND a.search_key LIKE ? ESCAPE '\\')
      OR EXISTS (SELECT 1 FROM entry_tags et JOIN tags t ON t.id = et.tag_id WHERE et.entry_id = e.id AND t.search_key LIKE ? ESCAPE '\\')
      ${additional} ORDER BY EXISTS (SELECT 1 FROM aliases a WHERE a.entry_id = e.id AND a.search_key = ?) DESC,
      (e.review_status = 'curated') DESC, e.name LIMIT 30`).bind(pattern, pattern, ...extraIds, key).all<Row>();
    return rows.results.map(entryFromRow);
  }

  async detail(id: string): Promise<EntryDetail | null> {
    const row = await this.db.prepare(`${entrySelect} WHERE e.id = ?`).bind(id).first<Row>();
    if (!row) return null;
    const related = await this.db.prepare(`SELECT r.*, target.id AS target_id, target.name AS target_name,
      (SELECT json_group_array(json_object('label', s.label, 'url', s.url)) FROM relationship_sources rs
       JOIN sources s ON s.url = rs.source_url WHERE rs.relationship_id = r.id) AS sources
      FROM relationships r JOIN entries target ON target.id = CASE WHEN r.from_id = ? THEN r.to_id ELSE r.from_id END
      WHERE r.from_id = ? OR r.to_id = ? ORDER BY r.review_status, r.id`).bind(id, id, id).all<{
        id: string; from_id: string; to_id: string; relation: string; confidence: KnowledgeRelation["confidence"];
        debated: number; review_status: KnowledgeRelation["reviewStatus"]; sources: string; target_id: string; target_name: string;
      }>();
    return {
      entry: entryFromRow(row),
      relationships: related.results.map((r) => ({ id: r.id, from: r.from_id, to: r.to_id, relation: r.relation,
        confidence: r.confidence, debated: Boolean(r.debated), reviewStatus: r.review_status,
        sources: JSON.parse(r.sources), target: { id: r.target_id, name: r.target_name } })),
    };
  }

  async recentSearch(query: string) {
    return this.db.prepare("SELECT completed_at, status, entry_ids FROM search_runs WHERE query = ?")
      .bind(normalizeSearch(query)).first<{ completed_at: string; status: string; entry_ids: string }>();
  }

  async recordFailure(query: string, now: string) {
    await this.db.batch([this.db.prepare(`INSERT INTO search_runs VALUES (?, ?, ?, 'failed', '[]')
      ON CONFLICT(query) DO UPDATE SET completed_at = excluded.completed_at, status = 'failed'`)
      .bind(normalizeSearch(query), query, now)]);
  }

  async merge(discovery: Discovery, now: string, query?: string): Promise<{ added: number; ids: string[] }> {
    const externalIds = discovery.entries.flatMap((e) => e.externalId ? [e.externalId] : []);
    const existing = externalIds.length ? (await this.db.prepare(`SELECT external_id, entry_id FROM external_ids
      WHERE namespace = 'wikidata' AND external_id IN (${externalIds.map(() => "?").join(",")})`).bind(...externalIds).all<{ external_id: string; entry_id: string }>()).results : [];
    const lookup = new Map(existing.map((item) => [item.external_id, item.entry_id]));
    const remap = new Map(discovery.entries.map((e) => [e.id, (e.externalId && lookup.get(e.externalId)) || e.id]));
    const entries = discovery.entries.map((e) => ({ ...e, id: remap.get(e.id)! }));
    const ids = [...new Set(entries.map((e) => e.id))];
    const relationships = discovery.relationships.map((r) => ({ ...r, from: remap.get(r.from) ?? r.from, to: remap.get(r.to) ?? r.to }));
    const sources = [...entries.flatMap((e) => e.sources), ...relationships.flatMap((r) => r.sources)];
    const entryRows = entries.map((e) => [e.id, e.name, e.latinName ?? null, e.kind, e.yearLabel ?? null, e.reviewStatus, now]);
    const inserts = insertRows(this.db, "entries", ["id", "name", "latin_name", "kind", "year_label", "review_status", "updated_at"], entryRows, "ON CONFLICT DO NOTHING");
    const statements = [
      ...inserts,
      ...insertRows(this.db, "entries", ["id", "name", "latin_name", "kind", "year_label", "review_status", "updated_at"], entryRows,
        `ON CONFLICT(id) DO UPDATE SET name = excluded.name,
          latin_name = COALESCE(excluded.latin_name, entries.latin_name),
          year_label = COALESCE(excluded.year_label, entries.year_label),
          updated_at = excluded.updated_at WHERE entries.review_status = 'unreviewed'`),
      ...insertRows(this.db, "external_ids", ["namespace", "external_id", "entry_id"], entries.flatMap((e) => e.externalId ? [["wikidata", e.externalId, e.id]] : []), "ON CONFLICT DO NOTHING"),
      ...insertRows(this.db, "sources", ["url", "label"], sources.map((s) => [s.url, s.label]), "ON CONFLICT DO NOTHING"),
      ...insertRows(this.db, "aliases", ["entry_id", "name", "search_key"], entries.flatMap((e) => [...new Set([e.name, e.latinName ?? "", ...e.aliases])].filter(Boolean).map((name) => [e.id, name, normalizeSearch(name)])), "ON CONFLICT DO NOTHING"),
      ...insertRows(this.db, "entry_sources", ["entry_id", "source_url", "first_seen", "last_seen"], entries.flatMap((e) => e.sources.map((s) => [e.id, s.url, now, now])), "ON CONFLICT(entry_id, source_url) DO UPDATE SET last_seen = excluded.last_seen"),
      ...insertRows(this.db, "summaries", ["entry_id", "body", "source_url", "quality", "retrieved_at"], entries.filter((e) => e.summary && e.sources.length).map((e) => [e.id, e.summary, e.sources[0].url, e.reviewStatus, now]), "ON CONFLICT(entry_id, source_url, body) DO UPDATE SET retrieved_at = excluded.retrieved_at"),
      ...insertRows(this.db, "tags", ["id", "name", "search_key"], entries.flatMap((e) => e.tags.map((t) => [t.id, t.name, normalizeSearch(t.name)])), "ON CONFLICT DO NOTHING"),
      ...insertRows(this.db, "entry_tags", ["entry_id", "tag_id", "source_url"], entries.flatMap((e) => e.tags.map((t) => [e.id, t.id, e.sources[0].url])), "ON CONFLICT DO NOTHING"),
      ...insertRows(this.db, "relationships", ["id", "from_id", "to_id", "relation", "confidence", "debated", "review_status"], relationships.map((r) => [r.id, r.from, r.to, r.relation, r.confidence, Number(r.debated), r.reviewStatus]), "ON CONFLICT DO NOTHING"),
      ...insertRows(this.db, "relationship_sources", ["relationship_id", "source_url"], relationships.flatMap((r) => r.sources.map((s) => [r.id, s.url])), "ON CONFLICT DO NOTHING"),
    ];
    if (query !== undefined) statements.push(this.db.prepare(`INSERT INTO search_runs VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(query) DO UPDATE SET display_query = excluded.display_query, completed_at = excluded.completed_at,
      status = excluded.status, entry_ids = excluded.entry_ids`).bind(normalizeSearch(query), query, now, ids.length ? "success" : "empty", JSON.stringify(ids)));
    // D1 batch is transactional, so partial source/tag imports cannot leak.
    const results = statements.length ? await this.db.batch(statements) : [];
    return { added: results.slice(0, inserts.length).reduce((sum, item) => sum + item.meta.changes, 0), ids };
  }
}
