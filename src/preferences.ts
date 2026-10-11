import type { Locale } from "./i18n";

export const DENSITIES = ["nodes", "names", "detailed"] as const;
export type Density = typeof DENSITIES[number];
export type Preferences = { locale: Locale; density: Density };
export const PREFERENCES_KEY = "legendbranch.preferences.v1";

export function browserLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    if (/^zh(?:-|$)/i.test(language)) return "zh";
    if (/^en(?:-|$)/i.test(language)) return "en";
  }
  return "en";
}
export function readPreferences(storage: Pick<Storage, "getItem">, languages: readonly string[]): Preferences {
  const fallback: Preferences = { locale: browserLocale(languages), density: "detailed" };
  try {
    const value = JSON.parse(storage.getItem(PREFERENCES_KEY) ?? "null");
    if (!value || typeof value !== "object") return fallback;
    return {
      locale: value.locale === "zh" || value.locale === "en" ? value.locale : fallback.locale,
      density: DENSITIES.includes(value.density) ? value.density : fallback.density,
    };
  } catch { return fallback; }
}
