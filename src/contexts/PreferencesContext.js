// src/contexts/PreferencesContext.js
"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import {
  DENSITY_MODES,
  getDensity,
  setDensity as persistDensity,
  getRegional,
  setRegional as persistRegional,
  isDebugEnabled,
  setDebugEnabled as persistDebug,
} from "@/lib/preferences";

const PreferencesContext = createContext({
  density: "comfortable",
  compact: false,
  setDensity: () => {},
  toggleCompact: () => {},
  debugMode: false,
  setDebugMode: () => {},
  toggleDebug: () => {},
  regional: { language: "en", timezone: "Asia/Colombo", dateFormat: "DD/MM/YYYY", currency: "LKR" },
  setRegional: () => {},
});

export function PreferencesProvider({ children }) {
  // Lazy initialisers read from localStorage once — no hydration effect needed.
  const [density, setDensityState] = useState(getDensity);
  const [debugMode, setDebugModeState] = useState(isDebugEnabled);
  const [regional, setRegionalState] = useState(getRegional);

  // Effect only synchronises the external DOM attribute (React-approved use).
  useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  const setDensity = useCallback((mode) => {
    const next = persistDensity(DENSITY_MODES.includes(mode) ? mode : "comfortable");
    setDensityState(next);
    return next;
  }, []);

  const toggleCompact = useCallback(() => {
    const next = getDensity() === "compact" ? "comfortable" : "compact";
    return setDensity(next);
  }, [setDensity]);

  const setDebugMode = useCallback((enabled) => {
    const next = persistDebug(!!enabled);
    setDebugModeState(next);
    return next;
  }, []);

  const toggleDebug = useCallback(() => setDebugMode(!isDebugEnabled()), [setDebugMode]);

  const setRegional = useCallback((patch) => {
    persistRegional(patch);
    setRegionalState(getRegional());
  }, []);

  const value = {
    density,
    compact: density === "compact",
    setDensity,
    toggleCompact,
    debugMode,
    setDebugMode,
    toggleDebug,
    regional,
    setRegional,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
