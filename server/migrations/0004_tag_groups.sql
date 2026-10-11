-- Keep the legacy category column compatible with older deployments.
-- The UI's grouping basis adds a separate category for types of things.
ALTER TABLE tags ADD COLUMN grouping_basis TEXT NOT NULL DEFAULT 'topic'
  CHECK(grouping_basis IN ('country', 'culture', 'category', 'topic'));
UPDATE tags SET grouping_basis = category;
UPDATE tags SET grouping_basis = 'category'
  WHERE id IN ('myth', 'folklore', 'literature', 'manga', 'film', 'game', 'drama', 'television');
CREATE INDEX tags_grouping_basis ON tags(grouping_basis, id);
