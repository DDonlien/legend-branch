import { useEffect, useState, type ReactNode } from "react";
import { translate } from "./i18n";
import { browserLocale, PREFERENCES_KEY, readPreferences, type Preferences } from "./preferences";
import { LocaleContext } from "./useLocale";

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try { return readPreferences(localStorage, navigator.languages); }
    catch { return { locale: browserLocale(navigator.languages), density: "detailed" }; }
  });
  useEffect(() => {
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); }
    catch { /* The current UI remains usable without storage. */ }
    document.documentElement.lang = preferences.locale === "zh" ? "zh-CN" : "en";
    document.title = translate(preferences.locale, "brand");
  }, [preferences]);
  return <LocaleContext.Provider value={{ ...preferences,
    setLocale: (locale) => setPreferences((current) => ({ ...current, locale })),
    setDensity: (density) => setPreferences((current) => ({ ...current, density })),
    t: (key, values) => translate(preferences.locale, key, values),
  }}>{children}</LocaleContext.Provider>;
}
