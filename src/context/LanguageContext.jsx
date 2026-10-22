import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../i18n";

const LanguageContext = createContext(null);
const LANG_KEY = "md_lang";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem(LANG_KEY);
    return stored === "te" || stored === "en" ? stored : "en";
  });

  // t(key, params?) — returns the translated string for the current language.
  // Falls back to English if a Telugu translation is missing, and to the key
  // itself if neither exists (visible-but-fixable, better than a silent blank).
  // Simple {var} interpolation is supported for dynamic values.
  const t = (key, params) => {
    const dict = translations[lang] || translations.en;
    let str = dict[key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replaceAll(`{${k}}`, v);
      }
    }
    return str;
  };

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    document.title = `${t("brand.name")} | ${t("brand.taglineDot")}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "en" ? "te" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
};
