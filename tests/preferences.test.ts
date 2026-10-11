import test from "node:test";
import assert from "node:assert/strict";
import { messages, translate, yearLabel, type TranslationKey } from "../src/i18n";
import { browserLocale, PREFERENCES_KEY, readPreferences } from "../src/preferences";

test("UI language follows the first supported browser language until a manual choice is saved", () => {
  assert.equal(browserLocale(["fr-FR", "zh-TW", "en-US"]), "zh");
  assert.equal(browserLocale(["en-GB", "zh-CN"]), "en");
  assert.equal(browserLocale(["ja-JP"]), "en");
  const storage = new Map([[PREFERENCES_KEY, JSON.stringify({ locale: "en", density: "nodes" })]]);
  assert.deepEqual(readPreferences({ getItem: (key) => storage.get(key) ?? null }, ["zh-CN"]), { locale: "en", density: "nodes" });
});

test("missing, corrupt, unsupported or blocked preferences keep the graph usable", () => {
  const fallback = { locale: "zh", density: "detailed" };
  for (const raw of [null, "{", "null", "[]", '"bad"', '{"locale":"fr","density":"hidden"}']) {
    assert.deepEqual(readPreferences({ getItem: () => raw }, ["zh-CN"]), fallback);
  }
  assert.deepEqual(readPreferences({ getItem: () => { throw new Error("blocked"); } }, ["zh-CN"]), fallback);
  assert.deepEqual(readPreferences({ getItem: () => '{"locale":"zh","density":"names"}' }, ["en-US"]), { locale: "zh", density: "names" });
});

test("both UI languages provide the same variable placeholders and preserve user text", () => {
  for (const key of Object.keys(messages.zh) as TranslationKey[]) {
    assert.ok(messages.en[key]);
    assert.deepEqual(messages.en[key].match(/\{\w+\}/g)?.sort(), messages.zh[key].match(/\{\w+\}/g)?.sort(), key);
  }
  assert.equal(translate("en", "brand"), "Legend Branch");
  assert.equal(translate("zh", "brand"), "传说谱系");
  assert.equal(translate("en", "searchQuery", { query: "我的故事" }), "Search “我的故事”");
  const date = { id: "local:node", yearLabel: "公元前 300", origin: "project" as const, placement: { year: -300, quality: "authored" as const } };
  assert.equal(yearLabel(date, "en"), "300 BCE");
  assert.equal(yearLabel(date, "zh"), "公元前 300");
  assert.equal(yearLabel({ id: "unknown", yearLabel: "作者自己的历法" }, "en"), "作者自己的历法");
});
