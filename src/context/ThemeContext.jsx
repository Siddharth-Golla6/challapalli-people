import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
// Key bumped from `md_theme` → `md_theme_v2` to reset every browser to the
// new dark-first default on next visit. Users can still toggle; their new
// preference is persisted under the v2 key.
const THEME_KEY = "md_theme_v2";
const LEGACY_KEY = "md_theme";

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      // Clear the old key so a stale `light` doesn't linger around.
      if (localStorage.getItem(LEGACY_KEY) !== null) {
        localStorage.removeItem(LEGACY_KEY);
      }
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) return stored === "dark";
    } catch {
      // Private mode / disabled storage — fall through to the default.
    }
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
