CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latin_name TEXT,
  kind TEXT NOT NULL CHECK(kind IN ('origin', 'literature', 'modern', 'entry')),
  year_label TEXT,
  review_status TEXT NOT NULL CHECK(review_status IN ('curated', 'unreviewed')),
  updated_at TEXT NOT NULL
);
CREATE TABLE external_ids (
  namespace TEXT NOT NULL,
  external_id TEXT NOT NULL,
  entry_id TEXT NOT NULL REFERENCES entries(id),
  PRIMARY KEY(namespace, external_id)
);
CREATE INDEX external_ids_entry ON external_ids(entry_id);
CREATE TABLE aliases (
  entry_id TEXT NOT NULL REFERENCES entries(id),
  name TEXT NOT NULL,
  search_key TEXT NOT NULL,
  PRIMARY KEY(entry_id, name)
);
CREATE INDEX aliases_search ON aliases(search_key, entry_id);
CREATE TABLE sources (
  url TEXT PRIMARY KEY,
  label TEXT NOT NULL
);
CREATE TABLE entry_sources (
  entry_id TEXT NOT NULL REFERENCES entries(id),
  source_url TEXT NOT NULL REFERENCES sources(url),
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  PRIMARY KEY(entry_id, source_url)
);
CREATE TABLE summaries (
  entry_id TEXT NOT NULL REFERENCES entries(id),
  body TEXT NOT NULL,
  source_url TEXT NOT NULL REFERENCES sources(url),
  quality TEXT NOT NULL CHECK(quality IN ('curated', 'unreviewed')),
  retrieved_at TEXT NOT NULL,
  PRIMARY KEY(entry_id, source_url, body)
);
CREATE INDEX summaries_entry ON summaries(entry_id, quality, retrieved_at);
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  search_key TEXT NOT NULL
);
CREATE INDEX tags_search ON tags(search_key, id);
CREATE TABLE entry_tags (
  entry_id TEXT NOT NULL REFERENCES entries(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  source_url TEXT NOT NULL REFERENCES sources(url),
  PRIMARY KEY(entry_id, tag_id, source_url)
);
CREATE INDEX entry_tags_tag ON entry_tags(tag_id, entry_id);
CREATE TABLE relationships (
  id TEXT PRIMARY KEY,
  from_id TEXT NOT NULL REFERENCES entries(id),
  to_id TEXT NOT NULL REFERENCES entries(id),
  relation TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK(confidence IN ('confirmed', 'probable', 'speculative')),
  debated INTEGER NOT NULL CHECK(debated IN (0, 1)),
  review_status TEXT NOT NULL CHECK(review_status IN ('curated', 'unreviewed')),
  UNIQUE(from_id, to_id, relation)
);
CREATE INDEX relationships_to ON relationships(to_id);
CREATE TABLE relationship_sources (
  relationship_id TEXT NOT NULL REFERENCES relationships(id),
  source_url TEXT NOT NULL REFERENCES sources(url),
  PRIMARY KEY(relationship_id, source_url)
);
CREATE TABLE search_runs (
  query TEXT PRIMARY KEY,
  display_query TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('success', 'empty', 'failed')),
  entry_ids TEXT NOT NULL CHECK(json_valid(entry_ids))
);
