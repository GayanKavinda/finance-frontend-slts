// src/contexts/ThemeContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  setTheme: () => {},
  forcedTheme: undefined,
  resolvedTheme: "light",
  themes: ["light", "dark", "system"],
  systemTheme: undefined,
});

export function ThemeProvider({
  children,
  forcedTheme,
  storageKey = "theme",
  defaultTheme = "system",
  attribute = "class",
  enableSystem = true,
  enableColorScheme = true,
  themes = ["light", "dark"],
  nonce,
  scriptProps = {},
  value,
}) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && themes.includes(stored)) return stored;
    } catch {}
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const resolvedTheme =
    forcedTheme ||
    (theme === "system" ? systemTheme : theme);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (t) => {
      if (attribute === "class") {
        root.classList.remove(...themes.filter((th) => th !== t));
        if (t) root.classList.add(t);
      } else if (attribute.startsWith("data-")) {
        if (t) {
          root.setAttribute(attribute, t);
        } else {
          root.removeAttribute(attribute);
        }
      }
      if (enableColorScheme) {
        root.style.colorScheme = t || "light";
      }
    };

    apply(resolvedTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemTheme(e.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [resolvedTheme, attribute, themes, enableColorScheme]);

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {}
  };

  const contextValue = {
    theme,
    setTheme: handleSetTheme,
    forcedTheme,
    resolvedTheme,
    themes: enableSystem ? [...themes, "system"] : themes,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
