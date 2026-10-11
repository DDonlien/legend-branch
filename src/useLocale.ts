import { createContext, useContext } from "react";
import type { Locale, TranslationKey } from "./i18n";
import type { Density } from "./preferences";

export const LocaleContext = createContext<{
  locale: Locale; density: Density; setLocale: (locale: Locale) => void; setDensity: (density: Density) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
} | null>(null);

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("PreferencesProvider is required");
  return value;
}
