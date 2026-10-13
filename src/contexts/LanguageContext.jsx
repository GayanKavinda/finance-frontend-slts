// src/contexts/LanguageContext.jsx
"use client";

import { createContext, useContext, useCallback, useMemo } from "react";
import { translate, LANGUAGES } from "@/lib/i18n";
import { usePreferences } from "@/contexts/PreferencesContext";

const LanguageContext = createContext({
  lang: "en",
  t: (text) => text,
  languages: LANGUAGES,
});

export function LanguageProvider({ children }) {
  const { regional } = usePreferences();
  const lang = LANGUAGES.some((l) => l.code === regional.language)
    ? regional.language
    : "en";

  // Re-created only when the language changes so consumers re-render.
  const t = useCallback((text) => translate(lang, text), [lang]);

  const value = useMemo(() => ({ lang, t, languages: LANGUAGES }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
