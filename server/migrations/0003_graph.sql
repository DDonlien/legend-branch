-- Structured, source-backed chronology. Existing content remains intact.
ALTER TABLE tags ADD COLUMN category TEXT NOT NULL DEFAULT 'topic'
  CHECK(category IN ('culture', 'country', 'topic'));
CREATE TABLE search_data_versions (
  query TEXT PRIMARY KEY REFERENCES search_runs(query),
  data_version INTEGER NOT NULL
);
CREATE TABLE entry_placements (
  entry_id TEXT PRIMARY KEY REFERENCES entries(id),
  year INTEGER NOT NULL CHECK(year BETWEEN -1000000 AND 1000000),
  end_year INTEGER CHECK(end_year IS NULL OR end_year >= year),
  source_url TEXT NOT NULL REFERENCES sources(url),
  quality TEXT NOT NULL CHECK(quality IN ('curated', 'sourced')),
  preferred_group TEXT REFERENCES tags(id),
  row_hint INTEGER CHECK(row_hint IS NULL OR row_hint >= 0),
  default_trace INTEGER NOT NULL DEFAULT 0 CHECK(default_trace IN (0, 1))
);
UPDATE tags SET category = 'country' WHERE id IN ('wd:Q668', 'wd:Q148', 'wd:Q17');
INSERT INTO tags(id, name, search_key, category) VALUES
  ('culture:india', '印度文化圈', '印度文化圈', 'culture'),
  ('culture:china', '中国文化圈', '中国文化圈', 'culture'),
  ('culture:japan', '日本现代传播', '日本现代传播', 'culture'),
  ('culture:modern-china', '中国现代传播', '中国现代传播', 'culture');
WITH v(id, year, group_id, row_hint, trace) AS (VALUES
  ('hanuman', -400, 'culture:india', 0, 1),
  ('ramayana', -300, 'culture:india', 1, 0),
  ('wuzhiqi', 1100, 'culture:china', 0, 1),
  ('monkey-pilgrim', 1200, 'culture:china', 1, 1),
  ('sun-wukong', 1592, 'culture:china', 2, 1),
  ('zaju', 1350, 'culture:china', 3, 0),
  ('dragon-ball', 1984, 'culture:japan', 0, 1),
  ('saiyuki', 1997, 'culture:japan', 1, 1),
  ('enma', 2002, 'culture:japan', 2, 0),
  ('a-chinese-odyssey', 1995, 'culture:modern-china', 0, 1),
  ('black-myth', 2024, 'culture:modern-china', 1, 1),
  ('tv-journey', 1986, 'culture:modern-china', 2, 0)
)
INSERT INTO entry_placements(entry_id, year, source_url, quality, preferred_group, row_hint, default_trace)
SELECT e.id, v.year, es.source_url, 'curated', v.group_id, v.row_hint, v.trace
FROM entries e JOIN v ON e.id = v.id JOIN entry_sources es ON es.entry_id = e.id
GROUP BY e.id;
INSERT INTO entry_tags(entry_id, tag_id, source_url)
SELECT entry_id, preferred_group, source_url FROM entry_placements;
